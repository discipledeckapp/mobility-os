import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import {
  applyFleetScope,
  applyVehicleScope,
  assertFleetAccess,
  assertVehicleAccess,
  getAssignedFleetIds,
} from '../auth/tenant-access';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateVehicleDto } from './dto/create-vehicle.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ListVehiclesDto } from './dto/list-vehicles.dto';
import {
  CreateVehicleIncidentDto,
  CreateVehicleInspectionDto,
  CreateVehicleMaintenanceEventDto,
  UpsertVehicleMaintenanceScheduleDto,
  VehicleIncidentResponseDto,
  VehicleInspectionResponseDto,
  VehicleMaintenanceEventResponseDto,
  VehicleMaintenanceScheduleResponseDto,
} from './dto/vehicle-operations.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleCodeSuggestionResponseDto } from './dto/vehicle-code-suggestion-response.dto';
import { VehicleDetailResponseDto } from './dto/vehicle-detail-response.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { VehiclesService } from './vehicles.service';

type HeaderWritableResponse = {
  setHeader(name: string, value: string): void;
};

@ApiTags('Vehicles')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @Get()
  @RequirePermissions(Permission.VehiclesRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [VehicleResponseDto] })
  @ApiQuery({ name: 'fleetId', required: false })
  list(
    @CurrentTenant() ctx: TenantContext,
    @Query() query: ListVehiclesDto,
  ): Promise<PaginatedResponse<VehicleResponseDto>> {
    return this.service.list(ctx.tenantId, applyVehicleScope(applyFleetScope(query, ctx), ctx));
  }

  @Get('code-suggestion')
  @RequirePermissions(Permission.VehiclesRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: VehicleCodeSuggestionResponseDto })
  @ApiQuery({ name: 'fleetId', required: true })
  suggestCode(
    @CurrentTenant() ctx: TenantContext,
    @Query('fleetId') fleetId: string,
  ): Promise<VehicleCodeSuggestionResponseDto> {
    assertFleetAccess(ctx, fleetId);
    return this.service.suggestTenantVehicleCode(ctx.tenantId, fleetId);
  }

  @Get('import-template.csv')
  @RequirePermissions(Permission.VehiclesRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: String })
  async downloadImportTemplate(@Res({ passthrough: true }) res: HeaderWritableResponse) {
    const csv = [
      'fleetName,tenantVehicleCode,vehicleType,make,model,trim,year,plate,color,vin,odometerKm,acquisitionCostMinorUnits,acquisitionDate,currentEstimatedValueMinorUnits,valuationSource',
      'Lagos Core Fleet,AJAH-0001,motorcycle,Honda,CB150R,,2024,LAG123XY,Red,1HGCM82633A004352,1250,245000000,2025-01-12,220000000,operator-estimate',
    ].join('\n');
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', 'attachment; filename=\"vehicle-import-template.csv\"');
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Get('export.csv')
  @RequirePermissions(Permission.VehiclesRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: String })
  async exportVehicles(
    @CurrentTenant() ctx: TenantContext,
    @Res({ passthrough: true }) res: HeaderWritableResponse,
  ) {
    const csv = await this.service.exportVehiclesCsv(ctx.tenantId, {
      ...(getAssignedFleetIds(ctx).length ? { fleetIds: getAssignedFleetIds(ctx) } : {}),
    });
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', 'attachment; filename=\"vehicles.csv\"');
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Post('import')
  @RequirePermissions(Permission.VehiclesWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  importVehicles(
    @CurrentTenant() ctx: TenantContext,
    @Body('csvContent') csvContent: string,
  ) {
    return this.service.importVehiclesFromCsv(ctx.tenantId, csvContent);
  }

  @Get(':id')
  @RequirePermissions(Permission.VehiclesRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: VehicleDetailResponseDto })
  findOne(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<VehicleDetailResponseDto> {
    return this.service.findOneDetailed(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return vehicle;
    });
  }

  @Post()
  @RequirePermissions(Permission.VehiclesWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: VehicleResponseDto })
  create(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    assertFleetAccess(ctx, dto.fleetId);
    return this.service.create(ctx.tenantId, dto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.VehiclesWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: VehicleResponseDto })
  update(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return this.service.update(ctx.tenantId, id, dto);
    });
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.VehiclesWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: VehicleResponseDto })
  updateStatus(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<VehicleResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return this.service.updateStatus(ctx.tenantId, id, status);
    });
  }

  @Get(':id/inspections')
  @RequirePermissions(Permission.InspectionsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [VehicleInspectionResponseDto] })
  listInspections(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<VehicleInspectionResponseDto[]> {
    return this.service.findOne(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return this.service.listInspections(ctx.tenantId, id).then((items) =>
        items.map((item) => ({
          ...item,
          inspectionDate: item.inspectionDate.toISOString(),
          nextInspectionDueAt: item.nextInspectionDueAt?.toISOString() ?? null,
          createdAt: item.createdAt.toISOString(),
        })),
      );
    });
  }

  @Post(':id/inspections')
  @RequirePermissions(Permission.InspectionsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: VehicleInspectionResponseDto })
  createInspection(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: CreateVehicleInspectionDto,
  ): Promise<VehicleInspectionResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return this.service.createInspection(ctx.tenantId, id, ctx.userId, dto).then((item) => ({
        ...item,
        inspectionDate: item.inspectionDate.toISOString(),
        nextInspectionDueAt: item.nextInspectionDueAt?.toISOString() ?? null,
        createdAt: item.createdAt.toISOString(),
      }));
    });
  }

  @Get(':id/maintenance-schedules')
  @RequirePermissions(Permission.MaintenanceRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [VehicleMaintenanceScheduleResponseDto] })
  listMaintenanceSchedules(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<VehicleMaintenanceScheduleResponseDto[]> {
    return this.service.findOne(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return this.service.listMaintenanceSchedules(ctx.tenantId, id).then((items) =>
        items.map((item) => ({
          ...item,
          nextDueAt: item.nextDueAt?.toISOString() ?? null,
          createdAt: item.createdAt.toISOString(),
        })),
      );
    });
  }

  @Post(':id/maintenance-schedules')
  @RequirePermissions(Permission.MaintenanceWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: VehicleMaintenanceScheduleResponseDto })
  upsertMaintenanceSchedule(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpsertVehicleMaintenanceScheduleDto,
  ): Promise<VehicleMaintenanceScheduleResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return this.service.upsertMaintenanceSchedule(ctx.tenantId, id, ctx.userId, dto).then((item) => ({
        ...item,
        nextDueAt: item.nextDueAt?.toISOString() ?? null,
        createdAt: item.createdAt.toISOString(),
      }));
    });
  }

  @Get(':id/maintenance-events')
  @RequirePermissions(Permission.MaintenanceRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [VehicleMaintenanceEventResponseDto] })
  listMaintenanceEvents(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<VehicleMaintenanceEventResponseDto[]> {
    return this.service.findOne(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return this.service.listMaintenanceEvents(ctx.tenantId, id).then((items) =>
        items.map((item) => ({
          ...item,
          scheduledFor: item.scheduledFor?.toISOString() ?? null,
          completedAt: item.completedAt?.toISOString() ?? null,
          createdAt: item.createdAt.toISOString(),
        })),
      );
    });
  }

  @Post(':id/maintenance-events')
  @RequirePermissions(Permission.MaintenanceWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: VehicleMaintenanceEventResponseDto })
  createMaintenanceEvent(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: CreateVehicleMaintenanceEventDto,
  ): Promise<VehicleMaintenanceEventResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return this.service.createMaintenanceEvent(ctx.tenantId, id, ctx.userId, dto).then((item) => ({
        ...item,
        scheduledFor: item.scheduledFor?.toISOString() ?? null,
        completedAt: item.completedAt?.toISOString() ?? null,
        createdAt: item.createdAt.toISOString(),
      }));
    });
  }

  @Get(':id/incidents')
  @RequirePermissions(Permission.VehiclesRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [VehicleIncidentResponseDto] })
  listIncidents(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<VehicleIncidentResponseDto[]> {
    return this.service.findOne(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return this.service.listIncidents(ctx.tenantId, id).then((items) =>
        items.map((item) => ({
          ...item,
          occurredAt: item.occurredAt.toISOString(),
          createdAt: item.createdAt.toISOString(),
        })),
      );
    });
  }

  @Post(':id/incidents')
  @RequirePermissions(Permission.VehiclesWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: VehicleIncidentResponseDto })
  createIncident(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: CreateVehicleIncidentDto,
  ): Promise<VehicleIncidentResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((vehicle) => {
      assertVehicleAccess(ctx, vehicle.id);
      assertFleetAccess(ctx, vehicle.fleetId);
      return this.service.createIncident(ctx.tenantId, id, ctx.userId, dto).then((item) => ({
        ...item,
        occurredAt: item.occurredAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
      }));
    });
  }
}
