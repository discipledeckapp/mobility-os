import { Injectable, ServiceUnavailableException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';

interface InitLivenessSessionInput {
  tenantId: string;
  countryCode: string;
}

interface ResolveEnrollmentInput {
  tenantId: string;
  countryCode?: string;
  /** 'driver' | 'guarantor' — controls role-aware presence recording. */
  roleType?: 'driver' | 'guarantor';
  association?: {
    localEntityType: string;
    localEntityId: string;
    roleType: 'driver' | 'guarantor' | 'owner' | 'admin';
    businessEntityId?: string;
    operatingUnitId?: string;
    fleetId?: string;
    status?: string;
    source?: string;
  };
  livenessPassed?: boolean;
  identifiers?: Array<{
    type: string;
    value: string;
    countryCode?: string;
  }>;
  biometric?: {
    modality: string;
    embeddingBase64: string;
    qualityScore: number;
  };
  providerVerification?: {
    subjectConsent?: boolean;
    validationData?: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
    };
    selfieImageBase64?: string;
    selfieImageUrl?: string;
    livenessCheck?: {
      provider?: string;
      sessionId?: string;
      passed?: boolean;
      confidenceScore?: number;
    };
  };
}

interface LivenessSessionResult {
  providerName: string;
  sessionId: string;
  expiresAt?: string;
  /** Provider-issued client auth token (azure_face authToken, smile_identity web token, etc.) */
  clientAuthToken?: string;
  fallbackChain: string[];
}

interface LivenessReadinessResult {
  countryCode: string;
  ready: boolean;
  status: 'ready' | 'misconfigured' | 'temporarily_unavailable' | 'unsupported_country';
  activeProvider?: string;
  configuredProviders: string[];
  checkedAt: string;
  message: string;
}

interface MatchingResult {
  decision: string;
  personId?: string;
  globalPersonCode?: string;
  reviewCaseId?: string;
  providerLookupStatus?: string;
  providerVerificationStatus?: string;
  providerName?: string;
  matchedIdentifierType?: string;
  isVerifiedMatch?: boolean;
  verifiedProfile?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    fullAddress?: string;
    addressLine?: string;
    town?: string;
    localGovernmentArea?: string;
    state?: string;
    mobileNumber?: string;
    emailAddress?: string;
    birthState?: string;
    birthLga?: string;
    nextOfKinState?: string;
    religion?: string;
    ninIdNumber?: string;
    gender?: string;
    photoUrl?: string;
    signatureUrl?: string;
    providerImageUrl?: string;
    selfieImageUrl?: string;
  };
  verificationMetadata?: {
    validity?: 'valid' | 'invalid' | 'unknown';
    issueDate?: string;
    expiryDate?: string;
    portraitAvailable?: boolean;
    matchScore?: number;
    riskScore?: number;
  };
  globalRiskScore?: number;
  riskBand?: string;
  isWatchlisted?: boolean;
  hasDuplicateIdentityFlag?: boolean;
  fraudIndicatorCount?: number;
  verificationConfidence?: number;
  livenessPassed?: boolean;
  livenessProviderName?: string;
  livenessConfidenceScore?: number;
  livenessReason?: string;
  /** True when the enrolled subject holds both driver and guarantor roles at the same tenant. */
  crossRoleConflict?: boolean;
  providerAudit?: Record<string, unknown>;
}

interface PersonRolePresence {
  isDriver: boolean;
  isGuarantor: boolean;
  tenantCount: number;
  hasMultiTenantPresence: boolean;
  hasMultiRolePresence: boolean;
}

interface SecondaryIdentityEvidenceResult {
  reviewCaseId: string | null;
  riskScore: number;
  riskBand: string;
}

@Injectable()
export class IntelligenceClient {
  constructor(private readonly configService: ConfigService) {}

