import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import type { CpWalletEntry } from '../generated/prisma';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreatePlatformWalletEntryDto } from './dto/create-platform-wallet-entry.dto';
import { PlatformWalletBalanceDto } from './dto/platform-wallet-balance.dto';
import { PaginatedPlatformWalletLedgerDto } from './dto/platform-wallet-ledger-item.dto';
import { PlatformWalletSummaryDto } from './dto/platform-wallet-summary.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlatformWalletsService } from './platform-wallets.service';

@ApiTags('Platform Wallets')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('platform-wallets')
export class PlatformWalletsController {
  constructor(private readonly platformWalletsService: PlatformWalletsService) {}

  @Get()
  @ApiOkResponse({ type: [PlatformWalletSummaryDto] })
  listWalletSummaries(): Promise<PlatformWalletSummaryDto[]> {
    return this.platformWalletsService.listWalletSummaries();
  }

  @Get('ledger')
  @ApiOkResponse({ type: PaginatedPlatformWalletLedgerDto })
  listLedger(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedPlatformWalletLedgerDto> {
    return this.platformWalletsService.listLedger(
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Get('tenant/:tenantId/balance')
  @ApiOkResponse({ type: PlatformWalletBalanceDto })
  getBalance(@Param('tenantId') tenantId: string): Promise<PlatformWalletBalanceDto> {
    return this.platformWalletsService.getBalance(tenantId);
  }

  @Get('tenant/:tenantId/entries')
  @ApiOkResponse({ description: 'Platform wallet ledger entries' })
  listEntries(@Param('tenantId') tenantId: string): Promise<CpWalletEntry[]> {
    return this.platformWalletsService.listEntries(tenantId);
  }

  @Post('tenant/:tenantId/entries')
  @ApiCreatedResponse({ description: 'Platform wallet entry created' })
  createEntry(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreatePlatformWalletEntryDto,
  ): Promise<CpWalletEntry> {
    return this.platformWalletsService.createEntry(tenantId, dto);
  }
}
