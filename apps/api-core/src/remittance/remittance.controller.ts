import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import {
  Body,
  Controller,
  Get,
  Param,
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
import { AssignmentsService } from '../assignments/assignments.service';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ListRemittanceDto } from './dto/list-remittance.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { RecordRemittanceDto } from './dto/record-remittance.dto';
import { RemittanceResponseDto } from './dto/remittance-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { RemittanceService } from './remittance.service';

type HeaderWritableResponse = {
  setHeader(name: string, value: string): void;
};

@ApiTags('Remittance')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('remittance')
export class RemittanceController {
  constructor(
    private readonly service: RemittanceService,
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @Get()
  @RequirePermissions(Permission.RemittanceRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [RemittanceResponseDto] })
  @ApiQuery({ name: 'assignmentId', required: false })
  @ApiQuery({ name: 'driverId', required: false })
  @ApiQuery({ name: 'status', required: false })
  list(
    @CurrentTenant() ctx: TenantContext,
    @Query() query: ListRemittanceDto,
  ): Promise<PaginatedResponse<RemittanceResponseDto>> {
    return this.service.list(
      ctx.tenantId,
      applyLinkedDriverScope(applyVehicleScope(applyFleetScope(query, ctx), ctx), ctx),
    );
  }

  @Get('export.csv')
  @RequirePermissions(Permission.RemittanceRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: String })
  async exportCsv(
    @CurrentTenant() ctx: TenantContext,
    @Res({ passthrough: true }) res: HeaderWritableResponse,
  ) {
    const csv = await this.service.exportCsv(ctx.tenantId, {
      ...(getAssignedVehicleIds(ctx).length
        ? { vehicleIds: getAssignedVehicleIds(ctx) }
        : {}),
      ...(getAssignedFleetIds(ctx).length ? { fleetIds: getAssignedFleetIds(ctx) } : {}),
    });
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', 'attachment; filename=\"remittance-history.csv\"');
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Get(':id')
  @RequirePermissions(Permission.RemittanceRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: RemittanceResponseDto })
  findOne(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<RemittanceResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((record) => {
      assertLinkedAssignmentAccess(ctx, record.driverId);
      assertFleetAccess(ctx, record.fleetId);
      assertVehicleAccess(ctx, record.vehicleId);
      return record;
    });
  }

  @Post()
  @RequirePermissions(Permission.RemittanceWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: RemittanceResponseDto })
  record(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: RecordRemittanceDto,
  ): Promise<RemittanceResponseDto> {
    return this.assignmentsService.findOne(ctx.tenantId, dto.assignmentId).then((assignment) => {
      assertLinkedAssignmentAccess(ctx, assignment.driverId);
      return this.service.record(ctx.tenantId, dto);
    });
  }

  @Post(':id/confirm')
  @RequirePermissions(Permission.RemittanceApprove)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: RemittanceResponseDto })
  confirm(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('paidDate') paidDate: string,
  ): Promise<RemittanceResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((record) => {
      assertNoLinkedDriverMutation(ctx, 'confirm remittance');
      assertLinkedAssignmentAccess(ctx, record.driverId);
      assertFleetAccess(ctx, record.fleetId);
      assertVehicleAccess(ctx, record.vehicleId);
      return this.service.confirm(ctx.tenantId, id, paidDate);
    });
  }

  @Post(':id/dispute')
  @RequirePermissions(Permission.RemittanceWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: RemittanceResponseDto })
  dispute(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('notes') notes: string,
  ): Promise<RemittanceResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((record) => {
      assertLinkedAssignmentAccess(ctx, record.driverId);
      assertFleetAccess(ctx, record.fleetId);
      assertVehicleAccess(ctx, record.vehicleId);
      return this.service.dispute(ctx.tenantId, id, notes);
    });
  }

  @Post(':id/waive')
  @RequirePermissions(Permission.RemittanceApprove)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: RemittanceResponseDto })
  waive(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('notes') notes: string,
  ): Promise<RemittanceResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((record) => {
      assertNoLinkedDriverMutation(ctx, 'waive remittance');
      assertLinkedAssignmentAccess(ctx, record.driverId);
      assertFleetAccess(ctx, record.fleetId);
      assertVehicleAccess(ctx, record.vehicleId);
      return this.service.waive(ctx.tenantId, id, notes, ctx.role);
    });
  }
}
