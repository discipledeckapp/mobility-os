import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { AccountingService } from './accounting.service';
import { GetAccountingProfitAndLossDto, ListAccountingLedgerDto } from './dto/accounting-query.dto';
import {
  AccountingBalanceSummaryResponseDto,
  AccountingLedgerEntryResponseDto,
  AccountingProfitAndLossResponseDto,
} from './dto/accounting-response.dto';

@ApiTags('Accounting')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get(':businessEntityId/ledger')
  @RequirePermissions(Permission.AccountingRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [AccountingLedgerEntryResponseDto] })
  listLedger(
    @CurrentTenant() ctx: TenantContext,
    @Param('businessEntityId') businessEntityId: string,
    @Query() query: ListAccountingLedgerDto,
  ): Promise<PaginatedResponse<AccountingLedgerEntryResponseDto>> {
    return this.accountingService.listLedger(ctx.tenantId, businessEntityId, query);
  }

  @Get(':businessEntityId/balance-summary')
  @RequirePermissions(Permission.AccountingRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AccountingBalanceSummaryResponseDto })
  getBalanceSummary(
    @CurrentTenant() ctx: TenantContext,
    @Param('businessEntityId') businessEntityId: string,
  ): Promise<AccountingBalanceSummaryResponseDto> {
    return this.accountingService.getBalanceSummary(ctx.tenantId, businessEntityId);
  }

  @Get(':businessEntityId/profit-and-loss')
  @RequirePermissions(Permission.AccountingRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: AccountingProfitAndLossResponseDto })
  getProfitAndLoss(
    @CurrentTenant() ctx: TenantContext,
    @Param('businessEntityId') businessEntityId: string,
    @Query() query: GetAccountingProfitAndLossDto,
  ): Promise<AccountingProfitAndLossResponseDto> {
    return this.accountingService.getProfitAndLoss(ctx.tenantId, businessEntityId, query);
  }
}
