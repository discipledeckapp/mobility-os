import { IdentifierType, ResolutionDecision } from '@mobility-os/intelligence-domain';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BiometricsService } from '../biometrics/biometrics.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { IdentifiersService } from '../identifiers/identifiers.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { LinkageEventsService } from '../linkage-events/linkage-events.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PersonsService } from '../persons/persons.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { IdentityVerificationService } from '../providers/identity-verification.service';
import type { VerifyEnrollmentIdentityOutput } from '../providers/identity-verification.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { LivenessService } from '../providers/liveness.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ReviewCasesService } from '../review-cases/review-cases.service';
import type { InitLivenessSessionDto } from './dto/init-liveness-session.dto';
import type { LivenessReadinessResponseDto } from './dto/liveness-readiness-response.dto';
import type { LivenessReadinessDto } from './dto/liveness-readiness.dto';
import type { LivenessSessionResponseDto } from './dto/liveness-session-response.dto';
import type { MatchingResultDto } from './dto/matching-result.dto';
import type { EnrollmentIdentifierDto, ResolveEnrollmentDto } from './dto/resolve-enrollment.dto';

interface NormalizedIdentifier {
  type: string;
  value: string;
  countryCode?: string;
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildLocalFallbackPersonId(
  identifiers: NormalizedIdentifier[],
  countryCode?: string,
): string | undefined {
  const primaryIdentifier = identifiers.find((identifier) =>
    ['NATIONAL_ID', 'DRIVERS_LICENSE', 'PASSPORT', 'BANK_ID', 'TAX_ID'].includes(identifier.type),
  );

  if (!primaryIdentifier) {
    return undefined;
  }

  const normalizedCountry = (primaryIdentifier.countryCode ?? countryCode ?? 'XX').toUpperCase();
  const normalizedType = primaryIdentifier.type.trim().toUpperCase();
  const normalizedValue = primaryIdentifier.value.trim().toUpperCase();
  return `local:${normalizedCountry}:${normalizedType}:${normalizedValue}`;
}

function summarizeImageValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value.startsWith('data:image/')) {
    return '[inline image omitted]';
  }

  if (value.length > 512) {
    return '[large image reference omitted]';
  }

  return value;
}

function buildSafeProviderEnrichmentMetadata(
  enrichment: NonNullable<
    Awaited<ReturnType<IdentityVerificationService['verifyForEnrollment']>>['verification']
  >['enrichment'],
): Record<string, unknown> | null {
  if (!enrichment) {
    return null;
  }

  return {
    ...enrichment,
    ...(Object.prototype.hasOwnProperty.call(enrichment, 'photoUrl')
      ? {
          photoUrl: summarizeImageValue(enrichment.photoUrl),
          photoAvailable: Boolean(enrichment.photoUrl),
        }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(enrichment, 'signatureUrl')
      ? {
          signatureUrl: summarizeImageValue(enrichment.signatureUrl),
          signatureAvailable: Boolean(enrichment.signatureUrl),
        }
      : {}),
  };
}

function isSuccessfulVerificationMessage(status?: string): boolean {
  if (!status) {
    return false;
  }

  const normalized = status.trim().toLowerCase().replace(/\s+/g, '_');
  return (
    normalized === 'success' ||
    normalized === 'successful_match' ||
    normalized === 'verified' ||
    normalized === 'match_found' ||
    normalized === 'found'
  );
}