  private async parseJsonSafely<T>(response: Response): Promise<T | null> {
    const text = await response.text().catch(() => '');
    if (!text.trim()) {
      return null;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }

  private toServiceUnavailableMessage(
    status: number,
    payload: { message?: string | string[]; error?: string } | null,
  ): string {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : (payload?.message ?? payload?.error ?? null);

    if (status >= 500) {
      return 'Identity verification is temporarily unavailable. Please try again.';
    }

    if (message) {
      return message;
    }

    return `Intelligence service returned status ${status}`;
  }

  async initializeLivenessSession(input: InitLivenessSessionInput): Promise<LivenessSessionResult> {
    return this.post<LivenessSessionResult>('/api/v1/internal/matching/liveness-sessions', input);
  }

  async getLivenessReadiness(input: { countryCode: string }): Promise<LivenessReadinessResult> {
    return this.post<LivenessReadinessResult>(
      '/api/v1/internal/matching/liveness-readiness',
      input,
    );
  }

  async resolveEnrollment(input: ResolveEnrollmentInput): Promise<MatchingResult> {
    return this.post<MatchingResult>('/api/v1/internal/matching/enrollments', input);
  }

  async queryPersonRisk(personId: string): Promise<{
    globalRiskScore?: number;
    riskBand?: string;
    isWatchlisted?: boolean;
    hasDuplicateIdentityFlag?: boolean;
    verificationConfidence?: number;
    verificationStatus?: string;
    verificationProvider?: string;
    verificationCountryCode?: string;
    reverificationRequired?: boolean;
    reverificationReason?: string | null;
  }> {
    return this.get<{
      globalRiskScore?: number;
      riskBand?: string;
      isWatchlisted?: boolean;
      hasDuplicateIdentityFlag?: boolean;
      verificationConfidence?: number;
      verificationStatus?: string;
      verificationProvider?: string;
      verificationCountryCode?: string;
      reverificationRequired?: boolean;
      reverificationReason?: string | null;
    }>(`/api/v1/query/persons/${personId}`);
  }

  async queryPersonRolePresence(personId: string): Promise<PersonRolePresence> {
    return this.get<PersonRolePresence>(`/api/v1/query/persons/${personId}/role-presence`);
  }

  // Lightweight document ID verification — sends a single identifier to the provider
  // without triggering a full biometric enrollment.  Used for the zero-trust document
  // verification step where the driver submits a document type + ID number.
  async verifyDocumentIdentifier(input: {
    tenantId: string;
    countryCode: string;
    identifierType: string;
    identifierValue: string;
    validationData?: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      dateOfBirth?: string;
      gender?: string;
    };
    selfieImageBase64?: string;
    selfieImageUrl?: string;
  }): Promise<MatchingResult> {
    return this.post<MatchingResult>('/api/v1/internal/matching/enrollments', {
      tenantId: input.tenantId,
      countryCode: input.countryCode,
      identifiers: [
        {
          type: input.identifierType,
          value: input.identifierValue,
          countryCode: input.countryCode,
        },
      ],
      ...(input.validationData
        ? {
            providerVerification: {
              subjectConsent: true,
              validationData: input.validationData,
              ...(input.selfieImageBase64 ? { selfieImageBase64: input.selfieImageBase64 } : {}),
              ...(input.selfieImageUrl ? { selfieImageUrl: input.selfieImageUrl } : {}),
            },
          }
        : {}),
    });
  }

  async retireBiometricAssetUrls(urls: string[]): Promise<{ affectedPeople: number }> {
    return this.post<{ affectedPeople: number }>(
      '/api/v1/internal/persons/retire-biometric-assets',
      {
        urls,
      },
    );
  }

