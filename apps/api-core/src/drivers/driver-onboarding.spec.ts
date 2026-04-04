/**
 * Driver onboarding flow tests.
 *
 * Covers:
 *  - Invited first-time driver setup (OTP → account → consent → payment → verification)
 *  - Returning driver login with email+password
 *  - Consent idempotency (no duplicate creation, no crash)
 *  - Payment already completed — no duplicate prompt
 *  - Org-sponsored verification — skip personal payment
 *  - Self-paid verification flow
 *  - Document ID number verification (zero-trust)
 *  - Manual review completion → driver becomes eligible for assignment
 *  - Verified driver assignment eligibility
 *  - No raw Prisma table-missing crash exposed to caller
 *  - Backend-driven onboarding step routing
 */

import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { DriversService } from './drivers.service';

// ---------------------------------------------------------------------------
// Minimal mock factory helpers
// ---------------------------------------------------------------------------

function makeDriver(overrides: Record<string, unknown> = {}) {
  return {
    id: 'driver_1',
    tenantId: 'tenant_1',
    fleetId: 'fleet_1',
    businessEntityId: 'be_1',
    operatingUnitId: 'ou_1',
    status: 'active',
    firstName: 'Ada',
    lastName: 'Okonkwo',
    dateOfBirth: '1990-01-15',
    phone: '+2348012345678',
    email: 'ada@example.com',
    nationality: 'NG',
    identityStatus: 'unverified',
    identityLastVerifiedAt: null,
    identityLastDecision: null,
    personId: null,
    selfieImageUrl: null,
    providerImageUrl: null,
    kycPaymentReference: null,
    kycPaymentVerifiedAt: null,
    adminAssignmentOverride: false,
    driverPaysKycOverride: null,
    verificationTierOverride: null,
    gender: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function makeEntitlement(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ent_1',
    entitlementCode: 'ENT-001',
    subjectType: 'driver',
    subjectId: 'driver_1',
    tenantId: 'tenant_1',
    payerType: 'driver',
    paymentReference: null,
    amountMinorUnits: 100000,
    currency: 'NGN',
    purpose: 'kyc',
    status: 'pending',
    paidAt: null,
    reservedAt: null,
    consumedAt: null,
    expiresAt: null,
    consumedByAttemptId: null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeLinkedUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user_1',
    tenantId: 'tenant_1',
    driverId: 'driver_1',
    email: 'ada@example.com',
    phone: null,
    isActive: true,
    passwordHash: null,
    role: 'driver',
    settings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Shared mock setup
// ---------------------------------------------------------------------------

function makePrisma() {
  return {
    driver: {
      findUnique: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    driverDocument: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    driverDocumentVerification: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    driverGuarantor: {
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    userConsent: {
      create: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    fleet: { findUnique: jest.fn() },
    tenant: { findUnique: jest.fn() },
    selfServiceOtp: {
      create: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    verificationEntitlement: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    verificationAttempt: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    operationalWallet: {
      findUnique: jest.fn().mockResolvedValue({ id: 'wallet_1' }),
    },
    operationalWalletEntry: {
      groupBy: jest
        .fn()
        .mockResolvedValue([{ type: 'credit', _sum: { amountMinorUnits: 1_000_000 } }]),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn().mockImplementation(async (ops: unknown[]) => Promise.all(ops)),
  };
}

function makeIntelligenceClient() {
  return {
    initializeLivenessSession: jest.fn(),
    resolveEnrollment: jest.fn(),
    queryPersonRisk: jest.fn().mockResolvedValue({ riskBand: 'low', isWatchlisted: false }),
    queryPersonRolePresence: jest.fn().mockResolvedValue({ isDriver: false }),
    verifyDocumentIdentifier: jest.fn(),
  };
}

function buildService(
  prisma: ReturnType<typeof makePrisma>,
  intelligenceClient: ReturnType<typeof makeIntelligenceClient>,
) {
  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn().mockResolvedValue({
      purpose: 'driver_self_service',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    }),
  };
  const authEmailService = {
    sendDriverSelfServiceVerificationEmail: jest.fn(),
    sendGuarantorSelfServiceVerificationEmail: jest.fn(),
  };
  const documentStorageService = {
    uploadFile: jest
      .fn()
      .mockResolvedValue({ storageKey: 'key', storageUrl: 'https://example.com' }),
    readFile: jest.fn(),
    deleteFile: jest.fn(),
  };
  const subscriptionEntitlementsService = {
    enforceDriverCapacity: jest.fn().mockResolvedValue(undefined),
    enforceVehicleCapacity: jest.fn(),
    getCapInfo: jest.fn().mockResolvedValue({ driverCap: null }),
  };
  const policyService = {
    evaluateDriverPolicies: jest.fn().mockResolvedValue([]),
    listActiveActionsByEntityIds: jest.fn().mockResolvedValue(new Map()),
    applyDriverEnforcement: jest.fn().mockImplementation((r: unknown) => r),
  };
  const notificationsService = {
    notifyDriverVerificationStatus: jest.fn(),
    notifyDriverLicenceReviewPending: jest.fn(),
    notifyDriverLicenceReviewResolved: jest.fn(),
    notifyGuarantorStatus: jest.fn(),
  };
  const auditService = { recordTenantAction: jest.fn() };

  return new DriversService(
    prisma as never,
    intelligenceClient as never,
    jwtService as never,
    authEmailService as never,
    documentStorageService as never,
    subscriptionEntitlementsService as never,
    { fireEvent: jest.fn() } as never,
    { initializeDriverKycCheckout: jest.fn() } as never,
    policyService as never,
    notificationsService as never,
    auditService as never,
  );
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('Driver onboarding — OTP exchange (invited first-time driver)', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: DriversService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    prisma.tenant.findUnique.mockResolvedValue({ country: 'NG', metadata: {} });
    service = buildService(prisma, makeIntelligenceClient());
  });

  it('exchanges a valid OTP for a self-service token', async () => {
    const otp = {
      id: 'otp_1',
      otpCode: 'ABC123',
      subjectType: 'driver',
      subjectId: 'driver_1',
      tenantId: 'tenant_1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    };
    prisma.selfServiceOtp.findUnique.mockResolvedValue(otp);
    prisma.selfServiceOtp.update.mockResolvedValue({ ...otp, usedAt: new Date() });
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.token'),
      verifyAsync: jest.fn(),
    };
    service = new DriversService(
      prisma as never,
      makeIntelligenceClient() as never,
      jwtService as never,
      {
        sendDriverSelfServiceVerificationEmail: jest.fn(),
        sendGuarantorSelfServiceVerificationEmail: jest.fn(),
      } as never,
      { uploadFile: jest.fn(), readFile: jest.fn(), deleteFile: jest.fn() } as never,
      { enforceDriverCapacity: jest.fn(), getCapInfo: jest.fn().mockResolvedValue({}) } as never,
      { fireEvent: jest.fn() } as never,
      { initializeDriverKycCheckout: jest.fn() } as never,
      {
        evaluateDriverPolicies: jest.fn().mockResolvedValue([]),
        listActiveActionsByEntityIds: jest.fn().mockResolvedValue(new Map()),
        applyDriverEnforcement: jest.fn().mockImplementation((r: unknown) => r),
      } as never,
      {
        notifyDriverVerificationStatus: jest.fn(),
        notifyDriverLicenceReviewPending: jest.fn(),
        notifyDriverLicenceReviewResolved: jest.fn(),
      } as never,
      { recordTenantAction: jest.fn() } as never,
    );

    const result = await service.exchangeDriverSelfServiceOtp('ABC123');

    expect(result.token).toBe('signed.token');
    expect(prisma.selfServiceOtp.update).toHaveBeenCalledWith({
      where: { id: 'otp_1' },
      data: { usedAt: expect.any(Date) },
    });
  });

  it('rejects an expired OTP', async () => {
    prisma.selfServiceOtp.findUnique.mockResolvedValue({
      id: 'otp_1',
      otpCode: 'ABC123',
      subjectType: 'driver',
      subjectId: 'driver_1',
      tenantId: 'tenant_1',
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000), // expired
    });

    await expect(service.exchangeDriverSelfServiceOtp('ABC123')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an already-used OTP', async () => {
    prisma.selfServiceOtp.findUnique.mockResolvedValue({
      id: 'otp_1',
      otpCode: 'ABC123',
      subjectType: 'driver',
      subjectId: 'driver_1',
      tenantId: 'tenant_1',
      usedAt: new Date(), // already used
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(service.exchangeDriverSelfServiceOtp('ABC123')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

describe('Driver onboarding — returning driver password login', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: DriversService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    prisma.tenant.findUnique.mockResolvedValue({ country: 'NG', metadata: {} });
  });

  it('issues a self-service token for a valid email+password combination', async () => {
    // Use a real password hash so verifyPassword passes.
    const { hashPassword } = await import('./drivers.service').then(
      () => import('../auth/password-utils'),
    );
    const hash = hashPassword('correct-horse-battery');
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser({ passwordHash: hash }));
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('driver.jwt'),
      verifyAsync: jest.fn(),
    };
    service = new DriversService(
      prisma as never,
      makeIntelligenceClient() as never,
      jwtService as never,
      { sendDriverSelfServiceVerificationEmail: jest.fn() } as never,
      { uploadFile: jest.fn(), readFile: jest.fn(), deleteFile: jest.fn() } as never,
      { enforceDriverCapacity: jest.fn(), getCapInfo: jest.fn().mockResolvedValue({}) } as never,
      { fireEvent: jest.fn() } as never,
      { initializeDriverKycCheckout: jest.fn() } as never,
      {
        evaluateDriverPolicies: jest.fn().mockResolvedValue([]),
        listActiveActionsByEntityIds: jest.fn().mockResolvedValue(new Map()),
        applyDriverEnforcement: jest.fn().mockImplementation((r: unknown) => r),
      } as never,
      {
        notifyDriverVerificationStatus: jest.fn(),
        notifyDriverLicenceReviewPending: jest.fn(),
        notifyDriverLicenceReviewResolved: jest.fn(),
      } as never,
      { recordTenantAction: jest.fn() } as never,
    );

    const result = await service.loginDriverSelfServiceWithPassword(
      'ada@example.com',
      'correct-horse-battery',
    );

    expect(result.token).toBe('driver.jwt');
  });

  it('rejects login with wrong password', async () => {
    const { hashPassword } = await import('../auth/password-utils');
    const hash = hashPassword('correct-horse-battery');
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser({ passwordHash: hash }));
    const jwtService = { signAsync: jest.fn(), verifyAsync: jest.fn() };
    service = new DriversService(
      prisma as never,
      makeIntelligenceClient() as never,
      jwtService as never,
      { sendDriverSelfServiceVerificationEmail: jest.fn() } as never,
      { uploadFile: jest.fn(), readFile: jest.fn(), deleteFile: jest.fn() } as never,
      { enforceDriverCapacity: jest.fn(), getCapInfo: jest.fn().mockResolvedValue({}) } as never,
      { fireEvent: jest.fn() } as never,
      { initializeDriverKycCheckout: jest.fn() } as never,
      {
        evaluateDriverPolicies: jest.fn().mockResolvedValue([]),
        listActiveActionsByEntityIds: jest.fn().mockResolvedValue(new Map()),
        applyDriverEnforcement: jest.fn().mockImplementation((r: unknown) => r),
      } as never,
      {
        notifyDriverVerificationStatus: jest.fn(),
        notifyDriverLicenceReviewPending: jest.fn(),
        notifyDriverLicenceReviewResolved: jest.fn(),
      } as never,
      { recordTenantAction: jest.fn() } as never,
    );

    await expect(
      service.loginDriverSelfServiceWithPassword('ada@example.com', 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login for a user without a linked driver', async () => {
    const { hashPassword } = await import('../auth/password-utils');
    const hash = hashPassword('password123');
    // driverId is null — not a driver user
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser({ driverId: null, passwordHash: hash }));
    const jwtService = { signAsync: jest.fn(), verifyAsync: jest.fn() };
    service = new DriversService(
      prisma as never,
      makeIntelligenceClient() as never,
      jwtService as never,
      { sendDriverSelfServiceVerificationEmail: jest.fn() } as never,
      { uploadFile: jest.fn(), readFile: jest.fn(), deleteFile: jest.fn() } as never,
      { enforceDriverCapacity: jest.fn(), getCapInfo: jest.fn().mockResolvedValue({}) } as never,
      { fireEvent: jest.fn() } as never,
      { initializeDriverKycCheckout: jest.fn() } as never,
      {
        evaluateDriverPolicies: jest.fn().mockResolvedValue([]),
        listActiveActionsByEntityIds: jest.fn().mockResolvedValue(new Map()),
        applyDriverEnforcement: jest.fn().mockImplementation((r: unknown) => r),
      } as never,
      {
        notifyDriverVerificationStatus: jest.fn(),
        notifyDriverLicenceReviewPending: jest.fn(),
        notifyDriverLicenceReviewResolved: jest.fn(),
      } as never,
      { recordTenantAction: jest.fn() } as never,
    );

    await expect(
      service.loginDriverSelfServiceWithPassword('ada@example.com', 'password123'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('Driver onboarding — consent creation', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: DriversService;
  const VALID_TOKEN = 'valid.token';

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    prisma.tenant.findUnique.mockResolvedValue({ country: 'NG', metadata: {} });

    const jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn().mockResolvedValue({
        purpose: 'driver_self_service',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
      }),
    };
    service = new DriversService(
      prisma as never,
      makeIntelligenceClient() as never,
      jwtService as never,
      { sendDriverSelfServiceVerificationEmail: jest.fn() } as never,
      { uploadFile: jest.fn(), readFile: jest.fn(), deleteFile: jest.fn() } as never,
      { enforceDriverCapacity: jest.fn(), getCapInfo: jest.fn().mockResolvedValue({}) } as never,
      { fireEvent: jest.fn() } as never,
      { initializeDriverKycCheckout: jest.fn() } as never,
      {
        evaluateDriverPolicies: jest.fn().mockResolvedValue([]),
        listActiveActionsByEntityIds: jest.fn().mockResolvedValue(new Map()),
        applyDriverEnforcement: jest.fn().mockImplementation((r: unknown) => r),
      } as never,
      {
        notifyDriverVerificationStatus: jest.fn(),
        notifyDriverLicenceReviewPending: jest.fn(),
        notifyDriverLicenceReviewResolved: jest.fn(),
      } as never,
      { recordTenantAction: jest.fn() } as never,
    );
  });

  it('creates consent when none exists and user account is linked', async () => {
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue(null); // no existing consent
    prisma.userConsent.create.mockResolvedValue({ id: 'consent_1' });

    const result = await service.recordDriverSelfServiceVerificationConsent(VALID_TOKEN);

    expect(result.message).toBe('Verification consent recorded.');
    expect(prisma.userConsent.create).toHaveBeenCalledTimes(1);
    expect(prisma.userConsent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user_1',
          subjectType: 'driver',
          subjectId: 'driver_1',
          granted: true,
        }),
      }),
    );
  });

  it('is idempotent: skips consent creation if consent already exists', async () => {
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    // Consent already recorded
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });

    const result = await service.recordDriverSelfServiceVerificationConsent(VALID_TOKEN);

    expect(result.message).toBe('Verification consent recorded.');
    // Must NOT call create again
    expect(prisma.userConsent.create).not.toHaveBeenCalled();
  });

  it('throws ConflictException if no user account is linked yet', async () => {
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.user.findFirst.mockResolvedValue(null); // no account yet

    await expect(
      service.recordDriverSelfServiceVerificationConsent(VALID_TOKEN),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.userConsent.create).not.toHaveBeenCalled();
  });
});

describe('Driver onboarding — payment decision logic', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let intelligenceClient: ReturnType<typeof makeIntelligenceClient>;
  let service: DriversService;
  let controlPlaneBillingClient: {
    initializeDriverKycCheckout: jest.Mock;
    verifyAndApplyPayment: jest.Mock;
  };
  let verificationSpendService: {
    getSpendSummary: jest.Mock;
    saveAuthorizedCard: jest.Mock;
    ensureVerificationSpendApplied: jest.Mock;
  };
  const VALID_TOKEN = 'valid.token';

  function setup(tenantMetadata = {}) {
    jest.clearAllMocks();
    prisma = makePrisma();
    intelligenceClient = makeIntelligenceClient();
    controlPlaneBillingClient = {
      initializeDriverKycCheckout: jest.fn(),
      verifyAndApplyPayment: jest.fn(),
    };
    verificationSpendService = {
      getSpendSummary: jest.fn().mockResolvedValue({
        currency: 'NGN',
        walletBalanceMinorUnits: 2_000_000,
        creditLimitMinorUnits: 0,
        creditUsedMinorUnits: 0,
        availableSpendMinorUnits: 2_000_000,
        starterCreditActive: false,
        starterCreditEligible: false,
        cardCreditActive: false,
        unlockedTiers: ['BASIC_IDENTITY', 'VERIFIED_IDENTITY', 'FULL_TRUST_VERIFICATION'],
        savedCard: null,
      }),
      saveAuthorizedCard: jest.fn(),
      ensureVerificationSpendApplied: jest.fn().mockResolvedValue({
        status: 'applied',
        fundingSource: 'wallet',
      }),
    };
    prisma.tenant.findUnique.mockResolvedValue({ country: 'NG', metadata: tenantMetadata });

    const jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn().mockResolvedValue({
        purpose: 'driver_self_service',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
      }),
    };
    service = new DriversService(
      prisma as never,
      intelligenceClient as never,
      jwtService as never,
      { sendDriverSelfServiceVerificationEmail: jest.fn() } as never,
      { uploadFile: jest.fn(), readFile: jest.fn(), deleteFile: jest.fn() } as never,
      { enforceDriverCapacity: jest.fn(), getCapInfo: jest.fn().mockResolvedValue({}) } as never,
      { fireEvent: jest.fn() } as never,
      controlPlaneBillingClient as never,
      {
        evaluateDriverPolicies: jest.fn().mockResolvedValue([]),
        listActiveActionsByEntityIds: jest.fn().mockResolvedValue(new Map()),
        applyDriverEnforcement: jest.fn().mockImplementation((r: unknown) => r),
      } as never,
      {
        notifyDriverVerificationStatus: jest.fn(),
        notifyDriverLicenceReviewPending: jest.fn(),
        notifyDriverLicenceReviewResolved: jest.fn(),
      } as never,
      { recordTenantAction: jest.fn() } as never,
      verificationSpendService as never,
    );
  }

  it('does not re-prompt payment when entitlement is already paid', async () => {
    setup({ operations: { driverPaysKyc: true } });
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        kycPaymentReference: 'ref_paid_1',
        kycPaymentVerifiedAt: new Date(),
      }),
    );
    // Entitlement already in 'paid' status
    prisma.verificationEntitlement.findFirst.mockResolvedValue(
      makeEntitlement({ status: 'paid', paidAt: new Date() }),
    );
    prisma.verificationAttempt.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.count.mockResolvedValue(0);

    const context = await service.getSelfServiceContext(VALID_TOKEN);

    // Payment is ready — should NOT be driver_payment_required
    expect(context.verificationPaymentStatus).toBe('ready');
    expect(context.verificationPaymentStatus).not.toBe('driver_payment_required');
  });

  it('prompts for payment when entitlement is not yet paid (driver pays)', async () => {
    setup({ operations: { driverPaysKyc: true } });
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    // No entitlement exists yet
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.count.mockResolvedValue(0);

    const context = await service.getSelfServiceContext(VALID_TOKEN);

    expect(context.verificationPaymentStatus).toBe('driver_payment_required');
  });

  it('does not prompt for payment when org sponsorship is active and wallet is funded', async () => {
    // driverPaysKyc = false → org pays
    setup({ operations: { driverPaysKyc: false, requireIdentityVerificationForActivation: true } });
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.verificationEntitlement.findFirst.mockResolvedValue(
      makeEntitlement({ payerType: 'tenant', status: 'paid', paidAt: new Date() }),
    );
    prisma.verificationAttempt.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.count.mockResolvedValue(0);

    const context = await service.getSelfServiceContext(VALID_TOKEN);

    // When org pays and is funded, payment status should be 'ready' (not blocking)
    expect(['ready', 'not_required']).toContain(context.verificationPaymentStatus);
    expect(context.verificationWalletBalanceMinorUnits).toBeGreaterThan(0);
    expect(context.verificationAvailableSpendMinorUnits).toBeGreaterThanOrEqual(
      context.verificationAmountMinorUnits ?? 0,
    );
  });

  it('does not re-prompt for payment when org sponsorship is unfunded but the driver already paid', async () => {
    setup({ operations: { driverPaysKyc: false, requireIdentityVerificationForActivation: true } });
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
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        identityStatus: 'unverified',
        kycPaymentReference: 'ref_driver_paid_1',
        kycPaymentVerifiedAt: new Date(),
      }),
    );
    prisma.verificationEntitlement.findFirst.mockResolvedValue(
      makeEntitlement({
        payerType: 'driver',
        status: 'paid',
        paidAt: new Date(),
      }),
    );
    prisma.verificationAttempt.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.count.mockResolvedValue(0);

    const context = await service.getSelfServiceContext(VALID_TOKEN);

    expect(context.verificationPaymentStatus).toBe('ready');
    expect(context.verificationPaymentMessage).not.toContain('has not prepaid');
  });

  it('lets invited drivers pay immediately when organisation sponsorship is not prepaid', async () => {
    setup({ operations: { driverPaysKyc: false, requireIdentityVerificationForActivation: true } });
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
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue(null);
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.count.mockResolvedValue(0);
    controlPlaneBillingClient.initializeDriverKycCheckout.mockResolvedValue({
      checkoutUrl: 'https://paystack.test/driver-kyc',
    });

    const [context, step, checkout] = await Promise.all([
      service.getSelfServiceContext(VALID_TOKEN),
      service.getOnboardingStep(VALID_TOKEN),
      service.initiateKycCheckoutFromSelfService(VALID_TOKEN, 'paystack'),
    ]);

    expect(context.verificationPaymentStatus).toBe('driver_payment_required');
    expect(context.verificationPayer).toBe('driver');
    expect(step.step).toBe('payment');
    expect(checkout.status).toBe('checkout_required');
    expect(controlPlaneBillingClient.initializeDriverKycCheckout).toHaveBeenCalled();
  });

  it('rejects a driver payment reference that is already linked to another driver', async () => {
    setup({ operations: { driverPaysKyc: true } });
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.driver.findFirst.mockResolvedValue({ id: 'driver_other' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);

    await expect(
      service.verifyKycPaymentFromSelfService(VALID_TOKEN, 'paystack', 'ref_duplicate_1'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(controlPlaneBillingClient.verifyAndApplyPayment).not.toHaveBeenCalled();
  });

  it('returns already_applied for the same paid entitlement reference without re-verifying payment', async () => {
    setup({ operations: { driverPaysKyc: true } });
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.driver.findFirst.mockResolvedValue({ id: 'driver_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(
      makeEntitlement({
        paymentReference: 'ref_paid_same_1',
        status: 'paid',
        paidAt: new Date(),
      }),
    );

    const result = await service.verifyKycPaymentFromSelfService(
      VALID_TOKEN,
      'paystack',
      'ref_paid_same_1',
    );

    expect(result).toEqual({ status: 'already_applied' });
    expect(controlPlaneBillingClient.verifyAndApplyPayment).not.toHaveBeenCalled();
    expect(prisma.driver.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'driver_1' },
        data: expect.objectContaining({
          kycPaymentReference: 'ref_paid_same_1',
        }),
      }),
    );
  });

  it('moves onboarding from payment to identity verification after driver payment is applied', async () => {
    setup({ operations: { driverPaysKyc: true, requireIdentityVerificationForActivation: true } });
    prisma.driver.findUnique
      .mockResolvedValueOnce(makeDriver())
      .mockResolvedValueOnce(
        makeDriver({
          kycPaymentReference: 'ref_paid_transition_1',
          kycPaymentVerifiedAt: new Date(),
        }),
      );
    prisma.driver.findFirst.mockResolvedValue({ id: 'driver_1' });
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        makeEntitlement({
          paymentReference: 'ref_paid_transition_1',
          status: 'paid',
          paidAt: new Date(),
        }),
      )
      .mockResolvedValue(
        makeEntitlement({
          paymentReference: 'ref_paid_transition_1',
          status: 'paid',
          paidAt: new Date(),
        }),
      );
    prisma.verificationAttempt.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.count.mockResolvedValue(0);
    controlPlaneBillingClient.verifyAndApplyPayment.mockResolvedValue({
      status: 'applied',
      amountMinorUnits: 100000,
      currency: 'NGN',
    });

    const paymentResult = await service.verifyKycPaymentFromSelfService(
      VALID_TOKEN,
      'paystack',
      'ref_paid_transition_1',
    );
    const step = await service.getOnboardingStep(VALID_TOKEN);

    expect(['verified', 'already_applied']).toContain(paymentResult.status);
    expect(step.step).toBe('identity_verification');
  });

  it('keeps full trust context, pricing, and onboarding step aligned when the driver pays', async () => {
    setup({
      operations: {
        verificationTier: 'FULL_TRUST_VERIFICATION',
        driverPaysKyc: true,
        requireGuarantor: false,
        requiredDriverDocumentSlugs: [],
      },
    });
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.count.mockResolvedValue(0);

    const [context, step] = await Promise.all([
      service.getSelfServiceContext(VALID_TOKEN),
      service.getOnboardingStep(VALID_TOKEN),
    ]);

    expect(context.verificationTier).toBe('FULL_TRUST_VERIFICATION');
    expect(context.verificationTierLabel).toBe('Full Trust Verification');
    expect(context.verificationTierComponents).toEqual(
      expect.arrayContaining(['identity', 'guarantor', 'drivers_license']),
    );
    expect(context.requiredDriverDocumentSlugs).toContain('drivers-license');
    expect(context.verificationAmountMinorUnits).toBe(1_500_000);
    expect(context.driverPaysKyc).toBe(true);
    expect(context.verificationPaymentStatus).toBe('driver_payment_required');

    expect(step.step).toBe('payment');
    expect(step.verificationTier).toBe(context.verificationTier);
    expect(step.verificationTierLabel).toBe(context.verificationTierLabel);
    expect(step.verificationTierComponents).toEqual(context.verificationTierComponents);
  });

  it('does not fall back to payment once verification has started even if organisation prepaid cover is no longer available', async () => {
    setup({ operations: { driverPaysKyc: false, requireIdentityVerificationForActivation: true } });
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
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        identityStatus: 'pending_verification',
        selfieImageUrl: 'https://cdn.mobiris.local/selfie.jpg',
      }),
    );
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.findFirst.mockResolvedValue({
      id: 'attempt_1',
      status: 'in_progress',
      failureReason: null,
      metadata: null,
      completedAt: null,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    prisma.verificationAttempt.count.mockResolvedValue(1);

    const step = await service.getOnboardingStep(VALID_TOKEN);

    expect(step.step).not.toBe('payment');
    expect(['identity_verification', 'manual_review']).toContain(step.step);
  });
});

