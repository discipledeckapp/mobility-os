import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import { getCountryConfig } from '@mobility-os/domain-config';
import { readUserSettings } from '../auth/user-settings';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import { ZeptoMailService } from '../notifications/zeptomail.service';
import { RecordsService } from '../records/records.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneBillingClient } from './control-plane-billing.client';
import type { InitializeCardSetupCheckoutDto } from './dto/initialize-card-setup-checkout.dto';
import type { InitializeSubscriptionBillingSetupDto } from './dto/initialize-subscription-billing-setup.dto';
import type { InitializeTenantInvoicePaymentDto } from './dto/initialize-tenant-invoice-payment.dto';
import type { InitializeTenantWalletTopUpDto } from './dto/initialize-tenant-wallet-top-up.dto';
import type {
  TenantBillingSummaryDto,
  TenantPaymentApplicationDto,
  TenantPaymentCheckoutDto,
} from './dto/tenant-billing-response.dto';
import type { VerifyTenantPaymentDto } from './dto/verify-tenant-payment.dto';
import type { TenantBillingPlanDto } from './dto/tenant-billing-response.dto';
import { VerificationSpendService } from './verification-spend.service';

function readNumericFeature(features: Record<string, unknown>, key: string): number | null {
  const value = features[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

// Growth plan limits used for the trial fallback when control-plane is unreachable.
const TRIAL_FEATURES = {
  vehicleCap: 20,
  assignmentCap: 50,
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
    private readonly verificationSpendService: VerificationSpendService,
    private readonly recordsService: RecordsService,
    private readonly zeptoMailService: ZeptoMailService,
  ) {}

  private resolveTenantCurrency(country?: string | null): string {
    return country?.trim().toUpperCase() === 'NG' ? 'NGN' : 'USD';
  }

  private async issuePaymentReceipt(input: {
    tenantId: string;
    purpose: TenantPaymentApplicationDto['purpose'];
    reference: string;
    provider: string;
    amountMinorUnits: number;
    currency: string;
    invoiceId?: string;
    paymentMethod?: TenantPaymentApplicationDto['paymentMethod'];
  }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: input.tenantId },
      select: { name: true },
    });
    const titleByPurpose: Record<TenantPaymentApplicationDto['purpose'], string> = {
      platform_wallet_topup: 'Verification Funding Receipt',
      card_authorization_setup: 'Verification Card Authorization Receipt',
      subscription_billing_setup: 'Subscription Billing Setup Receipt',
      invoice_settlement: 'Subscription Invoice Payment Receipt',
    };

    return this.recordsService.issueDocument({
      tenantId: input.tenantId,
      documentType: 'tenant_billing_receipt',
      issuerType: 'system',
      issuerId: 'api-core',
      recipientType: 'tenant',
      recipientId: input.tenantId,
      relatedEntityType: 'tenant_payment',
      relatedEntityId: input.reference,
      title: `${titleByPurpose[input.purpose]} ${input.reference}`,
      subjectLines: [
        `Organisation: ${tenant?.name ?? input.tenantId}`,
        `Purpose: ${input.purpose.replace(/_/g, ' ')}`,
        `Provider: ${input.provider}`,
        `Reference: ${input.reference}`,
        `Amount: ${input.amountMinorUnits} ${input.currency}`,
        ...(input.invoiceId ? [`Invoice: ${input.invoiceId}`] : []),
        ...(input.paymentMethod?.brand || input.paymentMethod?.last4
          ? [
              `Payment method: ${input.paymentMethod?.brand ?? 'Card'} ${input.paymentMethod?.last4 ? `ending in ${input.paymentMethod.last4}` : ''}`.trim(),
            ]
          : []),
      ],
      canonicalPayload: {
        tenantId: input.tenantId,
        purpose: input.purpose,
        provider: input.provider,
        reference: input.reference,
        amountMinorUnits: input.amountMinorUnits,
        currency: input.currency,
        ...(input.invoiceId ? { invoiceId: input.invoiceId } : {}),
        ...(input.paymentMethod ? { paymentMethod: input.paymentMethod } : {}),
      },
      metadata: {
        purpose: input.purpose,
        provider: input.provider,
        reference: input.reference,
      },
    });
  }

  private async deliverPaymentReceiptEmail(input: {
    tenantId: string;
    purpose: TenantPaymentApplicationDto['purpose'];
    reference: string;
    amountMinorUnits: number;
    currency: string;
    receiptDocumentNumber: string;
  }): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId: input.tenantId,
        isActive: true,
        role: { in: ['TENANT_OWNER', 'TENANT_ADMIN', 'FINANCE_OFFICER'] },
      },
      select: {
        email: true,
        name: true,
        role: true,
        settings: true,
      },
    });
    const recipients = users.filter((user) => {
      const settings = readUserSettings(user.settings, {
        preferredLanguage: 'en',
        role: user.role,
      });
      return settings.notificationPreferences.verification_payment_receipt.email;
    });

    if (recipients.length === 0) {
      return [];
    }

    await this.zeptoMailService.sendEmail({
      to: recipients.map((recipient) => ({
        address: recipient.email,
        ...(recipient.name ? { name: recipient.name } : {}),
      })),
      subject: `Payment receipt ${input.receiptDocumentNumber}`,
      htmlBody: [
        `<p>Your Mobility OS payment was confirmed.</p>`,
        `<p><strong>Purpose:</strong> ${input.purpose.replace(/_/g, ' ')}</p>`,
        `<p><strong>Reference:</strong> ${input.reference}</p>`,
        `<p><strong>Amount:</strong> ${input.amountMinorUnits} ${input.currency}</p>`,
        `<p><strong>Receipt:</strong> ${input.receiptDocumentNumber}</p>`,
      ].join(''),
    });

    return recipients.map((recipient) => recipient.email);
  }

  async getSummary(tenantId: string, userId: string): Promise<TenantBillingSummaryDto> {
    // Always fetch local counts — these come from our own DB, never the control plane.
    const [user, tenant, driverCount, vehicleCount, operatorSeatCount, assignmentCount] =
      await Promise.all([
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
      this.prisma.assignment.count({
        where: {
          tenantId,
          status: {
            in: [
              'created',
              'assigned',
              'pending_driver_confirmation',
              'driver_action_required',
              'accepted',
              'active',
            ],
          },
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('The authenticated tenant user could not be resolved.');
    }

    // Attempt to fetch live billing data from the control plane.
    let subscription: Awaited<ReturnType<ControlPlaneBillingClient['getSubscription']>> | null = null;
    let invoices: Awaited<ReturnType<ControlPlaneBillingClient['listInvoices']>> = [];
    let balance: Awaited<ReturnType<ControlPlaneBillingClient['getPlatformWalletBalance']>> | null = null;
    let entries: Awaited<ReturnType<ControlPlaneBillingClient['listPlatformWalletEntries']>> = [];
    let billingPaymentMethod: Awaited<
      ReturnType<ControlPlaneBillingClient['getBillingPaymentMethod']>
    > | null = null;

    const handleBillingDegradation = (label: string, error: unknown): null => {
      if (error instanceof ServiceUnavailableException) {
        this.logger.warn(`Billing summary ${label} degraded for tenant '${tenantId}': ${error.message}`);
        return null;
      }
      throw error;
    };

    const [subscriptionResult, invoicesResult, balanceResult, entriesResult, paymentMethodResult] =
      await Promise.all([
        this.controlPlaneBillingClient.getSubscription(tenantId).catch((error) =>
          handleBillingDegradation('subscription', error),
        ),
        this.controlPlaneBillingClient.listInvoices(tenantId).catch((error) => {
          const degraded = handleBillingDegradation('invoices', error);
          return degraded ?? [];
        }),
        this.controlPlaneBillingClient.getPlatformWalletBalance(tenantId).catch((error) =>
          handleBillingDegradation('wallet balance', error),
        ),
        this.controlPlaneBillingClient.listPlatformWalletEntries(tenantId).catch((error) => {
          const degraded = handleBillingDegradation('wallet ledger', error);
          return degraded ?? [];
        }),
        this.controlPlaneBillingClient.getBillingPaymentMethod(tenantId).catch((error) => {
          if (
            error instanceof ServiceUnavailableException &&
            String(error.message).includes('404')
          ) {
            return null;
          }
          const degraded = handleBillingDegradation('billing payment method', error);
          return degraded;
        }),
      ]);

    subscription = subscriptionResult;
    invoices = invoicesResult;
    balance = balanceResult;
    entries = entriesResult;
    billingPaymentMethod = paymentMethodResult;

    // If control-plane data is unavailable, build a trial fallback from local tenant data.
    if (!subscription) {
      const currency = this.resolveTenantCurrency(tenant?.country);
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
          billingInterval: 'monthly',
          basePriceMinorUnits: 0,
          currency,
          features: TRIAL_FEATURES,
        status: tenant?.status ?? 'trialing',
        currentPeriodStart: createdAt.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        cancelAtPeriodEnd: false,
        trialEndsAt: trialEndsAt > now ? trialEndsAt.toISOString() : null,
        enforcement: {
          stage: 'active',
          gracePeriodDays: 5,
          graceEndsAt: null,
          graceDaysRemaining: 0,
          degradedMode: false,
          blockedFeatures: [],
        },
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
          assignmentCount,
          driverCap: null,
          vehicleCap: TRIAL_FEATURES.vehicleCap,
          assignmentCap: TRIAL_FEATURES.assignmentCap ?? null,
          seatCap: TRIAL_FEATURES.seatLimit,
          openInvoiceCount: 0,
          verificationLedgerEntryCount: 0,
        },
        verificationSpend: await this.verificationSpendService.getSpendSummary(tenantId, currency),
        billingPaymentMethod: null,
        customerEmail: user.email,
        customerName: user.name,
      };
    }

    const outstandingInvoice = invoices.find((invoice) => invoice.status === 'open') ?? null;
    const vehicleCap =
      readNumericFeature(subscription.features, 'vehicleCap') ??
      readNumericFeature(subscription.features, 'fleetCap');
    const assignmentCap = readNumericFeature(subscription.features, 'assignmentCap');
    const seatCap = readNumericFeature(subscription.features, 'seatLimit');
    const walletCurrency = balance?.currency ?? subscription.currency;
    const verificationSpend = await this.verificationSpendService.getSpendSummary(
      tenantId,
      walletCurrency,
    );

    return {
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        planName: subscription.planName,
        planTier: subscription.planTier,
        billingInterval: subscription.billingInterval,
        basePriceMinorUnits: subscription.basePriceMinorUnits,
        currency: subscription.currency,
        features: subscription.features,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEndsAt: subscription.trialEndsAt ?? null,
        ...(subscription.enforcement ? { enforcement: subscription.enforcement } : {}),
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
        assignmentCount,
        driverCap: null,
        vehicleCap,
        assignmentCap,
        seatCap,
        openInvoiceCount: invoices.filter((invoice) => invoice.status === 'open').length,
        verificationLedgerEntryCount: entries.length,
      },
      verificationSpend,
      billingPaymentMethod,
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

  async initializeCardSetupCheckout(
    tenantId: string,
    userId: string,
    dto: InitializeCardSetupCheckoutDto,
  ): Promise<TenantPaymentCheckoutDto> {
    const summary = await this.getSummary(tenantId, userId);
    const provider = dto.provider ?? 'paystack';
    const amountMinorUnits = dto.amountMinorUnits ?? 10_000;
    const redirectUrl = this.buildReturnUrl(provider, 'card_authorization_setup');

    return this.controlPlaneBillingClient.initializeCardAuthorizationSetup({
      tenantId,
      provider,
      amountMinorUnits,
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

  async initializeSubscriptionBillingSetupCheckout(
    tenantId: string,
    userId: string,
    dto: InitializeSubscriptionBillingSetupDto,
  ): Promise<TenantPaymentCheckoutDto> {
    const summary = await this.getSummary(tenantId, userId);
    const provider = dto.provider ?? 'paystack';
    const amountMinorUnits = dto.amountMinorUnits ?? 10_000;
    const redirectUrl = this.buildReturnUrl(provider, 'subscription_billing_setup');

    return this.controlPlaneBillingClient.initializeSubscriptionBillingSetup({
      tenantId,
      provider,
      amountMinorUnits,
      currency: summary.subscription.currency,
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
      ...(dto.purpose === 'platform_wallet_topup' ||
      dto.purpose === 'card_authorization_setup' ||
      dto.purpose === 'subscription_billing_setup'
        ? { tenantId }
        : {}),
    });

    if (
      dto.purpose === 'card_authorization_setup' &&
      result.paymentMethod?.authorizationCode &&
      result.paymentMethod?.customerCode &&
      result.paymentMethod?.last4 &&
      result.paymentMethod?.brand
    ) {
      await this.verificationSpendService.saveAuthorizedCard({
        tenantId,
        provider: result.provider,
        authorizationCode: result.paymentMethod.authorizationCode,
        customerCode: result.paymentMethod.customerCode,
        last4: result.paymentMethod.last4,
        brand: result.paymentMethod.brand,
        initialReference: result.reference,
        currency: result.currency,
        metadata: {
          setupPurpose: 'card_authorization_setup',
        },
      });
    }

    const receipt = await this.issuePaymentReceipt({
      tenantId,
      purpose: result.purpose,
      reference: result.reference,
      provider: result.provider,
      amountMinorUnits: result.amountMinorUnits,
      currency: result.currency,
      ...(result.invoiceId ? { invoiceId: result.invoiceId } : {}),
      ...(result.paymentMethod ? { paymentMethod: result.paymentMethod } : {}),
    });
    let receiptEmailSentTo: string[] = [];
    try {
      receiptEmailSentTo = await this.deliverPaymentReceiptEmail({
        tenantId,
        purpose: result.purpose,
        reference: result.reference,
        amountMinorUnits: result.amountMinorUnits,
        currency: result.currency,
        receiptDocumentNumber: receipt.documentNumber,
      });
    } catch (error) {
      this.logger.warn(
        `Receipt email delivery failed for payment '${result.reference}' on tenant '${tenantId}': ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    return {
      provider: result.provider,
      reference: result.reference,
      purpose: result.purpose,
      status: result.status,
      amountMinorUnits: result.amountMinorUnits,
      currency: result.currency,
      ...(result.invoiceId ? { invoiceId: result.invoiceId } : {}),
      ...(result.tenantId ? { tenantId: result.tenantId } : {}),
      ...(result.paymentMethod ? { paymentMethod: result.paymentMethod } : {}),
      receiptDocumentId: receipt.id,
      receiptDocumentNumber: receipt.documentNumber,
      receiptEmailSentTo,
    };
  }

  async listPlans(tenantId: string): Promise<TenantBillingPlanDto[]> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true },
    });
    const preferredCurrency = this.resolveTenantCurrency(tenant?.country);
    const plans = await this.controlPlaneBillingClient.listPlans();
    const sortedPlans = [...plans].sort((left, right) => {
      const leftPreferred = left.currency === preferredCurrency ? 1 : 0;
      const rightPreferred = right.currency === preferredCurrency ? 1 : 0;
      if (leftPreferred !== rightPreferred) {
        return rightPreferred - leftPreferred;
      }
      if (left.isActive !== right.isActive) {
        return left.isActive ? -1 : 1;
      }
      return left.basePriceMinorUnits - right.basePriceMinorUnits;
    });
    return sortedPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      tier: plan.tier,
      billingInterval: plan.billingInterval,
      basePriceMinorUnits: plan.basePriceMinorUnits,
      currency: plan.currency,
      isActive: plan.isActive,
      features: plan.features,
      customTerms: plan.customTerms ?? null,
      isPreferredCurrency: plan.currency === preferredCurrency,
    }));
  }

  async changePlan(tenantId: string, planId: string) {
    return this.controlPlaneBillingClient.changePlan(tenantId, planId);
  }

  private buildReturnUrl(
    provider: string,
    purpose:
      | 'invoice_settlement'
      | 'platform_wallet_topup'
      | 'card_authorization_setup'
      | 'subscription_billing_setup',
    invoiceId?: string,
  ): string {
    const tenantWebUrl = this.configService.getOrThrow<string>('TENANT_WEB_URL');
    const path =
      purpose === 'invoice_settlement' || purpose === 'subscription_billing_setup'
        ? '/subscription/payment-return'
        : '/verification-funding/payment-return';
    const url = new URL(path, tenantWebUrl);
    url.searchParams.set('provider', provider);
    url.searchParams.set('purpose', purpose);
    if (invoiceId) {
      url.searchParams.set('invoiceId', invoiceId);
    }
    return url.toString();
  }
}
