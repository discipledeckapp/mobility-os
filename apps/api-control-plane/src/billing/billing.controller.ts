import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingService } from './billing.service';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';
import type { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('billing/invoices')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @ApiOkResponse({ type: [InvoiceResponseDto] })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'subscriptionId', required: false })
  @ApiQuery({ name: 'status', required: false })
  listInvoices(
    @Query('tenantId') tenantId?: string,
    @Query('subscriptionId') subscriptionId?: string,
    @Query('status') status?: string,
  ): Promise<InvoiceResponseDto[]> {
    return this.billingService.listInvoices({
      ...(tenantId ? { tenantId } : {}),
      ...(subscriptionId ? { subscriptionId } : {}),
      ...(status ? { status } : {}),
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: InvoiceResponseDto })
  getInvoice(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.billingService.getInvoice(id);
  }

  @Post()
  @ApiCreatedResponse({ type: InvoiceResponseDto })
  createInvoice(@Body() dto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    return this.billingService.createInvoice(dto);
  }

  @Post('subscriptions/:subscriptionId/generate')
  @ApiCreatedResponse({ type: InvoiceResponseDto })
  generateInvoiceForSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: GenerateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.billingService.generateInvoiceForSubscription(subscriptionId, dto);
  }

  @Patch(':id/open')
  @ApiOkResponse({ type: InvoiceResponseDto })
  openInvoice(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.billingService.openInvoice(id);
  }

  @Patch(':id/pay')
  @ApiOkResponse({ type: InvoiceResponseDto })
  markPaid(@Param('id') id: string, @Body('paidAt') paidAt?: string): Promise<InvoiceResponseDto> {
    return this.billingService.markPaid(id, paidAt);
  }

  @Patch(':id/void')
  @ApiOkResponse({ type: InvoiceResponseDto })
  voidInvoice(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.billingService.voidInvoice(id);
  }

  @Patch(':id/uncollectible')
  @ApiOkResponse({ type: InvoiceResponseDto })
  markUncollectible(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.billingService.markUncollectible(id);
  }
}