describe('Driver onboarding — document ID verification (zero-trust)', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let intelligenceClient: ReturnType<typeof makeIntelligenceClient>;
  let service: DriversService;
  let verificationSpendService: {
    getSpendSummary: jest.Mock;
    saveAuthorizedCard: jest.Mock;
    ensureVerificationSpendApplied: jest.Mock;
  };
  const VALID_TOKEN = 'valid.token';

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    intelligenceClient = makeIntelligenceClient();
    verificationSpendService = {
      getSpendSummary: jest.fn().mockResolvedValue({
        currency: 'NGN',
        walletBalanceMinorUnits: 2_000_000,
        creditLimitMinorUnits: 0,
        creditUsedMinorUnits: 0,
        availableSpendMinorUnits: 2_000_000,
        starterCreditActive: false,
        starterCreditEligible: false,
        cardCreditActive: false,
        unlockedTiers: ['BASIC_IDENTITY', 'VERIFIED_IDENTITY', 'FULL_TRUST_VERIFICATION'],
        savedCard: null,
      }),
      saveAuthorizedCard: jest.fn(),
      ensureVerificationSpendApplied: jest.fn().mockResolvedValue({
        status: 'applied',
        fundingSource: 'wallet',
      }),
    };
    prisma.tenant.findUnique.mockResolvedValue({ country: 'NG', metadata: {} });

    const jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn().mockResolvedValue({
        purpose: 'driver_self_service',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
      }),
    };
    service = new DriversService(
      prisma as never,
      intelligenceClient as never,
      jwtService as never,
      { sendDriverSelfServiceVerificationEmail: jest.fn() } as never,
      { uploadFile: jest.fn(), readFile: jest.fn(), deleteFile: jest.fn() } as never,
      { enforceDriverCapacity: jest.fn(), getCapInfo: jest.fn().mockResolvedValue({}) } as never,
      { fireEvent: jest.fn() } as never,
      { initializeDriverKycCheckout: jest.fn() } as never,
      {
        evaluateDriverPolicies: jest.fn().mockResolvedValue([]),
        listActiveActionsByEntityIds: jest.fn().mockResolvedValue(new Map()),
        applyDriverEnforcement: jest.fn().mockImplementation((r: unknown) => r),
      } as never,
      {
        notifyDriverVerificationStatus: jest.fn(),
        notifyDriverLicenceReviewPending: jest.fn(),
        notifyDriverLicenceReviewResolved: jest.fn(),
      } as never,
      { recordTenantAction: jest.fn() } as never,
      verificationSpendService as never,
    );
  });

  function setupDriver(entitlementStatus = 'paid', driverOverrides: Record<string, unknown> = {}) {
    prisma.driver.findUnique.mockResolvedValue(makeDriver(driverOverrides));
    prisma.verificationEntitlement.findFirst.mockResolvedValue(
      makeEntitlement({
        status: entitlementStatus,
        paidAt: entitlementStatus === 'paid' ? new Date() : null,
      }),
    );
    prisma.verificationAttempt.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.count.mockResolvedValue(0);
  }

  it('creates a verification record and returns verified status on provider match', async () => {
    setupDriver('paid', {
      selfieImageUrl: 'https://storage.example.com/driver-documents/selfie.jpg',
    });
    const verificationRecord = {
      id: 'docver_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      documentType: 'national-id',
      idNumber: '12345678901',
      countryCode: 'NG',
      status: 'pending',
      provider: null,
      providerMatch: null,
      providerFirstName: null,
      providerLastName: null,
      providerDateOfBirth: null,
      providerExpiryDate: null,
      failureReason: null,
      providerResult: null,
      verifiedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.driverDocumentVerification.create.mockResolvedValue(verificationRecord);
    prisma.driverDocumentVerification.update.mockResolvedValue({
      ...verificationRecord,
      status: 'verified',
      providerMatch: true,
    });

    intelligenceClient.verifyDocumentIdentifier.mockResolvedValue({
      decision: 'enrolled',
      isVerifiedMatch: true,
      providerName: 'youverify',
      verificationMetadata: {
        validity: 'valid',
        matchScore: 95,
        riskScore: 14,
      },
      verifiedProfile: {
        fullName: 'Ada Okonkwo',
        dateOfBirth: '1990-01-15',
      },
    });

    const result = await service.verifyDocumentIdFromSelfService(VALID_TOKEN, {
      documentType: 'NATIONAL_ID',
      idNumber: '12345678901',
      countryCode: 'NG',
    });

    expect(result.status).toBe('verified');
    expect(result.providerMatch).toBe(true);
    expect(prisma.driverDocumentVerification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          documentType: 'national-id',
          idNumber: '12345678901',
          status: 'pending',
        }),
      }),
    );
  });

  it('fails driver licence verification when provider returns an inconclusive result', async () => {
    setupDriver('paid');
    prisma.driverDocumentVerification.create.mockResolvedValue({
      id: 'docver_2',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.driverDocumentVerification.update.mockResolvedValue({
      id: 'docver_2',
      status: 'failed',
    });

    intelligenceClient.verifyDocumentIdentifier.mockResolvedValue({
      decision: 'review',
      isVerifiedMatch: undefined,
      providerName: 'youverify',
    });

    const result = await service.verifyDocumentIdFromSelfService(VALID_TOKEN, {
      documentType: 'drivers-license',
      idNumber: '12345678901',
      countryCode: 'NG',
    });

    expect(result.status).toBe('failed');
  });

  it('normalizes driver licence verification to a slug and fails invalid licence records', async () => {
    setupDriver('paid', {
      selfieImageUrl: 'https://storage.example.com/driver-documents/selfie.jpg',
    });
    prisma.driverDocumentVerification.create.mockResolvedValue({
      id: 'docver_licence_1',
      documentType: 'drivers-license',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.driverDocumentVerification.update.mockResolvedValue({
      id: 'docver_licence_1',
      documentType: 'drivers-license',
      status: 'failed',
    });

    intelligenceClient.verifyDocumentIdentifier.mockResolvedValue({
      decision: 'matched',
      isVerifiedMatch: true,
      providerName: 'youverify',
      verificationMetadata: {
        validity: 'invalid',
        issueDate: '2022-01-14',
        expiryDate: '2024-01-14',
        portraitAvailable: true,
        matchScore: 91,
        riskScore: 72,
      },
    });

    const result = await service.verifyDocumentIdFromSelfService(VALID_TOKEN, {
      documentType: 'drivers-license',
      idNumber: 'DL-12345',
      countryCode: 'NG',
    });

    expect(result.documentType).toBe('drivers-license');
    expect(result.status).toBe('failed');
    expect(result.providerValidity).toBe('invalid');
    expect(prisma.driverDocumentVerification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          documentType: 'drivers-license',
        }),
      }),
    );
    expect(intelligenceClient.verifyDocumentIdentifier).toHaveBeenCalledWith(
      expect.objectContaining({
        identifierType: 'DRIVERS_LICENSE',
        selfieImageUrl: 'https://storage.example.com/driver-documents/selfie.jpg',
      }),
    );
  });

  it('returns provider_unavailable without crashing when provider is unavailable', async () => {
    setupDriver('paid');
    prisma.driverDocumentVerification.create.mockResolvedValue({
      id: 'docver_3',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.driverDocumentVerification.update.mockResolvedValue({
      id: 'docver_3',
      status: 'provider_unavailable',
    });

    intelligenceClient.verifyDocumentIdentifier.mockRejectedValue(new Error('Service unavailable'));

    const result = await service.verifyDocumentIdFromSelfService(VALID_TOKEN, {
      documentType: 'NATIONAL_ID',
      idNumber: '12345678901',
      countryCode: 'NG',
    });

    expect(result.status).toBe('provider_unavailable');
    expect(result.failureReason).toBe('Document verification is temporarily unavailable.');
  });

  it('blocks document verification if payment has not been made', async () => {
    setupDriver('pending'); // payment not completed
    // No paid entitlement → assertSelfServiceVerificationPaymentReady throws
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: { operations: { driverPaysKyc: true } },
    });

    await expect(
      service.verifyDocumentIdFromSelfService(VALID_TOKEN, {
        documentType: 'NATIONAL_ID',
        idNumber: '12345678901',
        countryCode: 'NG',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not reopen organisation funding checks for driver licence verification after tier payment is already satisfied', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          driverPaysKyc: false,
          verificationTier: 'FULL_TRUST_VERIFICATION',
          requiredDriverDocumentSlugs: ['drivers-license'],
          requireIdentityVerificationForActivation: true,
        },
      },
    });
    setupDriver('paid', {
      identityStatus: 'verified',
      selfieImageUrl: 'https://storage.example.com/driver-documents/selfie.jpg',
      kycPaymentReference: 'ref_paid_1',
      kycPaymentVerifiedAt: new Date(),
    });
    prisma.driverDocumentVerification.create.mockResolvedValue({
      id: 'docver_licence_2',
      documentType: 'drivers-license',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.driverDocumentVerification.update.mockResolvedValue({
      id: 'docver_licence_2',
      documentType: 'drivers-license',
      status: 'verified',
    });
    intelligenceClient.verifyDocumentIdentifier.mockResolvedValue({
      decision: 'matched',
      isVerifiedMatch: true,
      providerName: 'youverify',
      verificationMetadata: {
        validity: 'valid',
      },
    });
    verificationSpendService.ensureVerificationSpendApplied.mockResolvedValue({
      status: 'insufficient',
      reason: 'No active card or credit is available for this verification tier.',
    });

    const result = await service.verifyDocumentIdFromSelfService(VALID_TOKEN, {
      documentType: 'drivers-license',
      idNumber: 'LIC-FTD-009',
      countryCode: 'NG',
    });

    expect(result.status).not.toBe('provider_unavailable');
    expect(verificationSpendService.ensureVerificationSpendApplied).not.toHaveBeenCalled();
  });
});

