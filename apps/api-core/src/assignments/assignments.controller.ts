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
import {
  applyFleetScope,
  applyVehicleScope,
  assertFleetAccess,
  assertVehicleAccess,
} from '../auth/tenant-access';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AssignmentsService } from './assignments.service';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateAssignmentDto } from './dto/create-assignment.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ListAssignmentsDto } from './dto/list-assignments.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { UpdateAssignmentRemittancePlanDto } from './dto/update-assignment-remittance-plan.dto';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  @Get()
  @RequirePermissions(Permission.AssignmentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [AssignmentResponseDto] })
  @ApiQuery({ name: 'driverId', required: false })
  @ApiQuery({ name: 'vehicleId', required: false })
  @ApiQuery({ name: 'fleetId', required: false })
  list(
    @CurrentTenant() ctx: TenantContext,
    @Query() query: ListAssignmentsDto,
  ): Promise<PaginatedResponse<AssignmentResponseDto>> {
    return this.service.list(ctx.tenantId, applyVehicleScope(applyFleetScope(query, ctx), ctx));
  }

  @Get(':id')
  @RequirePermissions(Permission.AssignmentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AssignmentResponseDto })
  findOne(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<AssignmentResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((assignment) => {
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return assignment;
    });
  }

  @Post()
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: AssignmentResponseDto })
  create(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: CreateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    if (dto.fleetId) {
      assertFleetAccess(ctx, dto.fleetId);
    }
    if (dto.vehicleId) {
      assertVehicleAccess(ctx, dto.vehicleId);
    }
    return this.service.create(ctx.tenantId, dto);
  }

  @Patch(':id/remittance-plan')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AssignmentResponseDto })
  updateRemittancePlan(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentRemittancePlanDto,
  ): Promise<AssignmentResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((assignment) => {
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return this.service.updateRemittancePlan(ctx.tenantId, id, dto);
    });
  }

  @Post(':id/start')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AssignmentResponseDto, description: 'Assignment started' })
  start(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<AssignmentResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((assignment) => {
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return this.service.start(ctx.tenantId, id);
    });
  }

  @Post(':id/complete')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AssignmentResponseDto, description: 'Assignment completed' })
  complete(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<AssignmentResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((assignment) => {
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return this.service.end(ctx.tenantId, id, 'completed', notes);
    });
  }

  @Post(':id/cancel')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AssignmentResponseDto, description: 'Assignment cancelled' })
  cancel(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<AssignmentResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((assignment) => {
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return this.service.end(ctx.tenantId, id, 'cancelled', notes);
    });
  }
}
