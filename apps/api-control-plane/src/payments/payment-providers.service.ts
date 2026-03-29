import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';

export interface InitializeProviderPaymentInput {
  provider: string;
  reference: string;
  amountMinorUnits: number;
  currency: string;
  redirectUrl: string;
  customerEmail: string;
  customerName?: string;
  description: string;
  metadata: Record<string, unknown>;
}

export interface InitializeProviderPaymentResult {
  provider: string;
  checkoutUrl: string;
  accessCode?: string;
}

export interface VerifiedProviderPayment {
  provider: string;
  reference: string;
  status: 'successful' | 'pending' | 'failed';
  amountMinorUnits: number;
  currency: string;
  paidAt?: string;
  providerPayload?: unknown;
  paymentMethod?: {
    authorizationCode?: string | null;
    customerCode?: string | null;
    last4?: string | null;
    brand?: string | null;
  };
}

@Injectable()
export class PaymentProvidersService {
  constructor(private readonly configService: ConfigService) {}

  async initializePayment(
    input: InitializeProviderPaymentInput,
  ): Promise<InitializeProviderPaymentResult> {
    switch (input.provider) {
      case 'flutterwave':
        return this.initializeFlutterwave(input);
      case 'paystack':
        return this.initializePaystack(input);
      default:
        throw new BadGatewayException(`Unsupported payment provider '${input.provider}'`);
    }
  }

  async verifyPayment(provider: string, reference: string): Promise<VerifiedProviderPayment> {
    switch (provider) {
      case 'flutterwave':
        return this.verifyFlutterwave(reference);
      case 'paystack':
        return this.verifyPaystack(reference);
      default:
        throw new BadGatewayException(`Unsupported payment provider '${provider}'`);
    }
  }

  assertWebhookAuthentic(
    provider: string,
    headers: Record<string, string | string[] | undefined>,
    payload: unknown,
  ): void {
    switch (provider) {
      case 'flutterwave':
        this.assertFlutterwaveWebhookAuthentic(headers);
        return;
      case 'paystack':
        this.assertPaystackWebhookAuthentic(headers, payload);
        return;
      default:
        throw new UnauthorizedException(`Unsupported payment provider '${provider}'`);
    }
  }

  extractWebhookReference(provider: string, payload: unknown): string {
    if (!this.isRecord(payload)) {
      throw new BadGatewayException('Webhook payload must be an object');
    }

    switch (provider) {
      case 'flutterwave': {
        const data = this.asRecord(payload.data);
        const reference = data?.tx_ref;
        if (typeof reference !== 'string' || reference.length === 0) {
          throw new BadGatewayException('Flutterwave webhook payload did not include tx_ref');
        }
        return reference;
      }
      case 'paystack': {
        const data = this.asRecord(payload.data);
        const reference = data?.reference;
        if (typeof reference !== 'string' || reference.length === 0) {
          throw new BadGatewayException('Paystack webhook payload did not include reference');
        }
        return reference;
      }
      default:
        throw new BadGatewayException(`Unsupported payment provider '${provider}'`);
    }
  }

  private async initializeFlutterwave(
    input: InitializeProviderPaymentInput,
  ): Promise<InitializeProviderPaymentResult> {
    const secretKey = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    const rawBase = this.configService.get<string>('FLUTTERWAVE_BASE_URL') ?? 'https://api.flutterwave.com/v3';
    const baseUrl = rawBase.replace(/\/v3\/?$/, '').replace(/\/$/, '') + '/v3';

    if (!secretKey) {
      throw new ServiceUnavailableException('Flutterwave is not configured for this environment');
    }

    const response = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        tx_ref: input.reference,
        amount: (input.amountMinorUnits / 100).toFixed(2),
        currency: input.currency,
        redirect_url: input.redirectUrl,
        customer: {
          email: input.customerEmail,
          ...(input.customerName ? { name: input.customerName } : {}),
        },
        customizations: {
          title: 'Mobility OS',
          description: input.description,
        },
        meta: input.metadata,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new BadGatewayException(
        `Flutterwave initialize returned status ${response.status}${errorBody ? `: ${errorBody}` : ''}`,
      );
    }

    const payload = (await response.json()) as {
      status?: string;
      message?: string;
      data?: { link?: string };
    };
    if (payload.status === 'error' || payload.status === false as unknown) {
      throw new BadGatewayException(
        `Flutterwave initialize failed: ${payload.message ?? 'unknown error'}`,
      );
    }
    const checkoutUrl = payload.data?.link;
    if (!checkoutUrl) {
      throw new BadGatewayException(
        'Flutterwave initialize response did not include a payment link',
      );
    }

