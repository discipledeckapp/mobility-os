import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CpSubscription } from '../generated/prisma';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { StaffNotificationService } from '../notifications/staff-notification.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlansService } from '../plans/plans.service';
import type { CreateSubscriptionDto } from './dto/create-subscription.dto';
import type { SubscriptionListItemDto } from './dto/subscription-list-item.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly plansService: PlansService,
    private readonly staffNotification: StaffNotificationService,
  ) {}

  async listSubscriptions(): Promise<SubscriptionListItemDto[]> {
    const subscriptions = await this.prisma.cpSubscription.findMany({
      include: {
        plan: {
          select: {
            name: true,
            tier: true,
            currency: true,
            basePriceMinorUnits: true,
            features: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return subscriptions.map((subscription) => ({
      id: subscription.id,
      tenantId: subscription.tenantId,
      planId: subscription.planId,
      planName: subscription.plan.name,
      planTier: subscription.plan.tier,
      currency: subscription.plan.currency,
      basePriceMinorUnits: subscription.plan.basePriceMinorUnits,
      features: subscription.plan.features,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      trialEndsAt: subscription.trialEndsAt,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    }));
  }

  async listActivePlans() {
    return this.plansService.listPlans(true);
  }

  async getTenantSubscriptionSummary(tenantId: string): Promise<SubscriptionListItemDto> {
    const subscription = await this.prisma.cpSubscription.findUnique({
      where: { tenantId },
      include: {
        plan: {
          select: {
            name: true,
            tier: true,
            currency: true,
            basePriceMinorUnits: true,
            features: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(`No subscription found for tenant '${tenantId}'`);
    }

    return {
      id: subscription.id,
      tenantId: subscription.tenantId,
      planId: subscription.planId,
      planName: subscription.plan.name,
      planTier: subscription.plan.tier,
      currency: subscription.plan.currency,
      basePriceMinorUnits: subscription.plan.basePriceMinorUnits,
      features: subscription.plan.features,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      trialEndsAt: subscription.trialEndsAt,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  async getByTenant(tenantId: string): Promise<CpSubscription> {
    const sub = await this.prisma.cpSubscription.findUnique({
      where: { tenantId },
    });

    if (!sub) {
      throw new NotFoundException(`No subscription found for tenant '${tenantId}'`);
    }

    return sub;
  }

  async createSubscription(dto: CreateSubscriptionDto): Promise<CpSubscription> {
    // Ensure the plan exists and is active.
    const plan = await this.plansService.getPlan(dto.planId);

    if (!plan.isActive) {
      throw new BadRequestException(`Plan '${dto.planId}' is not active`);
    }

    // One active subscription per tenant — enforced by @@unique on tenantId in schema,
    // but we surface a friendlier error here before hitting the DB constraint.
    const existing = await this.prisma.cpSubscription.findUnique({
      where: { tenantId: dto.tenantId },
    });

    if (existing) {
      throw new ConflictException(
        `Tenant '${dto.tenantId}' already has a subscription ('${existing.id}'). Use changePlan to switch plans.`,
      );
    }

    const status = dto.trialEndsAt ? 'trialing' : 'active';

    return this.prisma.cpSubscription.create({
      data: {
        tenantId: dto.tenantId,
        planId: dto.planId,
        status,
        currentPeriodStart: new Date(dto.currentPeriodStart),
        currentPeriodEnd: new Date(dto.currentPeriodEnd),
        trialEndsAt: dto.trialEndsAt ? new Date(dto.trialEndsAt) : null,
      },
    });
  }

  async ensureBootstrapSubscription(params: {
    tenantId: string;
    currency?: string;
    trialDays?: number;
  }): Promise<CpSubscription> {
    const existing = await this.prisma.cpSubscription.findUnique({
      where: { tenantId: params.tenantId },
    });
    if (existing) {
      return existing;
    }

    const activePlans = await this.plansService.listPlans(true);
    const currency = params.currency?.toUpperCase();
    const plan =
      activePlans.find((item) => item.currency === currency && item.tier === 'growth') ??
      activePlans.find((item) => item.currency === currency) ??
      activePlans.find((item) => item.tier === 'growth') ??
      activePlans[0];

    if (!plan) {
      throw new NotFoundException('No active billing plan is available for bootstrap provisioning.');
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(currentPeriodStart);
    if (plan.billingInterval === 'annual') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    const trialDays = params.trialDays ?? 14;
    const trialEndsAt =
      trialDays > 0
        ? new Date(currentPeriodStart.getTime() + trialDays * 24 * 60 * 60 * 1000)
        : undefined;

    return this.createSubscription({
      tenantId: params.tenantId,
      planId: plan.id,
      currentPeriodStart: currentPeriodStart.toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      ...(trialEndsAt ? { trialEndsAt: trialEndsAt.toISOString() } : {}),
    });
  }

  async cancelAtPeriodEnd(tenantId: string): Promise<CpSubscription> {
    const sub = await this.getByTenant(tenantId);

    if (sub.cancelAtPeriodEnd) {
      throw new BadRequestException(
        `Subscription '${sub.id}' is already set to cancel at period end`,
      );
    }

    return this.prisma.cpSubscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: true },
    });
  }

  async changePlan(tenantId: string, newPlanId: string): Promise<CpSubscription> {
    const [sub, newPlan] = await Promise.all([
      this.getByTenant(tenantId),
      this.plansService.getPlan(newPlanId),
    ]);

    if (!newPlan.isActive) {
      throw new BadRequestException(`Plan '${newPlanId}' is not active`);
    }

    if (sub.planId === newPlanId) {
      throw new BadRequestException(`Tenant '${tenantId}' is already on plan '${newPlanId}'`);
    }

    const previousPlan = await this.plansService.getPlan(sub.planId).catch(() => null);

    const updated = await this.prisma.cpSubscription.update({
      where: { id: sub.id },
      data: {
        planId: newPlanId,
        // Downgrade/upgrade takes effect immediately — period boundaries unchanged.
        // Proration is handled by the billing service when the next invoice is generated.
        cancelAtPeriodEnd: false,
      },
    });

    // Fire-and-forget — never let notification failure block a plan change.
    void this.staffNotification
      .notifySubscriptionTierUpgraded({
        tenantId,
        fromPlanName: previousPlan?.name ?? sub.planId,
        toPlanName: newPlan.name,
        upgradedAt: new Date(),
      })
      .catch(() => undefined);

    return updated;
  }
}
