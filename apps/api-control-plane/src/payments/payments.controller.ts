import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { InitializeInvoicePaymentDto } from './dto/initialize-invoice-payment.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { InitializeWalletTopUpDto } from './dto/initialize-wallet-top-up.dto';
import { PaymentApplicationResponseDto } from './dto/payment-application-response.dto';
import { PaymentCheckoutResponseDto } from './dto/payment-checkout-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { VerifyAndApplyPaymentDto } from './dto/verify-and-apply-payment.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('billing/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('invoice-checkouts')
  @ApiCreatedResponse({ type: PaymentCheckoutResponseDto })
  initializeInvoicePayment(
    @Body() dto: InitializeInvoicePaymentDto,
  ): Promise<PaymentCheckoutResponseDto> {
    return this.paymentsService.initializeInvoicePayment(dto);
  }

  @Post('wallet-top-ups')
  @ApiCreatedResponse({ type: PaymentCheckoutResponseDto })
  initializeWalletTopUp(
    @Body() dto: InitializeWalletTopUpDto,
  ): Promise<PaymentCheckoutResponseDto> {
    return this.paymentsService.initializeWalletTopUp(dto);
  }

  @Post('verify-and-apply')
  @ApiOkResponse({ type: PaymentApplicationResponseDto })
  verifyAndApplyPayment(
    @Body() dto: VerifyAndApplyPaymentDto,
  ): Promise<PaymentApplicationResponseDto> {
    return this.paymentsService.verifyAndApplyPayment(dto);
  }

  @Post('invoices/:invoiceId/settle-from-wallet')
  @ApiOkResponse({ type: PaymentApplicationResponseDto })
  settleInvoiceFromPlatformWallet(
    @Param('invoiceId') invoiceId: string,
  ): Promise<PaymentApplicationResponseDto> {
    return this.paymentsService.settleInvoiceFromPlatformWallet(invoiceId);
  }
}
