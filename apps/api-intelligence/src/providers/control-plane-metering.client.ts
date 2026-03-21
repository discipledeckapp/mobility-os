import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { ConfigService } from '@nestjs/config';

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
    const internalToken = this.configService.get<string>('INTERNAL_SERVICE_TOKEN');

    if (!baseUrl || !internalToken) {
      return false;
    }

    try {
      const response = await fetch(
        `${baseUrl.replace(/\/$/, '')}/api/internal/metering/usage-events`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-internal-service-token': internalToken,
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
