import { Injectable, ServiceUnavailableException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import { signInternalServiceJwt } from './internal-service-jwt';

export interface ControlPlaneTenantLifecycleState {
  tenantId: string;
  subscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  enforcement: {
    stage: 'active' | 'grace' | 'expired';
    gracePeriodDays: number;
    graceEndsAt: string | null;
    graceDaysRemaining: number;
    degradedMode: boolean;
    blockedFeatures: string[];
  };
}

@Injectable()
export class ControlPlaneLifecycleClient {
  constructor(private readonly configService: ConfigService) {}

  async getTenantLifecycleState(tenantId: string): Promise<ControlPlaneTenantLifecycleState> {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_API_URL');
    const internalServiceJwtSecret = this.configService.get<string>('INTERNAL_SERVICE_JWT_SECRET');

    if (!baseUrl || !internalServiceJwtSecret) {
      throw new ServiceUnavailableException(
        'Control-plane lifecycle integration is not configured',
      );
    }

    let response: Response;
    try {
      const bearerToken = await signInternalServiceJwt({
        secret: internalServiceJwtSecret,
        callerId: this.configService.get<string>('INTERNAL_SERVICE_CALLER_ID', 'api-core'),
        audience: 'api-control-plane',
        expiresIn: this.configService.get<string>('INTERNAL_SERVICE_JWT_EXPIRES_IN', '2m'),
      });
      response = await fetch(
        `${baseUrl.replace(/\/$/, '')}/api/internal/tenant-lifecycle/tenant/${tenantId}`,
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        },
      );
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error
          ? `Control-plane lifecycle request failed: ${error.message}`
          : 'Control-plane lifecycle request failed',
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Control-plane lifecycle returned status ${response.status}`,
      );
    }

    return (await response.json()) as ControlPlaneTenantLifecycleState;
  }
}