    return {
      provider: 'flutterwave',
      checkoutUrl,
    };
  }

  private async verifyFlutterwave(reference: string): Promise<VerifiedProviderPayment> {
    const secretKey = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    const rawBase = this.configService.get<string>('FLUTTERWAVE_BASE_URL') ?? 'https://api.flutterwave.com/v3';
    const baseUrl = rawBase.replace(/\/v3\/?$/, '').replace(/\/$/, '') + '/v3';

    if (!secretKey) {
      throw new ServiceUnavailableException('Flutterwave is not configured for this environment');
    }

    const response = await fetch(
      `${baseUrl}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
      {
        headers: {
          authorization: `Bearer ${secretKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new BadGatewayException(`Flutterwave verify returned status ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: {
        tx_ref?: string;
        status?: string;
        amount?: number;
        currency?: string;
        paid_at?: string;
        card?: {
          token?: string;
          last_4digits?: string;
          type?: string;
        };
        customer?: {
          id?: number | string;
        };
      };
    };
    const data = payload.data;
    if (!data?.tx_ref || typeof data.amount !== 'number' || !data.currency) {
      throw new BadGatewayException('Flutterwave verify response was missing required fields');
    }

    return {
      provider: 'flutterwave',
      reference: data.tx_ref,
      status:
        data.status === 'successful'
          ? 'successful'
          : data.status === 'pending'
            ? 'pending'
            : 'failed',
      amountMinorUnits: Math.round(data.amount * 100),
      currency: data.currency,
      ...(data.paid_at ? { paidAt: data.paid_at } : {}),
      providerPayload: payload,
      paymentMethod: {
        authorizationCode:
          this.asRecord(data.card)?.token && typeof this.asRecord(data.card)?.token === 'string'
            ? (this.asRecord(data.card)?.token as string)
            : null,
        customerCode:
          typeof this.asRecord(data.customer)?.id === 'number' ||
          typeof this.asRecord(data.customer)?.id === 'string'
            ? String(this.asRecord(data.customer)?.id)
            : null,
        last4:
          typeof this.asRecord(data.card)?.last_4digits === 'string'
            ? (this.asRecord(data.card)?.last_4digits as string)
            : null,
        brand:
          typeof this.asRecord(data.card)?.type === 'string'
            ? (this.asRecord(data.card)?.type as string)
            : null,
      },
    };
  }

  private async initializePaystack(
    input: InitializeProviderPaymentInput,
  ): Promise<InitializeProviderPaymentResult> {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const baseUrl = (
      this.configService.get<string>('PAYSTACK_BASE_URL') ?? 'https://api.paystack.co'
    ).replace(/\/$/, '');

    if (!secretKey) {
      throw new ServiceUnavailableException('Paystack is not configured for this environment');
    }

    const response = await fetch(`${baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        email: input.customerEmail,
        amount: input.amountMinorUnits,
        currency: input.currency,
        reference: input.reference,
        callback_url: input.redirectUrl,
        metadata: {
          ...input.metadata,
          ...(input.customerName ? { customerName: input.customerName } : {}),
          description: input.description,
        },
      }),
    });

    const paystackInitPayload = (await response.json().catch(() => ({}))) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string; access_code?: string };
    };

    if (!response.ok || paystackInitPayload.status === false) {
      throw new BadGatewayException(
        `Paystack initialize failed: ${paystackInitPayload.message ?? `status ${response.status}`}`,
      );
    }

    const checkoutUrl = paystackInitPayload.data?.authorization_url;
    if (!checkoutUrl) {
      throw new BadGatewayException(
        'Paystack initialize response did not include an authorization URL',
      );
    }
    const payload = paystackInitPayload;

    return {
      provider: 'paystack',
      checkoutUrl,
      ...(payload.data?.access_code ? { accessCode: payload.data.access_code } : {}),
    };
  }

  private async verifyPaystack(reference: string): Promise<VerifiedProviderPayment> {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const baseUrl = (
      this.configService.get<string>('PAYSTACK_BASE_URL') ?? 'https://api.paystack.co'
    ).replace(/\/$/, '');

    if (!secretKey) {
      throw new ServiceUnavailableException('Paystack is not configured for this environment');
    }

    const response = await fetch(
      `${baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          authorization: `Bearer ${secretKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new BadGatewayException(`Paystack verify returned status ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: {
        reference?: string;
        status?: string;
        amount?: number;
        currency?: string;
        paid_at?: string;
        authorization?: {
          authorization_code?: string;
          last4?: string;
          brand?: string;
        };
        customer?: {
          customer_code?: string;
        };
      };
    };
    const data = payload.data;
    if (!data?.reference || typeof data.amount !== 'number' || !data.currency) {
      throw new BadGatewayException('Paystack verify response was missing required fields');
    }

    return {
      provider: 'paystack',
      reference: data.reference,
      status:
        data.status === 'success' ? 'successful' : data.status === 'pending' ? 'pending' : 'failed',
      amountMinorUnits: data.amount,
      currency: data.currency,
      ...(data.paid_at ? { paidAt: data.paid_at } : {}),
      providerPayload: payload,
      paymentMethod: {
        authorizationCode: data.authorization?.authorization_code ?? null,
        customerCode: data.customer?.customer_code ?? null,
        last4: data.authorization?.last4 ?? null,
        brand: data.authorization?.brand ?? null,
      },
    };
  }

  private assertFlutterwaveWebhookAuthentic(
    headers: Record<string, string | string[] | undefined>,
  ): void {
    const configuredHash = this.configService.get<string>('FLUTTERWAVE_WEBHOOK_SECRET_HASH');
    if (!configuredHash) {
      return;
    }

    const presented = headers['verif-hash'];
    const headerValue = Array.isArray(presented) ? presented[0] : presented;
    if (!headerValue || headerValue !== configuredHash) {
      throw new UnauthorizedException('Invalid Flutterwave webhook signature');
    }
  }

  private assertPaystackWebhookAuthentic(
    headers: Record<string, string | string[] | undefined>,
    payload: unknown,
  ): void {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      return;
    }

    const presented = headers['x-paystack-signature'];
    const headerValue = Array.isArray(presented) ? presented[0] : presented;
    if (!headerValue) {
      throw new UnauthorizedException('Missing Paystack webhook signature');
    }

    const computed = createHmac('sha512', secretKey)
      .update(JSON.stringify(payload), 'utf8')
      .digest('hex');

    const left = Buffer.from(headerValue, 'utf8');
    const right = Buffer.from(computed, 'utf8');
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      throw new UnauthorizedException('Invalid Paystack webhook signature');
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return this.isRecord(value) ? value : null;
  }
}
