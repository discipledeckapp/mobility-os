import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { InitializeInvoicePaymentDto } from './dto/initialize-invoice-payment.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { InitializeWalletTopUpDto } from './dto/initialize-wallet-top-up.dto';
import type { PaymentApplicationResponseDto } from './dto/payment-application-response.dto';
import type { PaymentCheckoutResponseDto } from './dto/payment-checkout-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { VerifyAndApplyPaymentDto } from './dto/verify-and-apply-payment.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PaymentsService } from './payments.service';

@ApiExcludeController()
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/payments')
export class PaymentsInternalController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('invoice-checkouts')
  initializeInvoicePayment(
    @Body() dto: InitializeInvoicePaymentDto,
  ): Promise<PaymentCheckoutResponseDto> {
    return this.paymentsService.initializeInvoicePayment(dto);
  }

  @Post('wallet-top-ups')
  initializeWalletTopUp(
    @Body() dto: InitializeWalletTopUpDto,
  ): Promise<PaymentCheckoutResponseDto> {
    return this.paymentsService.initializeWalletTopUp(dto);
  }

  @Post('verify-and-apply')
  verifyAndApplyPayment(
    @Body() dto: VerifyAndApplyPaymentDto,
  ): Promise<PaymentApplicationResponseDto> {
    return this.paymentsService.verifyAndApplyPayment(dto);
  }
}