type EnrollmentPostProcessingResult = {
  globalPersonCode?: string;
  crossRoleConflict: boolean;
  intelligenceResult: Partial<MatchingResultDto>;
};

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly personsService: PersonsService,
    private readonly identifiersService: IdentifiersService,
    private readonly biometricsService: BiometricsService,
    private readonly linkageEventsService: LinkageEventsService,
    private readonly identityVerificationService: IdentityVerificationService,
    private readonly livenessService: LivenessService,
    private readonly reviewCasesService: ReviewCasesService,
  ) {}

  initializeLivenessSession(dto: InitLivenessSessionDto): Promise<LivenessSessionResponseDto> {
    return this.livenessService.initializeSession({
      tenantId: dto.tenantId,
      countryCode: dto.countryCode,
    });
  }

  getLivenessReadiness(dto: LivenessReadinessDto): Promise<LivenessReadinessResponseDto> {
    return this.livenessService.getReadiness(dto.countryCode);
  }

  async resolveEnrollment(dto: ResolveEnrollmentDto): Promise<MatchingResultDto> {
    this.logger.log(
      JSON.stringify({
        event: 'enrollment_resolve_start',
        tenantId: dto.tenantId,
        countryCode: dto.countryCode ?? null,
        identifierCount: dto.identifiers?.length ?? 0,
        identifierTypes: (dto.identifiers ?? []).map((i) => i.type),
        hasBiometric: Boolean(dto.biometric),
        hasSelfie: Boolean(dto.providerVerification?.selfieImageBase64),
        hasLivenessEvidence: Boolean(dto.providerVerification?.livenessCheck?.sessionId),
        livenessProvider: dto.providerVerification?.livenessCheck?.provider ?? null,
      }),
    );

    if ((!dto.identifiers || dto.identifiers.length === 0) && !dto.biometric) {
      throw new BadRequestException(
        'Enrollment requires at least one identifier or one biometric payload',
      );
    }

    const normalizedIdentifiers = (dto.identifiers ?? []).map((identifier) =>
      this.normalizeIdentifier(identifier),
    );

    try {
      return await this.resolveEnrollmentWithPersonGraph(dto, normalizedIdentifiers);
    } catch (error) {
      if (this.shouldUseLocalVerificationFallback(error, dto)) {
        this.logger.warn(
          JSON.stringify({
            event: 'enrollment_local_fallback_activated',
            tenantId: dto.tenantId,
            countryCode: dto.countryCode ?? null,
            error: error instanceof Error ? error.message : 'unknown_error',
          }),
        );

        return this.resolveEnrollmentWithoutPersonGraph(dto, normalizedIdentifiers);
      }

      throw error;
    }
  }

  private async resolveEnrollmentWithPersonGraph(
    dto: ResolveEnrollmentDto,
    normalizedIdentifiers: NormalizedIdentifier[],
  ): Promise<MatchingResultDto> {
    const existingMatches = await this.findExistingIdentifierMatches(normalizedIdentifiers);
    const candidatePersonIds = [...new Set(existingMatches.map((m) => m.personId))];

    if (candidatePersonIds.length > 1) {
      const [firstCandidatePersonId] = candidatePersonIds;
      if (!firstCandidatePersonId) {
        throw new Error('Expected at least one candidate person ID for ambiguous identifier match');
      }

      const reviewCase = await this.reviewCasesService.create({
        personId: firstCandidatePersonId,
        confidenceScore: 0.9,
        evidence: {
          conflictType: 'ambiguous_identifier_match',
          tenantId: dto.tenantId,
          candidatePersonIds,
          identifiers: normalizedIdentifiers.map((identifier) => ({
            type: identifier.type,
            value: identifier.value,
            countryCode: identifier.countryCode ?? null,
          })),
        },
        notes:
          'Submitted enrollment matched identifiers across multiple canonical persons. ' +
          'Manual adjudication required.',
      });

      await Promise.all(
        candidatePersonIds.map((personId) => this.personsService.setDuplicateFlag(personId, true)),
      );

      return {
        decision: ResolutionDecision.ReviewRequired,
        reviewCaseId: reviewCase.id,
      };
    }

    let personId = candidatePersonIds[0];
    let decision = ResolutionDecision.AutoLinked;

    if (dto.biometric) {
      const biometricConflict = await this.biometricsService.findExactConflict(
        dto.biometric.modality,
        Buffer.from(dto.biometric.embeddingBase64, 'base64'),
        personId,
      );

      if (biometricConflict) {
        const reviewCase = await this.reviewCasesService.create({
          personId: personId ?? biometricConflict.personId,
          confidenceScore: 0.99,
          evidence: {
            conflictType: 'biometric_conflict',
            tenantId: dto.tenantId,
            modality: dto.biometric.modality,
            candidatePersonId: personId ?? null,
            conflictingPersonId: biometricConflict.personId,
            conflictingBiometricProfileId: biometricConflict.biometricProfileId,
          },
          notes:
            'Submitted enrollment produced an exact biometric conflict. ' +
            'Manual adjudication required.',
        });

        await Promise.all(
          [
            ...new Set(
              [personId, biometricConflict.personId].filter(
                (matchedPersonId): matchedPersonId is string => Boolean(matchedPersonId),
              ),
            ),
          ].map((matchedPersonId) => this.personsService.setDuplicateFlag(matchedPersonId, true)),
        );

        return {
          decision: ResolutionDecision.ReviewRequired,
          reviewCaseId: reviewCase.id,
        };
      }
    }

    if (!personId) {
      const person = await this.personsService.create({});
      personId = person.id;
      decision = ResolutionDecision.NewPerson;
      await this.linkageEventsService.record({
        personId,
        eventType: 'person_created',
        actor: 'system',
        reason: 'new canonical person created during enrollment',
        metadata: {
          tenantId: dto.tenantId,
          roleType: dto.roleType ?? 'driver',
        },
      });
    }

    const providerVerification = await this.identityVerificationService.verifyForEnrollment({
      tenantId: dto.tenantId,
      identifiers: normalizedIdentifiers,
      ...(dto.countryCode ? { countryCode: dto.countryCode } : {}),
      ...(dto.livenessPassed !== undefined ? { livenessPassed: dto.livenessPassed } : {}),
      ...(dto.providerVerification ? { providerVerification: dto.providerVerification } : {}),
    });

    const verification = providerVerification.verification;
    const liveness = providerVerification.liveness;
    const isVerifiedMatch =
      verification?.status === 'verified' &&
      isSuccessfulVerificationMessage(verification.verificationStatus);
    const verificationMetadata = verification
      ? this.buildVerificationMetadata(verification, liveness)
      : undefined;

    const { globalPersonCode, crossRoleConflict, intelligenceResult } =
      await this.runEnrollmentPostProcessing({
        dto,
        personId,
        isVerifiedMatch,
        verification,
        providerVerification,
        existingMatches,
        normalizedIdentifiers,
        decision,
      });

    this.logger.log(
      JSON.stringify({
        event: 'enrollment_resolve_complete',
        tenantId: dto.tenantId,
        personId: personId ?? null,
        decision,
        isVerifiedMatch,
        providerLookupStatus: verification?.status ?? null,
        providerName: verification?.providerName ?? null,
        hasEnrichedProfile: Boolean(verification?.enrichment?.fullName),
        portraitAvailable: verification?.documentMetadata?.portraitAvailable ?? false,
        livenessPassed: liveness?.passed ?? null,
        livenessProvider: liveness?.providerName ?? null,
        livenessReason: liveness?.reason ?? null,
        crossRoleConflict: crossRoleConflict ?? false,
      }),
    );

    return {
      decision,
      personId,
      ...(globalPersonCode ? { globalPersonCode } : {}),
      ...(verification?.status ? { providerLookupStatus: verification.status } : {}),
      ...(verification?.verificationStatus
        ? { providerVerificationStatus: verification.verificationStatus }
        : {}),
      ...(verification?.providerName ? { providerName: verification.providerName } : {}),
      ...(verification?.matchedIdentifierType
        ? { matchedIdentifierType: verification.matchedIdentifierType }
        : {}),
      isVerifiedMatch,
      ...(liveness ? { livenessPassed: liveness.passed } : {}),
      ...(liveness?.providerName ? { livenessProviderName: liveness.providerName } : {}),
      ...(liveness?.confidenceScore !== undefined
        ? { livenessConfidenceScore: liveness.confidenceScore }
        : {}),
      ...(liveness?.reason ? { livenessReason: liveness.reason } : {}),
      ...(verification?.enrichment ? { verifiedProfile: verification.enrichment } : {}),
      ...(verification?.auditData ? { providerAudit: verification.auditData } : {}),
      ...(verificationMetadata ? { verificationMetadata } : {}),
      ...(crossRoleConflict ? { crossRoleConflict: true } : {}),
      ...intelligenceResult,
    };
  }

  private async resolveEnrollmentWithoutPersonGraph(
    dto: ResolveEnrollmentDto,
    normalizedIdentifiers: NormalizedIdentifier[],
  ): Promise<MatchingResultDto> {
    const providerVerification = await this.identityVerificationService.verifyForEnrollment({
      tenantId: dto.tenantId,
      identifiers: normalizedIdentifiers,
      ...(dto.countryCode ? { countryCode: dto.countryCode } : {}),
      ...(dto.livenessPassed !== undefined ? { livenessPassed: dto.livenessPassed } : {}),
      ...(dto.providerVerification ? { providerVerification: dto.providerVerification } : {}),
    });

    const verification = providerVerification.verification;
    const liveness = providerVerification.liveness;
    const isVerifiedMatch =
      verification?.status === 'verified' &&
      isSuccessfulVerificationMessage(verification.verificationStatus);
    const verificationMetadata = verification
      ? this.buildVerificationMetadata(verification, liveness)
      : undefined;

    const decision =
      verification?.status === 'verified'
        ? ResolutionDecision.AutoLinked
        : ResolutionDecision.NewPerson;
    const localFallbackPersonId =
      verification?.status === 'verified'
        ? buildLocalFallbackPersonId(normalizedIdentifiers, dto.countryCode)
        : undefined;

    return {
      decision,
      ...(localFallbackPersonId ? { personId: localFallbackPersonId } : {}),
      ...(verification?.status ? { providerLookupStatus: verification.status } : {}),
      ...(verification?.verificationStatus
        ? { providerVerificationStatus: verification.verificationStatus }
        : {}),
      ...(verification?.providerName ? { providerName: verification.providerName } : {}),
      ...(verification?.matchedIdentifierType
        ? { matchedIdentifierType: verification.matchedIdentifierType }
        : {}),
      isVerifiedMatch,
      ...(liveness ? { livenessPassed: liveness.passed } : {}),
      ...(liveness?.providerName ? { livenessProviderName: liveness.providerName } : {}),
      ...(liveness?.confidenceScore !== undefined
        ? { livenessConfidenceScore: liveness.confidenceScore }
        : {}),
      ...(liveness?.reason ? { livenessReason: liveness.reason } : {}),
      ...(verification?.enrichment ? { verifiedProfile: verification.enrichment } : {}),
      ...(verification?.auditData ? { providerAudit: verification.auditData } : {}),
      ...(verificationMetadata ? { verificationMetadata } : {}),
    };
  }

  private shouldUseLocalVerificationFallback(
    error: unknown,
    dto: ResolveEnrollmentDto,
  ): boolean {
    if (process.env.NODE_ENV === 'production') {
      return false;
    }

    if ((dto.countryCode ?? '').toUpperCase() !== 'NG') {
      return false;
    }

    const message = error instanceof Error ? error.message : String(error);
    return /intel_person_|intel_biometric_|intel_review_case|intel_persons/i.test(message);
  }

  private async runEnrollmentPostProcessing(input: {
    dto: ResolveEnrollmentDto;
    personId: string;
    isVerifiedMatch: boolean;
    verification: VerifyEnrollmentIdentityOutput['verification'];
    providerVerification: VerifyEnrollmentIdentityOutput;
    existingMatches: Array<{ id: string; personId: string; type: string; value: string }>;
    normalizedIdentifiers: NormalizedIdentifier[];
    decision: ResolutionDecision;
  }): Promise<EnrollmentPostProcessingResult> {
    const { dto, personId, isVerifiedMatch, verification, providerVerification } = input;
    let globalPersonCode: string | undefined;
    let crossRoleConflict = false;
    let intelligenceResult: Partial<MatchingResultDto> = {};

    const runStage = async <T>(stage: string, fn: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await fn();
      } catch (error) {
        this.logger.warn(
          JSON.stringify({
            event: 'enrollment_post_processing_failed',
            stage,
            tenantId: dto.tenantId,
            personId,
            error: error instanceof Error ? error.message : 'unknown_error',
          }),
        );
        return fallback;
      }
    };

    await runStage(
      'apply_identity_enrichment',
      async () => {
        if (!verification?.enrichment && !dto.providerVerification?.selfieImageUrl) {
          return null;
        }

        await this.personsService.applyIdentityEnrichment({
          personId,
          ...(isVerifiedMatch && verification?.enrichment?.fullName
            ? { fullName: verification.enrichment.fullName }
            : {}),
          ...(isVerifiedMatch && verification?.enrichment?.dateOfBirth
            ? { dateOfBirth: verification.enrichment.dateOfBirth }
            : {}),
          ...(isVerifiedMatch && verification?.enrichment?.address
            ? { address: verification.enrichment.address }
            : {}),
          ...(isVerifiedMatch && verification?.enrichment?.gender
            ? { gender: verification.enrichment.gender }
            : {}),
          ...(verification?.enrichment?.photoUrl
            ? { photoUrl: verification.enrichment.photoUrl }
            : {}),
          ...(dto.providerVerification?.selfieImageUrl
            ? { selfieImageUrl: dto.providerVerification.selfieImageUrl }
            : {}),
          ...(verification?.enrichment?.photoUrl
            ? { providerImageUrl: verification.enrichment.photoUrl }
            : {}),
          ...(verification?.verificationStatus
            ? { verificationStatus: verification.verificationStatus }
            : {}),
          ...(verification?.providerName
            ? { verificationProvider: verification.providerName }
            : {}),
          ...(dto.countryCode ? { verificationCountryCode: dto.countryCode } : {}),
          ...(dto.tenantId ? { tenantId: dto.tenantId } : {}),
          ...(dto.association?.localEntityType
            ? { localEntityType: dto.association.localEntityType }
            : {}),
          ...(dto.association?.localEntityId
            ? { localEntityId: dto.association.localEntityId }
            : {}),
          source: 'verified_enrollment',
          verificationConfidence: 0.95,
        });
        return null;
      },
      null,
    );

    await runStage(
      'add_identifiers',
      async () => {
        const existingMatchMap = new Map(
          input.existingMatches.map((match) => [
            this.identifierKey(match.type, match.value),
            match.personId,
          ]),
        );

        for (const identifier of input.normalizedIdentifiers) {
          const key = this.identifierKey(identifier.type, identifier.value);
          if (existingMatchMap.get(key) === personId) {
            continue;
          }

          await this.identifiersService.addIdentifier({
            personId,
            type: identifier.type,
            value: identifier.value,
            ...(identifier.countryCode ? { countryCode: identifier.countryCode } : {}),
          });
        }
        return null;
      },
      null,
    );

    await runStage(
      'enroll_biometric',
      async () => {
        if (!dto.biometric) {
          return null;
        }

        await this.biometricsService.enroll({
          personId,
          modality: dto.biometric.modality,
          embeddingBase64: dto.biometric.embeddingBase64,
          qualityScore: dto.biometric.qualityScore,
        });
        return null;
      },
      null,
    );

    const presenceResult = await runStage(
      'record_tenant_presence',
      () =>
        this.personsService.recordTenantPresence({
          personId,
          tenantId: dto.tenantId,
          roleType: dto.association?.roleType ?? dto.roleType ?? 'driver',
          localEntityType: dto.association?.localEntityType ?? dto.roleType ?? 'driver',
          localEntityId:
            dto.association?.localEntityId ?? `${dto.tenantId}:${dto.roleType ?? 'driver'}`,
          ...(dto.association?.businessEntityId
            ? { businessEntityId: dto.association.businessEntityId }
            : {}),
          ...(dto.association?.operatingUnitId
            ? { operatingUnitId: dto.association.operatingUnitId }
            : {}),
          ...(dto.association?.fleetId ? { fleetId: dto.association.fleetId } : {}),
          status: dto.association?.status ?? 'active',
          source: dto.association?.source ?? 'identity_resolution',
          ...(isVerifiedMatch ? { verifiedAt: new Date() } : {}),
        }),
      { crossRoleConflict: false },
    );
    crossRoleConflict = presenceResult.crossRoleConflict;

    if (isVerifiedMatch) {
      const person = await runStage(
        'ensure_global_person_code',
        () => this.personsService.ensureGlobalPersonCode(personId, dto.countryCode),
        null,
      );
      globalPersonCode = person?.globalPersonCode ?? undefined;

      await runStage(
        'record_verified_linkage_event',
        () =>
          this.linkageEventsService.record({
            personId,
            eventType:
              (dto.association?.roleType ?? dto.roleType ?? 'driver') === 'guarantor'
                ? 'linked_to_guarantor'
                : (dto.association?.roleType ?? dto.roleType ?? 'driver') === 'driver'
                  ? 'linked_to_driver'
                  : 'linked_to_owner',
            actor: 'system',
            confidenceScore: 0.95,
            reason: 'verified enrollment linked canonical person to local record',
            metadata: {
              tenantId: dto.tenantId,
              roleType: dto.association?.roleType ?? dto.roleType ?? 'driver',
              localEntityType: dto.association?.localEntityType ?? dto.roleType ?? 'driver',
              localEntityId:
                dto.association?.localEntityId ?? `${dto.tenantId}:${dto.roleType ?? 'driver'}`,
              globalPersonCode,
            },
          }),
        undefined,
      );
    }

    await runStage(
      'record_linkage_event',
      () =>
        this.linkageEventsService.record({
          personId,
          eventType:
            input.decision === ResolutionDecision.NewPerson ? 'manual_linked' : 'auto_linked',
          actor: 'system',
          ...(input.decision === ResolutionDecision.AutoLinked ? { confidenceScore: 0.95 } : {}),
          reason:
            input.decision === ResolutionDecision.NewPerson
              ? 'new canonical person created during enrollment'
              : 'existing canonical person linked during enrollment',
          metadata: {
            tenantId: dto.tenantId,
            countryCode: dto.countryCode ?? null,
            identifierCount: input.normalizedIdentifiers.length,
            biometricSubmitted: dto.biometric !== undefined,
            livenessPassed: dto.livenessPassed ?? null,
            providerVerificationAttempted: providerVerification.attempted,
            providerFallbackChain: providerVerification.fallbackChain,
            providerVerificationStatus:
              providerVerification.verification?.verificationStatus ??
              providerVerification.verification?.status ??
              null,
            providerName: providerVerification.verification?.providerName ?? null,
            providerEnrichment: buildSafeProviderEnrichmentMetadata(
              providerVerification.verification?.enrichment,
            ),
          },
        }),
      undefined,
    );

    intelligenceResult = await runStage<Partial<MatchingResultDto>>(
      'query_tenant_intelligence',
      () => this.personsService.queryForTenant(personId),
      {},
    );

    return {
      ...(globalPersonCode ? { globalPersonCode } : {}),
      crossRoleConflict,
      intelligenceResult,
    };
  }

  private buildVerificationMetadata(
    verification: NonNullable<
      Awaited<ReturnType<IdentityVerificationService['verifyForEnrollment']>>['verification']
    >,
    liveness?: {
      attempted: boolean;
      passed: boolean;
      fallbackChain: string[];
      providerName?: string;
      confidenceScore?: number;
      reason?: string;
    },
  ): {
    validity?: 'valid' | 'invalid' | 'unknown';
    issueDate?: string;
    expiryDate?: string;
    portraitAvailable?: boolean;
    matchScore?: number;
    riskScore?: number;
  } {
    const metadata = verification.documentMetadata;
    const matchScore =
      verification.status === 'verified'
        ? clampPercentage((liveness?.confidenceScore ?? 0.95) * 100)
        : verification.status === 'no_match'
          ? 18
          : verification.status === 'provider_error' ||
              verification.status === 'provider_unavailable'
            ? 40
            : 30;
    const riskScore =
      liveness?.passed === false
        ? 88
        : verification.status === 'verified'
          ? metadata?.validity === 'invalid'
            ? 72
            : metadata?.validity === 'unknown'
              ? 34
              : 14
          : verification.status === 'no_match'
            ? 82
            : verification.status === 'provider_error' ||
                verification.status === 'provider_unavailable'
              ? 57
              : 45;

    return {
      ...(metadata?.validity ? { validity: metadata.validity } : {}),
      ...(metadata?.issueDate ? { issueDate: metadata.issueDate } : {}),
      ...(metadata?.expiryDate ? { expiryDate: metadata.expiryDate } : {}),
      ...(metadata?.portraitAvailable !== undefined
        ? { portraitAvailable: metadata.portraitAvailable }
        : {}),
      matchScore,
      riskScore,
    };
  }

  private async findExistingIdentifierMatches(
    identifiers: NormalizedIdentifier[],
  ): Promise<Array<{ id: string; personId: string; type: string; value: string }>> {
    if (identifiers.length === 0) {
      return [];
    }

    return this.prisma.intelPersonIdentifier.findMany({
      where: {
        OR: identifiers.map((identifier) => ({
          type: identifier.type,
          value: identifier.value,
        })),
      },
      select: {
        id: true,
        personId: true,
        type: true,
        value: true,
      },
    });
  }

  private normalizeIdentifier(identifier: EnrollmentIdentifierDto): NormalizedIdentifier {
    const trimmed = identifier.value.trim();
    const type = identifier.type as IdentifierType;

    return {
      type: identifier.type,
      value: type === IdentifierType.Email ? trimmed.toLowerCase() : trimmed.toUpperCase(),
      ...(identifier.countryCode ? { countryCode: identifier.countryCode } : {}),
    };
  }

  private identifierKey(type: string, value: string): string {
    return `${type}:${value}`;
  }
}
