import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
import type { CpWalletEntry } from '../generated/prisma';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { RecordVerificationChargeDto } from './dto/record-verification-charge.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlatformWalletsService } from './platform-wallets.service';

@ApiExcludeController()
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/platform-wallets')
export class PlatformWalletsInternalController {
  constructor(private readonly platformWalletsService: PlatformWalletsService) {}

  @Get('tenant/:tenantId/balance')
  getBalance(@Param('tenantId') tenantId: string) {
    return this.platformWalletsService.getBalance(tenantId);
  }

  @Get('tenant/:tenantId/entries')
  listEntries(@Param('tenantId') tenantId: string): Promise<CpWalletEntry[]> {
    return this.platformWalletsService.listEntries(tenantId);
  }

  @Post('verification-charges')
  recordVerificationCharge(@Body() dto: RecordVerificationChargeDto): Promise<CpWalletEntry> {
    return this.platformWalletsService.recordVerificationCharge(dto);
  }
}
