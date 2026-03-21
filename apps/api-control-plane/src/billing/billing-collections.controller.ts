import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingCollectionsService } from './billing-collections.service';
import { CollectionAttemptResponseDto } from './dto/collection-attempt-response.dto';
import { CollectionsRunResponseDto } from './dto/collections-run-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateCollectionReminderDto } from './dto/create-collection-reminder.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateCollectionRetryCheckoutDto } from './dto/create-collection-retry-checkout.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { RunCollectionsDto } from './dto/run-collections.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('billing/collections')
export class BillingCollectionsController {
  constructor(private readonly billingCollectionsService: BillingCollectionsService) {}

  @Post()
  @ApiCreatedResponse({ type: CollectionsRunResponseDto })
  runOverdueInvoices(@Body() dto: RunCollectionsDto): Promise<CollectionsRunResponseDto> {
    return this.billingCollectionsService.runOverdueInvoices(dto);
  }

  @Post('invoices/:invoiceId')
  @ApiCreatedResponse({ type: CollectionsRunResponseDto })
  async runForInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: RunCollectionsDto,
  ): Promise<CollectionsRunResponseDto> {
    const processedAt = dto.asOf ?? new Date().toISOString();
    const result = await this.billingCollectionsService.runForInvoice(invoiceId, dto);

    return {
      processedAt,
      invoiceCount: 1,
      results: [result],
    };
  }

  @Post('invoices/:invoiceId/reminders')
  @ApiCreatedResponse({ type: CollectionAttemptResponseDto })
  createReminder(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: CreateCollectionReminderDto,
  ): Promise<CollectionAttemptResponseDto> {
    return this.billingCollectionsService.createReminder(invoiceId, dto);
  }

  @Post('invoices/:invoiceId/retry-checkouts')
  @ApiCreatedResponse({ type: CollectionAttemptResponseDto })
  initiateRetryCheckout(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: CreateCollectionRetryCheckoutDto,
  ): Promise<CollectionAttemptResponseDto> {
    return this.billingCollectionsService.initiateRetryCheckout(invoiceId, dto);
  }
}
