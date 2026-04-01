import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import { signInternalServiceJwt } from '../auth/internal-service-jwt';

export type MeteringEventType = 'active_driver' | 'active_vehicle';

@Injectable()
export class ControlPlaneMeteringClient {
  private readonly logger = new Logger(ControlPlaneMeteringClient.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Fire a usage metering event to the control plane.
   * This is always fire-and-forget — failures are logged but never thrown.
   */
  fireEvent(tenantId: string, eventType: MeteringEventType, quantity = 1): void {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_API_URL');
    const internalServiceJwtSecret = this.configService.get<string>('INTERNAL_SERVICE_JWT_SECRET');

    if (!baseUrl || !internalServiceJwtSecret) {
      this.logger.warn(
        `Skipping metering event '${eventType}' for tenant '${tenantId}': control-plane integration is not configured`,
      );
      return;
    }

    signInternalServiceJwt({
      secret: internalServiceJwtSecret,
      callerId: this.configService.get<string>('INTERNAL_SERVICE_CALLER_ID', 'api-core'),
      audience: 'api-control-plane',
      expiresIn: this.configService.get<string>('INTERNAL_SERVICE_JWT_EXPIRES_IN', '2m'),
    })
      .then((token) =>
        fetch(`${baseUrl.replace(/\/$/, '')}/api/internal/metering/usage-events`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ tenantId, eventType, quantity }),
        }),
      )
      .then((res) => {
        if (!res.ok) {
          this.logger.warn(
            `Metering event '${eventType}' for tenant '${tenantId}' returned status ${res.status}`,
          );
        }
      })
      .catch((error: unknown) => {
        this.logger.warn(
          `Metering event '${eventType}' for tenant '${tenantId}' failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      });
  }
}
