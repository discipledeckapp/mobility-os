import { PlatformRole } from '@mobility-os/authz-model';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RequirePlatformRoles } from '../auth/decorators/require-platform-roles.decorator';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';
import {
  GovernanceNotificationsOverviewDto,
  GovernanceOverviewDto,
  GovernancePrivacyOverviewDto,
} from './dto/governance-overview.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { GovernanceService } from './governance.service';

@ApiTags('Governance')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard, PlatformRolesGuard)
@RequirePlatformRoles(PlatformRole.PlatformAdmin, PlatformRole.SupportAgent)
@Controller('governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get('oversight')
  @ApiOkResponse({ type: GovernanceOverviewDto })
  getOverview(): Promise<GovernanceOverviewDto> {
    return this.governanceService.getOverview();
  }

  @Get('oversight/privacy')
  @ApiOkResponse({ type: GovernancePrivacyOverviewDto })
  getPrivacyOverview(): Promise<GovernancePrivacyOverviewDto> {
    return this.governanceService.getPrivacyOverview();
  }

  @Get('oversight/notifications')
  @ApiOkResponse({ type: GovernanceNotificationsOverviewDto })
  getNotificationsOverview(): Promise<GovernanceNotificationsOverviewDto> {
    return this.governanceService.getNotificationsOverview();
  }

  @Get('oversight/tenants/:tenantId')
  @ApiOkResponse({ type: GovernanceOverviewDto })
  getTenantOverview(@Param('tenantId') tenantId: string): Promise<GovernanceOverviewDto> {
    return this.governanceService.getOverview(tenantId);
  }
}
