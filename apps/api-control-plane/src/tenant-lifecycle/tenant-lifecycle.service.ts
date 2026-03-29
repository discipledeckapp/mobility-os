import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CpSubscription, CpTenantLifecycleEvent, Prisma } from '../generated/prisma';

const SUBSCRIPTION_GRACE_PERIOD_DAYS = 5;

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  trialing: ['onboarded', 'active', 'past_due', 'canceled'],
  prospect: ['onboarded', 'active', 'canceled'],
  onboarded: ['active', 'past_due', 'canceled'],
  active: ['past_due', 'grace_period', 'suspended', 'terminated', 'canceled'],
  past_due: ['active', 'grace_period', 'suspended', 'terminated', 'canceled'],
  grace_period: ['active', 'past_due', 'suspended', 'terminated'],
  suspended: ['active', 'terminated', 'archived'],
  terminated: ['archived'],
  canceled: ['archived'],
  archived: [],
};

@Injectable()
export class TenantLifecycleService {
  constructor(private readonly prisma: PrismaService) {}

  resolveEnforcementState(
    subscription: Pick<CpSubscription, 'status' | 'currentPeriodEnd'>,
    asOf = new Date(),
  ): {
    stage: 'active' | 'grace' | 'expired';
    gracePeriodDays: number;
    graceEndsAt: Date | null;
    graceDaysRemaining: number;
    degradedMode: boolean;
    blockedFeatures: Array<'driver_onboarding' | 'vehicle_onboarding' | 'assignment_creation'>;
  } {
    if (!['past_due', 'grace_period'].includes(subscription.status)) {
      return {
        stage: 'active',
        gracePeriodDays: SUBSCRIPTION_GRACE_PERIOD_DAYS,
        graceEndsAt: null,
        graceDaysRemaining: 0,
        degradedMode: false,
        blockedFeatures: [],
      };
    }

    const graceEndsAt = new Date(subscription.currentPeriodEnd);
    graceEndsAt.setUTCDate(graceEndsAt.getUTCDate() + SUBSCRIPTION_GRACE_PERIOD_DAYS);
    const millisecondsRemaining = graceEndsAt.getTime() - asOf.getTime();
    const graceDaysRemaining =
      millisecondsRemaining > 0 ? Math.ceil(millisecondsRemaining / (24 * 60 * 60 * 1000)) : 0;
    const inGrace = graceDaysRemaining > 0;

    return {
      stage: inGrace ? 'grace' : 'expired',
      gracePeriodDays: SUBSCRIPTION_GRACE_PERIOD_DAYS,
      graceEndsAt,
      graceDaysRemaining,
      degradedMode: !inGrace,
      blockedFeatures: inGrace
        ? ['driver_onboarding', 'vehicle_onboarding']
        : ['driver_onboarding', 'vehicle_onboarding', 'assignment_creation'],
    };
  }

  async getCurrentState(tenantId: string): Promise<CpSubscription> {
    const subscription = await this.prisma.cpSubscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException(`No subscription found for tenant '${tenantId}'`);
    }

    return subscription;
  }

  async listEvents(tenantId: string): Promise<CpTenantLifecycleEvent[]> {
    return this.prisma.cpTenantLifecycleEvent.findMany({
      where: { tenantId },
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
    });
  }

  async transitionTenant(params: {
    tenantId: string;
    toStatus: string;
    triggeredBy: 'system' | 'platform_admin' | 'billing';
    actorId?: string;
    reason?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<CpSubscription> {
    const subscription = await this.getCurrentState(params.tenantId);
    const fromStatus = subscription.status;

    if (fromStatus === params.toStatus) {
      return subscription;
    }

    const allowedTransitions = ALLOWED_TRANSITIONS[fromStatus] ?? [];
    if (!allowedTransitions.includes(params.toStatus)) {
      throw new BadRequestException(
        `Invalid tenant lifecycle transition from '${fromStatus}' to '${params.toStatus}'`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.cpSubscription.update({
        where: { id: subscription.id },
        data: { status: params.toStatus },
      });

      const createInput: Prisma.CpTenantLifecycleEventCreateInput = {
        tenantId: params.tenantId,
        fromStatus,
        toStatus: params.toStatus,
        triggeredBy: params.triggeredBy,
        actorId: params.actorId ?? null,
        reason: params.reason ?? null,
      };
      if (params.metadata !== undefined) {
        createInput.metadata = params.metadata;
      }

      await tx.cpTenantLifecycleEvent.create({
        data: createInput,
      });

      return updated;
    });
  }

  async markPaymentFailed(params: {
    tenantId: string;
    invoiceId: string;
    reason?: string;
  }): Promise<CpSubscription> {
    return this.transitionTenant({
      tenantId: params.tenantId,
      toStatus: 'past_due',
      triggeredBy: 'billing',
      reason: params.reason ?? `Invoice '${params.invoiceId}' is overdue`,
      metadata: { event: 'payment_failed', invoiceId: params.invoiceId },
    });
  }

  async markPaymentRecovered(params: {
    tenantId: string;
    invoiceId: string;
    provider?: string;
    referenceId?: string;
  }): Promise<CpSubscription> {
    const subscription = await this.getCurrentState(params.tenantId);
    if (!['past_due', 'grace_period'].includes(subscription.status)) {
      return subscription;
    }

    return this.transitionTenant({
      tenantId: params.tenantId,
      toStatus: 'active',
      triggeredBy: 'billing',
      reason: `Invoice '${params.invoiceId}' was settled`,
      metadata: {
        event: 'payment_recovered',
        invoiceId: params.invoiceId,
        ...(params.provider ? { provider: params.provider } : {}),
        ...(params.referenceId ? { referenceId: params.referenceId } : {}),
      },
    });
  }
}
