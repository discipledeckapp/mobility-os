import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { ConfigService } from '@nestjs/config';
import { signInternalServiceJwt } from '../auth/internal-service-jwt';

@Injectable()
export class ControlPlaneMeteringClient {
  constructor(private readonly configService: ConfigService) {}

  async recordUsageEvent(input: {
    tenantId: string;
    eventType: 'identity_verification';
    quantity: number;
    countryCode?: string;
    idempotencyKey: string;
    occurredAt: string;
  }): Promise<boolean> {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_BASE_URL');
    const internalServiceJwtSecret = this.configService.get<string>('INTERNAL_SERVICE_JWT_SECRET');

    if (!baseUrl || !internalServiceJwtSecret) {
      return false;
    }

    try {
      const bearerToken = await signInternalServiceJwt({
        secret: internalServiceJwtSecret,
        callerId: this.configService.get<string>('INTERNAL_SERVICE_CALLER_ID', 'api-intelligence'),
        audience: 'api-control-plane',
        expiresIn: this.configService.get<string>('INTERNAL_SERVICE_JWT_EXPIRES_IN', '2m'),
      });
      const response = await fetch(
        `${baseUrl.replace(/\/$/, '')}/api/internal/metering/usage-events`,
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${bearerToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(input),
        },
      );

      return response.ok;
    } catch {
      return false;
    }
  }
}
