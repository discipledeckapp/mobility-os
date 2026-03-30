import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { assertFleetAccess, assertVehicleAccess } from '../auth/tenant-access';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { VehiclesService } from '../vehicles/vehicles.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { WorkOrderResponseDto } from './dto/maintenance-response.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { MaintenanceService } from './services/maintenance-service';

function toResponse(item: Awaited<ReturnType<MaintenanceService['createWorkOrder']>> | Awaited<ReturnType<MaintenanceService['updateWorkOrder']>> | Awaited<ReturnType<MaintenanceService['listVehicleMaintenance']>>[number]): WorkOrderResponseDto {
  if (!item) {
    throw new Error('Work order response is missing.');
  }
  const cost = 'costs' in item ? item.costs[0] : undefined;
  return {
    id: item.id,
    vehicleId: item.vehicleId,
    issueDescription: item.issueDescription,
    priority: item.priority,
    status: item.status,
    vendorId: item.vendorId ?? null,
    totalCostMinorUnits: cost?.totalCostMinorUnits ?? null,
    currency: cost?.currency ?? null,
    createdAt: item.createdAt.toISOString(),
  };
}

@ApiTags('Maintenance')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Get('work-orders')
  @RequirePermissions(Permission.MaintenanceRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [WorkOrderResponseDto] })
  async listTenantMaintenance(
    @CurrentTenant() ctx: TenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<WorkOrderResponseDto>> {
    const result = await this.maintenanceService.listTenantMaintenance(ctx.tenantId, query);
    return {
      ...result,
      data: result.data.map((item) => toResponse(item)),
    };
  }

  @Post('work-orders')
  @RequirePermissions(Permission.MaintenanceWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: WorkOrderResponseDto })
  async createWorkOrder(@CurrentTenant() ctx: TenantContext, @Body() dto: CreateWorkOrderDto) {
    const vehicle = await this.vehiclesService.findOne(ctx.tenantId, dto.vehicleId);
    assertVehicleAccess(ctx, vehicle.id);
    assertFleetAccess(ctx, vehicle.fleetId);
    const item = await this.maintenanceService.createWorkOrder(ctx.tenantId, ctx.userId, dto);
    return toResponse(item);
  }

  @Get('vehicle/:vehicleId')
  @RequirePermissions(Permission.MaintenanceRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [WorkOrderResponseDto] })
  async listVehicleMaintenance(@CurrentTenant() ctx: TenantContext, @Param('vehicleId') vehicleId: string) {
    const vehicle = await this.vehiclesService.findOne(ctx.tenantId, vehicleId);
    assertVehicleAccess(ctx, vehicle.id);
    assertFleetAccess(ctx, vehicle.fleetId);
    const items = await this.maintenanceService.listVehicleMaintenance(ctx.tenantId, vehicleId);
    return items.map((item: Awaited<ReturnType<MaintenanceService['listVehicleMaintenance']>>[number]) => toResponse(item));
  }

  @Patch('work-orders/:id')
  @RequirePermissions(Permission.MaintenanceWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: WorkOrderResponseDto })
  async updateWorkOrder(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    const item = await this.maintenanceService.updateWorkOrder(ctx.tenantId, ctx.userId, id, dto);
    const vehicle = await this.vehiclesService.findOne(ctx.tenantId, item!.vehicleId);
    assertVehicleAccess(ctx, vehicle.id);
    assertFleetAccess(ctx, vehicle.fleetId);
    return toResponse(item!);
  }
}
