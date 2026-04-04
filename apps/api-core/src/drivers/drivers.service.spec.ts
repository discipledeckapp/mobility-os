import {
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DriversService } from './drivers.service';

describe('DriversService', () => {
  const prisma = {
    driver: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    driverDocument: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    driverDocumentVerification: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    driverGuarantor: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
    },
    assignment: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    remittance: {
      count: jest.fn(),
    },
    verificationEntitlement: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userNotification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    userConsent: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    selfServiceOtp: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    fleet: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    vehicle: {
      findMany: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  };

  const intelligenceClient = {
    initializeLivenessSession: jest.fn(),
    resolveEnrollment: jest.fn(),
    queryPersonRisk: jest.fn(),
    queryPersonRolePresence: jest.fn(),
    resolveDriverLicenceEvidenceReview: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };
  const authEmailService = {
    sendDriverSelfServiceVerificationEmail: jest.fn(),
    sendGuarantorSelfServiceVerificationEmail: jest.fn(),
  };
  const documentStorageService = {
    uploadFile: jest.fn(),
    readFile: jest.fn(),
    readFileByUrl: jest.fn(),
    deleteFile: jest.fn(),
  };
  const subscriptionEntitlementsService = {
    enforceDriverCapacity: jest.fn(),
    enforceVehicleCapacity: jest.fn(),
    getCapInfo: jest.fn(),
  };
  const policyService = {
    evaluateDriverPolicies: jest.fn(),
    listActiveActionsByEntityIds: jest.fn(),
    applyDriverEnforcement: jest.fn((readiness: unknown) => readiness),
  };
  const controlPlaneBillingClient = {
    initializeDriverKycCheckout: jest.fn(),
    initializeIdentityVerificationCheckout: jest.fn(),
    verifyAndApplyPayment: jest.fn(),
  };
  const notificationsService = {
    notifyDriverVerificationStatus: jest.fn(),
    notifyDriverLicenceReviewPending: jest.fn(),
    notifyDriverLicenceReviewResolved: jest.fn(),
    notifyGuarantorStatus: jest.fn(),
  };

  let service: DriversService;

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.driverGuarantor.findMany.mockResolvedValue([]);
    prisma.driverGuarantor.findFirst.mockResolvedValue(null);
    prisma.driverGuarantor.count.mockResolvedValue(0);
    prisma.driverDocument.findMany.mockResolvedValue([]);
    prisma.driverDocument.updateMany.mockResolvedValue({ count: 0 });
    prisma.driverDocument.findFirst.mockResolvedValue(null);
    prisma.driver.findMany.mockResolvedValue([]);
    prisma.driver.findFirst.mockResolvedValue(null);
    prisma.driver.count.mockResolvedValue(0);
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.updateMany.mockResolvedValue({ count: 0 });
    prisma.assignment.findMany.mockResolvedValue([]);
    prisma.assignment.count.mockResolvedValue(0);
    prisma.remittance.count.mockResolvedValue(0);
    prisma.verificationEntitlement.findFirst.mockResolvedValue(null);
    prisma.userNotification.findMany.mockResolvedValue([]);
    prisma.userNotification.findFirst.mockResolvedValue(null);
    prisma.selfServiceOtp.findFirst.mockResolvedValue(null);
    prisma.$queryRaw.mockResolvedValue([]);
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          requiredDriverDocumentSlugs: ['drivers-license'],
          requireGuarantor: true,
          requireGuarantorVerification: true,
        },
      },
    });
    prisma.$transaction.mockImplementation(
      async (input: unknown[] | ((tx: typeof prisma) => Promise<unknown> | unknown)) => {
        if (typeof input === 'function') {
          return input(prisma as never);
        }
        return Promise.all(input);
      },
    );
    documentStorageService.uploadFile.mockResolvedValue({
      storageKey: 'doc-key',
      storageUrl: 'https://storage.example.com/driver-documents/doc-key',
    });
    documentStorageService.readFileByUrl.mockResolvedValue(Buffer.from('image'));
    prisma.driverDocumentVerification.findMany.mockResolvedValue([]);
    intelligenceClient.queryPersonRisk.mockResolvedValue({
      riskBand: 'low',
      isWatchlisted: false,
    });
    intelligenceClient.queryPersonRolePresence.mockResolvedValue({
      isDriver: false,
    });
    subscriptionEntitlementsService.getCapInfo.mockResolvedValue({ driverCap: null });
    subscriptionEntitlementsService.enforceDriverCapacity.mockResolvedValue(undefined);
    policyService.evaluateDriverPolicies.mockResolvedValue([]);
    policyService.listActiveActionsByEntityIds.mockResolvedValue(new Map());
    policyService.applyDriverEnforcement.mockImplementation((readiness: unknown) => readiness);
    const auditService = { recordTenantAction: jest.fn() };
    service = new DriversService(
      prisma as never,
      intelligenceClient as never,
      jwtService as never,
      authEmailService as never,
      documentStorageService as never,
      subscriptionEntitlementsService as never,
      { fireEvent: jest.fn() } as never,
      controlPlaneBillingClient as never,
      policyService as never,
      notificationsService as never,
      auditService as never,
    );
  });

  it('creates or updates a guarantor for the driver', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      identityStatus: 'unverified',
      nationality: 'NG',
    });
    prisma.driverGuarantor.upsert.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Chinwe Okafor',
      phone: '+2348012345678',
      relationship: 'Sister',
    });

    const result = await service.createOrUpdateGuarantor('tenant_1', 'driver_1', {
      name: ' Chinwe Okafor ',
      phone: '08012345678',
      countryCode: 'NG',
      relationship: ' Sister ',
    });

    expect(prisma.driverGuarantor.upsert).toHaveBeenCalledWith({
      where: { driverId: 'driver_1' },
      create: expect.objectContaining({
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        name: 'Chinwe Okafor',
        phone: '+2348012345678',
        countryCode: 'NG',
        relationship: 'Sister',
      }),
      update: expect.objectContaining({
        name: 'Chinwe Okafor',
        phone: '+2348012345678',
        countryCode: 'NG',
        relationship: 'Sister',
      }),
    });
    expect(result.driverId).toBe('driver_1');
  });

  it('keeps activation and assignment non-ready when full-trust guarantor verification is still pending', () => {
    const readiness = (service as unknown as {
      computeReadiness: (
        driver: Record<string, unknown>,
        settings: Record<string, unknown>,
      ) => {
        activationReadiness: string;
        assignmentReadiness: string;
        activationReadinessReasons: string[];
        assignmentReadinessReasons: string[];
        verificationComponents: Array<{ key: string; required: boolean; status: string }>;
      };
    }).computeReadiness(
      {
        status: 'active',
        identityStatus: 'verified',
        guarantorStatus: 'pending_verification',
        guarantorPersonId: null,
        hasApprovedLicence: true,
        hasMobileAccess: true,
        approvedDocumentTypes: ['drivers-license'],
        adminAssignmentOverride: false,
      },
      {
        requireIdentityVerificationForActivation: true,
        requiredDriverDocumentSlugs: ['drivers-license'],
        requireGuarantor: true,
        guarantorBlocking: true,
        requireGuarantorVerification: true,
        allowAdminAssignmentOverride: true,
        verificationTier: 'FULL_TRUST_VERIFICATION',
      },
    );

    expect(readiness.activationReadiness).not.toBe('ready');
    expect(readiness.assignmentReadiness).not.toBe('ready');
    expect(readiness.activationReadinessReasons).toContain('A verified guarantor is required.');
    expect(readiness.assignmentReadinessReasons).toContain('A verified guarantor is required.');
    expect(readiness.verificationComponents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'guarantor',
          required: true,
          status: 'pending',
        }),
      ]),
    );
  });

  it('blocks admin assignment override when active fraud flags are present', () => {
    const readiness = (service as unknown as {
      computeReadiness: (
        driver: Record<string, unknown>,
        settings: Record<string, unknown>,
      ) => {
        assignmentReadiness: string;
        assignmentReadinessReasons: string[];
      };
    }).computeReadiness(
      {
        status: 'active',
        identityStatus: 'verified',
        guarantorStatus: 'verified',
        guarantorPersonId: 'person_1',
        hasApprovedLicence: true,
        hasMobileAccess: true,
        approvedDocumentTypes: ['drivers-license'],
        adminAssignmentOverride: true,
        isWatchlisted: true,
        duplicateIdentityFlag: false,
        riskBand: 'critical',
      },
      {
        requireIdentityVerificationForActivation: true,
        requiredDriverDocumentSlugs: ['drivers-license'],
        requireGuarantor: true,
        guarantorBlocking: true,
        requireGuarantorVerification: true,
        allowAdminAssignmentOverride: true,
        verificationTier: 'FULL_TRUST_VERIFICATION',
      },
    );

    expect(readiness.assignmentReadiness).not.toBe('ready');
    expect(readiness.assignmentReadinessReasons).toContain(
      'Admin override is blocked because active fraud flags are present on this driver.',
    );
  });

  it('falls back to the stored portrait document when a live selfie exists only on the portrait record', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      archivedAt: null,
      identityStatus: 'pending_verification',
      identityProfile: null,
      identityProviderRawData: null,
      selfieImageUrl: null,
      providerImageUrl: null,
      identitySignatureImageUrl: null,
    });
    prisma.driverDocument.findFirst.mockResolvedValue({
      id: 'doc_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      documentType: 'portrait',
      fileName: 'portrait.jpg',
      contentType: 'image/jpeg',
      storageKey: 'portrait-doc-key',
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    documentStorageService.readFile.mockResolvedValue(Buffer.from('portrait-image'));

    const result = await service.getIdentityImage('tenant_1', 'driver_1', 'selfie');

    expect(documentStorageService.readFile).toHaveBeenCalledWith('portrait-doc-key');
    expect(result.contentType).toBe('image/jpeg');
    expect(result.buffer).toEqual(Buffer.from('portrait-image'));
  });

  it('reads the NIN portrait from legacy provider photo fields when providerImageUrl is not populated', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      archivedAt: null,
      identityStatus: 'verified',
      identityProfile: null,
      identityProviderRawData: {
        photoUrl: 'data:image/png;base64,aGVsbG8=',
      },
      selfieImageUrl: null,
      providerImageUrl: null,
      identitySignatureImageUrl: null,
    });

    const result = await service.getIdentityImage('tenant_1', 'driver_1', 'provider');

    expect(result.contentType).toBe('image/png');
    expect(result.buffer).toEqual(Buffer.from('hello'));
  });

  it('requires full international format when guarantor phone country is omitted', async () => {
    prisma.driver.findUnique.mockResolvedValueOnce({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
    });

    await expect(
      service.createOrUpdateGuarantor('tenant_1', 'driver_1', {
        name: 'Chinwe Okafor',
        phone: '08012345678',
      }),
    ).rejects.toThrow(
      'Phone numbers without an explicit country must be entered in full international format',
    );
  });

  it('blocks guarantor save when the phone is already bound to another verified identity', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      identityStatus: 'unverified',
      nationality: 'NG',
      personId: null,
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue(null);
    prisma.driver.findFirst.mockResolvedValue({
      personId: 'person_existing_1',
    });

    await expect(
      service.createOrUpdateGuarantor('tenant_1', 'driver_1', {
        name: 'Chinwe Okafor',
        phone: '08012345678',
        countryCode: 'NG',
      }),
    ).rejects.toThrow(
      'This phone number is already bound to another verified NIN-backed identity in this organisation. Use a different phone number.',
    );
  });

  it('allows replacing a guarantor before responsibility is accepted or KYC starts', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      identityStatus: 'verified',
      nationality: 'NG',
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      personId: null,
      name: 'Old Guarantor',
      phone: '+2348000000000',
      email: 'old@example.com',
      status: 'pending_verification',
      responsibilityAcceptedAt: null,
      selfieImageUrl: null,
      providerImageUrl: null,
      dateOfBirth: null,
      gender: null,
      disconnectedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.driverGuarantor.upsert.mockResolvedValue({
      id: 'guarantor_2',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'New Guarantor',
      phone: '+2348111111111',
      email: 'new@example.com',
      countryCode: 'NG',
      relationship: 'Brother',
      status: 'pending_verification',
    });

    const result = await service.createOrUpdateGuarantor('tenant_1', 'driver_1', {
      name: 'New Guarantor',
      phone: '08111111111',
      email: 'new@example.com',
      countryCode: 'NG',
      relationship: 'Brother',
    });

    expect(prisma.driverGuarantor.upsert).toHaveBeenCalled();
    expect(result.name).toBe('New Guarantor');
  });

  it('blocks replacing a guarantor after they accept responsibility', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      identityStatus: 'verified',
      nationality: 'NG',
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      personId: null,
      name: 'Accepted Guarantor',
      phone: '+2348000000000',
      email: 'accepted@example.com',
      status: 'pending_verification',
      responsibilityAcceptedAt: new Date('2026-01-02T10:00:00.000Z'),
      selfieImageUrl: null,
      providerImageUrl: null,
      dateOfBirth: null,
      gender: null,
      disconnectedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.createOrUpdateGuarantor('tenant_1', 'driver_1', {
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

  it('blocks activation when the driver is not identity-verified', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      status: 'inactive',
      identityStatus: 'pending_verification',
    });

    await expect(service.updateStatus('tenant_1', 'driver_1', 'active')).rejects.toThrow(
      'Identity verification must be completed.',
    );
  });

  it('blocks activation when the driver has no guarantor', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          requiredDriverDocumentSlugs: ['drivers-license'],
          requireGuarantor: true,
          guarantorBlocking: true,
          requireGuarantorVerification: true,
        },
      },
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      status: 'inactive',
      identityStatus: 'verified',
    });
    prisma.driverGuarantor.findMany.mockResolvedValue([]);
    prisma.driverDocument.findMany.mockResolvedValue([
      {
        id: 'document_1',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        documentType: 'drivers-license',
        status: 'approved',
      },
    ]);

    await expect(service.updateStatus('tenant_1', 'driver_1', 'active')).rejects.toThrow(
      'A verified guarantor is required.',
    );
  });

  it('blocks activation when the driver has no approved licence', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      status: 'inactive',
      identityStatus: 'verified',
    });
    prisma.driverGuarantor.findMany.mockResolvedValue([
      {
        id: 'guarantor_1',
        driverId: 'driver_1',
        tenantId: 'tenant_1',
        status: 'active',
        personId: 'person_guarantor',
      },
    ]);
    prisma.driverDocument.findFirst.mockResolvedValue(null);
    prisma.user.findMany.mockResolvedValue([
      { driverId: 'driver_1', isActive: true, mobileAccessRevoked: false },
    ]);

    await expect(service.updateStatus('tenant_1', 'driver_1', 'active')).rejects.toThrow();
  });

  it('allows activation when the driver is verified and has a guarantor', async () => {
    prisma.tenant.findUnique.mockResolvedValueOnce({
      country: 'NG',
      metadata: { operations: { requiredDriverDocumentSlugs: ['drivers-license'] } },
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      status: 'inactive',
      identityStatus: 'verified',
    });
    prisma.driverGuarantor.findMany.mockResolvedValue([
      {
        id: 'guarantor_1',
        driverId: 'driver_1',
        tenantId: 'tenant_1',
        status: 'active',
        personId: 'person_guarantor',
      },
    ]);
    prisma.driverDocument.findFirst.mockResolvedValue({
      id: 'doc_1',
      driverId: 'driver_1',
      status: 'approved',
      documentType: 'drivers-license',
    });
    prisma.driverDocument.findMany.mockResolvedValue([
      {
        driverId: 'driver_1',
        documentType: 'drivers-license',
        status: 'approved',
      },
    ]);
    prisma.user.findMany.mockResolvedValue([
      { driverId: 'driver_1', isActive: true, mobileAccessRevoked: false },
    ]);
    prisma.driver.update.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      status: 'active',
      identityStatus: 'verified',
    });

    const result = await service.updateStatus('tenant_1', 'driver_1', 'active');

    expect(prisma.driver.update).toHaveBeenCalledWith({
      where: { id: 'driver_1' },
      data: { status: 'active' },
    });
    expect(result.status).toBe('active');
  });

  it('allows activation without a driver licence when the tenant does not require one', async () => {
    prisma.tenant.findUnique.mockResolvedValueOnce({
      country: 'NG',
      metadata: {
        operations: {
          requiredDriverDocumentSlugs: [],
          requireGuarantor: false,
          requireGuarantorVerification: false,
        },
      },
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      status: 'inactive',
      identityStatus: 'verified',
    });
    prisma.driverDocument.findFirst.mockResolvedValue(null);
    prisma.driverDocument.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([
      { driverId: 'driver_1', isActive: true, mobileAccessRevoked: false },
    ]);
    prisma.driver.update.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      status: 'active',
      identityStatus: 'verified',
    });

    const result = await service.updateStatus('tenant_1', 'driver_1', 'active');

    expect(prisma.driver.update).toHaveBeenCalledWith({
      where: { id: 'driver_1' },
      data: { status: 'active' },
    });
    expect(result.status).toBe('active');
  });

  it('returns the guarantor step when guarantor onboarding is still outstanding', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          requiredDriverDocumentSlugs: ['drivers-license'],
          driverPaysKyc: false,
          requireGuarantor: true,
          requireGuarantorVerification: true,
        },
      },
    });
    jest.spyOn(service as never, 'getSelfServiceVerificationPolicy' as never).mockResolvedValue({
      enabledDriverIdentifierTypes: ['NATIONAL_ID'],
      requiredDriverIdentifierTypes: ['NATIONAL_ID'],
      requiredDriverDocumentSlugs: ['drivers-license'],
      driverPaysKyc: false,
      kycPaymentVerified: true,
      verificationPaymentState: 'not_required',
      verificationEntitlementState: 'none',
      verificationState: 'success',
      verificationEntitlementCode: null,
      verificationPaymentReference: null,
      verificationConsumedAt: null,
      verificationAttemptCount: 1,
      verificationBlockedReason: null,
      verificationPayer: 'organisation',
      verificationAmountMinorUnits: 0,
      verificationCurrency: 'NGN',
      verificationPaymentStatus: 'ready',
      verificationPaymentMessage: null,
    } as never);
    jwtService.verifyAsync.mockResolvedValue({
      purpose: 'driver_self_service',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      status: 'inactive',
      identityStatus: 'verified',
      nationality: 'NG',
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
    });
    prisma.user.findFirst
      .mockResolvedValueOnce({ id: 'user_1' })
      .mockResolvedValueOnce({ id: 'user_1', tenantId: 'tenant_1', driverId: 'driver_1' });
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.driverDocumentVerification.findMany.mockResolvedValue([
      { documentType: 'drivers-license', status: 'verified' },
    ]);
    prisma.driverGuarantor.findFirst.mockResolvedValue(null);

    const result = await service.getOnboardingStep('driver-self-service-token');

    expect(result.step).toBe('guarantor');
    expect(result.requiresGuarantor).toBe(true);
    expect(result.guarantorVerified).toBe(false);
  });

  it('allows onboarding to continue while guarantor verification is pending', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          requiredDriverDocumentSlugs: ['drivers-license'],
          driverPaysKyc: false,
          requireGuarantor: true,
          requireGuarantorVerification: true,
        },
      },
    });
    jest.spyOn(service as never, 'getSelfServiceVerificationPolicy' as never).mockResolvedValue({
      enabledDriverIdentifierTypes: ['NATIONAL_ID'],
      requiredDriverIdentifierTypes: ['NATIONAL_ID'],
      requiredDriverDocumentSlugs: ['drivers-license'],
      driverPaysKyc: false,
      kycPaymentVerified: true,
      verificationPaymentState: 'not_required',
      verificationEntitlementState: 'none',
      verificationState: 'success',
      verificationEntitlementCode: null,
      verificationPaymentReference: null,
      verificationConsumedAt: null,
      verificationAttemptCount: 1,
      verificationBlockedReason: null,
      verificationPayer: 'organisation',
      verificationAmountMinorUnits: 0,
      verificationCurrency: 'NGN',
      verificationPaymentStatus: 'ready',
      verificationPaymentMessage: null,
    } as never);
    jwtService.verifyAsync.mockResolvedValue({
      purpose: 'driver_self_service',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      status: 'inactive',
      identityStatus: 'verified',
      nationality: 'NG',
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
    });
    prisma.user.findFirst
      .mockResolvedValueOnce({ id: 'user_1' })
      .mockResolvedValueOnce({ id: 'user_1', tenantId: 'tenant_1', driverId: 'driver_1' });
    prisma.userConsent.findFirst.mockResolvedValue({ id: 'consent_1' });
    prisma.driverDocumentVerification.findMany.mockResolvedValue([
      { documentType: 'drivers-license', status: 'verified' },
    ]);
    prisma.driverGuarantor.findFirst.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Chinwe Okafor',
      phone: '+2348012345678',
      email: 'chinwe@example.com',
      status: 'pending_verification',
      disconnectedAt: null,
    });

    const result = await service.getOnboardingStep('driver-self-service-token');

    expect(result.step).toBe('complete');
    expect(result.requiresGuarantor).toBe(true);
    expect(result.guarantorVerified).toBe(false);
    expect(result.guarantorStatus).toBe('pending_verification');
  });

  it('auto-sends the guarantor link when a verified driver adds a guarantor with email', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.driverGuarantor.upsert.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Chinwe Okafor',
      phone: '+2348012345678',
      email: 'chinwe@example.com',
      status: 'pending_verification',
      disconnectedAt: null,
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Chinwe Okafor',
      phone: '+2348012345678',
      email: 'chinwe@example.com',
      status: 'pending_verification',
      disconnectedAt: null,
    });
    jwtService.signAsync.mockResolvedValue('guarantor-token');
    prisma.selfServiceOtp.create.mockResolvedValue({
      id: 'otp_1',
      otpCode: 'ABC123',
    });

    await service.createOrUpdateGuarantor('tenant_1', 'driver_1', {
      name: 'Chinwe Okafor',
      phone: '08012345678',
      countryCode: 'NG',
      email: 'chinwe@example.com',
    });

    expect(authEmailService.sendGuarantorSelfServiceVerificationEmail).toHaveBeenCalled();
    expect(notificationsService.notifyGuarantorStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        driverId: 'driver_1',
        guarantorName: 'Chinwe Okafor',
        guarantorEmail: 'chinwe@example.com',
        status: 'invited',
      }),
    );
  });

  it('blocks guarantor link delivery when the resolved verification tier does not require a guarantor', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Acme Mobility',
      country: 'NG',
      metadata: {
        operations: {
          requireGuarantor: false,
          requireGuarantorVerification: false,
          verificationTier: 'basic',
        },
      },
    });

    await expect(service.sendGuarantorSelfServiceLink('tenant_1', 'driver_1')).rejects.toThrow(
      'does not require a guarantor',
    );
    expect(authEmailService.sendGuarantorSelfServiceVerificationEmail).not.toHaveBeenCalled();
  });

  it('blocks guarantor link delivery until the guarantor verification add-on payment succeeds', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Acme Mobility',
      country: 'NG',
      metadata: {
        operations: {
          requireGuarantor: true,
          requireGuarantorVerification: true,
          driverPaysKyc: true,
        },
      },
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      status: 'pending_verification',
      disconnectedAt: null,
    });
    (
      jest.spyOn(service as never, 'getDriverVerificationAddonPaymentPolicy') as unknown as {
        mockResolvedValue: (value: unknown) => unknown;
      }
    ).mockResolvedValue({
      key: 'guarantor_verification',
      required: true,
      paymentStatus: 'driver_payment_required',
      paymentMessage:
        'The guarantor verification add-on has not been paid yet. Complete payment before sending the guarantor link.',
      amountMinorUnits: 500000,
      currency: 'NGN',
      payer: 'driver',
      entitlementState: 'none',
      entitlementCode: null,
      paymentReference: null,
    });

    await expect(service.sendGuarantorSelfServiceLink('tenant_1', 'driver_1')).rejects.toThrow(
      'has not been paid yet',
    );
    expect(authEmailService.sendGuarantorSelfServiceVerificationEmail).not.toHaveBeenCalled();
  });

  it('allows guarantor link delivery for an active full-verification flow without the separate add-on flag', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Acme Mobility',
      country: 'NG',
      metadata: {
        operations: {
          verificationTier: 'FULL_TRUST_VERIFICATION',
          requireGuarantorVerification: false,
          driverPaysKyc: true,
        },
      },
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      status: 'pending_verification',
      disconnectedAt: null,
    });
    jwtService.signAsync.mockResolvedValue('guarantor-token');
    prisma.selfServiceOtp.create.mockResolvedValue({
      id: 'otp_1',
      otpCode: 'ABC123',
    });

    const result = await service.sendGuarantorSelfServiceLink('tenant_1', 'driver_1');

    expect(result.destination).toBe('grace@example.com');
    expect(authEmailService.sendGuarantorSelfServiceVerificationEmail).toHaveBeenCalled();
  });

  it('creates a guarantor self-service account linked back to the driver workflow', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      purpose: 'guarantor_self_service',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      status: 'pending_verification',
    });
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'user_1' });

    await service.createGuarantorSelfServiceAccountFromSelfService(
      'guarantor-self-service-token',
      'grace-login@example.com',
      'Password@123',
    );

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 'tenant_1',
        email: 'grace-login@example.com',
        phone: '+2348000000000',
        role: 'READ_ONLY',
        settings: expect.objectContaining({
          selfServiceLinkage: {
            subjectType: 'guarantor',
            driverId: 'driver_1',
          },
        }),
      }),
    });
  });

  it('sends a guarantor reminder when the guarantor is still required, invited, and pending', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Acme Mobility',
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
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      status: 'pending_verification',
      inviteStatus: 'sent',
      inviteExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      guarantorReminderCount: 0,
      guarantorReminderSuppressed: false,
      disconnectedAt: null,
    });
    jwtService.signAsync.mockResolvedValue('guarantor-token');
    prisma.selfServiceOtp.create.mockResolvedValue({
      id: 'otp_1',
      otpCode: 'ABC123',
    });

    const result = await service.sendPendingGuarantorReminder('tenant_1', 'driver_1');

    expect(result.status).toBe('sent');
    expect(authEmailService.sendGuarantorSelfServiceVerificationEmail).toHaveBeenCalled();
    expect(prisma.driverGuarantor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { driverId: 'driver_1' },
        data: expect.objectContaining({
          inviteStatus: 'sent',
          guarantorReminderCount: 1,
        }),
      }),
    );
  });

  it('stops guarantor reminders after guarantor verification is complete', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      status: 'verified',
      personId: 'person_1',
      inviteStatus: 'sent',
      disconnectedAt: null,
    });

    const result = await service.sendPendingGuarantorReminder('tenant_1', 'driver_1');

    expect(result.status).toBe('not_ready');
    expect(authEmailService.sendGuarantorSelfServiceVerificationEmail).not.toHaveBeenCalled();
    expect(prisma.driverGuarantor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { driverId: 'driver_1' },
        data: expect.objectContaining({
          inviteStatus: 'verified',
        }),
      }),
    );
  });

  it('stops guarantor reminders when policy no longer requires a guarantor', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Acme Mobility',
      country: 'NG',
      metadata: {
        operations: {
          verificationTier: 'BASIC_IDENTITY',
          requireGuarantorVerification: false,
        },
      },
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      status: 'pending_verification',
      inviteStatus: 'sent',
      disconnectedAt: null,
    });

    const result = await service.sendPendingGuarantorReminder('tenant_1', 'driver_1');

    expect(result.status).toBe('not_ready');
    expect(authEmailService.sendGuarantorSelfServiceVerificationEmail).not.toHaveBeenCalled();
    expect(prisma.driverGuarantor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inviteStatus: 'not_required',
        }),
      }),
    );
  });

  it('stops guarantor reminders after the maximum reminder count is reached', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Acme Mobility',
      country: 'NG',
      metadata: {
        operations: {
          verificationTier: 'FULL_TRUST_VERIFICATION',
        },
      },
    });
    prisma.driverGuarantor.findMany.mockResolvedValue([
      {
        id: 'guarantor_1',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        inviteStatus: 'sent',
        inviteExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        guarantorReminderCount: 3,
        lastInviteSentAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        lastGuarantorReminderSentAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        guarantorReminderSuppressed: false,
        status: 'pending_verification',
        disconnectedAt: null,
      },
    ]);
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      inviteStatus: 'sent',
      inviteExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      guarantorReminderCount: 3,
      guarantorReminderSuppressed: false,
      status: 'pending_verification',
      disconnectedAt: null,
    });

    const result = await service.findDriversPendingGuarantorReminders();

    expect(result).toEqual([]);
  });

  it('does not continue reminders on an expired invite chain', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Acme Mobility',
      country: 'NG',
      metadata: {
        operations: {
          verificationTier: 'FULL_TRUST_VERIFICATION',
        },
      },
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      status: 'pending_verification',
      inviteStatus: 'sent',
      inviteExpiresAt: new Date(Date.now() - 60 * 1000),
      guarantorReminderCount: 1,
      guarantorReminderSuppressed: false,
      disconnectedAt: null,
    });

    const result = await service.sendPendingGuarantorReminder('tenant_1', 'driver_1');

    expect(result.status).toBe('not_ready');
    expect(authEmailService.sendGuarantorSelfServiceVerificationEmail).not.toHaveBeenCalled();
    expect(prisma.driverGuarantor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inviteStatus: 'expired',
        }),
      }),
    );
  });

  it('a fresh resend starts a new reminder chain instead of continuing the stale one', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Acme Mobility',
      country: 'NG',
      metadata: {
        operations: {
          verificationTier: 'FULL_TRUST_VERIFICATION',
        },
      },
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      status: 'pending_verification',
      inviteStatus: 'expired',
      inviteExpiresAt: new Date(Date.now() - 60 * 1000),
      guarantorReminderCount: 3,
      guarantorReminderSuppressed: true,
      disconnectedAt: null,
    });
    jwtService.signAsync.mockResolvedValue('guarantor-token');
    prisma.selfServiceOtp.create.mockResolvedValue({
      id: 'otp_1',
      otpCode: 'ABC123',
    });

    const result = await service.sendGuarantorSelfServiceLink('tenant_1', 'driver_1');

    expect(result.destination).toBe('grace@example.com');
    expect(prisma.driverGuarantor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inviteStatus: 'sent',
          guarantorReminderCount: 0,
          guarantorReminderSuppressed: false,
        }),
      }),
    );
  });

  it('blocks guarantor self-service account creation when the email is already bound to another verified identity', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      purpose: 'guarantor_self_service',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      firstName: 'Ada',
      lastName: 'Okafor',
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      status: 'verified',
      personId: null,
    });
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.driverGuarantor.findFirst.mockResolvedValue({
      personId: 'person_existing_1',
    });

    await expect(
      service.createGuarantorSelfServiceAccountFromSelfService(
        'guarantor-self-service-token',
        'claimed@example.com',
        'Password@123',
      ),
    ).rejects.toThrow(
      'This email address is already bound to another verified NIN-backed identity in this organisation. Use a different email address.',
    );
  });

  it('completes guarantor self-service identity without creating a separate payment flow', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      purpose: 'guarantor_self_service',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      firstName: 'Ada',
      lastName: 'Okafor',
      phone: '+2348012345678',
      nationality: 'NG',
      personId: 'person_driver_1',
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      name: 'Grace Eze',
      phone: '+2348000000000',
      email: 'grace@example.com',
      countryCode: 'NG',
      status: 'pending_verification',
      personId: null,
    });
    prisma.driverGuarantor.update.mockResolvedValue({
      id: 'guarantor_1',
      driverId: 'driver_1',
      tenantId: 'tenant_1',
      personId: 'person_guarantor_1',
      status: 'verified',
    });
    intelligenceClient.resolveEnrollment.mockResolvedValue({
      decision: 'verified_match',
      personId: 'person_guarantor_1',
      isVerifiedMatch: true,
      verifiedProfile: {
        fullName: 'Grace Eze',
      },
    });

    const result = await service.resolveGuarantorIdentityFromSelfService(
      'guarantor-self-service-token',
      {
        subjectConsent: true,
        livenessCheck: {
          provider: 'youverify',
          sessionId: 'g-session-1',
          passed: true,
        },
        identifiers: [{ type: 'NATIONAL_ID', value: '11111111111', countryCode: 'NG' }],
      },
    );

    expect(prisma.driverGuarantor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { driverId: 'driver_1' },
        data: expect.objectContaining({
          personId: 'person_guarantor_1',
          status: 'verified',
        }),
      }),
    );
    expect(prisma.verificationEntitlement.findFirst).toHaveBeenCalled();
    expect(controlPlaneBillingClient.initializeDriverKycCheckout).not.toHaveBeenCalled();
    expect(result.personId).toBe('person_guarantor_1');
  });

  it('uploads driver documents in pending status', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      identityStatus: 'unverified',
    });
    prisma.driverDocument.create.mockResolvedValue({
      id: 'doc_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      documentType: 'drivers-license',
      fileName: 'licence.pdf',
      contentType: 'application/pdf',
      storageKey: 'doc-key',
      uploadedBy: 'operator',
      status: 'pending',
    });

    await service.uploadDocument('tenant_1', 'driver_1', {
      documentType: 'drivers-license',
      fileName: 'licence.pdf',
      contentType: 'application/pdf',
      fileBase64: Buffer.from('%PDF-1.4\n').toString('base64'),
      uploadedBy: 'operator',
    });

    expect(documentStorageService.uploadFile).toHaveBeenCalledWith(
      Buffer.from('%PDF-1.4\n'),
      'licence.pdf',
      'application/pdf',
    );
    expect(prisma.driverDocument.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'pending',
        storageKey: 'doc-key',
        storageUrl: 'https://storage.example.com/driver-documents/doc-key',
        reviewedBy: null,
        reviewedAt: null,
      }),
    });
  });

  it('approves a driver licence with reviewer and expiry metadata', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      identityStatus: 'verified',
    });
    prisma.driverDocument.findUnique.mockResolvedValue({
      id: 'doc_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      documentType: 'drivers-license',
      status: 'pending',
    });
    prisma.driverDocument.update.mockResolvedValue({
      id: 'doc_1',
      status: 'approved',
    });

    await service.reviewDocument(
      'tenant_1',
      'driver_1',
      'doc_1',
      { status: 'approved', expiresAt: '2030-01-01' },
      'user_1',
    );

    expect(prisma.driverDocument.update).toHaveBeenCalledWith({
      where: { id: 'doc_1' },
      data: expect.objectContaining({
        status: 'approved',
        reviewedBy: 'user_1',
      }),
    });
  });

  it('rejects approving a licence without an expiry date', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      identityStatus: 'verified',
    });
    prisma.driverDocument.findUnique.mockResolvedValue({
      id: 'doc_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      documentType: 'drivers-license',
      status: 'pending',
    });

    await expect(
      service.reviewDocument('tenant_1', 'driver_1', 'doc_1', { status: 'approved' }, 'user_1'),
    ).rejects.toThrow('An expiry date is required before this document can be approved.');
  });

  it('marks a guarantor as disconnected instead of deleting the record', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
      email: 'ada@example.com',
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      driverId: 'driver_1',
      tenantId: 'tenant_1',
      name: 'Grace Eze',
      email: 'grace@example.com',
      status: 'active',
    });
    prisma.driverGuarantor.update.mockResolvedValue({
      id: 'guarantor_1',
      driverId: 'driver_1',
      tenantId: 'tenant_1',
      status: 'disconnected',
      disconnectedReason: 'Disconnected by operator request',
      disconnectedAt: new Date(),
    });

    const result = await service.removeGuarantor('tenant_1', 'driver_1');

    expect(prisma.driverGuarantor.update).toHaveBeenCalled();
    expect(result.status).toBe('disconnected');
    expect(policyService.evaluateDriverPolicies).toHaveBeenCalledWith('tenant_1', 'driver_1');
    expect(notificationsService.notifyGuarantorStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        guarantorName: 'Grace Eze',
        guarantorEmail: 'grace@example.com',
        status: 'disconnected',
      }),
    );
  });

  it('requires an email address before sending a self-service link', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      firstName: 'Ada',
      lastName: 'Okafor',
      email: null,
    });

    await expect(service.sendSelfServiceLink('tenant_1', 'driver_1')).rejects.toThrow(
      'Driver has no email; please add one before sending a self-service link.',
    );
  });

  it('does not let a per-driver verification tier fall below the organisation minimum', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      firstName: 'Ada',
      lastName: 'Okafor',
      email: 'ada@example.com',
      identityStatus: 'unverified',
      verificationTierOverride: null,
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Tenant One',
      country: 'NG',
      metadata: {
        operations: {
          verificationTier: 'VERIFIED_IDENTITY',
          driverPaysKyc: false,
        },
      },
    });
    jwtService.signAsync.mockResolvedValue('driver-token');
    prisma.selfServiceOtp.create.mockResolvedValue({ id: 'otp_1', otpCode: 'ABC123' });

    await service.sendSelfServiceLink('tenant_1', 'driver_1', {
      verificationTierOverride: 'BASIC_IDENTITY',
    });

    expect(prisma.driver.update).not.toHaveBeenCalled();
    expect(authEmailService.sendDriverSelfServiceVerificationEmail).toHaveBeenCalled();
  });

  it('can request fresh reverification for an existing driver at a selected tier', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      firstName: 'Ada',
      lastName: 'Okafor',
      email: 'ada@example.com',
      identityStatus: 'verified',
      verificationTierOverride: null,
      driverPaysKycOverride: null,
      identityProfile: { fullName: 'Ada Okafor' },
      identityReviewCaseId: 'review_1',
      identityReviewStatus: 'open',
      identityLastDecision: 'approved',
      identityVerificationConfidence: 97,
      identityLastVerifiedAt: new Date('2026-03-01T00:00:00.000Z'),
      identityLivenessPassed: true,
      identityLivenessProvider: 'youverify',
      identityLivenessConfidence: 0.93,
      identityLivenessReason: null,
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Acme Transport',
      country: 'NG',
      metadata: {
        branding: { displayName: 'Acme Transport' },
        operations: {
          verificationTier: 'BASIC_IDENTITY',
          driverPaysKyc: false,
        },
      },
    });
    prisma.driver.update.mockResolvedValue({ id: 'driver_1' });
    jwtService.signAsync.mockResolvedValue('driver-token');
    prisma.selfServiceOtp.create.mockResolvedValue({
      otpCodeHash: 'hash',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const delivery = await service.sendSelfServiceLink('tenant_1', 'driver_1', {
      verificationTierOverride: 'FULL_TRUST_VERIFICATION',
      forceReverification: true,
      requestedBy: 'user_1',
    });

    expect(prisma.driver.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'driver_1' },
        data: expect.objectContaining({
          verificationTierOverride: 'FULL_TRUST_VERIFICATION',
          identityStatus: 'unverified',
          identityReviewCaseId: null,
          kycPaymentReference: null,
          adminAssignmentOverride: false,
        }),
      }),
    );
    expect(authEmailService.sendDriverSelfServiceVerificationEmail).toHaveBeenCalled();
    expect(delivery.delivery).toBe('email');
  });

  it('automatically sends a self-service link when the driver pays verification fees', async () => {
    prisma.fleet.findUnique.mockResolvedValue({
      id: 'fleet_1',
      tenantId: 'tenant_1',
      status: 'active',
      operatingUnit: {
        id: 'ou_1',
        businessEntityId: 'be_1',
      },
    });
    prisma.tenant.findUnique.mockResolvedValue({
      country: 'NG',
      metadata: {
        operations: {
          autoSendDriverSelfServiceLinkOnCreate: false,
          requireIdentityVerificationForActivation: true,
          driverPaysKyc: true,
        },
      },
    });
    prisma.driver.create.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      firstName: 'Ada',
      lastName: 'Okafor',
      phone: null,
      email: 'ada@example.com',
      dateOfBirth: null,
      nationality: 'NG',
      status: 'inactive',
      identityStatus: 'unverified',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const sendSelfServiceLinkSpy = jest.spyOn(service, 'sendSelfServiceLink').mockResolvedValue({
      delivery: 'email',
      verificationUrl: 'https://app.mobiris.ng/driver-self-service?token=test',
      destination: 'ada@example.com',
      otpCode: '123456',
    });

    const result = await service.create('tenant_1', {
      fleetId: 'fleet_1',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Okafor',
      nationality: 'NG',
    });

    expect(sendSelfServiceLinkSpy).toHaveBeenCalledWith('tenant_1', 'driver_1');
    expect(result.selfServiceInviteStatus).toBe('sent');
  });

  it('blocks driver creation when the email is already bound to another verified guarantor identity', async () => {
    prisma.fleet.findUnique.mockResolvedValue({
      id: 'fleet_1',
      tenantId: 'tenant_1',
      status: 'active',
      operatingUnit: {
        id: 'ou_1',
        businessEntityId: 'be_1',
      },
    });
    prisma.driverGuarantor.findFirst.mockResolvedValue({
      personId: 'person_verified_guarantor_1',
    });

    await expect(
      service.create('tenant_1', {
        fleetId: 'fleet_1',
        email: 'claimed@example.com',
        firstName: 'Ada',
        lastName: 'Okafor',
        nationality: 'NG',
      }),
    ).rejects.toThrow(
      'This email address is already bound to another verified NIN-backed identity in this organisation. Use a different email address.',
    );
  });

  it('imports drivers from the published template column shape', async () => {
    prisma.fleet.findMany.mockResolvedValue([
      {
        id: 'fleet_1',
        name: 'Lagos Core Fleet',
        status: 'active',
      },
    ]);
    const createSpy = jest.spyOn(service, 'create').mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      firstName: 'Seyi',
      lastName: 'Adelaju',
      phone: '+2348012345678',
      email: 'seyi@example.com',
      dateOfBirth: '1992-05-20',
      nationality: 'NG',
      status: 'inactive',
      identityStatus: 'unverified',
      createdAt: new Date(),
      updatedAt: new Date(),
      selfServiceInviteStatus: 'sent',
      selfServiceInviteReason: null,
    } as never);

    const result = await service.importDriversFromCsv(
      'tenant_1',
      [
        'fleetName,firstName,lastName,phone,email,dateOfBirth,nationality',
        'Lagos Core Fleet,Seyi,Adelaju,08012345678,seyi@example.com,1992-05-20,NG',
      ].join('\n'),
      {},
    );

    expect(result.createdCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(createSpy).toHaveBeenCalledWith(
      'tenant_1',
      expect.objectContaining({
        fleetId: 'fleet_1',
        firstName: 'Seyi',
        lastName: 'Adelaju',
        phone: '08012345678',
        email: 'seyi@example.com',
        dateOfBirth: '1992-05-20',
        nationality: 'NG',
      }),
      {},
    );
  });

  it('links a field-officer tenant user as constrained driver mobile access', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      businessEntityId: 'be_1',
      operatingUnitId: 'ou_1',
      firstName: 'Ada',
      lastName: 'Okafor',
      phone: '+2348012345678',
      email: 'ada@example.com',
      identityStatus: 'verified',
      status: 'inactive',
    });
    prisma.user.findFirst
      .mockResolvedValueOnce({
        id: 'user_1',
        tenantId: 'tenant_1',
        driverId: null,
        email: 'ada-mobile@example.com',
        phone: '+2348012345678',
        name: 'Ada Mobile',
        role: 'FIELD_OFFICER',
        isActive: true,
        settings: null,
      })
      .mockResolvedValueOnce(null);
    prisma.user.update.mockResolvedValue({
      id: 'user_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      email: 'ada-mobile@example.com',
      phone: '+2348012345678',
      name: 'Ada Mobile',
      role: 'FIELD_OFFICER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.linkUserToDriver('tenant_1', 'driver_1', 'user_1');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: expect.objectContaining({
        driverId: 'driver_1',
        businessEntityId: 'be_1',
        operatingUnitId: 'ou_1',
        mobileAccessRevoked: false,
        role: 'READ_ONLY',
        settings: expect.objectContaining({
          accessMode: 'driver_mobile',
          assignedFleetIds: ['fleet_1'],
          assignedVehicleIds: [],
          customPermissions: expect.arrayContaining([
            'drivers:read',
            'assignments:read',
            'assignments:write',
            'remittance:read',
            'remittance:write',
          ]),
        }),
      }),
    });
  });

  it('creates a dedicated driver mobile account from self-service with driver hierarchy scope', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      purpose: 'driver_self_service',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      businessEntityId: 'be_1',
      operatingUnitId: 'ou_1',
      firstName: 'Ada',
      lastName: 'Okafor',
      phone: '+2348012345678',
      email: 'ada@example.com',
      identityStatus: 'verified',
      status: 'inactive',
    });
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create = jest.fn().mockResolvedValue({
      id: 'user_driver_1',
    });
    prisma.$transaction.mockImplementation(async (operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );

    await service.createDriverMobileAccountFromSelfService(
      'driver-self-service-token',
      'mobile@example.com',
      'password123',
    );

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        businessEntityId: 'be_1',
        operatingUnitId: 'ou_1',
        role: 'READ_ONLY',
        settings: expect.objectContaining({
          accessMode: 'driver_mobile',
          assignedFleetIds: ['fleet_1'],
          assignedVehicleIds: [],
          customPermissions: expect.arrayContaining([
            'drivers:read',
            'assignments:read',
            'assignments:write',
            'remittance:read',
            'remittance:write',
          ]),
        }),
      }),
    });
  });

  it('shows the driver a newly assigned vehicle and the assignment-issued notification', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      purpose: 'driver_self_service',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    });
    prisma.assignment.findMany.mockResolvedValue([
      {
        id: 'assignment_1',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        fleetId: 'fleet_1',
        status: 'driver_action_required',
        notes: 'Morning dispatch',
        remittanceAmountMinorUnits: 250000,
        remittanceCurrency: 'NGN',
        remittanceFrequency: 'daily',
        remittanceStartDate: '2026-03-31',
        createdAt: new Date('2026-03-31T06:00:00.000Z'),
        updatedAt: new Date('2026-03-31T06:00:00.000Z'),
      },
    ]);
    prisma.vehicle.findMany.mockResolvedValue([
      {
        id: 'vehicle_1',
        make: 'Toyota',
        model: 'Corolla',
        plate: 'LAG-123AA',
        tenantVehicleCode: null,
        systemVehicleCode: null,
        status: 'assigned',
      },
    ]);
    prisma.user.findMany.mockResolvedValue([{ id: 'user_1' }]);
    prisma.userNotification.findMany.mockResolvedValue([
      {
        id: 'notification_1',
        tenantId: 'tenant_1',
        userId: 'user_1',
        topic: 'assignment_issued',
        title: 'Vehicle assigned',
        body: 'Toyota Corolla has been assigned to you.',
        actionUrl: '/assignments/assignment_1',
        metadata: { assignmentId: 'assignment_1' },
        readAt: null,
        createdAt: new Date('2026-03-31T06:01:00.000Z'),
        updatedAt: new Date('2026-03-31T06:01:00.000Z'),
      },
    ]);

    const [assignments, notifications] = await Promise.all([
      service.listAssignmentsFromSelfService('driver-self-service-token'),
      service.listNotificationsFromSelfService('driver-self-service-token'),
    ]);

    expect(assignments).toHaveLength(1);
    expect(assignments[0]).toMatchObject({
      id: 'assignment_1',
      status: 'driver_action_required',
      vehicleId: 'vehicle_1',
      vehicle: expect.objectContaining({
        plate: 'LAG-123AA',
        status: 'assigned',
      }),
    });
    expect(notifications).toEqual([
      expect.objectContaining({
        id: 'notification_1',
        topic: 'assignment_issued',
        actionUrl: '/assignments/assignment_1',
      }),
    ]);
  });

  it('initializes a driver liveness session through api-intelligence', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
    });
    intelligenceClient.initializeLivenessSession.mockResolvedValue({
      providerName: 'youverify',
      sessionId: 'session_1',
      fallbackChain: ['amazon_rekognition:provider_unavailable', 'youverify:initialized'],
    });

    const result = await service.initializeIdentityLivenessSession('tenant_1', 'driver_1');

    expect(intelligenceClient.initializeLivenessSession).toHaveBeenCalledWith({
      tenantId: 'tenant_1',
      countryCode: 'NG',
    });
    expect(result).toEqual({
      providerName: 'youverify',
      sessionId: 'session_1',
      fallbackChain: ['amazon_rekognition:provider_unavailable', 'youverify:initialized'],
    });
  });

  it('returns a clear liveness-unavailable error when intelligence is unreachable', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      nationality: 'NG',
    });
    intelligenceClient.initializeLivenessSession.mockRejectedValue(
      new ServiceUnavailableException('Intelligence service integration is not configured'),
    );

    await expect(service.initializeIdentityLivenessSession('tenant_1', 'driver_1')).rejects.toThrow(
      'Live verification is temporarily unavailable right now. Please try again in a moment.',
    );
  });

  it('stores personId on the driver when identity resolution links a canonical person', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      firstName: 'Emeka',
      lastName: 'Okonkwo',
      phone: '+2348012345678',
      email: 'emeka@example.com',
      dateOfBirth: '1990-06-15',
      nationality: 'NG',
    });
    intelligenceClient.resolveEnrollment.mockResolvedValue({
      decision: 'auto_linked',
      personId: 'person_1',
      globalRiskScore: 4,
      riskBand: 'low',
      isWatchlisted: false,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 0,
      verificationConfidence: 0.98,
    });

    const result = await service.resolveIdentity('tenant_1', 'driver_1', {
      subjectConsent: true,
      livenessCheck: {
        provider: 'youverify',
        sessionId: 'session_1',
        passed: true,
      },
      identifiers: [{ type: 'NATIONAL_ID', value: '12345678901', countryCode: 'NG' }],
    });

    expect(intelligenceClient.resolveEnrollment).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant_1',
        countryCode: 'NG',
        providerVerification: expect.objectContaining({
          subjectConsent: true,
          validationData: {
            firstName: 'Emeka',
            lastName: 'Okonkwo',
            dateOfBirth: '1990-06-15',
          },
          livenessCheck: {
            provider: 'youverify',
            sessionId: 'session_1',
            passed: true,
          },
        }),
      }),
    );
    expect(prisma.driver.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'driver_1' },
        data: expect.objectContaining({ personId: 'person_1' }),
      }),
    );
    expect(result.personId).toBe('person_1');
  });

  it('blocks identity resolution when the resolved person is already linked to another active driver in the same tenant', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      firstName: 'Emeka',
      lastName: 'Okonkwo',
      phone: '+2348012345678',
      email: 'emeka@example.com',
      dateOfBirth: '1990-06-15',
      nationality: 'NG',
    });
    prisma.driver.findFirst.mockResolvedValue({
      id: 'driver_existing',
      firstName: 'Sarah',
      lastName: 'Doe',
      email: 'sarah@example.com',
      phone: '+2348099999999',
      status: 'inactive',
    });
    intelligenceClient.resolveEnrollment.mockResolvedValue({
      decision: 'auto_linked',
      personId: 'person_1',
      isVerifiedMatch: true,
    });

    await expect(
      service.resolveIdentity('tenant_1', 'driver_1', {
        subjectConsent: true,
        livenessCheck: {
          provider: 'youverify',
          sessionId: 'session_1',
          passed: true,
        },
        identifiers: [{ type: 'NATIONAL_ID', value: '12345678901', countryCode: 'NG' }],
      }),
    ).rejects.toThrow(
      'This verified identity is already linked to Sarah Doe in your organisation.',
    );

    expect(prisma.driver.update).not.toHaveBeenCalled();
  });

  it('allows the same canonical person to continue onboarding in another tenant without local duplicate blocking', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_2',
      firstName: 'Emeka',
      lastName: 'Okonkwo',
      phone: '+2348012345678',
      email: 'new-tenant@example.com',
      dateOfBirth: '1990-06-15',
      nationality: 'NG',
    });
    prisma.driver.findFirst.mockResolvedValue(null);
    intelligenceClient.resolveEnrollment.mockResolvedValue({
      decision: 'auto_linked',
      personId: 'person_1',
      isVerifiedMatch: true,
      globalRiskScore: 3,
      riskBand: 'low',
      isWatchlisted: false,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 0,
      verificationConfidence: 0.99,
    });

    const result = await service.resolveIdentity('tenant_2', 'driver_1', {
      subjectConsent: true,
      livenessCheck: {
        provider: 'youverify',
        sessionId: 'session_2',
        passed: true,
      },
      identifiers: [{ type: 'NATIONAL_ID', value: '12345678901', countryCode: 'NG' }],
    });

    expect(prisma.driver.findFirst).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant_2',
        personId: 'person_1',
        id: { not: 'driver_1' },
        archivedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
      },
    });
    expect(prisma.driver.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'driver_1' },
        data: expect.objectContaining({ personId: 'person_1' }),
      }),
    );
    expect(result.personId).toBe('person_1');
  });

  it('allows a returning driver to resume verification when the same person already exists on a matching email record', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_retry',
      tenantId: 'tenant_1',
      firstName: 'Amara',
      lastName: 'Okafor',
      phone: '+2348012345678',
      email: 'amara@example.com',
      dateOfBirth: '1992-04-11',
      nationality: 'NG',
    });
    prisma.driver.findFirst
      .mockResolvedValueOnce({
        id: 'driver_existing',
        firstName: 'Amara',
        lastName: 'Okafor',
        email: 'amara@example.com',
        phone: '+2348099999999',
        status: 'inactive',
      })
      .mockResolvedValueOnce({
        personId: 'person_1',
      });
    intelligenceClient.resolveEnrollment.mockResolvedValue({
      decision: 'auto_linked',
      personId: 'person_1',
      isVerifiedMatch: true,
      globalRiskScore: 2,
      riskBand: 'low',
      isWatchlisted: false,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 0,
      verificationConfidence: 0.99,
    });

    const result = await service.resolveIdentity('tenant_1', 'driver_retry', {
      subjectConsent: true,
      livenessCheck: {
        provider: 'youverify',
        sessionId: 'session_retry_1',
        passed: true,
      },
      identifiers: [{ type: 'NATIONAL_ID', value: '12345678901', countryCode: 'NG' }],
    });

    expect(prisma.driver.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'driver_retry' },
        data: expect.objectContaining({ personId: 'person_1' }),
      }),
    );
    expect(result.personId).toBe('person_1');
  });

  it('requires all operational profile fields before self-service profile completion can continue', async () => {
    jest.spyOn(service as any, 'verifySelfServiceToken').mockResolvedValue({
      tenantId: 'tenant_1',
      driverId: 'driver_1',
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      phone: '+2348012345678',
      operationalProfile: null,
    });

    await expect(
      service.updateProfileFromSelfService('token_1', {
        address: '12 Marina Road',
        town: 'Lagos',
      }),
    ).rejects.toThrow(
      'Complete the required profile fields before continuing: Local government area, State, Next of kin name, Next of kin phone, Emergency contact name, Emergency contact phone.',
    );
  });

  it('archives a removable driver and preserves historical state safely', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      status: 'inactive',
      personId: null,
      firstName: 'Ada',
      lastName: 'Okonkwo',
      archivedAt: null,
    });
    prisma.assignment.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1);
    prisma.remittance.count.mockResolvedValueOnce(1);
    prisma.driver.update.mockResolvedValue({ id: 'driver_1' });

    const result = await service.archiveDriver('tenant_1', 'driver_1', {
      reason: 'Duplicate onboarding record',
      archivedBy: 'user_1',
    });

    expect(prisma.driver.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'driver_1' },
        data: expect.objectContaining({
          archivedBy: 'user_1',
          archiveReason: 'Duplicate onboarding record',
        }),
      }),
    );
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant_1', driverId: 'driver_1' },
      data: { isActive: false },
    });
    expect(result.mode).toBe('archived');
  });

  it('persists the rich verified profile, metadata, and images returned by identity resolution', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      firstName: 'Emeka',
      lastName: 'Okonkwo',
      phone: '+2348012345678',
      email: 'emeka@example.com',
      dateOfBirth: '1990-06-15',
      nationality: 'NG',
      status: 'pending_verification',
    });
    documentStorageService.uploadFile
      .mockResolvedValueOnce({
        storageKey: 'selfie-key',
        storageUrl: 'https://storage.example.com/driver-documents/selfie.jpg',
      })
      .mockResolvedValueOnce({
        storageKey: 'portrait-key',
        storageUrl: 'https://storage.example.com/driver-documents/nin-portrait.jpg',
      })
      .mockResolvedValueOnce({
        storageKey: 'signature-key',
        storageUrl: 'https://storage.example.com/driver-documents/signature.jpg',
      });
    intelligenceClient.resolveEnrollment.mockResolvedValue({
      decision: 'verified_match',
      personId: 'person_1',
      providerName: 'youverify',
      providerLookupStatus: 'success',
      providerVerificationStatus: 'verified',
      isVerifiedMatch: true,
      verificationConfidence: 0.99,
      livenessPassed: true,
      livenessProviderName: 'youverify',
      livenessConfidenceScore: 0.97,
      verifiedProfile: {
        firstName: 'Emeka',
        middleName: 'Chinedu',
        lastName: 'Okonkwo',
        fullName: 'Emeka Chinedu Okonkwo',
        dateOfBirth: '1990-06-15',
        nationality: 'Nigerian',
        gender: 'm',
        fullAddress: '12 Marina Road, Lagos',
        addressLine: '12 Marina Road',
        town: 'Lagos Island',
        localGovernmentArea: 'Eti-Osa',
        state: 'Lagos',
        mobileNumber: '+2348012345678',
        emailAddress: 'emeka@example.com',
        birthState: 'Anambra',
        birthLga: 'Nnewi North',
        nextOfKinState: 'Imo',
        religion: 'Christianity',
        ninIdNumber: '11111111111',
        providerImageUrl: 'data:image/png;base64,aGVsbG8=',
        signatureUrl: 'data:image/png;base64,c2lnbmF0dXJl',
      },
      verificationMetadata: {
        validity: 'valid',
        matchScore: 98,
        riskScore: 4,
        portraitAvailable: true,
      },
      providerAudit: {
        provider: 'youverify',
        lookupStatus: 'success',
      },
    });

    const result = await service.resolveIdentity('tenant_1', 'driver_1', {
      subjectConsent: true,
      selfieImageBase64: 'c2VsZmll',
      livenessCheck: {
        provider: 'youverify',
        sessionId: 'session_1',
        passed: true,
      },
      identifiers: [{ type: 'NATIONAL_ID', value: '11111111111', countryCode: 'NG' }],
    });

    expect(documentStorageService.uploadFile).toHaveBeenCalledTimes(3);
    expect(prisma.driver.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'driver_1' },
        data: expect.objectContaining({
          personId: 'person_1',
          firstName: 'Emeka Chinedu',
          lastName: 'Okonkwo',
          nationality: 'NIGERIAN',
          gender: 'male',
          selfieImageUrl: 'https://storage.example.com/driver-documents/selfie.jpg',
          providerImageUrl: 'https://storage.example.com/driver-documents/nin-portrait.jpg',
          identitySignatureImageUrl: 'https://storage.example.com/driver-documents/signature.jpg',
          identityStatus: 'verified',
          identityVerificationMetadata: expect.objectContaining({
            validity: 'valid',
            matchScore: 98,
            riskScore: 4,
          }),
          identityProviderRawData: expect.objectContaining({
            provider: 'youverify',
            lookupStatus: 'success',
          }),
          identityProfile: expect.objectContaining({
            fullName: 'Emeka Chinedu Okonkwo',
            ninIdNumber: '11111111111',
            nationality: 'NIGERIAN',
            selfieImageUrl: 'https://storage.example.com/driver-documents/selfie.jpg',
            providerImageUrl: 'https://storage.example.com/driver-documents/nin-portrait.jpg',
            signatureImageUrl: 'https://storage.example.com/driver-documents/signature.jpg',
          }),
        }),
      }),
    );
    expect(result.verifiedProfile).toEqual(
      expect.objectContaining({
        fullName: 'Emeka Chinedu Okonkwo',
        selfieImageUrl: 'https://storage.example.com/driver-documents/selfie.jpg',
        providerImageUrl: 'https://storage.example.com/driver-documents/nin-portrait.jpg',
        signatureImageUrl: 'https://storage.example.com/driver-documents/signature.jpg',
      }),
    );
  });

  it('rejects creating a driver with a duplicate phone in the same tenant', async () => {
    prisma.fleet.findUnique.mockResolvedValue({
      id: 'fleet_1',
      tenantId: 'tenant_1',
      status: 'active',
      operatingUnit: {
        id: 'ou_1',
        businessEntityId: 'be_1',
      },
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_existing',
      tenantId: 'tenant_1',
      phone: '+2348012345678',
    });

    await expect(
      service.create('tenant_1', {
        fleetId: 'fleet_1',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Okafor',
        phone: '08012345678',
        nationality: 'NG',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid driver status transitions', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_2',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      status: 'terminated',
      firstName: 'Ada',
      lastName: 'Okafor',
      phone: '+2348012345678',
      identityStatus: 'verified',
    });

    await expect(service.updateStatus('tenant_1', 'driver_2', 'active')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('lists drivers with pagination metadata', async () => {
    prisma.driver.findMany.mockResolvedValue([
      {
        id: 'driver_1',
        tenantId: 'tenant_1',
        fleetId: 'fleet_1',
        firstName: 'Ada',
        lastName: 'Okafor',
        phone: '+2348012345678',
        status: 'inactive',
        identityStatus: 'unverified',
      },
    ]);
    prisma.driver.count.mockResolvedValue(1);

    const result = await service.list('tenant_1', {
      page: 2,
      limit: 25,
    });

    expect(prisma.driver.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 25,
        take: 25,
      }),
    );
    expect(result.page).toBe(2);
    expect(result.limit).toBe(25);
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('still lists drivers when guarantor enrichment fails', async () => {
    prisma.driver.findMany.mockResolvedValue([
      {
        id: 'driver_1',
        tenantId: 'tenant_1',
        fleetId: 'fleet_1',
        businessEntityId: 'be_1',
        operatingUnitId: 'ou_1',
        firstName: 'Ada',
        lastName: 'Okafor',
        phone: '+2348012345678',
        status: 'inactive',
        identityStatus: 'unverified',
      },
    ]);
    prisma.driver.count.mockResolvedValue(1);
    prisma.driverGuarantor.findMany.mockRejectedValue(
      new Error('relation "driver_guarantors" does not exist'),
    );

    const result = await service.list('tenant_1', { limit: 25 });

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'driver_1',
      hasGuarantor: false,
      guarantorStatus: null,
      hasApprovedLicence: false,
      hasMobileAccess: false,
      mobileAccessStatus: 'missing',
      activationReadiness: 'not_ready',
    });
  });

  it('still lists drivers when mobile-access enrichment fails', async () => {
    prisma.driver.findMany.mockResolvedValue([
      {
        id: 'driver_1',
        tenantId: 'tenant_1',
        fleetId: 'fleet_1',
        businessEntityId: 'be_1',
        operatingUnitId: 'ou_1',
        firstName: 'Ada',
        lastName: 'Okafor',
        phone: '+2348012345678',
        status: 'inactive',
        identityStatus: 'unverified',
      },
    ]);
    prisma.driver.count.mockResolvedValue(1);
    prisma.user.findMany.mockRejectedValue(
      new Error('column "mobileAccessRevoked" does not exist'),
    );

    const result = await service.list('tenant_1', { limit: 25 });

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'driver_1',
      hasMobileAccess: false,
      mobileAccessStatus: 'missing',
      activationReadiness: 'not_ready',
    });
  });
});
