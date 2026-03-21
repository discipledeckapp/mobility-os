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
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ListRemittanceDto } from './dto/list-remittance.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { RecordRemittanceDto } from './dto/record-remittance.dto';
import { RemittanceResponseDto } from './dto/remittance-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { RemittanceService } from './remittance.service';

@ApiTags('Remittance')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('remittance')
export class RemittanceController {
  constructor(private readonly service: RemittanceService) {}

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
    return this.service.list(ctx.tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(Permission.RemittanceRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: RemittanceResponseDto })
  findOne(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<RemittanceResponseDto> {
    return this.service.findOne(ctx.tenantId, id);
  }

  @Post()
  @RequirePermissions(Permission.RemittanceWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: RemittanceResponseDto })
  record(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: RecordRemittanceDto,
  ): Promise<RemittanceResponseDto> {
    return this.service.record(ctx.tenantId, dto);
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
    return this.service.confirm(ctx.tenantId, id, paidDate);
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
    return this.service.dispute(ctx.tenantId, id, notes);
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
    return this.service.waive(ctx.tenantId, id, notes, ctx.role);
  }
}
