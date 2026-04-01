import { ServiceUnavailableException } from '@nestjs/common';
import { TenantBillingService } from './tenant-billing.service';

describe('TenantBillingService', () => {
  const prisma = {
    tenant: {
      findUnique: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    driver: {
      count: jest.fn(),
    },
    vehicle: {
      count: jest.fn(),
    },
  };
  const controlPlaneBillingClient = {
    getSubscription: jest.fn(),
    listInvoices: jest.fn(),
    getPlatformWalletBalance: jest.fn(),
    listPlatformWalletEntries: jest.fn(),
    getBillingPaymentMethod: jest.fn(),
    listPlans: jest.fn(),
    verifyAndApplyPayment: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  };
  const verificationSpendService = {
    getSpendSummary: jest.fn(),
  };
  const recordsService = {
    issueDocument: jest.fn(),
  };
  const zeptoMailService = {
    sendEmail: jest.fn(),
  };

  let service: TenantBillingService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findFirst.mockResolvedValue({
      email: 'owner@example.com',
      name: 'Owner',
    });
    prisma.user.count.mockResolvedValue(2);
    prisma.driver.count.mockResolvedValue(4);
    prisma.vehicle.count.mockResolvedValue(3);
    prisma.tenant.findUnique.mockResolvedValue({ country: 'NG', createdAt: new Date('2026-01-01T00:00:00.000Z') });
    verificationSpendService.getSpendSummary.mockResolvedValue({
      currency: 'NGN',
      walletBalanceMinorUnits: 0,
      creditLimitMinorUnits: 0,
      creditUsedMinorUnits: 0,
      availableSpendMinorUnits: 0,
      starterCreditActive: false,
      starterCreditEligible: false,
      cardCreditActive: false,
      unlockedTiers: [],
      savedCard: null,
    });
    service = new TenantBillingService(
      prisma as never,
      controlPlaneBillingClient as never,
      configService as never,
      verificationSpendService as never,
      recordsService as never,
      zeptoMailService as never,
    );
  });

  it('orders plans by the tenant preferred currency and marks preferred plans', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ country: 'NG' });
    controlPlaneBillingClient.listPlans.mockResolvedValue([
      {
        id: 'usd_growth',
        name: 'Growth USD',
        tier: 'growth',
        billingInterval: 'monthly',
        basePriceMinorUnits: 19_900,
        currency: 'USD',
        isActive: true,
        features: {},
      },
      {
        id: 'ngn_growth',
        name: 'Growth NGN',
        tier: 'growth',
        billingInterval: 'monthly',
        basePriceMinorUnits: 299_000,
        currency: 'NGN',
        isActive: true,
        features: {},
      },
    ]);

    const plans = await service.listPlans('tenant_1');

    expect(plans.map((plan) => plan.id)).toEqual(['ngn_growth', 'usd_growth']);
    expect(plans[0]?.isPreferredCurrency).toBe(true);
    expect(plans[1]?.isPreferredCurrency).toBe(false);
  });

  it('prefers USD plans for non-Nigerian tenants', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ country: 'GH' });
    controlPlaneBillingClient.listPlans.mockResolvedValue([
      {
        id: 'ghs_growth',
        name: 'Growth GHS',
        tier: 'growth',
        billingInterval: 'monthly',
        basePriceMinorUnits: 35_000,
        currency: 'GHS',
        isActive: true,
        features: {},
      },
      {
        id: 'usd_growth',
        name: 'Growth USD',
        tier: 'growth',
        billingInterval: 'monthly',
        basePriceMinorUnits: 29_900,
        currency: 'USD',
        isActive: true,
        features: {},
      },
    ]);

    const plans = await service.listPlans('tenant_2');

    expect(plans.map((plan) => plan.id)).toEqual(['usd_growth', 'ghs_growth']);
    expect(plans[0]?.isPreferredCurrency).toBe(true);
  });

  it('issues and emails a receipt after a payment is applied', async () => {
    controlPlaneBillingClient.verifyAndApplyPayment.mockResolvedValue({
      provider: 'paystack',
      reference: 'ref_123',
      purpose: 'platform_wallet_topup',
      status: 'applied',
      amountMinorUnits: 25_000,
      currency: 'NGN',
      tenantId: 'tenant_1',
      paymentMethod: {
        authorizationCode: 'AUTH_1',
        customerCode: 'CUS_1',
        last4: '4242',
        brand: 'visa',
      },
    });
    prisma.tenant.findUnique.mockResolvedValue({ name: 'Acme Mobility', country: 'NG' });
    prisma.user.findMany.mockResolvedValue([
      {
        email: 'owner@example.com',
        name: 'Owner',
        role: 'TENANT_OWNER',
        settings: null,
      },
    ]);
    recordsService.issueDocument.mockResolvedValue({
      id: 'doc_1',
      documentNumber: 'RCT-0001',
    });
    zeptoMailService.sendEmail.mockResolvedValue(undefined);

    const result = await service.verifyAndApply('tenant_1', {
      provider: 'paystack',
      reference: 'ref_123',
      purpose: 'platform_wallet_topup',
    });

    expect(recordsService.issueDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant_1',
        documentType: 'tenant_billing_receipt',
        relatedEntityId: 'ref_123',
      }),
    );
    expect(zeptoMailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Payment receipt RCT-0001',
      }),
    );
    expect(result.receiptDocumentId).toBe('doc_1');
    expect(result.receiptDocumentNumber).toBe('RCT-0001');
    expect(result.receiptEmailSentTo).toEqual(['owner@example.com']);
  });

  it('builds a usable summary when invoice and wallet reads degrade but subscription still loads', async () => {
    controlPlaneBillingClient.getSubscription.mockResolvedValue({
      id: 'sub_1',
      planId: 'growth_ngn_monthly',
      planName: 'Growth',
      planTier: 'growth',
      currency: 'NGN',
      features: {
        vehicleCap: 20,
        seatLimit: 25,
      },
      status: 'trialing',
      currentPeriodStart: '2026-04-01T00:00:00.000Z',
      currentPeriodEnd: '2026-05-01T00:00:00.000Z',
      cancelAtPeriodEnd: false,
      trialEndsAt: '2026-04-15T00:00:00.000Z',
      enforcement: {
        stage: 'active',
        gracePeriodDays: 5,
        graceEndsAt: null,
        graceDaysRemaining: 0,
        degradedMode: false,
        blockedFeatures: [],
      },
    });
    controlPlaneBillingClient.listInvoices.mockRejectedValue(
      new ServiceUnavailableException('billing invoices unavailable'),
    );
    controlPlaneBillingClient.getPlatformWalletBalance.mockRejectedValue(
      new ServiceUnavailableException('wallet balance unavailable'),
    );
    controlPlaneBillingClient.listPlatformWalletEntries.mockRejectedValue(
      new ServiceUnavailableException('wallet entries unavailable'),
    );
    controlPlaneBillingClient.getBillingPaymentMethod.mockRejectedValue(
      new ServiceUnavailableException('404 not found'),
    );

    const summary = await service.getSummary('tenant_1', 'user_1');

    expect(summary.subscription.planName).toBe('Growth');
    expect(summary.invoices).toEqual([]);
    expect(summary.verificationWallet.balanceMinorUnits).toBe(0);
    expect(summary.verificationWallet.entries).toEqual([]);
    expect(summary.usage.driverCap).toBeNull();
    expect(summary.usage.vehicleCap).toBe(20);
  });
});
