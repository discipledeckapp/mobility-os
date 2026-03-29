import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';

export interface ApiCorePrivacyOversightRecord {
  generatedAt: string;
  totals: {
    openRequests: number;
    pendingReviewRequests: number;
    closedRequests: number;
    consentEventsLast30Days: number;
    tenantsWithOpenPrivacyRequests: number;
  };
  tenantSummaries: Array<{
    tenantId: string;
    openRequests: number;
    pendingReviewRequests: number;
    closedRequests: number;
    consentEventsLast30Days: number;
    lastRequestAt: string | null;
    lastConsentAt: string | null;
  }>;
  requests: Array<{
    id: string;
    tenantId: string;
    userId: string | null;
    subjectType: string;
    subjectId: string | null;
    requestType: string;
    status: string;
    contactEmail: string | null;
    details: string | null;
    resolutionNotes: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  consents: Array<{
    id: string;
    tenantId: string;
    userId: string | null;
    subjectType: string;
    subjectId: string | null;
    policyDocument: string;
    policyVersion: string;
    consentScope: string;
    granted: boolean;
    grantedAt: string;
  }>;
  support: {
    supportEmail: string;
    supportPhonePrimary: string | null;
    supportPhoneSecondary: string | null;
    privacyPolicyVersion: string;
    termsVersion: string;
  };
}

export interface ApiCoreNotificationsOversightRecord {
  generatedAt: string;
  totals: {
    notificationsLast30Days: number;
    unreadNotifications: number;
    pushDevices: number;
    pushEnabledUsers: number;
    tenantsWithUnreadNotifications: number;
    verificationNotifications: number;
    remittanceNotifications: number;
    assignmentNotifications: number;
    complianceRiskNotifications: number;
  };
  tenantSummaries: Array<{
    tenantId: string;
    notificationsLast30Days: number;
    unreadNotifications: number;
    pushDevices: number;
    pushEnabledUsers: number;
    lastNotificationAt: string | null;
  }>;
  notifications: Array<{
    id: string;
    tenantId: string;
    userId: string;
    topic: string;
    title: string;
    body: string;
    actionUrl: string | null;
    readAt: string | null;
    createdAt: string;
    user: { name: string | null; email: string | null } | null;
  }>;
}

@Injectable()
export class ApiCoreGovernanceClient {
  constructor(private readonly configService: ConfigService) {}

  private async request<T>(path: string): Promise<T> {
    const baseUrl = this.configService.get<string>('API_CORE_BASE_URL');
    const internalToken = this.configService.get<string>('INTERNAL_SERVICE_TOKEN');

    if (!baseUrl || !internalToken) {
      throw new ServiceUnavailableException('api-core governance integration is not configured.');
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1${path}`, {
      headers: {
        'content-type': 'application/json',
        'x-internal-service-token': internalToken,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new InternalServerErrorException(
        `api-core governance failed with status ${response.status}: ${errorBody}`,
      );
    }

    return (await response.json()) as T;
  }

  getPrivacyOverview(tenantId?: string): Promise<ApiCorePrivacyOversightRecord> {
    const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
    return this.request(`/internal/privacy/oversight${query}`);
  }

  getNotificationsOverview(tenantId?: string): Promise<ApiCoreNotificationsOversightRecord> {
    const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
    return this.request(`/internal/notifications/oversight${query}`);
  }
}
