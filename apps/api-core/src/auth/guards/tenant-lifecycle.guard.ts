import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { Reflector } from '@nestjs/core';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../../database/prisma.service';
import {
  TENANT_LIFECYCLE_FEATURE_KEY,
  type TenantLifecycleFeature,
} from '../decorators/tenant-lifecycle-access.decorator';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneLifecycleClient } from '../control-plane-lifecycle.client';
import { ALLOW_BLOCKED_TENANT_ACCESS_KEY } from '../decorators/allow-blocked-tenant-access.decorator';

interface TenantContextRequest {
  method: string;
  tenantContext?: {
    tenantId: string;
  };
}

const BLOCKED_STATUSES = new Set(['suspended', 'terminated', 'archived', 'canceled']);

@Injectable()
export class TenantLifecycleGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly controlPlaneLifecycleClient: ControlPlaneLifecycleClient,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowBlockedAccess = this.reflector.getAllAndOverride<boolean>(
      ALLOW_BLOCKED_TENANT_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredFeature = this.reflector.getAllAndOverride<TenantLifecycleFeature | undefined>(
      TENANT_LIFECYCLE_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<TenantContextRequest>();
    const tenantId = request.tenantContext?.tenantId;
    if (!tenantId) {
      return true;
    }

    const localTenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!localTenant) {
      throw new NotFoundException(`Tenant '${tenantId}' not found`);
    }

    const lifecycleState = await this.resolveCurrentStatus(tenantId, localTenant.status);
    if (allowBlockedAccess) {
      return true;
    }

    if (BLOCKED_STATUSES.has(lifecycleState.status)) {
      throw new ForbiddenException(
        `Tenant access is blocked while account status is '${lifecycleState.status}'`,
      );
    }

    if (
      requiredFeature &&
      lifecycleState.enforcement.blockedFeatures.includes(requiredFeature)
    ) {
      const actionDescription = this.describeFeature(requiredFeature);
      if (lifecycleState.enforcement.stage === 'grace') {
        throw new ForbiddenException(
          `Subscription expired. Renew within ${lifecycleState.enforcement.graceDaysRemaining} day(s) to continue ${actionDescription}.`,
        );
      }
      throw new ForbiddenException(
        `Subscription expired and grace period ended. Upgrade to continue ${actionDescription}.`,
      );
    }

    return true;
  }

  private describeFeature(feature: TenantLifecycleFeature): string {
    if (feature === 'assignment_creation') {
      return 'creating new assignments';
    }
    if (feature === 'vehicle_onboarding') {
      return 'adding new vehicles';
    }
    return 'adding new drivers';
  }

  private async resolveCurrentStatus(
    tenantId: string,
    fallbackStatus: string,
  ): Promise<{
    status: string;
    enforcement: {
      stage: 'active' | 'grace' | 'expired';
      gracePeriodDays: number;
      graceEndsAt: string | null;
      graceDaysRemaining: number;
      degradedMode: boolean;
      blockedFeatures: string[];
    };
  }> {
    try {
      const remoteState = await this.controlPlaneLifecycleClient.getTenantLifecycleState(tenantId);
      if (remoteState.status !== fallbackStatus) {
        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: { status: remoteState.status },
        });
      }
      return remoteState;
    } catch {
      const expiredFallback = fallbackStatus === 'past_due';
      return {
        status: fallbackStatus,
        enforcement: {
          stage: expiredFallback
            ? 'expired'
            : fallbackStatus === 'grace_period'
              ? 'grace'
              : 'active',
          gracePeriodDays: 5,
          graceEndsAt: null,
          graceDaysRemaining: 0,
          degradedMode: expiredFallback,
          blockedFeatures:
            fallbackStatus === 'grace_period'
              ? ['driver_onboarding', 'vehicle_onboarding']
              : expiredFallback
                ? ['driver_onboarding', 'vehicle_onboarding', 'assignment_creation']
                : [],
        },
      };
    }
  }
}
