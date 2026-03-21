import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { PaymentApplicationResponseDto } from './dto/payment-application-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PaymentsService } from './payments.service';

@ApiExcludeController()
@Controller('billing/payments/webhooks')
export class PaymentsWebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('flutterwave')
  handleFlutterwaveWebhook(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() payload: unknown,
  ): Promise<PaymentApplicationResponseDto> {
    return this.paymentsService.handleWebhook('flutterwave', headers, payload);
  }

  @Post('paystack')
  handlePaystackWebhook(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() payload: unknown,
  ): Promise<PaymentApplicationResponseDto> {
    return this.paymentsService.handleWebhook('paystack', headers, payload);
  }
}
