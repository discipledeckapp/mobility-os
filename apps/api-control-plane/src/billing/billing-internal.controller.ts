import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingService } from './billing.service';

@ApiExcludeController()
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/billing')
export class BillingInternalController {
  constructor(private readonly billingService: BillingService) {}

  @Get('tenant/:tenantId/invoices')
  listTenantInvoices(@Param('tenantId') tenantId: string, @Query('status') status?: string) {
    return this.billingService.listInvoices({
      tenantId,
      ...(status ? { status } : {}),
    });
  }
}
