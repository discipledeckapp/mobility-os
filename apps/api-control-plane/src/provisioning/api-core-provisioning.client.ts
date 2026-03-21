import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';

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
    const internalToken = this.configService.get<string>('INTERNAL_SERVICE_TOKEN');

    if (!baseUrl || !internalToken) {
      throw new ServiceUnavailableException('api-core provisioning integration is not configured.');
    }

    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/api/v1/internal/provisioning/tenant-setup`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-internal-service-token': internalToken,
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
