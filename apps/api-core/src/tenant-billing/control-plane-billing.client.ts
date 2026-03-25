import { Injectable, ServiceUnavailableException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';

export interface TenantSubscriptionSummary {
  id: string;
  tenantId: string;
  planId: string;
  planName: string;
  planTier: string;
  currency: string;
  features: Record<string, unknown>;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantPlanSummary {
  id: string;
  name: string;
  tier: string;
  billingInterval: string;
  basePriceMinorUnits: number;
  currency: string;
  isActive: boolean;
  features: Record<string, unknown>;
  customTerms?: Record<string, unknown> | null;
}

export interface TenantInvoiceSummary {
  id: string;
  tenantId: string;
  subscriptionId: string;
  status: string;
  amountDueMinorUnits: number;
  amountPaidMinorUnits: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  dueAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantPlatformWalletBalance {
  walletId: string;
  tenantId: string;
  currency: string;
  balanceMinorUnits: number;
}

export interface TenantPlatformWalletEntry {
  id: string;
  walletId: string;
  type: string;
  amountMinorUnits: number;
  currency: string;
  referenceId?: string | null;
  referenceType?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface TenantPaymentCheckout {
  provider: string;
  reference: string;
  checkoutUrl: string;
  accessCode?: string;
  purpose: string;
}

export interface TenantPaymentApplication {
  provider: string;
  reference: string;
  purpose: string;
  status: string;
  amountMinorUnits: number;
  currency: string;
  invoiceId?: string;
  tenantId?: string;
}

@Injectable()
export class ControlPlaneBillingClient {
  constructor(private readonly configService: ConfigService) {}

  async getSubscription(tenantId: string): Promise<TenantSubscriptionSummary> {
    try {
      return await this.request(`/internal/subscriptions/tenant/${tenantId}`);
    } catch (error) {
      // If the subscription doesn't exist yet (tenant created before bootstrap
      // was wired), auto-bootstrap on 404 then re-fetch.
      if (
        error instanceof ServiceUnavailableException &&
        String(error.message).includes('404')
      ) {
        await this.request('/internal/subscriptions/bootstrap', {
          method: 'POST',
          body: JSON.stringify({ tenantId }),
        });
        return this.request(`/internal/subscriptions/tenant/${tenantId}`);
      }
      throw error;
    }
  }

  async listPlans(): Promise<TenantPlanSummary[]> {
    return this.request('/internal/subscriptions/plans');
  }

  async changePlan(tenantId: string, planId: string): Promise<TenantSubscriptionSummary> {
    return this.request(`/internal/subscriptions/tenant/${tenantId}/change-plan/${planId}`, {
      method: 'POST',
    });
  }

  async listInvoices(
    tenantId: string,
    options: { status?: string } = {},
  ): Promise<TenantInvoiceSummary[]> {
    const query = options.status ? `?status=${encodeURIComponent(options.status)}` : '';
    return this.request(`/internal/billing/tenant/${tenantId}/invoices${query}`);
  }

  async getPlatformWalletBalance(tenantId: string): Promise<TenantPlatformWalletBalance> {
    return this.request(`/internal/platform-wallets/tenant/${tenantId}/balance`);
  }

  async listPlatformWalletEntries(tenantId: string): Promise<TenantPlatformWalletEntry[]> {
    return this.request(`/internal/platform-wallets/tenant/${tenantId}/entries`);
  }

  async initializeWalletTopUp(input: {
    tenantId: string;
    provider: string;
    amountMinorUnits: number;
    currency: string;
    customerEmail: string;
    customerName?: string;
    redirectUrl: string;
  }): Promise<TenantPaymentCheckout> {
    return this.request('/internal/payments/wallet-top-ups', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async initializeInvoiceCheckout(input: {
    provider: string;
    invoiceId: string;
    customerEmail: string;
    customerName?: string;
    redirectUrl: string;
  }): Promise<TenantPaymentCheckout> {
    return this.request('/internal/payments/invoice-checkouts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async verifyAndApplyPayment(input: {
    provider: string;
    reference: string;
    purpose: string;
    invoiceId?: string;
    tenantId?: string;
  }): Promise<TenantPaymentApplication> {
    return this.request('/internal/payments/verify-and-apply', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_API_URL');
    const internalToken = this.configService.get<string>('INTERNAL_SERVICE_TOKEN');

    if (!baseUrl || !internalToken) {
      throw new ServiceUnavailableException('Control-plane billing integration is not configured');
    }

    const headers = new Headers(init.headers);
    headers.set('x-internal-service-token', internalToken);
    headers.set('content-type', 'application/json');

    let response: Response;
    try {
      response = await fetch(`${baseUrl.replace(/\/$/, '')}/api${path}`, {
        ...init,
        headers,
      });
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error
          ? `Control-plane billing request failed: ${error.message}`
          : 'Control-plane billing request failed',
      );
    }

    if (!response.ok) {
      const text = await response.text();
      throw new ServiceUnavailableException(
        text
          ? `Control-plane billing returned status ${response.status}: ${text}`
          : `Control-plane billing returned status ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }
}
