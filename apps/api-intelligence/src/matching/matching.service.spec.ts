import { ResolutionDecision } from '@mobility-os/intelligence-domain';
import { BadRequestException } from '@nestjs/common';
import { MatchingService } from './matching.service';

describe('MatchingService', () => {
  const prisma = {
    intelPersonIdentifier: {
      findMany: jest.fn(),
    },
  };

  const personsService = {
    create: jest.fn(),
    setDuplicateFlag: jest.fn(),
    recordTenantPresence: jest.fn(),
    ensureGlobalPersonCode: jest.fn(),
    queryForTenant: jest.fn(),
    applyIdentityEnrichment: jest.fn(),
  };

  const identifiersService = {
    addIdentifier: jest.fn(),
  };

  const biometricsService = {
    findExactConflict: jest.fn(),
    enroll: jest.fn(),
  };

  const linkageEventsService = {
    record: jest.fn(),
  };

  const identityVerificationService = {
    verifyForEnrollment: jest.fn(),
  };

  const livenessService = {
    initializeSession: jest.fn(),
  };

  const reviewCasesService = {
    create: jest.fn(),
  };

  let service: MatchingService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new MatchingService(
      prisma as never,
      personsService as never,
      identifiersService as never,
      biometricsService as never,
      linkageEventsService as never,
      identityVerificationService as never,
      livenessService as never,
      reviewCasesService as never,
    );

    identityVerificationService.verifyForEnrollment.mockResolvedValue({
      attempted: false,
      fallbackChain: [],
      reason: 'country code not provided',
    });
    personsService.recordTenantPresence.mockResolvedValue({
      crossRoleConflict: false,
    });
    personsService.ensureGlobalPersonCode.mockResolvedValue({
      globalPersonCode: 'GP-0001',
    });
  });

  it('throws when enrollment has neither identifiers nor biometric', async () => {
    await expect(service.resolveEnrollment({ tenantId: 'tenant_1' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('initializes a liveness session through the provider orchestrator', async () => {
    livenessService.initializeSession.mockResolvedValue({
      providerName: 'youverify',
      sessionId: 'yv-session-1',
      expiresAt: '2026-03-19T12:00:00.000Z',
      fallbackChain: ['amazon_rekognition:provider_unavailable', 'youverify:initialized'],
    });

    const result = await service.initializeLivenessSession({
      tenantId: 'tenant_1',
      countryCode: 'NG',
    });

    expect(livenessService.initializeSession).toHaveBeenCalledWith({
      tenantId: 'tenant_1',
      countryCode: 'NG',
    });
    expect(result).toEqual({
      providerName: 'youverify',
      sessionId: 'yv-session-1',
      expiresAt: '2026-03-19T12:00:00.000Z',
      fallbackChain: ['amazon_rekognition:provider_unavailable', 'youverify:initialized'],
    });
  });

  it('returns new_person when no existing candidate is found', async () => {
    prisma.intelPersonIdentifier.findMany.mockResolvedValue([]);
    personsService.create.mockResolvedValue({ id: 'person_new' });
    personsService.queryForTenant.mockResolvedValue({
      personId: 'person_new',
      globalRiskScore: 0,
      riskBand: 'low',
      isWatchlisted: false,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 0,
      verificationConfidence: 0,
    });

    const result = await service.resolveEnrollment({
      tenantId: 'tenant_1',
      identifiers: [{ type: 'EMAIL', value: 'driver@example.com' }],
    });

    expect(result).toEqual({
      decision: ResolutionDecision.NewPerson,
      personId: 'person_new',
      isVerifiedMatch: false,
      globalRiskScore: 0,
      riskBand: 'low',
      isWatchlisted: false,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 0,
      verificationConfidence: 0,
    });
    expect(personsService.create).toHaveBeenCalledTimes(1);
    expect(identifiersService.addIdentifier).toHaveBeenCalledWith({
      personId: 'person_new',
      type: 'EMAIL',
      value: 'driver@example.com',
    });
    expect(personsService.recordTenantPresence).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: 'person_new',
        tenantId: 'tenant_1',
        roleType: 'driver',
        localEntityType: 'driver',
      }),
    );
    expect(linkageEventsService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: 'person_new',
        eventType: 'manual_linked',
      }),
    );
    expect(personsService.applyIdentityEnrichment).not.toHaveBeenCalled();
  });

  it('returns auto_linked when exactly one existing candidate is found', async () => {
    prisma.intelPersonIdentifier.findMany.mockResolvedValue([
      {
        id: 'identifier_1',
        personId: 'person_existing',
        type: 'EMAIL',
        value: 'driver@example.com',
      },
    ]);
    personsService.queryForTenant.mockResolvedValue({
      personId: 'person_existing',
      globalRiskScore: 12,
      riskBand: 'low',
      isWatchlisted: true,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 1,
      verificationConfidence: 0.91,
    });

    const result = await service.resolveEnrollment({
      tenantId: 'tenant_1',
      identifiers: [{ type: 'EMAIL', value: 'driver@example.com' }],
    });

    expect(result).toEqual({
      decision: ResolutionDecision.AutoLinked,
      personId: 'person_existing',
      isVerifiedMatch: false,
      globalRiskScore: 12,
      riskBand: 'low',
      isWatchlisted: true,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 1,
      verificationConfidence: 0.91,
    });
    expect(personsService.create).not.toHaveBeenCalled();
    expect(identifiersService.addIdentifier).not.toHaveBeenCalled();
    expect(personsService.recordTenantPresence).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: 'person_existing',
        tenantId: 'tenant_1',
        roleType: 'driver',
        localEntityType: 'driver',
      }),
    );
    expect(linkageEventsService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: 'person_existing',
        eventType: 'auto_linked',
        confidenceScore: 0.95,
      }),
    );
    expect(personsService.applyIdentityEnrichment).not.toHaveBeenCalled();
  });

  it('anchors same-person recognition on NIN even when email and phone change', async () => {
    prisma.intelPersonIdentifier.findMany.mockResolvedValue([
      {
        id: 'identifier_nin_1',
        personId: 'person_existing',
        type: 'NATIONAL_ID',
        value: '11111111111',
      },
    ]);
    personsService.queryForTenant.mockResolvedValue({
      personId: 'person_existing',
      globalRiskScore: 8,
      riskBand: 'low',
      isWatchlisted: false,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 0,
      verificationConfidence: 0.95,
    });

    const result = await service.resolveEnrollment({
      tenantId: 'tenant_1',
      identifiers: [
        { type: 'NATIONAL_ID', value: '11111111111', countryCode: 'NG' },
        { type: 'EMAIL', value: 'new-driver@example.com' },
        { type: 'PHONE', value: '+2348099999999' },
      ],
    });

    expect(result).toEqual(
      expect.objectContaining({
        decision: ResolutionDecision.AutoLinked,
        personId: 'person_existing',
      }),
    );
    expect(personsService.create).not.toHaveBeenCalled();
    expect(personsService.recordTenantPresence).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: 'person_existing',
        tenantId: 'tenant_1',
        roleType: 'driver',
      }),
    );
    expect(identifiersService.addIdentifier).toHaveBeenCalledWith({
      personId: 'person_existing',
      type: 'EMAIL',
      value: 'new-driver@example.com',
    });
    expect(identifiersService.addIdentifier).toHaveBeenCalledWith({
      personId: 'person_existing',
      type: 'PHONE',
      value: '+2348099999999',
    });
  });

  it('returns review_required when identifiers match multiple persons', async () => {
    prisma.intelPersonIdentifier.findMany.mockResolvedValue([
      {
        id: 'identifier_1',
        personId: 'person_a',
        type: 'PHONE',
        value: '+2348000000001',
      },
      {
        id: 'identifier_2',
        personId: 'person_b',
        type: 'EMAIL',
        value: 'driver@example.com',
      },
    ]);
    reviewCasesService.create.mockResolvedValue({ id: 'review_case_1' });

    const result = await service.resolveEnrollment({
      tenantId: 'tenant_1',
      identifiers: [
        { type: 'PHONE', value: '+2348000000001' },
        { type: 'EMAIL', value: 'driver@example.com' },
      ],
    });

    expect(result).toEqual({
      decision: ResolutionDecision.ReviewRequired,
      reviewCaseId: 'review_case_1',
    });
    expect(personsService.setDuplicateFlag).toHaveBeenCalledWith('person_a', true);
    expect(personsService.setDuplicateFlag).toHaveBeenCalledWith('person_b', true);
    expect(linkageEventsService.record).not.toHaveBeenCalled();
  });

  it('requires manual review when the same NIN resolves to multiple canonical persons', async () => {
    prisma.intelPersonIdentifier.findMany.mockResolvedValue([
      {
        id: 'identifier_nin_a',
        personId: 'person_a',
        type: 'NATIONAL_ID',
        value: '11111111111',
      },
      {
        id: 'identifier_nin_b',
        personId: 'person_b',
        type: 'NATIONAL_ID',
        value: '11111111111',
      },
    ]);
    reviewCasesService.create.mockResolvedValue({ id: 'review_case_nin_1' });

    const result = await service.resolveEnrollment({
      tenantId: 'tenant_1',
      countryCode: 'NG',
      identifiers: [{ type: 'NATIONAL_ID', value: '11111111111', countryCode: 'NG' }],
    });

    expect(result).toEqual({
      decision: ResolutionDecision.ReviewRequired,
      reviewCaseId: 'review_case_nin_1',
    });
    expect(reviewCasesService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        evidence: expect.objectContaining({
          conflictType: 'ambiguous_identifier_match',
          candidatePersonIds: ['person_a', 'person_b'],
        }),
      }),
    );
    expect(personsService.setDuplicateFlag).toHaveBeenCalledWith('person_a', true);
    expect(personsService.setDuplicateFlag).toHaveBeenCalledWith('person_b', true);
  });

  it('returns review_required when a biometric conflict is found', async () => {
    prisma.intelPersonIdentifier.findMany.mockResolvedValue([
      {
        id: 'identifier_1',
        personId: 'person_existing',
        type: 'EMAIL',
        value: 'driver@example.com',
      },
    ]);
    biometricsService.findExactConflict.mockResolvedValue({
      personId: 'person_conflict',
      biometricProfileId: 'bio_1',
    });
    reviewCasesService.create.mockResolvedValue({ id: 'review_case_bio' });

    const result = await service.resolveEnrollment({
      tenantId: 'tenant_1',
      identifiers: [{ type: 'EMAIL', value: 'driver@example.com' }],
      biometric: {
        modality: 'face',
        embeddingBase64: Buffer.from('embedding').toString('base64'),
        qualityScore: 0.99,
      },
    });

    expect(result).toEqual({
      decision: ResolutionDecision.ReviewRequired,
      reviewCaseId: 'review_case_bio',
    });
    expect(personsService.setDuplicateFlag).toHaveBeenCalledWith('person_existing', true);
    expect(personsService.setDuplicateFlag).toHaveBeenCalledWith('person_conflict', true);
    expect(biometricsService.enroll).not.toHaveBeenCalled();
    expect(linkageEventsService.record).not.toHaveBeenCalled();
  });

  it('persists normalized provider enrichment on verified lookup', async () => {
    prisma.intelPersonIdentifier.findMany.mockResolvedValue([]);
    personsService.create.mockResolvedValue({ id: 'person_new' });
    personsService.queryForTenant.mockResolvedValue({
      personId: 'person_new',
      globalRiskScore: 0,
      riskBand: 'low',
      isWatchlisted: false,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 0,
      verificationConfidence: 0.95,
    });
    identityVerificationService.verifyForEnrollment.mockResolvedValue({
      attempted: true,
      fallbackChain: ['youverify:verified'],
      verification: {
        status: 'verified',
        providerName: 'youverify',
        verificationStatus: 'success',
        matchedIdentifierType: 'NATIONAL_ID',
        enrichment: {
          fullName: 'Ada Okafor',
          dateOfBirth: '1992-10-03',
          address: '12 Marina, Lagos',
          gender: 'female',
          photoUrl: 'https://example.com/photo.jpg',
        },
      },
    });

    const result = await service.resolveEnrollment({
      tenantId: 'tenant_1',
      countryCode: 'NG',
      livenessPassed: true,
      identifiers: [{ type: 'NATIONAL_ID', value: '12345678901' }],
    });

    expect(result).toEqual(
      expect.objectContaining({
        decision: ResolutionDecision.NewPerson,
        personId: 'person_new',
        providerLookupStatus: 'verified',
        providerVerificationStatus: 'success',
        isVerifiedMatch: true,
      }),
    );

    expect(personsService.applyIdentityEnrichment).toHaveBeenCalledWith({
      personId: 'person_new',
      tenantId: 'tenant_1',
      source: 'verified_enrollment',
      fullName: 'Ada Okafor',
      dateOfBirth: '1992-10-03',
      address: '12 Marina, Lagos',
      gender: 'female',
      photoUrl: 'https://example.com/photo.jpg',
      providerImageUrl: 'https://example.com/photo.jpg',
      verificationStatus: 'success',
      verificationProvider: 'youverify',
      verificationCountryCode: 'NG',
      verificationConfidence: 0.95,
    });
  });
});
