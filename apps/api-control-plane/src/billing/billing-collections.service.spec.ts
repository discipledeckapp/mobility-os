import { NotFoundException } from '@nestjs/common';
import { BillingCollectionsService } from './billing-collections.service';

describe('BillingCollectionsService', () => {
  const prisma = {
    cpInvoice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    cpCollectionAttempt: {
      create: jest.fn(),
    },
    cpSubscription: {
      update: jest.fn(),
    },
  };

  const billingService = {
    markPaid: jest.fn(),
  };

  const paymentsService = {
    initializeInvoicePayment: jest.fn(),
  };
  const tenantLifecycleService = {
    markPaymentFailed: jest.fn(),
    markPaymentRecovered: jest.fn(),
  };

  const platformWalletsService = {
    getBalance: jest.fn(),
    createEntry: jest.fn(),
  };

  let service: BillingCollectionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BillingCollectionsService(
      prisma as never,
      billingService as never,
      platformWalletsService as never,
      paymentsService as never,
      tenantLifecycleService as never,
    );
  });

  it('marks a tenant subscription past due when an overdue invoice remains unpaid', async () => {
    prisma.cpInvoice.findUnique.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      status: 'open',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
      subscription: {
        id: 'sub_1',
        status: 'active',
        cancelAtPeriodEnd: false,
      },
    });
    platformWalletsService.getBalance.mockRejectedValue(new NotFoundException('wallet missing'));
    tenantLifecycleService.markPaymentFailed.mockResolvedValue({
      id: 'sub_1',
      status: 'past_due',
    });

    const result = await service.runForInvoice('inv_1', {
      asOf: '2026-04-10T00:00:00.000Z',
    });

    expect(result.collectionOutcome).toBe('marked_past_due');
    expect(result.subscriptionStatus).toBe('past_due');
  });

  it('settles an overdue invoice from platform wallet balance and restores active status', async () => {
    prisma.cpInvoice.findUnique.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      status: 'open',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
      subscription: {
        id: 'sub_1',
        status: 'past_due',
        cancelAtPeriodEnd: false,
      },
    });
    platformWalletsService.getBalance.mockResolvedValue({
      balanceMinorUnits: 5030000,
    });
    tenantLifecycleService.markPaymentRecovered.mockResolvedValue({
      id: 'sub_1',
      status: 'active',
    });

    const result = await service.runForInvoice('inv_1');

    expect(result.collectionOutcome).toBe('settled_from_platform_wallet');
    expect(result.subscriptionStatus).toBe('active');
    expect(platformWalletsService.createEntry).toHaveBeenCalled();
    expect(billingService.markPaid).toHaveBeenCalledWith('inv_1');
  });

  it('returns already paid when the invoice is already settled', async () => {
    prisma.cpInvoice.findUnique.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      status: 'paid',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 5030000,
      currency: 'NGN',
      subscription: {
        id: 'sub_1',
        status: 'active',
        cancelAtPeriodEnd: false,
      },
    });

    const result = await service.runForInvoice('inv_1');

    expect(result.collectionOutcome).toBe('already_paid');
  });

  it('records a reminder attempt for a collectible invoice', async () => {
    prisma.cpInvoice.findUnique.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      status: 'open',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
      dueAt: new Date('2026-04-01T00:00:00.000Z'),
      subscription: {
        id: 'sub_1',
        status: 'past_due',
        cancelAtPeriodEnd: false,
      },
    });
    prisma.cpCollectionAttempt.create.mockResolvedValue({
      id: 'ca_1',
      invoiceId: 'inv_1',
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      kind: 'reminder',
      status: 'queued',
      channel: 'email',
      provider: null,
      paymentReference: null,
      metadata: { note: 'First reminder' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createReminder('inv_1', {
      channel: 'email',
      note: 'First reminder',
    });

    expect(result.kind).toBe('reminder');
    expect(prisma.cpCollectionAttempt.create).toHaveBeenCalled();
  });

  it('creates a retry checkout and persists the collection attempt', async () => {
    prisma.cpInvoice.findUnique.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      status: 'open',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
      dueAt: new Date('2026-04-01T00:00:00.000Z'),
      subscription: {
        id: 'sub_1',
        status: 'past_due',
        cancelAtPeriodEnd: false,
      },
    });
    paymentsService.initializeInvoicePayment.mockResolvedValue({
      provider: 'paystack',
      reference: 'mos_paystack_invoice_settlement_inv_1_123',
      checkoutUrl: 'https://checkout.example/pay',
      purpose: 'invoice_settlement',
    });
    prisma.cpCollectionAttempt.create.mockResolvedValue({
      id: 'ca_2',
      invoiceId: 'inv_1',
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      kind: 'retry_checkout',
      status: 'checkout_initialized',
      channel: 'provider_checkout',
      provider: 'paystack',
      paymentReference: 'mos_paystack_invoice_settlement_inv_1_123',
      metadata: {
        purpose: 'invoice_settlement',
        checkoutUrl: 'https://checkout.example/pay',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.initiateRetryCheckout('inv_1', {
      provider: 'paystack',
      customerEmail: 'billing@example.com',
    });

    expect(result.paymentReference).toBe('mos_paystack_invoice_settlement_inv_1_123');
    expect(result.checkoutUrl).toBe('https://checkout.example/pay');
  });
});