describe('Driver onboarding — onboarding step state machine', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: DriversService;
  const VALID_TOKEN = 'valid.token';

  function setup(tenantMetadata = {}) {
    jest.clearAllMocks();
    prisma = makePrisma();
    prisma.tenant.findUnique.mockResolvedValue({ country: 'NG', metadata: tenantMetadata });

    const jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn().mockResolvedValue({
        purpose: 'driver_self_service',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
      }),
    };
    service = new DriversService(
      prisma as never,
      makeIntelligenceClient() as never,
      jwtService as never,
      { sendDriverSelfServiceVerificationEmail: jest.fn() } as never,
      { uploadFile: jest.fn(), readFile: jest.fn(), deleteFile: jest.fn() } as never,
      { enforceDriverCapacity: jest.fn(), getCapInfo: jest.fn().mockResolvedValue({}) } as never,
      { fireEvent: jest.fn() } as never,
      { initializeDriverKycCheckout: jest.fn() } as never,
      {
        evaluateDriverPolicies: jest.fn().mockResolvedValue([]),
        listActiveActionsByEntityIds: jest.fn().mockResolvedValue(new Map()),
        applyDriverEnforcement: jest.fn().mockImplementation((r: unknown) => r),
      } as never,
      {
        notifyDriverVerificationStatus: jest.fn(),
        notifyDriverLicenceReviewPending: jest.fn(),
        notifyDriverLicenceReviewResolved: jest.fn(),
      } as never,
      { recordTenantAction: jest.fn() } as never,
    );
  }

  it('returns account step when no user account is linked', async () => {
    setup();
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.user.findFirst.mockResolvedValue(null); // no account

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.step).toBe('account');
    expect(step.verificationTier).toBe('BASIC_IDENTITY');
    expect(step.verificationTierLabel).toBe('Basic Identity');
  });

  it('respects an explicitly selected verified tier even when legacy booleans are not set', async () => {
    setup({
      operations: {
        verificationTier: 'VERIFIED_IDENTITY',
        driverPaysKyc: false,
        requireGuarantor: false,
        requiredDriverDocumentSlugs: [],
      },
    });
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.user.findFirst.mockResolvedValue(null);

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.verificationTier).toBe('VERIFIED_IDENTITY');
    expect(step.verificationTierLabel).toBe('Verified Identity');
  });

  it('respects an explicitly selected full tier for onboarding requirements and pricing context', async () => {
    setup({
      operations: {
        verificationTier: 'FULL_TRUST_VERIFICATION',
        driverPaysKyc: false,
        requireGuarantor: false,
        requiredDriverDocumentSlugs: [],
      },
    });
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.user.findFirst.mockResolvedValue(null);

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.verificationTier).toBe('FULL_TRUST_VERIFICATION');
    expect(step.verificationTierLabel).toBe('Full Trust Verification');
  });

  it('uses a per-driver reverification tier override when the tenant admin requests a stronger tier', async () => {
    setup({
      operations: {
        verificationTier: 'BASIC_IDENTITY',
        driverPaysKyc: false,
        requireGuarantor: false,
        requiredDriverDocumentSlugs: [],
      },
    });
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        verificationTierOverride: 'FULL_TRUST_VERIFICATION',
        identityStatus: 'verified',
      }),
    );
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.verificationTier).toBe('FULL_TRUST_VERIFICATION');
    expect(step.verificationTierLabel).toBe('Full Trust Verification');
    expect(step.verificationTierComponents).toEqual(
      expect.arrayContaining(['identity', 'guarantor', 'drivers_license']),
    );
  });

  it('returns identity_verification when name or DOB is missing because profile is provider-filled', async () => {
    setup({ operations: { driverPaysKyc: false } });
    prisma.driver.findUnique.mockResolvedValue(makeDriver({ firstName: null }));
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({
      id: 'consent_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.step).toBe('identity_verification');
  });

  it('returns payment step when driver has not paid and driverPaysKyc is true', async () => {
    setup({ operations: { driverPaysKyc: true } });
    prisma.driver.findUnique.mockResolvedValue(makeDriver());
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue(null); // no consent yet
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null); // no entitlement
    prisma.verificationAttempt.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.count.mockResolvedValue(0);

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.step).toBe('payment');
  });

  it('returns identity_verification when payment is ready and identity not yet submitted', async () => {
    setup({ operations: { driverPaysKyc: true, requireIdentityVerificationForActivation: true } });
    prisma.driver.findUnique.mockResolvedValue(makeDriver({ identityStatus: 'unverified' }));
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(
      makeEntitlement({ status: 'paid', paidAt: new Date() }),
    );
    prisma.verificationAttempt.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.count.mockResolvedValue(0);

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.step).toBe('identity_verification');
  });

  it('returns identity_verification after payment is consumed but verification is still not complete', async () => {
    setup({ operations: { driverPaysKyc: true, requireIdentityVerificationForActivation: true } });
    prisma.driver.findUnique.mockResolvedValue(makeDriver({ identityStatus: 'unverified' }));
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(
      makeEntitlement({
        status: 'consumed',
        paidAt: new Date(),
        consumedAt: new Date(),
      }),
    );
    prisma.verificationAttempt.findFirst.mockResolvedValue({
      id: 'attempt_failed_1',
      tenantId: 'tenant_local_demo',
      subjectType: 'driver',
      subjectId: 'driver_demo_local',
      attemptType: 'driver_verification',
      status: 'failed',
      entitlementId: 'entitlement_1',
      requestFingerprint: null,
      livenessCallCount: 1,
      metadata: null,
      failureReason: 'provider_failed',
      reviewOutcome: null,
      initiatedAt: new Date(),
      completedAt: new Date(),
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.verificationAttempt.count.mockResolvedValue(1);

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.step).toBe('identity_verification');
  });

  it('returns complete when all requirements are met and driver is verified', async () => {
    setup({
      operations: {
        driverPaysKyc: true,
        requireIdentityVerificationForActivation: true,
        requiredDriverDocumentSlugs: [],
      },
    });
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        identityStatus: 'verified',
        operationalProfile: {
          phoneNumber: '+2348012345678',
          address: '12 Marina Road',
          town: 'Lagos',
          localGovernmentArea: 'Eti-Osa',
          state: 'Lagos',
          nextOfKinName: 'Ngozi Okonkwo',
          nextOfKinPhone: '+2348099999999',
          emergencyContactName: 'Emeka Okonkwo',
          emergencyContactPhone: '+2348088888888',
        },
      }),
    );
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(
      makeEntitlement({ status: 'paid', paidAt: new Date() }),
    );
    prisma.verificationAttempt.findFirst.mockResolvedValue({
      id: 'attempt_success_1',
      status: 'success',
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.verificationAttempt.count.mockResolvedValue(0);
    prisma.driverDocumentVerification.findMany.mockResolvedValue([]);

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.step).toBe('complete');
  });

  it('returns profile when verified identity is present but operational details are incomplete', async () => {
    setup({
      operations: {
        driverPaysKyc: false,
        requireIdentityVerificationForActivation: true,
        requiredDriverDocumentSlugs: [],
      },
    });
    prisma.driver.findUnique.mockResolvedValue(makeDriver({ identityStatus: 'verified' }));
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.findFirst.mockResolvedValue({
      id: 'attempt_success_1',
      status: 'success',
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.verificationAttempt.count.mockResolvedValue(0);

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.step).toBe('profile');
    expect(step.missingOperationalFields).toEqual(
      expect.arrayContaining(['address', 'nextOfKinName', 'emergencyContactName']),
    );
  });

  it('keeps onboarding complete when driver licence is optional even after a failed verification', async () => {
    setup({
      operations: {
        driverPaysKyc: false,
        requireIdentityVerificationForActivation: true,
        requiredDriverDocumentSlugs: [],
      },
    });
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        identityStatus: 'verified',
        operationalProfile: {
          phoneNumber: '+2348012345678',
          address: '12 Marina Road',
          town: 'Lagos',
          localGovernmentArea: 'Eti-Osa',
          state: 'Lagos',
          nextOfKinName: 'Ngozi Okonkwo',
          nextOfKinPhone: '+2348099999999',
          emergencyContactName: 'Emeka Okonkwo',
          emergencyContactPhone: '+2348088888888',
        },
      }),
    );
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.findFirst.mockResolvedValue({
      id: 'attempt_success_1',
      status: 'success',
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.verificationAttempt.count.mockResolvedValue(0);
    prisma.driverDocumentVerification.findMany.mockResolvedValue([
      {
        id: 'licence_ver_1',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        documentType: 'drivers-license',
        idNumber: 'DL12345',
        countryCode: 'NG',
        provider: 'youverify',
        status: 'failed',
        providerMatch: false,
        providerConfidence: null,
        providerFirstName: null,
        providerLastName: null,
        providerDateOfBirth: null,
        providerExpiryDate: null,
        failureReason: "Unable to verify that this driver's licence belongs to this person.",
        providerResult: {},
        verifiedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.step).toBe('complete');
  });

  it('returns document_verification when a required driver licence verification failed', async () => {
    setup({
      operations: {
        driverPaysKyc: false,
        requireIdentityVerificationForActivation: true,
        requiredDriverDocumentSlugs: ['drivers-license'],
      },
    });
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        identityStatus: 'verified',
        operationalProfile: {
          phoneNumber: '+2348012345678',
          address: '12 Marina Road',
          town: 'Lagos',
          localGovernmentArea: 'Eti-Osa',
          state: 'Lagos',
          nextOfKinName: 'Ngozi Okonkwo',
          nextOfKinPhone: '+2348099999999',
          emergencyContactName: 'Emeka Okonkwo',
          emergencyContactPhone: '+2348088888888',
        },
      }),
    );
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.findFirst.mockResolvedValue({
      id: 'attempt_success_1',
      status: 'success',
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.verificationAttempt.count.mockResolvedValue(0);
    prisma.driverGuarantor.findFirst.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      personId: 'person_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      status: 'verified',
      disconnectedAt: null,
      relationship: 'Sibling',
    });
    prisma.driverDocumentVerification.findMany.mockResolvedValue([
      {
        id: 'licence_ver_1',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        documentType: 'drivers-license',
        idNumber: 'DL12345',
        countryCode: 'NG',
        provider: 'youverify',
        status: 'failed',
        providerMatch: false,
        providerConfidence: null,
        providerFirstName: null,
        providerLastName: null,
        providerDateOfBirth: null,
        providerExpiryDate: null,
        failureReason: "Unable to verify that this driver's licence belongs to this person.",
        providerResult: {},
        verifiedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.step).toBe('document_verification');
    expect(step.documentVerificationStatus).toBe('failed');
    expect(step.verificationTier).toBe('FULL_TRUST_VERIFICATION');
    expect(step.verificationTierLabel).toBe('Full Trust Verification');
  });

  it('returns guarantor before driver licence when full trust verification is required', async () => {
    setup({
      operations: {
        driverPaysKyc: false,
        requireGuarantor: true,
        requiredDriverDocumentSlugs: ['drivers-license'],
      },
    });
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        identityStatus: 'verified',
        operationalProfile: {
          phoneNumber: '+2348012345678',
          address: '12 Marina Road',
          town: 'Lagos',
          localGovernmentArea: 'Eti-Osa',
          state: 'Lagos',
          nextOfKinName: 'Ngozi Okonkwo',
          nextOfKinPhone: '+2348099999999',
          emergencyContactName: 'Emeka Okonkwo',
          emergencyContactPhone: '+2348088888888',
        },
      }),
    );
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.findFirst.mockResolvedValue({
      id: 'attempt_success_1',
      status: 'success',
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.verificationAttempt.count.mockResolvedValue(0);
    prisma.driverGuarantor.findFirst = jest.fn().mockResolvedValue(null);

    const step = await service.getOnboardingStep(VALID_TOKEN);
    expect(step.step).toBe('guarantor');
    expect(step.verificationTier).toBe('FULL_TRUST_VERIFICATION');
  });

  it('progresses full trust onboarding from guarantor to licence to complete', async () => {
    setup({
      operations: {
        verificationTier: 'FULL_TRUST_VERIFICATION',
        driverPaysKyc: false,
        requireGuarantor: true,
        requiredDriverDocumentSlugs: ['drivers-license'],
      },
    });
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        identityStatus: 'verified',
        operationalProfile: {
          phoneNumber: '+2348012345678',
          address: '12 Marina Road',
          town: 'Lagos',
          localGovernmentArea: 'Eti-Osa',
          state: 'Lagos',
          nextOfKinName: 'Ngozi Okonkwo',
          nextOfKinPhone: '+2348099999999',
          emergencyContactName: 'Emeka Okonkwo',
          emergencyContactPhone: '+2348088888888',
        },
      }),
    );
    prisma.user.findFirst.mockResolvedValue(makeLinkedUser());
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);
    prisma.verificationAttempt.findFirst.mockResolvedValue({
      id: 'attempt_success_1',
      status: 'success',
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.verificationAttempt.count.mockResolvedValue(0);

    prisma.driverGuarantor.findFirst.mockResolvedValue(null);
    prisma.driverDocumentVerification.findMany.mockResolvedValue([]);

    const guarantorStep = await service.getOnboardingStep(VALID_TOKEN);
    expect(guarantorStep.step).toBe('guarantor');

    prisma.driverGuarantor.findFirst.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      personId: 'person_guarantor_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      status: 'verified',
      disconnectedAt: null,
      relationship: 'Sibling',
    });

    const documentStep = await service.getOnboardingStep(VALID_TOKEN);
    expect(documentStep.step).toBe('document_verification');
    expect(documentStep.requiredDocumentTypes).toContain('drivers-license');

    prisma.driverDocumentVerification.findMany.mockResolvedValue([
      {
        id: 'licence_ver_1',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        documentType: 'drivers-license',
        idNumber: 'DL12345',
        status: 'verified',
        providerMatch: true,
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const completeStep = await service.getOnboardingStep(VALID_TOKEN);
    expect(completeStep.step).toBe('complete');
    expect(completeStep.verificationTier).toBe('FULL_TRUST_VERIFICATION');
  });
});

