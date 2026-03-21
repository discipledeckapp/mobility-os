import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
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
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AssignmentsService } from './assignments.service';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import type { CreateAssignmentDto } from './dto/create-assignment.dto';
import type { ListAssignmentsDto } from './dto/list-assignments.dto';

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
    return this.service.list(ctx.tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(Permission.AssignmentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AssignmentResponseDto })
  findOne(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<AssignmentResponseDto> {
    return this.service.findOne(ctx.tenantId, id);
  }

  @Post()
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: AssignmentResponseDto })
  create(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: CreateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    return this.service.create(ctx.tenantId, dto);
  }

  @Post(':id/start')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AssignmentResponseDto, description: 'Assignment started' })
  start(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<AssignmentResponseDto> {
    return this.service.start(ctx.tenantId, id);
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
    return this.service.end(ctx.tenantId, id, 'completed', notes);
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
    return this.service.end(ctx.tenantId, id, 'cancelled', notes);
  }
}