  async recordDriverLicenceEvidence(input: {
    personId: string;
    tenantId: string;
    driverId: string;
    linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
    providerName?: string;
    providerReference?: string | null;
    validity?: string | null;
    issueDate?: string | null;
    expiryDate?: string | null;
    demographicMatchScore?: number | null;
    biometricMatchScore?: number | null;
    overallLinkageScore?: number | null;
    linkageReasons?: string[];
    manualReviewRequired: boolean;
    evidence?: Record<string, unknown>;
  }): Promise<SecondaryIdentityEvidenceResult> {
    return this.post<SecondaryIdentityEvidenceResult>(
      '/api/v1/internal/persons/secondary-identity-evidence',
      {
        personId: input.personId,
        tenantId: input.tenantId,
        driverId: input.driverId,
        linkageDecision: input.linkageDecision,
        ...(input.providerName ? { providerName: input.providerName } : {}),
        ...(input.providerReference ? { providerReference: input.providerReference } : {}),
        ...(input.validity ? { validity: input.validity } : {}),
        ...(input.issueDate ? { issueDate: input.issueDate } : {}),
        ...(input.expiryDate ? { expiryDate: input.expiryDate } : {}),
        ...(input.demographicMatchScore !== null && input.demographicMatchScore !== undefined
          ? { demographicMatchScore: input.demographicMatchScore }
          : {}),
        ...(input.biometricMatchScore !== null && input.biometricMatchScore !== undefined
          ? { biometricMatchScore: input.biometricMatchScore }
          : {}),
        ...(input.overallLinkageScore !== null && input.overallLinkageScore !== undefined
          ? { overallLinkageScore: input.overallLinkageScore }
          : {}),
        ...(input.linkageReasons?.length ? { linkageReasons: input.linkageReasons } : {}),
        manualReviewRequired: input.manualReviewRequired,
        ...(input.evidence ? { evidence: input.evidence } : {}),
      },
    );
  }

  async resolveDriverLicenceEvidenceReview(input: {
    personId: string;
    reviewCaseId: string;
    decision: 'approved' | 'rejected' | 'request_reverification';
    reviewerId: string;
    reviewerRole: string;
    notes?: string;
    evidenceSnapshot?: Record<string, unknown>;
  }): Promise<SecondaryIdentityEvidenceResult> {
    return this.post<SecondaryIdentityEvidenceResult>(
      '/api/v1/internal/persons/secondary-identity-evidence/review',
      {
        personId: input.personId,
        reviewCaseId: input.reviewCaseId,
        decision: input.decision,
        reviewerId: input.reviewerId,
        reviewerRole: input.reviewerRole,
        ...(input.notes ? { notes: input.notes } : {}),
        ...(input.evidenceSnapshot ? { evidenceSnapshot: input.evidenceSnapshot } : {}),
      },
    );
  }

  private async get<T>(path: string): Promise<T> {
    const baseUrl = this.configService.get<string>('INTELLIGENCE_API_URL');
    const apiKey = this.configService.get<string>('INTELLIGENCE_API_KEY');

    if (!baseUrl || !apiKey) {
      throw new ServiceUnavailableException('Intelligence service integration is not configured');
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'x-caller-service': 'api-core',
        },
      });
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error
          ? `Intelligence service request failed: ${error.message}`
          : 'Intelligence service request failed',
      );
    }

    const payload = await this.parseJsonSafely<T & { message?: string | string[]; error?: string }>(
      response,
    );

    if (!response.ok) {
      throw new ServiceUnavailableException(
        this.toServiceUnavailableMessage(response.status, payload),
      );
    }

    if (!payload) {
      throw new ServiceUnavailableException(
        'Identity verification is temporarily unavailable. Please try again.',
      );
    }

    return payload as T;
  }

  private async post<T>(path: string, body: object): Promise<T> {
    const baseUrl = this.configService.get<string>('INTELLIGENCE_API_URL');
    const apiKey = this.configService.get<string>('INTELLIGENCE_API_KEY');

    if (!baseUrl || !apiKey) {
      throw new ServiceUnavailableException('Intelligence service integration is not configured');
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'x-caller-service': 'api-core',
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error
          ? `Intelligence service request failed: ${error.message}`
          : 'Intelligence service request failed',
      );
    }

    const payload = await this.parseJsonSafely<T & { message?: string | string[]; error?: string }>(
      response,
    );

    if (!response.ok) {
      throw new ServiceUnavailableException(
        this.toServiceUnavailableMessage(response.status, payload),
      );
    }

    if (!payload) {
      throw new ServiceUnavailableException(
        'Identity verification is temporarily unavailable. Please try again.',
      );
    }

    return payload as T;
  }
}
