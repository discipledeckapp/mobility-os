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
import { RequireTenantLifecycleFeature } from '../auth/decorators/tenant-lifecycle-access.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import {
  applyLinkedDriverScope,
  applyFleetScope,
  applyVehicleScope,
  assertLinkedAssignmentAccess,
  assertNoLinkedDriverMutation,
  assertFleetAccess,
  assertVehicleAccess,
  getAssignedFleetIds,
  getAssignedVehicleIds,
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

type HeaderWritableResponse = {
  setHeader(name: string, value: string): void;
};

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
    return this.service.list(
      ctx.tenantId,
      applyLinkedDriverScope(applyVehicleScope(applyFleetScope(query, ctx), ctx), ctx),
    );
  }

  @Get('import-template.csv')
  @RequirePermissions(Permission.AssignmentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: String })
  async downloadImportTemplate(@Res({ passthrough: true }) res: HeaderWritableResponse) {
    const csv = [
      'fleetName,driverPhone,vehicleCode,notes,contractType,remittanceModel,remittanceAmountMinorUnits,remittanceCurrency,remittanceFrequency,remittanceStartDate,remittanceCollectionDay,totalTargetAmountMinorUnits,principalAmountMinorUnits,depositAmountMinorUnits,contractDurationPeriods,contractEndDate',
      'Lagos Core Fleet,08012345678,AJAH-0001,Daily route,regular_hire,fixed,250000,NGN,daily,2026-03-24,,,,,',
    ].join('\n');
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader(
      'content-disposition',
      'attachment; filename=\"assignment-import-template.csv\"',
    );
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Get('export.csv')
  @RequirePermissions(Permission.AssignmentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: String })
  async exportAssignments(
    @CurrentTenant() ctx: TenantContext,
    @Res({ passthrough: true }) res: HeaderWritableResponse,
  ) {
    const csv = await this.service.exportAssignmentsCsv(ctx.tenantId, {
      ...(getAssignedFleetIds(ctx).length ? { fleetIds: getAssignedFleetIds(ctx) } : {}),
      ...(getAssignedVehicleIds(ctx).length ? { vehicleIds: getAssignedVehicleIds(ctx) } : {}),
    });
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', 'attachment; filename=\"assignments.csv\"');
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Post('import')
  @RequirePermissions(Permission.AssignmentsWrite)
  @RequireTenantLifecycleFeature('assignment_creation')
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  importAssignments(
    @CurrentTenant() ctx: TenantContext,
    @Body('csvContent') csvContent: string,
  ) {
    assertNoLinkedDriverMutation(ctx, 'import assignments');
    return this.service.importAssignmentsFromCsv(ctx.tenantId, csvContent);
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
      assertLinkedAssignmentAccess(ctx, assignment.driverId);
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return assignment;
    });
  }

  @Post()
  @RequirePermissions(Permission.AssignmentsWrite)
  @RequireTenantLifecycleFeature('assignment_creation')
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: AssignmentResponseDto })
  create(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: CreateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    assertNoLinkedDriverMutation(ctx, 'create assignments');
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
      assertNoLinkedDriverMutation(ctx, 'update assignment remittance plans');
      assertLinkedAssignmentAccess(ctx, assignment.driverId);
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
      assertLinkedAssignmentAccess(ctx, assignment.driverId);
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return this.service.start(ctx.tenantId, id);
    });
  }

  @Post(':id/accept-terms')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AssignmentResponseDto, description: 'Assignment terms accepted' })
  acceptTerms(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('acceptedFrom') acceptedFrom?: string,
    @Body('note') note?: string,
  ): Promise<AssignmentResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((assignment) => {
      assertLinkedAssignmentAccess(ctx, assignment.driverId);
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return this.service.acceptDriverTerms(ctx.tenantId, id, {
        acceptedFrom: acceptedFrom?.trim() || 'operator_console',
        confirmationMethod: acceptedFrom?.trim() || 'operator_console',
        ...(note ? { note } : {}),
      });
    });
  }

  @Post(':id/decline')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AssignmentResponseDto, description: 'Assignment declined' })
  decline(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<AssignmentResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((assignment) => {
      assertLinkedAssignmentAccess(ctx, assignment.driverId);
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return this.service.decline(ctx.tenantId, id, {
        declinedFrom: 'operator_console',
        ...(notes ? { note: notes } : {}),
      });
    });
  }

  @Post(':id/complete')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AssignmentResponseDto, description: 'Assignment ended' })
  complete(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('notes') notes?: string,
    @Body('returnedBy') returnedBy?: string,
  ): Promise<AssignmentResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((assignment) => {
      assertLinkedAssignmentAccess(ctx, assignment.driverId);
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return this.service.end(ctx.tenantId, id, 'ended', {
        ...(notes ? { notes } : {}),
        returnedBy: returnedBy?.trim() || ctx.userId,
        closeCurrentRemittanceAs: 'partially_settled',
      });
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
      assertLinkedAssignmentAccess(ctx, assignment.driverId);
      assertFleetAccess(ctx, assignment.fleetId);
      assertVehicleAccess(ctx, assignment.vehicleId);
      return this.service.end(ctx.tenantId, id, 'cancelled', {
        ...(notes ? { notes } : {}),
        returnedBy: ctx.userId,
        closeCurrentRemittanceAs: 'cancelled_due_to_assignment_end',
      });
    });
  }
}
