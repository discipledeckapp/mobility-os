import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import { signInternalServiceJwt } from '../auth/internal-service-jwt';

interface ApiCoreProvisionTenantInput {
  tenantSlug: string;
  tenantName: string;
  tenantCountry: string;
  businessEntityName: string;
  businessModel: string;
  operatingUnitName?: string;
  fleetName?: string;
  walletCurrency: string;
  operatorName: string;
  operatorEmail: string;
  operatorPhone?: string;
  operatorPassword: string;
}

interface ApiCoreProvisionTenantResult {
  tenant: {
    id: string;
    slug: string;
    name: string;
    country: string;
  };
  businessEntity: {
    id: string;
    name: string;
    country: string;
    businessModel: string;
  };
  operatingUnit: {
    id: string;
    name: string;
  };
  fleet: {
    id: string;
    name: string;
    businessModel: string;
  };
  operatorUser: {
    id: string;
    email: string;
    role: string;
    businessEntityId: string;
  };
  operationalWallet: {
    id: string;
    currency: string;
  };
}

@Injectable()
export class ApiCoreProvisioningClient {
  constructor(private readonly configService: ConfigService) {}

  async provisionTenant(input: ApiCoreProvisionTenantInput): Promise<ApiCoreProvisionTenantResult> {
    const baseUrl = this.configService.get<string>('API_CORE_BASE_URL');
    const internalServiceJwtSecret = this.configService.get<string>('INTERNAL_SERVICE_JWT_SECRET');

    if (!baseUrl || !internalServiceJwtSecret) {
      throw new ServiceUnavailableException('api-core provisioning integration is not configured.');
    }

    const bearerToken = await signInternalServiceJwt({
      secret: internalServiceJwtSecret,
      callerId: this.configService.get<string>('INTERNAL_SERVICE_CALLER_ID', 'api-control-plane'),
      audience: 'api-core',
      expiresIn: this.configService.get<string>('INTERNAL_SERVICE_JWT_EXPIRES_IN', '2m'),
    });
    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/api/v1/internal/provisioning/tenant-setup`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${bearerToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(input),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new InternalServerErrorException(
        `api-core provisioning failed with status ${response.status}: ${errorBody}`,
      );
    }

    return (await response.json()) as ApiCoreProvisionTenantResult;
  }
}
