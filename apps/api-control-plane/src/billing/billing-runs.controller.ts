import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingRunsService } from './billing-runs.service';
import { BillingRunResponseDto } from './dto/billing-run-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { RunBillingCycleDto } from './dto/run-billing-cycle.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('billing/runs')
export class BillingRunsController {
  constructor(private readonly billingRunsService: BillingRunsService) {}

  @Post()
  @ApiCreatedResponse({ type: BillingRunResponseDto })
  async runDueSubscriptions(@Body() dto: RunBillingCycleDto): Promise<BillingRunResponseDto> {
    return this.billingRunsService.runDueSubscriptions(dto);
  }

  @Post('subscriptions/:subscriptionId')
  @ApiCreatedResponse({ type: BillingRunResponseDto })
  async runSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: RunBillingCycleDto,
  ): Promise<BillingRunResponseDto> {
    const processedAt = dto.asOf ?? new Date().toISOString();
    const result = await this.billingRunsService.runForSubscription(subscriptionId, dto);

    return {
      processedAt,
      subscriptionCount: 1,
      results: [result],
    };
  }
}
