import { PlatformRole } from '@mobility-os/authz-model';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RequirePlatformRoles } from '../auth/decorators/require-platform-roles.decorator';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';
import { OperationsOverviewDto, OperationsTenantSummaryDto } from './dto/operations-overview.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { OperationsService } from './operations.service';

@ApiTags('Operations')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard, PlatformRolesGuard)
@RequirePlatformRoles(PlatformRole.PlatformAdmin, PlatformRole.SupportAgent)
@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get('oversight')
  @ApiOkResponse({ type: OperationsOverviewDto })
  getOverview(): Promise<OperationsOverviewDto> {
    return this.operationsService.getOverview();
  }

  @Get('oversight/tenants/:tenantId')
  @ApiOkResponse({ type: OperationsTenantSummaryDto })
  getTenantSummary(@Param('tenantId') tenantId: string): Promise<OperationsTenantSummaryDto> {
    return this.operationsService.getTenantOperationalSummary(tenantId);
  }
}
