import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateVehicleDto } from './dto/create-vehicle.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ListVehiclesDto } from './dto/list-vehicles.dto';
import type { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleCodeSuggestionResponseDto } from './dto/vehicle-code-suggestion-response.dto';
import { VehicleDetailResponseDto } from './dto/vehicle-detail-response.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { VehiclesService } from './vehicles.service';

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
    return this.service.list(ctx.tenantId, query);
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
    return this.service.suggestTenantVehicleCode(ctx.tenantId, fleetId);
  }

  @Get(':id')
  @RequirePermissions(Permission.VehiclesRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: VehicleDetailResponseDto })
  findOne(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<VehicleDetailResponseDto> {
    return this.service.findOneDetailed(ctx.tenantId, id);
  }

  @Post()
  @RequirePermissions(Permission.VehiclesWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: VehicleResponseDto })
  create(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
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
    return this.service.update(ctx.tenantId, id, dto);
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
    return this.service.updateStatus(ctx.tenantId, id, status);
  }
}
