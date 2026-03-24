import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { getAssignedFleetIds, getAssignedVehicleIds } from '../auth/tenant-access';
import {
  LicenceExpiryReportItemDto,
  OperationalReadinessResponseDto,
} from './dto/operational-readiness-response.dto';
import { ReportsOverviewResponseDto } from './dto/reports-overview-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  @RequirePermissions(Permission.DriversRead, Permission.RemittanceRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: ReportsOverviewResponseDto })
  getOverview(
    @CurrentTenant() ctx: TenantContext,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getOverview(
      ctx.tenantId,
      getAssignedFleetIds(ctx),
      getAssignedVehicleIds(ctx),
      dateFrom,
      dateTo,
    );
  }

  @Get('operational-readiness')
  @RequirePermissions(Permission.DriversRead, Permission.VehiclesRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: OperationalReadinessResponseDto })
  getOperationalReadiness(@CurrentTenant() ctx: TenantContext) {
    return this.reportsService.getOperationalReadiness(
      ctx.tenantId,
      getAssignedFleetIds(ctx),
      getAssignedVehicleIds(ctx),
    );
  }

  @Get('licence-expiry')
  @RequirePermissions(Permission.DriversRead, Permission.DocumentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [LicenceExpiryReportItemDto] })
  getLicenceExpiry(@CurrentTenant() ctx: TenantContext): Promise<LicenceExpiryReportItemDto[]> {
    return this.reportsService.getLicenceExpiryReport(
      ctx.tenantId,
      getAssignedFleetIds(ctx),
      getAssignedVehicleIds(ctx),
    );
  }
}
