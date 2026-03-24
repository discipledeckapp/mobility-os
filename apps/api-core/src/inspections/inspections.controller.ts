import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { assertFleetAccess, assertVehicleAccess } from '../auth/tenant-access';
import { VehiclesService } from '../vehicles/vehicles.service';
import { InspectionResponseDto } from './dto/inspection-response.dto';
import { ReviewInspectionDto } from './dto/review-inspection.dto';
import { StartInspectionDto } from './dto/start-inspection.dto';
import { SubmitInspectionDto } from './dto/submit-inspection.dto';
import { InspectionService } from './services/inspection-service';

function toInspectionResponse(
  inspection: {
    id: string;
    vehicleId: string;
    templateId: string;
    inspectionType: string;
    status: string;
    summary: string | null;
    odometerKm: number | null;
    startedAt: Date;
    submittedAt: Date | null;
    reviewedAt: Date | null;
    results: Array<{ id: string; checklistItemId: string; result: string; notes: string | null }>;
    scorecards: Array<{ score: number; riskLevel: string }>;
  },
): InspectionResponseDto {
  return {
    id: inspection.id,
    vehicleId: inspection.vehicleId,
    templateId: inspection.templateId,
    inspectionType: inspection.inspectionType,
    status: inspection.status,
    summary: inspection.summary ?? null,
    odometerKm: inspection.odometerKm ?? null,
    startedAt: inspection.startedAt.toISOString(),
    submittedAt: inspection.submittedAt?.toISOString() ?? null,
    reviewedAt: inspection.reviewedAt?.toISOString() ?? null,
    results: inspection.results.map((result: { id: string; checklistItemId: string; result: string; notes: string | null }) => ({
      id: result.id,
      checklistItemId: result.checklistItemId,
      result: result.result,
      notes: result.notes ?? null,
    })),
    latestScore: inspection.scorecards[0]
      ? {
          score: inspection.scorecards[0].score,
          riskLevel: inspection.scorecards[0].riskLevel,
        }
      : null,
  };
}

@ApiTags('Inspections')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('inspections')
export class InspectionsController {
  constructor(
    private readonly inspectionService: InspectionService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Post('start')
  @RequirePermissions(Permission.InspectionsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: InspectionResponseDto })
  async startInspection(@CurrentTenant() ctx: TenantContext, @Body() dto: StartInspectionDto) {
    const vehicle = await this.vehiclesService.findOne(ctx.tenantId, dto.vehicleId);
    assertVehicleAccess(ctx, vehicle.id);
    assertFleetAccess(ctx, vehicle.fleetId);
    const inspection = await this.inspectionService.startInspection(ctx.tenantId, ctx.userId, dto);
    return toInspectionResponse(inspection);
  }

  @Post(':id/submit')
  @RequirePermissions(Permission.InspectionsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: InspectionResponseDto })
  async submitInspection(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: SubmitInspectionDto,
  ) {
    const inspection = await this.inspectionService.submitInspection(ctx.tenantId, ctx.userId, id, dto);
    const vehicle = await this.vehiclesService.findOne(ctx.tenantId, inspection!.vehicleId);
    assertVehicleAccess(ctx, vehicle.id);
    assertFleetAccess(ctx, vehicle.fleetId);
    return toInspectionResponse(inspection!);
  }

  @Get(':vehicleId')
  @RequirePermissions(Permission.InspectionsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [InspectionResponseDto] })
  async listVehicleInspections(@CurrentTenant() ctx: TenantContext, @Param('vehicleId') vehicleId: string) {
    const vehicle = await this.vehiclesService.findOne(ctx.tenantId, vehicleId);
    assertVehicleAccess(ctx, vehicle.id);
    assertFleetAccess(ctx, vehicle.fleetId);
    const items = await this.inspectionService.listVehicleInspections(ctx.tenantId, vehicleId);
    return items.map((item: Awaited<ReturnType<InspectionService['listVehicleInspections']>>[number]) => toInspectionResponse(item));
  }

  @Post(':id/review')
  @RequirePermissions(Permission.InspectionsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: InspectionResponseDto })
  async reviewInspection(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: ReviewInspectionDto,
  ) {
    const inspection = await this.inspectionService.reviewInspection(ctx.tenantId, ctx.userId, id, dto);
    const vehicle = await this.vehiclesService.findOne(ctx.tenantId, inspection!.vehicleId);
    assertVehicleAccess(ctx, vehicle.id);
    assertFleetAccess(ctx, vehicle.fleetId);
    return toInspectionResponse(inspection!);
  }
}
