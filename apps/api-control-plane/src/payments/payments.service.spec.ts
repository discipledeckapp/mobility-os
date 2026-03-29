import { BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const prisma = {
    cpPaymentAttempt: {
      create: jest.fn(),
      findFirst: jest.fn(),
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
  const recordsService = {
    issueDocument: jest.fn(),
  };
  const tenantLifecycleService = {
    markPaymentRecovered: jest.fn(),
  };
  const staffNotificationService = {
    sendVerificationPaymentReceipt: jest.fn(),
    notifyVerificationPaymentReceived: jest.fn(),
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
      recordsService as never,
      paymentProvidersService as never,
      configService as never,
      tenantLifecycleService as never,
      staffNotificationService as never,
    );
    configService.get.mockReturnValue('https://tenant.example.com/payments/return');
    prisma.cpPaymentAttempt.findFirst.mockResolvedValue(null);
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

  it('initializes an identity verification checkout for a guarantor subject', async () => {
    paymentProvidersService.initializePayment.mockResolvedValue({
      provider: 'paystack',
      checkoutUrl: 'https://paystack.test/checkout',
      accessCode: 'access_123',
    });
    prisma.cpPaymentAttempt.create.mockResolvedValue({
      id: 'attempt_1',
    });

    const result = await service.initializeIdentityVerificationPayment({
      provider: 'paystack',
      tenantId: 'tenant_1',
      subjectType: 'guarantor',
      subjectId: 'guarantor_1',
      relatedDriverId: 'driver_1',
      currency: 'NGN',
      verificationTier: 'VERIFIED_IDENTITY',
      amountMinorUnits: 1_000_000,
      customerEmail: 'guarantor@example.com',
      customerName: 'Guarantor One',
    });

    expect(result.purpose).toBe('identity_verification');
    expect(prisma.cpPaymentAttempt.create).toHaveBeenCalled();
    expect(paymentProvidersService.initializePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinorUnits: 1_000_000,
        description: 'Mobiris Verified Identity verification fee',
        metadata: expect.objectContaining({
          subjectType: 'guarantor',
          subjectId: 'guarantor_1',
          driverId: 'driver_1',
          verificationTier: 'VERIFIED_IDENTITY',
        }),
      }),
    );
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

  it('applies identity verification payments and returns already_applied on retry', async () => {
    prisma.cpPaymentAttempt.findUnique
      .mockResolvedValueOnce({
        reference: 'ref_kyc_1',
        purpose: 'identity_verification',
        tenantId: 'tenant_1',
        invoiceId: null,
        status: 'checkout_initialized',
        amountMinorUnits: 500000,
        currency: 'NGN',
        customerEmail: 'driver@example.com',
        customerName: 'Driver One',
      })
      .mockResolvedValueOnce({
        reference: 'ref_kyc_1',
        purpose: 'identity_verification',
        tenantId: 'tenant_1',
        invoiceId: null,
        status: 'applied',
        amountMinorUnits: 500000,
        currency: 'NGN',
        customerEmail: 'driver@example.com',
        customerName: 'Driver One',
      });
    prisma.cpPaymentAttempt.updateMany.mockResolvedValue({ count: 1 });
    paymentProvidersService.verifyPayment.mockResolvedValue({
      provider: 'paystack',
      reference: 'ref_kyc_1',
      status: 'successful',
      amountMinorUnits: 500000,
      currency: 'NGN',
    });
    recordsService.issueDocument.mockResolvedValue({
      id: 'doc_1',
      fileUrl: 'https://control.mobiris.ng/receipts/doc_1.pdf',
    });

    const first = await service.verifyAndApplyPayment({
      provider: 'paystack',
      reference: 'ref_kyc_1',
      purpose: 'identity_verification',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    });
    const second = await service.verifyAndApplyPayment({
      provider: 'paystack',
      reference: 'ref_kyc_1',
      purpose: 'identity_verification',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    });

    expect(first.purpose).toBe('identity_verification');
    expect(first.status).toBe('applied');
    expect(second.status).toBe('already_applied');
    expect(second.driverId).toBe('driver_1');
    expect(staffNotificationService.sendVerificationPaymentReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'driver@example.com',
        reference: 'ref_kyc_1',
      }),
    );
    expect(staffNotificationService.notifyVerificationPaymentReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        reference: 'ref_kyc_1',
      }),
    );
  });

  it('reuses an unfinished identity verification checkout instead of creating a new charge', async () => {
    prisma.cpPaymentAttempt.findFirst.mockResolvedValue({
      reference: 'ref_existing_kyc_1',
      checkoutUrl: 'https://paystack.test/existing-checkout',
      accessCode: 'access_existing_1',
    });

    const result = await service.initializeDriverKycPayment({
      provider: 'paystack',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      customerEmail: 'driver@example.com',
      customerName: 'Driver One',
      currency: 'NGN',
      verificationTier: 'FULL_TRUST_VERIFICATION',
      amountMinorUnits: 1_500_000,
    });

    expect(result).toEqual({
      provider: 'paystack',
      reference: 'ref_existing_kyc_1',
      checkoutUrl: 'https://paystack.test/existing-checkout',
      accessCode: 'access_existing_1',
      purpose: 'identity_verification',
    });
    expect(paymentProvidersService.initializePayment).not.toHaveBeenCalled();
    expect(prisma.cpPaymentAttempt.create).not.toHaveBeenCalled();
    expect(prisma.cpPaymentAttempt.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          reference: {
            startsWith: 'mos_paystack_identity_verification_driver_driver_1_',
          },
        }),
      }),
    );
  });
});
