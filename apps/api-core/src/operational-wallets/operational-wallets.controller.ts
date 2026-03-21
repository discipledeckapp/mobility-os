import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import {
  type CreateWalletEntryDto,
  WalletBalanceResponseDto,
  WalletEntryResponseDto,
} from './dto/wallet-entry.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { OperationalWalletsService } from './operational-wallets.service';

// Routes are scoped to a businessEntityId — each business entity has its own wallet.
// Tenants can only access wallets for their own business entities (enforced in service).

@ApiTags('Operational Wallets')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('operational-wallets')
export class OperationalWalletsController {
  constructor(private readonly service: OperationalWalletsService) {}

  @Get(':businessEntityId/balance')
  @ApiOkResponse({ type: WalletBalanceResponseDto })
  getBalance(
    @CurrentTenant() ctx: TenantContext,
    @Param('businessEntityId') businessEntityId: string,
  ): Promise<WalletBalanceResponseDto> {
    return this.service.getBalance(ctx.tenantId, businessEntityId);
  }

  @Get(':businessEntityId/entries')
  @ApiOkResponse({ type: [WalletEntryResponseDto] })
  listEntries(
    @CurrentTenant() ctx: TenantContext,
    @Param('businessEntityId') businessEntityId: string,
  ): Promise<WalletEntryResponseDto[]> {
    return this.service.listEntries(ctx.tenantId, businessEntityId);
  }

  @Post(':businessEntityId/entries')
  @ApiCreatedResponse({ type: WalletEntryResponseDto })
  addEntry(
    @CurrentTenant() ctx: TenantContext,
    @Param('businessEntityId') businessEntityId: string,
    @Body() dto: CreateWalletEntryDto,
  ): Promise<WalletEntryResponseDto> {
    return this.service.addEntry(ctx.tenantId, businessEntityId, dto);
  }
}
