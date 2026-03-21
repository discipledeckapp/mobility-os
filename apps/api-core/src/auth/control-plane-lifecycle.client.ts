import { Injectable, ServiceUnavailableException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';

export interface ControlPlaneTenantLifecycleState {
  tenantId: string;
  subscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

@Injectable()
export class ControlPlaneLifecycleClient {
  constructor(private readonly configService: ConfigService) {}

  async getTenantLifecycleState(tenantId: string): Promise<ControlPlaneTenantLifecycleState> {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_API_URL');
    const internalToken = this.configService.get<string>('INTERNAL_SERVICE_TOKEN');

    if (!baseUrl || !internalToken) {
      throw new ServiceUnavailableException(
        'Control-plane lifecycle integration is not configured',
      );
    }

    let response: Response;
    try {
      response = await fetch(
        `${baseUrl.replace(/\/$/, '')}/internal/tenant-lifecycle/tenant/${tenantId}`,
        {
          headers: {
            'x-internal-service-token': internalToken,
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
