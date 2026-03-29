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
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    fleet: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
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
  };
  const documentStorageService = {
    uploadFile: jest.fn(),
    readFile: jest.fn(),
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
  const notificationsService = {
    notifyDriverVerificationStatus: jest.fn(),
    notifyDriverLicenceReviewPending: jest.fn(),
    notifyDriverLicenceReviewResolved: jest.fn(),
  };

  let service: DriversService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.driverGuarantor.findMany.mockResolvedValue([]);
    prisma.driverDocument.findMany.mockResolvedValue([]);
    prisma.driverDocument.updateMany.mockResolvedValue({ count: 0 });
    prisma.driverDocument.findFirst.mockResolvedValue(null);
    prisma.driver.findMany.mockResolvedValue([]);
    prisma.driver.count.mockResolvedValue(0);
    prisma.user.findMany.mockResolvedValue([]);
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
    prisma.$transaction.mockImplementation(async (operations: unknown[]) =>
      Promise.all(operations),
    );
    documentStorageService.uploadFile.mockResolvedValue({
      storageKey: 'doc-key',
      storageUrl: 'https://storage.example.com/driver-documents/doc-key',
    });
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
    const auditService = { recordTenantAction: jest.fn() };
    service = new DriversService(
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
  });

  it('creates or updates a guarantor for the driver', async () => {
    prisma.driver.findUnique.mockResolvedValueOnce({
      id: 'driver_1',
      tenantId: 'tenant_1',
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
      'A guarantor with verified linkage is required.',
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

    await expect(service.updateStatus('tenant_1', 'driver_1', 'active')).rejects.toThrow(
      'An approved driver licence is required.',
    );
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

  it('resolves a pending driver licence review and notifies the driver and operators', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      identityStatus: 'verified',
      firstName: 'Ada',
      lastName: 'Okafor',
      email: 'ada@example.com',
      personId: 'person_1',
    });
    prisma.driverDocumentVerification.findFirst.mockResolvedValue({
      id: 'docver_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      documentType: 'drivers-license',
      idNumber: 'DL12345',
      countryCode: 'NG',
      provider: 'youverify',
      status: 'manual_review',
      providerMatch: null,
      providerConfidence: 82,
      providerFirstName: 'Ada',
      providerLastName: 'Okafor',
      providerDateOfBirth: '1990-01-01',
      providerExpiryDate: '2030-01-01',
      failureReason: "Driver's licence verification is pending review.",
      providerResult: {
        validity: 'valid',
        expiryDate: '2030-01-01',
        reviewCaseId: 'review_1',
        manualReviewRequired: true,
        linkage: {
          status: 'pending',
          decision: 'pending_human_review',
          demographicMatchScore: 84,
          biometricMatchScore: 78,
          overallLinkageScore: 81,
          reasons: ['Biometric linkage data needs a human review.'],
        },
        risk: {
          impact: 'medium',
          summary: "Driver's licence needs additional verification before confidence can improve.",
        },
      },
      verifiedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      createdAt: new Date('2026-03-28T10:00:00.000Z'),
      updatedAt: new Date('2026-03-28T10:00:00.000Z'),
    });
    prisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      tenantId: 'tenant_1',
      role: 'TENANT_OWNER',
      name: 'Owner One',
      isActive: true,
    });
    prisma.driverDocumentVerification.update.mockResolvedValue({
      id: 'docver_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      documentType: 'drivers-license',
      idNumber: 'DL12345',
      countryCode: 'NG',
      provider: 'youverify',
      status: 'verified',
      providerMatch: true,
      providerConfidence: 82,
      providerFirstName: 'Ada',
      providerLastName: 'Okafor',
      providerDateOfBirth: '1990-01-01',
      providerExpiryDate: '2030-01-01',
      failureReason: null,
      providerResult: {
        validity: 'valid',
        expiryDate: '2030-01-01',
        reviewCaseId: 'review_1',
        manualReviewRequired: false,
        reviewDecision: 'approved',
        linkage: {
          status: 'pending',
          decision: 'auto_pass',
          demographicMatchScore: 84,
          biometricMatchScore: 78,
          overallLinkageScore: 81,
          reasons: ['Biometric linkage data needs a human review.'],
        },
        risk: {
          impact: 'low',
          summary: "Driver's licence is valid and strongly linked to the verified identity.",
        },
      },
      verifiedAt: new Date('2026-03-28T11:00:00.000Z'),
      reviewedBy: 'user_1',
      reviewedAt: new Date('2026-03-28T11:00:00.000Z'),
      reviewNotes: 'Manual check completed.',
      createdAt: new Date('2026-03-28T10:00:00.000Z'),
      updatedAt: new Date('2026-03-28T11:00:00.000Z'),
    });
    prisma.tenant.findUnique.mockResolvedValue({
      name: 'Mobiris Fleet',
      country: 'NG',
      metadata: {},
    });
    intelligenceClient.resolveDriverLicenceEvidenceReview.mockResolvedValue({
      riskScore: 22,
      riskBand: 'low',
    });

    const result = await service.reviewDriverLicenceVerification(
      'tenant_1',
      'driver_1',
      { decision: 'approved', notes: 'Manual check completed.' },
      'user_1',
    );

    expect(intelligenceClient.resolveDriverLicenceEvidenceReview).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: 'person_1',
        reviewCaseId: 'review_1',
        decision: 'approved',
      }),
    );
    expect(notificationsService.notifyDriverLicenceReviewResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        decision: 'approved',
      }),
    );
    expect(result?.reviewDecision).toBe('approved');
    expect(result?.status).toBe('verified');
  });

  it('marks a guarantor as disconnected instead of deleting the record', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      identityStatus: 'verified',
    });
    prisma.driverGuarantor.findUnique.mockResolvedValue({
      id: 'guarantor_1',
      driverId: 'driver_1',
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
            fullAddress: '12 Marina Road, Lagos',
            localGovernmentArea: 'Eti-Osa',
            birthState: 'Anambra',
            nextOfKinState: 'Imo',
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