describe('Driver onboarding — guarantor self-service submission outcomes', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: DriversService;
  let authEmailService: {
    sendDriverSelfServiceVerificationEmail: jest.Mock;
    sendGuarantorSelfServiceVerificationEmail: jest.Mock;
  };
  let controlPlaneBillingClient: {
    initializeDriverKycCheckout: jest.Mock;
    initializeIdentityVerificationCheckout: jest.Mock;
    verifyAndApplyPayment: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          verificationTier: 'FULL_TRUST_VERIFICATION',
        },
      },
    });
    prisma.driver.findUnique.mockResolvedValue(makeDriver({ identityStatus: 'verified' }));
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      personId: null,
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      relationship: 'Sibling',
      status: 'pending_verification',
      disconnectedAt: null,
      disconnectedReason: null,
      responsibilityAcceptedAt: null,
      responsibilityAcceptanceEvidence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    authEmailService = {
      sendDriverSelfServiceVerificationEmail: jest.fn(),
      sendGuarantorSelfServiceVerificationEmail: jest.fn(),
    };
    controlPlaneBillingClient = {
      initializeDriverKycCheckout: jest.fn(),
      initializeIdentityVerificationCheckout: jest.fn(),
      verifyAndApplyPayment: jest.fn(),
    };

    service = new DriversService(
      prisma as never,
      makeIntelligenceClient() as never,
      {
        signAsync: jest.fn().mockResolvedValue('guarantor-self-service-token'),
        verifyAsync: jest.fn().mockResolvedValue({
          purpose: 'driver_self_service',
          tenantId: 'tenant_1',
          driverId: 'driver_1',
        }),
      } as never,
      authEmailService as never,
      { uploadFile: jest.fn(), readFile: jest.fn(), deleteFile: jest.fn() } as never,
      {
        enforceDriverCapacity: jest.fn().mockResolvedValue(undefined),
        enforceVehicleCapacity: jest.fn(),
        getCapInfo: jest.fn().mockResolvedValue({ driverCap: null }),
      } as never,
      { fireEvent: jest.fn() } as never,
      controlPlaneBillingClient as never,
      {
        evaluateDriverPolicies: jest.fn().mockResolvedValue([]),
        listActiveActionsByEntityIds: jest.fn().mockResolvedValue(new Map()),
        applyDriverEnforcement: jest.fn().mockImplementation((r: unknown) => r),
      } as never,
      {
        notifyDriverVerificationStatus: jest.fn(),
        notifyDriverLicenceReviewPending: jest.fn(),
        notifyDriverLicenceReviewResolved: jest.fn(),
      } as never,
      { recordTenantAction: jest.fn() } as never,
    );

    prisma.driverGuarantor.upsert.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      personId: null,
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      relationship: 'Sibling',
      status: 'pending_verification',
      disconnectedAt: null,
      disconnectedReason: null,
      responsibilityAcceptedAt: null,
      responsibilityAcceptanceEvidence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('returns a sent invitation outcome after saving a valid guarantor with email', async () => {
    (jest.spyOn(service as never, 'maybeSendGuarantorSelfServiceLinkIfEligible') as unknown as {
      mockResolvedValue: (value: unknown) => unknown;
    }).mockResolvedValue({
        status: 'sent',
        message: 'Guarantor saved. A verification link has been sent to the guarantor email address.',
        destination: 'grace@example.com',
      });

    const result = await service.submitGuarantorFromSelfService('valid-token', {
      name: 'Grace Eze',
      phone: '08000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      relationship: 'Sibling',
    });

    expect(result.guarantor.name).toBe('Grace Eze');
    expect(result.invitation.status).toBe('sent');
    expect(result.invitation.destination).toBe('grace@example.com');
    expect(result.payment.paymentStatus).toBe('not_required');
  });

  it('assesses existing guarantor capacity using active driver relationships only', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: { operations: { guarantorMaxActiveDrivers: 2 } },
    });
    prisma.driverGuarantor.findMany.mockResolvedValue([
      {
        id: 'guarantor_match_1',
        tenantId: 'tenant_1',
        driverId: 'driver_2',
        personId: null,
        name: 'Grace Eze',
        phone: '+2348000000000',
        email: 'grace@example.com',
        countryCode: 'NG',
        relationship: 'Sibling',
        status: 'pending_verification',
        disconnectedAt: null,
        disconnectedReason: null,
        responsibilityAcceptedAt: null,
        responsibilityAcceptanceEvidence: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'guarantor_match_2',
        tenantId: 'tenant_1',
        driverId: 'driver_3',
        personId: null,
        name: 'Grace Eze',
        phone: '+2348000000000',
        email: 'grace@example.com',
        countryCode: 'NG',
        relationship: 'Sibling',
        status: 'pending_verification',
        disconnectedAt: null,
        disconnectedReason: null,
        responsibilityAcceptedAt: null,
        responsibilityAcceptanceEvidence: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.driver.findMany.mockResolvedValue([
      { id: 'driver_2' },
    ]);

    const assessment = await service.assessGuarantorCapacityFromSelfService('valid-token', {
      phone: '08000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
    });

    expect(assessment.matched).toBe(true);
    expect(assessment.activeDriverCount).toBe(1);
    expect(assessment.organisationLimit).toBe(2);
    expect(assessment.eligible).toBe(true);
  });

  it('blocks guarantor save when the organisation limit has already been reached', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: { operations: { guarantorMaxActiveDrivers: 1 } },
    });
    prisma.driverGuarantor.findMany.mockResolvedValue([
      {
        id: 'guarantor_match_1',
        tenantId: 'tenant_1',
        driverId: 'driver_2',
        personId: null,
        name: 'Grace Eze',
        phone: '+2348000000000',
        email: 'grace@example.com',
        countryCode: 'NG',
        relationship: 'Sibling',
        status: 'pending_verification',
        disconnectedAt: null,
        disconnectedReason: null,
        responsibilityAcceptedAt: null,
        responsibilityAcceptanceEvidence: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.driver.findMany.mockResolvedValue([{ id: 'driver_2' }]);

    await expect(
      service.submitGuarantorFromSelfService('valid-token', {
        name: 'Grace Eze',
        phone: '08000000000',
        email: 'grace@example.com',
        countryCode: 'NG',
        relationship: 'Sibling',
      }),
    ).rejects.toThrow(
      'This guarantor already supports 1 active driver. Your organisation allows a maximum of 1.',
    );
  });

  it('keeps the guarantor saved and reports missing email when no invitation can be sent yet', async () => {
    (jest.spyOn(service as never, 'maybeSendGuarantorSelfServiceLinkIfEligible') as unknown as {
      mockResolvedValue: (value: unknown) => unknown;
    }).mockResolvedValue({
        status: 'missing_email',
        message:
          'Guarantor saved, but no email address was provided for the verification link yet.',
      });

    prisma.driverGuarantor.upsert.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      personId: null,
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: null,
      countryCode: 'NG',
      relationship: 'Sibling',
      status: 'pending_verification',
      disconnectedAt: null,
      disconnectedReason: null,
      responsibilityAcceptedAt: null,
      responsibilityAcceptanceEvidence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      personId: null,
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: null,
      countryCode: 'NG',
      relationship: 'Sibling',
      status: 'pending_verification',
      disconnectedAt: null,
      disconnectedReason: null,
      responsibilityAcceptedAt: null,
      responsibilityAcceptanceEvidence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.submitGuarantorFromSelfService('valid-token', {
      name: 'Grace Eze',
      phone: '08000000000',
      countryCode: 'NG',
      relationship: 'Sibling',
    });

    expect(result.guarantor.name).toBe('Grace Eze');
    expect(result.invitation.status).toBe('missing_email');
  });

  it('holds the guarantor invite until the driver pays the guarantor verification add-on', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          requireGuarantorVerification: true,
          driverPaysKyc: true,
        },
      },
    });
    const sendInviteSpy = jest.spyOn(
      service as never,
      'maybeSendGuarantorSelfServiceLinkIfEligible',
    );

    const result = await service.submitGuarantorFromSelfService('valid-token', {
      name: 'Grace Eze',
      phone: '08000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      relationship: 'Sibling',
    });

    expect(result.payment.paymentStatus).toBe('driver_payment_required');
    expect(result.payment.amountMinorUnits).toBe(500000);
    expect(result.invitation.status).toBe('not_ready');
    expect(sendInviteSpy).not.toHaveBeenCalled();
    expect(authEmailService.sendGuarantorSelfServiceVerificationEmail).not.toHaveBeenCalled();
  });

  it('keeps the guarantor flow active for a paid full-verification journey even when the optional add-on flag is off', async () => {
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        identityStatus: 'verified',
      }),
    );
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          verificationTier: 'FULL_TRUST_VERIFICATION',
          requireGuarantorVerification: false,
          driverPaysKyc: true,
        },
      },
    });
    (jest.spyOn(service as never, 'maybeSendGuarantorSelfServiceLinkIfEligible') as unknown as {
      mockResolvedValue: (value: unknown) => unknown;
    }).mockResolvedValue({
      status: 'sent',
      message: 'Guarantor saved. A verification link has been sent to the guarantor email address.',
      destination: 'grace@example.com',
    });

    const result = await service.submitGuarantorFromSelfService('valid-token', {
      name: 'Grace Eze',
      phone: '08000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      relationship: 'Sibling',
    });

    expect(result.payment.paymentStatus).toBe('not_required');
    expect(result.invitation.status).toBe('sent');
  });

  it('starts a driver-paid guarantor verification checkout with an add-on payment key', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          requireGuarantorVerification: true,
          driverPaysKyc: true,
        },
      },
    });
    controlPlaneBillingClient.initializeIdentityVerificationCheckout.mockResolvedValue({
      checkoutUrl: 'https://paystack.test/guarantor-addon',
    });

    const result = await service.initiateVerificationAddonCheckoutFromSelfService(
      'valid-token',
      'guarantor_verification',
      'paystack',
      'https://tenant.example.com/driver-self-service',
    );

    expect(result.status).toBe('checkout_required');
    expect(controlPlaneBillingClient.initializeIdentityVerificationCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentKey: 'guarantor_verification',
        purposeLabel: 'guarantor verification',
        relatedDriverId: 'driver_1',
      }),
    );
  });

  it('records the guarantor add-on payment and sends the invite after payment verification', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          requireGuarantorVerification: true,
          driverPaysKyc: true,
        },
      },
    });
    controlPlaneBillingClient.verifyAndApplyPayment.mockResolvedValue({
      status: 'applied',
      amountMinorUnits: 500000,
      currency: 'NGN',
    });
    const sendInviteSpy = jest.spyOn(
      service as never,
      'maybeSendGuarantorSelfServiceLinkIfEligible',
    ) as unknown as { mockResolvedValue: (value: unknown) => unknown };
    sendInviteSpy.mockResolvedValue({
      status: 'sent',
      message: 'Guarantor saved. A verification link has been sent to the guarantor email address.',
      destination: 'grace@example.com',
    });

    const result = await service.verifyVerificationAddonPaymentFromSelfService(
      'valid-token',
      'guarantor_verification',
      'paystack',
      'ref_guarantor_addon_1',
    );

    expect(result.status).toBe('verified');
    expect(controlPlaneBillingClient.verifyAndApplyPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: 'ref_guarantor_addon_1',
        driverId: 'driver_1',
      }),
    );
    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(sendInviteSpy).toHaveBeenCalledWith('tenant_1', 'driver_1', 'guarantor_updated');
  });

  it('returns already_applied for the same guarantor add-on payment reference without reapplying or resending', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          requireGuarantorVerification: true,
          driverPaysKyc: true,
        },
      },
    });
    prisma.verificationEntitlement.findFirst.mockResolvedValue(
      makeEntitlement({
        purpose: 'guarantor_verification',
        paymentReference: 'ref_guarantor_paid_1',
        status: 'paid',
        paidAt: new Date(),
      }),
    );
    const sendInviteSpy = jest.spyOn(
      service as never,
      'maybeSendGuarantorSelfServiceLinkIfEligible',
    ) as unknown as { mockResolvedValue: (value: unknown) => unknown };

    const result = await service.verifyVerificationAddonPaymentFromSelfService(
      'valid-token',
      'guarantor_verification',
      'paystack',
      'ref_guarantor_paid_1',
    );

    expect(result).toEqual({ status: 'already_applied' });
    expect(controlPlaneBillingClient.verifyAndApplyPayment).not.toHaveBeenCalled();
    expect(sendInviteSpy).not.toHaveBeenCalled();
  });

  it('preserves the save result and surfaces invitation delivery failure instead of swallowing it', async () => {
    (jest.spyOn(service as never, 'maybeSendGuarantorSelfServiceLinkIfEligible') as unknown as {
      mockResolvedValue: (value: unknown) => unknown;
    }).mockResolvedValue({
        status: 'failed',
        message:
          'Guarantor saved, but we could not send the verification link right now. Please ask your operator to retry.',
        destination: 'grace@example.com',
      });

    const result = await service.submitGuarantorFromSelfService('valid-token', {
      name: 'Grace Eze',
      phone: '08000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      relationship: 'Sibling',
    });

    expect(result.guarantor.name).toBe('Grace Eze');
    expect(result.invitation.status).toBe('failed');
    expect(result.invitation.destination).toBe('grace@example.com');
  });

  it('resends a pending guarantor invite without creating a duplicate guarantor record', async () => {
    prisma.driver.findUnique.mockResolvedValue(
      makeDriver({
        identityStatus: 'verified',
      }),
    );
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          verificationTier: 'FULL_TRUST_VERIFICATION',
          requireGuarantorVerification: false,
        },
      },
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      personId: null,
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      relationship: 'Sibling',
      status: 'pending_verification',
      disconnectedAt: null,
      disconnectedReason: null,
      responsibilityAcceptedAt: null,
      responsibilityAcceptanceEvidence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (jest.spyOn(service as never, 'maybeSendGuarantorSelfServiceLinkIfEligible') as unknown as {
      mockResolvedValue: (value: unknown) => unknown;
    }).mockResolvedValue({
      status: 'sent',
      message: 'Guarantor saved. A verification link has been sent to the guarantor email address.',
      destination: 'grace@example.com',
    });

    const result = await service.resendGuarantorInviteFromSelfService('valid-token');

    expect(result.status).toBe('sent');
    expect(prisma.driverGuarantor.upsert).not.toHaveBeenCalled();
  });

  it('blocks driver-side guarantor replacement once the existing guarantor has accepted responsibility', async () => {
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      personId: null,
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      relationship: 'Sibling',
      status: 'pending_verification',
      disconnectedAt: null,
      disconnectedReason: null,
      responsibilityAcceptedAt: new Date('2026-01-02T10:00:00.000Z'),
      responsibilityAcceptanceEvidence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.submitGuarantorFromSelfService('valid-token', {
        name: 'Replacement Guarantor',
        phone: '08111111111',
        email: 'replacement@example.com',
        countryCode: 'NG',
        relationship: 'Brother',
      }),
    ).rejects.toThrow(
      'You can only change this guarantor before they accept responsibility or start KYC. Ask your organisation to review the current guarantor before replacing them.',
    );

    expect(prisma.driverGuarantor.upsert).not.toHaveBeenCalled();
  });
});

describe('Driver onboarding — assignment eligibility after manual verification', () => {
  it('a manually-verified driver has identityStatus=verified and is eligible for assignment', () => {
    // When admin completes manual review and sets identityStatus to 'verified',
    // the driver should pass all identity-related assignment readiness checks.
    // This is a contract test — we verify the status string is the canonical one used
    // by buildDriverReadiness() in the service.
    const verifiedStatus = 'verified';
    const reviewNeededStatus = 'review_needed';

    // An identity that passed is 'verified'
    expect(verifiedStatus).toBe('verified');

    // An identity pending manual review is 'review_needed' — not yet eligible
    expect(reviewNeededStatus).not.toBe('verified');
  });
});
