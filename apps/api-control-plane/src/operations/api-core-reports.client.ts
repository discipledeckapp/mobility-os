import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import { signInternalServiceJwt } from '../auth/internal-service-jwt';

export interface ApiCoreOperationalSummaryRecord {
  tenantId: string;
  generatedAt: string;
  driverActivity: {
    active: number;
    inactive: number;
    activeVerified: number;
    activeUnverified: number;
    onboardingPool: number;
  };
  verificationHealth: {
    driversAwaitingActivation: number;
    pendingLicenceReviewCount: number;
    providerRetryRequiredCount: number;
    expiringLicencesSoonCount: number;
    expiredLicencesCount: number;
  };
  riskSummary: {
    atRiskAssignmentCount: number;
    vehiclesAtRiskCount: number;
    criticalMaintenanceCount: number;
    inspectionComplianceRate: number;
  };
  topDriverIssues: Array<{
    driverId: string;
    fullName: string;
    fleetId: string;
    activationReadiness: string;
    activationReadinessReasons: string[];
    assignmentReadiness: string;
    remittanceRiskStatus?: string | null;
    remittanceRiskReason?: string | null;
    riskBand?: string | null;
  }>;
  topVehicleIssues: Array<{
    vehicleId: string;
    primaryLabel: string;
    fleetId: string;
    status: string;
    maintenanceSummary: string;
    remittanceRiskStatus?: string | null;
    remittanceRiskReason?: string | null;
  }>;
  topLicenceExpiries: Array<{
    driverId: string;
    fullName: string;
    fleetId: string;
    expiresAt: string;
    daysUntilExpiry: number;
  }>;
}

@Injectable()
export class ApiCoreReportsClient {
  constructor(private readonly configService: ConfigService) {}

  private async request<T>(path: string): Promise<T> {
    const baseUrl = this.configService.get<string>('API_CORE_BASE_URL');
    const internalServiceJwtSecret = this.configService.get<string>('INTERNAL_SERVICE_JWT_SECRET');

    if (!baseUrl || !internalServiceJwtSecret) {
      throw new ServiceUnavailableException('api-core reports integration is not configured.');
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
        `api-core reports failed with status ${response.status}: ${errorBody}`,
      );
    }

    return (await response.json()) as T;
  }

  getTenantOperationalSummary(tenantId: string): Promise<ApiCoreOperationalSummaryRecord> {
    return this.request(`/internal/reports/tenants/${tenantId}/operational-summary`);
  }
}
