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
  fallbackChain: string[];
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
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    photoUrl?: string;
    providerImageUrl?: string;
    selfieImageUrl?: string;
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
}

interface PersonRolePresence {
  isDriver: boolean;
  isGuarantor: boolean;
  tenantCount: number;
  hasMultiTenantPresence: boolean;
  hasMultiRolePresence: boolean;
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
      : payload?.message ?? payload?.error ?? null;

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
      lastName?: string;
      dateOfBirth?: string;
    };
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
            },
          }
        : {}),
    });
  }

  async retireBiometricAssetUrls(urls: string[]): Promise<{ affectedPeople: number }> {
    return this.post<{ affectedPeople: number }>('/api/v1/internal/persons/retire-biometric-assets', {
      urls,
    });
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
