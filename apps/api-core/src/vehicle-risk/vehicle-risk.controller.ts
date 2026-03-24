import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { assertFleetAccess, assertVehicleAccess } from '../auth/tenant-access';
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleRiskResponseDto } from './dto/vehicle-risk-response.dto';
import { VehicleRiskService } from './services/vehicle-risk.service';

@ApiTags('Vehicle Risk')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('vehicles')
export class VehicleRiskController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly vehicleRiskService: VehicleRiskService,
  ) {}

  @Get(':id/risk')
  @RequirePermissions(Permission.VehiclesRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: VehicleRiskResponseDto })
  async getVehicleRisk(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    const vehicle = await this.vehiclesService.findOne(ctx.tenantId, id);
    assertVehicleAccess(ctx, vehicle.id);
    assertFleetAccess(ctx, vehicle.fleetId);
    const risk = await this.vehicleRiskService.getVehicleRisk(ctx.tenantId, id);
    return {
      ...risk,
      evaluatedAt: risk.evaluatedAt.toISOString(),
    };
  }
}
