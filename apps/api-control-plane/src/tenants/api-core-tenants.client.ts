import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import { signInternalServiceJwt } from '../auth/internal-service-jwt';

export interface ApiCoreTenantRecord {
  id: string;
  slug: string;
  name: string;
  country: string;
  status: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiCoreTenantOwnerSummaryRecord {
  ownerUserId?: string | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  ownerRole?: string | null;
  ownerIsActive?: boolean | null;
  adminContacts?: Array<{
    userId: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    isActive: boolean;
  }>;
}

@Injectable()
export class ApiCoreTenantsClient {
  constructor(private readonly configService: ConfigService) {}

  private async request<T>(path: string): Promise<T> {
    const baseUrl = this.configService.get<string>('API_CORE_BASE_URL');
    const internalServiceJwtSecret = this.configService.get<string>('INTERNAL_SERVICE_JWT_SECRET');

    if (!baseUrl || !internalServiceJwtSecret) {
      throw new ServiceUnavailableException(
        'api-core tenant registry integration is not configured.',
      );
    }

    const bearerToken = await signInternalServiceJwt({
      secret: internalServiceJwtSecret,
      callerId: this.configService.get<string>('INTERNAL_SERVICE_CALLER_ID', 'api-control-plane'),
      audience: 'api-core',
      expiresIn: this.configService.get<string>('INTERNAL_SERVICE_JWT_EXPIRES_IN', '2m'),
    });
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1${path}`, {
      headers: {
        authorization: `Bearer ${bearerToken}`,
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new InternalServerErrorException(
        `api-core tenant registry failed with status ${response.status}: ${errorBody}`,
      );
    }

    return (await response.json()) as T;
  }

  listTenants(): Promise<ApiCoreTenantRecord[]> {
    return this.request('/internal/tenants');
  }

  getTenant(tenantId: string): Promise<ApiCoreTenantRecord> {
    return this.request(`/internal/tenants/${tenantId}`);
  }

  getTenantOwnerSummary(tenantId: string): Promise<ApiCoreTenantOwnerSummaryRecord> {
    return this.request(`/internal/tenants/${tenantId}/owner-summary`);
  }
}
