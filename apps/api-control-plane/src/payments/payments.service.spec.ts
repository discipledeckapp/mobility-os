import { BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const prisma = {
    cpPaymentAttempt: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const billingService = {
    getInvoice: jest.fn(),
    markPaid: jest.fn(),
  };
  const platformWalletsService = {
    hasEntryForReference: jest.fn(),
    createEntry: jest.fn(),
  };
  const tenantLifecycleService = {
    markPaymentRecovered: jest.fn(),
  };
  const paymentProvidersService = {
    initializePayment: jest.fn(),
    verifyPayment: jest.fn(),
    assertWebhookAuthentic: jest.fn(),
    extractWebhookReference: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };

  let service: PaymentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentsService(
      prisma as never,
      billingService as never,
      platformWalletsService as never,
      paymentProvidersService as never,
      configService as never,
      tenantLifecycleService as never,
    );
    configService.get.mockReturnValue('https://tenant.example.com/payments/return');
  });

  it('initializes an invoice checkout with the requested provider', async () => {
    billingService.getInvoice.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      status: 'open',
      amountDueMinorUnits: 5000000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
    });
    paymentProvidersService.initializePayment.mockResolvedValue({
      provider: 'paystack',
      checkoutUrl: 'https://paystack.test/checkout',
      accessCode: 'access_123',
    });
    prisma.cpPaymentAttempt.create.mockResolvedValue({
      id: 'attempt_1',
    });

    const result = await service.initializeInvoicePayment({
      provider: 'paystack',
      invoiceId: 'inv_1',
      customerEmail: 'billing@example.com',
    });

    expect(result.provider).toBe('paystack');
    expect(result.purpose).toBe('invoice_settlement');
    expect(result.checkoutUrl).toContain('paystack');
    expect(prisma.cpPaymentAttempt.create).toHaveBeenCalled();
  });

  it('applies a successful wallet top-up exactly once', async () => {
    prisma.cpPaymentAttempt.findUnique.mockResolvedValue({
      reference: 'ref_1',
      purpose: 'platform_wallet_topup',
      tenantId: 'tenant_1',
      invoiceId: null,
    });
    prisma.cpPaymentAttempt.updateMany.mockResolvedValue({ count: 1 });
    paymentProvidersService.verifyPayment.mockResolvedValue({
      provider: 'flutterwave',
      reference: 'ref_1',
      status: 'successful',
      amountMinorUnits: 250000,
      currency: 'NGN',
    });
    platformWalletsService.hasEntryForReference.mockResolvedValue(false);
    platformWalletsService.createEntry.mockResolvedValue({
      id: 'entry_1',
    });

    const result = await service.verifyAndApplyPayment({
      provider: 'flutterwave',
      reference: 'ref_1',
      purpose: 'platform_wallet_topup',
      tenantId: 'tenant_1',
    });

    expect(platformWalletsService.createEntry).toHaveBeenCalledWith(
      'tenant_1',
      expect.objectContaining({
        type: 'credit',
        amountMinorUnits: 250000,
        currency: 'NGN',
        referenceType: 'payment',
      }),
    );
    expect(result.status).toBe('applied');
  });

  it('rejects applying a non-successful provider payment', async () => {
    prisma.cpPaymentAttempt.findUnique.mockResolvedValue({
      reference: 'ref_1',
      purpose: 'platform_wallet_topup',
      tenantId: 'tenant_1',
      invoiceId: null,
    });
    prisma.cpPaymentAttempt.updateMany.mockResolvedValue({ count: 1 });
    paymentProvidersService.verifyPayment.mockResolvedValue({
      provider: 'paystack',
      reference: 'ref_1',
      status: 'pending',
      amountMinorUnits: 250000,
      currency: 'NGN',
    });

    await expect(
      service.verifyAndApplyPayment({
        provider: 'paystack',
        reference: 'ref_1',
        purpose: 'platform_wallet_topup',
        tenantId: 'tenant_1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('reconciles a webhook by stored payment attempt reference', async () => {
    paymentProvidersService.extractWebhookReference.mockReturnValue('ref_webhook_1');
    prisma.cpPaymentAttempt.findUnique.mockResolvedValue({
      reference: 'ref_webhook_1',
      purpose: 'invoice_settlement',
      tenantId: 'tenant_1',
      invoiceId: 'inv_1',
    });
    prisma.cpPaymentAttempt.update.mockResolvedValue({ id: 'attempt_1' });
    prisma.cpPaymentAttempt.updateMany.mockResolvedValue({ count: 1 });
    billingService.getInvoice.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      currency: 'NGN',
      status: 'open',
      amountDueMinorUnits: 5000000,
      amountPaidMinorUnits: 0,
    });
    paymentProvidersService.verifyPayment.mockResolvedValue({
      provider: 'flutterwave',
      reference: 'ref_webhook_1',
      status: 'successful',
      amountMinorUnits: 5000000,
      currency: 'NGN',
      providerPayload: { ok: true },
    });
    billingService.markPaid.mockResolvedValue({
      id: 'inv_1',
      status: 'paid',
    });
    tenantLifecycleService.markPaymentRecovered.mockResolvedValue({
      id: 'sub_1',
      status: 'active',
    });

    const result = await service.handleWebhook(
      'flutterwave',
      { 'verif-hash': 'hash' },
      { data: { tx_ref: 'ref_webhook_1' } },
    );

    expect(result.status).toBe('applied');
    expect(result.invoiceId).toBe('inv_1');
    expect(tenantLifecycleService.markPaymentRecovered).toHaveBeenCalledWith({
      tenantId: 'tenant_1',
      invoiceId: 'inv_1',
      provider: 'flutterwave',
      referenceId: 'ref_webhook_1',
    });
  });
});
