import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ApiCoreGovernanceClient } from './api-core-governance.client';
import type {
  GovernanceNotificationsOverviewDto,
  GovernanceOverviewDto,
  GovernancePrivacyOverviewDto,
} from './dto/governance-overview.dto';

@Injectable()
export class GovernanceService {
  constructor(private readonly apiCoreGovernanceClient: ApiCoreGovernanceClient) {}

  async getOverview(tenantId?: string): Promise<GovernanceOverviewDto> {
    const [privacy, notifications] = await Promise.all([
      this.getPrivacyOverview(tenantId),
      this.getNotificationsOverview(tenantId),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      privacy,
      notifications,
    };
  }

  async getPrivacyOverview(tenantId?: string): Promise<GovernancePrivacyOverviewDto> {
    return this.apiCoreGovernanceClient.getPrivacyOverview(tenantId);
  }

  async getNotificationsOverview(tenantId?: string): Promise<GovernanceNotificationsOverviewDto> {
    return this.apiCoreGovernanceClient.getNotificationsOverview(tenantId);
  }
}
