import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import { getCountryConfig } from '@mobility-os/domain-config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneBillingClient } from './control-plane-billing.client';
import type { InitializeTenantInvoicePaymentDto } from './dto/initialize-tenant-invoice-payment.dto';
import type { InitializeTenantWalletTopUpDto } from './dto/initialize-tenant-wallet-top-up.dto';
import type {
  TenantBillingSummaryDto,
  TenantPaymentApplicationDto,
  TenantPaymentCheckoutDto,
} from './dto/tenant-billing-response.dto';
import type { VerifyTenantPaymentDto } from './dto/verify-tenant-payment.dto';
import type { TenantBillingPlanDto } from './dto/tenant-billing-response.dto';

function readNumericFeature(features: Record<string, unknown>, key: string): number | null {
  const value = features[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

// Growth plan limits used for the trial fallback when control-plane is unreachable.
const TRIAL_FEATURES = {
  vehicleCap: 20,
  driverCap: null as number | null,
  seatLimit: 25,
  verificationEnabled: true,
  walletEnabled: true,
};

@Injectable()
export class TenantBillingService {
  private readonly logger = new Logger(TenantBillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly controlPlaneBillingClient: ControlPlaneBillingClient,
    private readonly configService: ConfigService,
  ) {}

  async getSummary(tenantId: string, userId: string): Promise<TenantBillingSummaryDto> {
    // Always fetch local counts — these come from our own DB, never the control plane.
    const [user, tenant, driverCount, vehicleCount, operatorSeatCount] = await Promise.all([
      this.prisma.user.findFirst({
        where: { id: userId, tenantId, isActive: true },
        select: { email: true, name: true },
      }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { status: true, country: true, createdAt: true },
      }),
      this.prisma.driver.count({ where: { tenantId } }),
      this.prisma.vehicle.count({ where: { tenantId } }),
      this.prisma.user.count({ where: { tenantId, isActive: true } }),
    ]);

    if (!user) {
      throw new NotFoundException('The authenticated tenant user could not be resolved.');
    }

    // Attempt to fetch live billing data from the control plane.
    let subscription: Awaited<ReturnType<ControlPlaneBillingClient['getSubscription']>> | null = null;
    let invoices: Awaited<ReturnType<ControlPlaneBillingClient['listInvoices']>> = [];
    let balance: Awaited<ReturnType<ControlPlaneBillingClient['getPlatformWalletBalance']>> | null = null;
    let entries: Awaited<ReturnType<ControlPlaneBillingClient['listPlatformWalletEntries']>> = [];

    try {
      [subscription, invoices, balance, entries] = await Promise.all([
        this.controlPlaneBillingClient.getSubscription(tenantId),
        this.controlPlaneBillingClient.listInvoices(tenantId),
        this.controlPlaneBillingClient.getPlatformWalletBalance(tenantId),
        this.controlPlaneBillingClient.listPlatformWalletEntries(tenantId),
      ]);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        this.logger.warn(`Billing summary degraded for tenant '${tenantId}': ${error.message}`);
      } else {
        throw error;
      }
    }

    // If control-plane data is unavailable, build a trial fallback from local tenant data.
    if (!subscription) {
      const currency = tenant ? (() => {
        try { return getCountryConfig(tenant.country).currency; } catch { return 'NGN'; }
      })() : 'NGN';
      const createdAt = tenant?.createdAt ?? new Date();
      const trialEndsAt = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      return {
        subscription: {
          id: 'trial',
          planId: 'trial',
          planName: 'Growth (Free Trial)',
          planTier: 'growth',
          currency,
          features: TRIAL_FEATURES,
          status: tenant?.status ?? 'trialing',
          currentPeriodStart: createdAt.toISOString(),
          currentPeriodEnd: periodEnd.toISOString(),
          cancelAtPeriodEnd: false,
          trialEndsAt: trialEndsAt > now ? trialEndsAt.toISOString() : null,
        },
        invoices: [],
        outstandingInvoice: null,
        verificationWallet: {
          walletId: 'pending',
          currency,
          balanceMinorUnits: 0,
          entries: [],
        },
        usage: {
          driverCount,
          vehicleCount,
          operatorSeatCount,
          driverCap: TRIAL_FEATURES.driverCap,
          vehicleCap: TRIAL_FEATURES.vehicleCap,
          seatCap: TRIAL_FEATURES.seatLimit,
          openInvoiceCount: 0,
          verificationLedgerEntryCount: 0,
        },
        customerEmail: user.email,
        customerName: user.name,
      };
    }

    const outstandingInvoice = invoices.find((invoice) => invoice.status === 'open') ?? null;
    const driverCap =
      readNumericFeature(subscription.features, 'driverCap') ??
      readNumericFeature(subscription.features, 'seatLimit');
    const vehicleCap =
      readNumericFeature(subscription.features, 'vehicleCap') ??
      readNumericFeature(subscription.features, 'fleetCap');
    const seatCap = readNumericFeature(subscription.features, 'seatLimit');
    const walletCurrency = balance?.currency ?? subscription.currency;

    return {
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        planName: subscription.planName,
        planTier: subscription.planTier,
        currency: subscription.currency,
        features: subscription.features,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEndsAt: subscription.trialEndsAt ?? null,
      },
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        subscriptionId: invoice.subscriptionId,
        status: invoice.status,
        amountDueMinorUnits: invoice.amountDueMinorUnits,
        amountPaidMinorUnits: invoice.amountPaidMinorUnits,
        currency: invoice.currency,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        dueAt: invoice.dueAt ?? null,
        paidAt: invoice.paidAt ?? null,
      })),
      outstandingInvoice: outstandingInvoice
        ? {
            id: outstandingInvoice.id,
            subscriptionId: outstandingInvoice.subscriptionId,
            status: outstandingInvoice.status,
            amountDueMinorUnits: outstandingInvoice.amountDueMinorUnits,
            amountPaidMinorUnits: outstandingInvoice.amountPaidMinorUnits,
            currency: outstandingInvoice.currency,
            periodStart: outstandingInvoice.periodStart,
            periodEnd: outstandingInvoice.periodEnd,
            dueAt: outstandingInvoice.dueAt ?? null,
            paidAt: outstandingInvoice.paidAt ?? null,
          }
        : null,
      verificationWallet: {
        walletId: balance?.walletId ?? 'pending',
        currency: walletCurrency,
        balanceMinorUnits: balance?.balanceMinorUnits ?? 0,
        entries: entries.map((entry) => ({
          id: entry.id,
          type: entry.type,
          amountMinorUnits: entry.amountMinorUnits,
          currency: entry.currency,
          referenceId: entry.referenceId ?? null,
          referenceType: entry.referenceType ?? null,
          description: entry.description ?? null,
          createdAt: entry.createdAt,
        })),
      },
      usage: {
        driverCount,
        vehicleCount,
        operatorSeatCount,
        driverCap,
        vehicleCap,
        seatCap,
        openInvoiceCount: invoices.filter((invoice) => invoice.status === 'open').length,
        verificationLedgerEntryCount: entries.length,
      },
      customerEmail: user.email,
      customerName: user.name,
    };
  }

  async initializeWalletTopUp(
    tenantId: string,
    userId: string,
    dto: InitializeTenantWalletTopUpDto,
  ): Promise<TenantPaymentCheckoutDto> {
    const summary = await this.getSummary(tenantId, userId);
    const redirectUrl = this.buildReturnUrl(dto.provider, 'platform_wallet_topup');

    return this.controlPlaneBillingClient.initializeWalletTopUp({
      tenantId,
      provider: dto.provider,
      amountMinorUnits: dto.amountMinorUnits,
      currency: summary.verificationWallet.currency,
      customerEmail: summary.customerEmail,
      customerName: summary.customerName,
      redirectUrl,
    });
  }

  async initializeInvoicePayment(
    tenantId: string,
    userId: string,
    dto: InitializeTenantInvoicePaymentDto,
  ): Promise<TenantPaymentCheckoutDto> {
    const summary = await this.getSummary(tenantId, userId);
    const invoice = summary.invoices.find((item) => item.id === dto.invoiceId);

    if (!invoice) {
      throw new NotFoundException(`Invoice '${dto.invoiceId}' is not available for this tenant.`);
    }

    const redirectUrl = this.buildReturnUrl(dto.provider, 'invoice_settlement', dto.invoiceId);

    return this.controlPlaneBillingClient.initializeInvoiceCheckout({
      provider: dto.provider,
      invoiceId: dto.invoiceId,
      customerEmail: summary.customerEmail,
      customerName: summary.customerName,
      redirectUrl,
    });
  }

  async verifyAndApply(
    tenantId: string,
    dto: VerifyTenantPaymentDto,
  ): Promise<TenantPaymentApplicationDto> {
    const result = await this.controlPlaneBillingClient.verifyAndApplyPayment({
      provider: dto.provider,
      reference: dto.reference,
      purpose: dto.purpose,
      ...(dto.invoiceId ? { invoiceId: dto.invoiceId } : {}),
      ...(dto.purpose === 'platform_wallet_topup' ? { tenantId } : {}),
    });

    return {
      provider: result.provider,
      reference: result.reference,
      purpose: result.purpose,
      status: result.status,
      amountMinorUnits: result.amountMinorUnits,
      currency: result.currency,
      ...(result.invoiceId ? { invoiceId: result.invoiceId } : {}),
    };
  }

  async listPlans(): Promise<TenantBillingPlanDto[]> {
    const plans = await this.controlPlaneBillingClient.listPlans();
    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      tier: plan.tier,
      billingInterval: plan.billingInterval,
      basePriceMinorUnits: plan.basePriceMinorUnits,
      currency: plan.currency,
      isActive: plan.isActive,
      features: plan.features,
    }));
  }

  async changePlan(tenantId: string, planId: string) {
    return this.controlPlaneBillingClient.changePlan(tenantId, planId);
  }

  private buildReturnUrl(
    provider: string,
    purpose: 'invoice_settlement' | 'platform_wallet_topup',
    invoiceId?: string,
  ): string {
    const tenantWebUrl = this.configService.getOrThrow<string>('TENANT_WEB_URL');
    const url = new URL('/wallet/payment-return', tenantWebUrl);
    url.searchParams.set('provider', provider);
    url.searchParams.set('purpose', purpose);
    if (invoiceId) {
      url.searchParams.set('invoiceId', invoiceId);
    }
    return url.toString();
  }
}
