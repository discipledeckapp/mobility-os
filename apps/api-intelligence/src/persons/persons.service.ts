import { randomBytes } from 'node:crypto';
import { RiskScore } from '@mobility-os/intelligence-domain';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PrismaService } from '../database/prisma.service';
import type { IntelPerson, Prisma } from '../generated/prisma';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { LinkageEventsService } from '../linkage-events/linkage-events.service';
import type { CreatePersonDto } from './dto/create-person.dto';
import type { IntelligenceQueryResultDto } from './dto/person-response.dto';

interface CanonicalIdentityEnrichmentInput {
  personId: string;
  fullName?: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  photoUrl?: string;
  selfieImageUrl?: string;
  providerImageUrl?: string;
  verificationStatus?: string;
  verificationProvider?: string;
  verificationCountryCode?: string;
  verificationConfidence?: number;
  tenantId?: string;
  localEntityType?: string;
  localEntityId?: string;
  source?: string;
}

interface RecordPersonAssociationInput {
  personId: string;
  tenantId: string;
  roleType: 'driver' | 'guarantor' | 'owner' | 'admin';
  businessEntityId?: string;
  operatingUnitId?: string;
  fleetId?: string;
  localEntityType: string;
  localEntityId: string;
  status?: string;
  source?: string;
  verifiedAt?: Date;
}

interface SecondaryIdentityEvidenceInput {
  personId: string;
  tenantId: string;
  driverId: string;
  linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
  providerName?: string;
  providerReference?: string;
  validity?: string;
  issueDate?: string;
  expiryDate?: string;
  demographicMatchScore?: number;
  biometricMatchScore?: number;
  overallLinkageScore?: number;
  linkageReasons?: string[];
  manualReviewRequired: boolean;
  evidence?: Record<string, unknown>;
}

interface ResolveSecondaryIdentityReviewInput {
  personId: string;
  reviewCaseId: string;
  decision: 'approved' | 'rejected' | 'request_reverification';
  reviewerId: string;
  reviewerRole: string;
  notes?: string;
  evidenceSnapshot?: Record<string, unknown>;
}

@Injectable()
export class PersonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly linkageEventsService: LinkageEventsService,
  ) {}

  async create(dto: CreatePersonDto): Promise<IntelPerson> {
    return this.prisma.intelPerson.create({
      data: {
        globalRiskScore: dto.globalRiskScore ?? 0,
      },
    });
  }

  async findById(id: string): Promise<IntelPerson> {
    const person = await this.prisma.intelPerson.findUnique({ where: { id } });

    if (!person) {
      throw new NotFoundException(`Person '${id}' not found`);
    }

    return person;
  }

  async listForStaff(
    input: {
      q?: string;
      limit?: number;
      riskBand?: string;
      countryCode?: string;
      watchlistStatus?: 'flagged' | 'clear';
      reviewState?: 'open' | 'in_review' | 'resolved' | 'escalated';
      roleType?: 'driver' | 'guarantor' | 'owner' | 'admin';
      reverificationRequired?: boolean;
    } = {},
  ): Promise<IntelPerson[]> {
    const q = input.q?.trim();
    const limit = Math.min(Math.max(input.limit ?? 25, 1), 100);
    const riskScoreWhere = this.riskBandToScoreWhere(input.riskBand);
    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { id: { contains: q, mode: 'insensitive' } },
        { globalPersonCode: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (riskScoreWhere) {
      where.globalRiskScore = riskScoreWhere;
    }
    if (input.countryCode) {
      where.verificationCountryCode = input.countryCode.toUpperCase();
    }
    if (input.watchlistStatus) {
      where.isWatchlisted = input.watchlistStatus === 'flagged';
    }
    if (input.reviewState) {
      where.reviewCases = { some: { status: input.reviewState } };
    }
    if (input.roleType || input.reverificationRequired !== undefined) {
      where.tenantPresences = {
        some: {
          ...(input.roleType ? { roleType: input.roleType } : {}),
          ...(input.reverificationRequired !== undefined
            ? { reverificationRequired: input.reverificationRequired }
            : {}),
        },
      };
    }

    return this.prisma.intelPerson.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
      take: limit,
    });
  }

  /**
   * Returns the derived intelligence result for a given person ID.
   * This is the only view exposed to tenant callers — no raw cross-tenant
   * records are included, only signals computed from aggregated data.
   */
  async queryForTenant(personId: string): Promise<IntelligenceQueryResultDto> {
    const person = await this.findById(personId);
    const stalePresence = await this.prisma.intelPersonTenantPresence.findFirst({
      where: {
        personId,
        reverificationRequired: true,
      },
      orderBy: [{ verifiedAt: 'desc' }, { createdAt: 'desc' }],
    });

    const riskScore = RiskScore.of(person.globalRiskScore);

    return {
      personId: person.id,
      globalRiskScore: person.globalRiskScore,
      riskBand: riskScore.band,
      isWatchlisted: person.isWatchlisted,
      hasDuplicateIdentityFlag: person.hasDuplicateFlag,
      fraudIndicatorCount: person.fraudSignalCount,
      verificationConfidence: person.verificationConfidence,
      verificationStatus: person.verificationStatus,
      verificationProvider: person.verificationProvider,
      verificationCountryCode: person.verificationCountryCode,
      reverificationRequired: Boolean(stalePresence),
      reverificationReason: stalePresence?.reverificationReason ?? null,
    };
  }

  async updateRiskScore(id: string, newScore: number): Promise<IntelPerson> {
    if (newScore < 0 || newScore > 100) {
      throw new BadRequestException('Risk score must be between 0 and 100');
    }

    await this.findById(id); // throws if not found

    return this.prisma.intelPerson.update({
      where: { id },
      data: { globalRiskScore: newScore },
    });
  }

  async recordSecondaryIdentityEvidence(input: SecondaryIdentityEvidenceInput): Promise<{
    reviewCaseId: string | null;
    riskScore: number;
    riskBand: string;
  }> {
    const person = await this.findById(input.personId);
    const nextRiskScore = this.deriveSecondaryIdentityRiskScore(person.globalRiskScore, {
      linkageDecision: input.linkageDecision,
      validity: input.validity ?? null,
      expiryDate: input.expiryDate ?? null,
      manualReviewRequired: input.manualReviewRequired,
    });

    let reviewCaseId: string | null = null;
    if (input.manualReviewRequired) {
      const reviewCase = await this.prisma.intelReviewCase.create({
        data: {
          personId: input.personId,
          confidenceScore: Math.max(
            0,
            Math.min(1, (input.overallLinkageScore ?? input.demographicMatchScore ?? 0) / 100),
          ),
          evidence: {
            reviewType: 'driver_licence_linkage',
            tenantId: input.tenantId,
            driverId: input.driverId,
            linkageDecision: input.linkageDecision,
            validity: input.validity ?? null,
            issueDate: input.issueDate ?? null,
            expiryDate: input.expiryDate ?? null,
            demographicMatchScore: input.demographicMatchScore ?? null,
            biometricMatchScore: input.biometricMatchScore ?? null,
            overallLinkageScore: input.overallLinkageScore ?? null,
            linkageReasons: input.linkageReasons ?? [],
            providerName: input.providerName ?? null,
            providerReference: input.providerReference ?? null,
            ...(input.evidence ? { evidence: input.evidence } : {}),
          } as Prisma.InputJsonObject,
          notes: 'Driver licence linkage requires tenant review.',
        },
      });
      reviewCaseId = reviewCase.id;
    }

    await Promise.all([
      this.prisma.intelPerson.update({
        where: { id: input.personId },
        data: { globalRiskScore: nextRiskScore },
      }),
      this.prisma.intelIdentityChangeEvent.create({
        data: {
          personId: input.personId,
          eventType: 'secondary_identity_recorded',
          source: 'driver_licence_verification',
          verificationProvider: input.providerName ?? null,
          tenantId: input.tenantId,
          localEntityType: 'driver',
          localEntityId: input.driverId,
          changedFields: ['driver_licence_verification'],
          newValues: {
            linkageDecision: input.linkageDecision,
            validity: input.validity ?? null,
            issueDate: input.issueDate ?? null,
            expiryDate: input.expiryDate ?? null,
            demographicMatchScore: input.demographicMatchScore ?? null,
            biometricMatchScore: input.biometricMatchScore ?? null,
            overallLinkageScore: input.overallLinkageScore ?? null,
            linkageReasons: input.linkageReasons ?? [],
            manualReviewRequired: input.manualReviewRequired,
            reviewCaseId,
            providerReference: input.providerReference ?? null,
            ...(input.evidence ? { evidence: input.evidence } : {}),
          } as Prisma.InputJsonObject,
          reason: 'Driver licence verification recorded as secondary identity evidence.',
          verifiedAt: new Date(),
        },
      }),
      this.linkageEventsService.record({
        personId: input.personId,
        eventType: 'risk_changed',
        actor: 'system',
        ...(input.overallLinkageScore !== undefined
          ? { confidenceScore: input.overallLinkageScore / 100 }
          : {}),
        reason: 'Driver licence verification updated canonical confidence and risk posture.',
        metadata: {
          tenantId: input.tenantId,
          driverId: input.driverId,
          linkageDecision: input.linkageDecision,
          reviewCaseId,
          previousRiskScore: person.globalRiskScore,
          nextRiskScore,
        },
      }),
    ]);

    return {
      reviewCaseId,
      riskScore: nextRiskScore,
      riskBand: this.scoreToRiskBand(nextRiskScore),
    };
  }

  async resolveSecondaryIdentityReview(input: ResolveSecondaryIdentityReviewInput): Promise<{
    riskScore: number;
    riskBand: string;
  }> {
    const person = await this.findById(input.personId);
    const reviewCase = await this.prisma.intelReviewCase.findUnique({
      where: { id: input.reviewCaseId },
    });
    if (!reviewCase || reviewCase.personId !== input.personId) {
      throw new NotFoundException(`ReviewCase '${input.reviewCaseId}' not found`);
    }

    const nextRiskScore = this.deriveManualReviewRiskScore(person.globalRiskScore, input.decision);
    const resolution =
      input.decision === 'approved'
        ? 'licence_linkage_approved'
        : input.decision === 'rejected'
          ? 'licence_linkage_rejected'
          : 'licence_linkage_reverification_requested';

    await Promise.all([
      this.prisma.intelReviewCase.update({
        where: { id: input.reviewCaseId },
        data: {
          status: 'resolved',
          resolution,
          reviewedBy: input.reviewerId,
          reviewedAt: new Date(),
          notes: input.notes ?? null,
        },
      }),
      this.prisma.intelPerson.update({
        where: { id: input.personId },
        data: { globalRiskScore: nextRiskScore },
      }),
      this.prisma.intelIdentityChangeEvent.create({
        data: {
          personId: input.personId,
          eventType: 'secondary_identity_reviewed',
          source: 'driver_licence_review',
          changedFields: ['driver_licence_review_decision'],
          newValues: {
            reviewCaseId: input.reviewCaseId,
            decision: input.decision,
            reviewerId: input.reviewerId,
            reviewerRole: input.reviewerRole,
            notes: input.notes ?? null,
            evidenceSnapshot: input.evidenceSnapshot ?? null,
          } as Prisma.InputJsonObject,
          reason: `Driver licence review ${input.decision.replace(/_/g, ' ')}`,
          verifiedAt: new Date(),
        },
      }),
      this.linkageEventsService.record({
        personId: input.personId,
        eventType: 'risk_changed',
        actor: input.reviewerId,
        reason: `Driver licence review ${input.decision.replace(/_/g, ' ')}`,
        metadata: {
          reviewCaseId: input.reviewCaseId,
          reviewerRole: input.reviewerRole,
          previousRiskScore: person.globalRiskScore,
          nextRiskScore,
        },
      }),
    ]);

    return {
      riskScore: nextRiskScore,
      riskBand: this.scoreToRiskBand(nextRiskScore),
    };
  }

  async setWatchlisted(id: string, isWatchlisted: boolean): Promise<IntelPerson> {
    await this.findById(id);

    return this.prisma.intelPerson.update({
      where: { id },
      data: { isWatchlisted },
    });
  }

  async setDuplicateFlag(id: string, hasDuplicateFlag: boolean): Promise<IntelPerson> {
    await this.findById(id);

    return this.prisma.intelPerson.update({
      where: { id },
      data: { hasDuplicateFlag },
    });
  }

  /**
   * Records that a person has appeared at a tenant in a given operational role.
   *
   * When a person is recorded as a guarantor at a tenant where they are already
   * a driver (or vice versa), a cross_role_presence risk signal is emitted
   * automatically. The signal is idempotent — a second enrollment in the same
   * role at the same tenant is a no-op and does not produce a duplicate signal.
   */
  async recordTenantPresence(
    input: RecordPersonAssociationInput,
  ): Promise<{ crossRoleConflict: boolean }> {
    const oppositeRole =
      input.roleType === 'driver' ? 'guarantor' : input.roleType === 'guarantor' ? 'driver' : null;

    const [, oppositePresence] = await Promise.all([
      this.prisma.intelPersonTenantPresence.upsert({
        where: {
          personId_tenantId_roleType_localEntityType_localEntityId: {
            personId: input.personId,
            tenantId: input.tenantId,
            roleType: input.roleType,
            localEntityType: input.localEntityType,
            localEntityId: input.localEntityId,
          },
        },
        create: {
          personId: input.personId,
          tenantId: input.tenantId,
          roleType: input.roleType,
          localEntityType: input.localEntityType,
          localEntityId: input.localEntityId,
          ...(input.businessEntityId ? { businessEntityId: input.businessEntityId } : {}),
          ...(input.operatingUnitId ? { operatingUnitId: input.operatingUnitId } : {}),
          ...(input.fleetId ? { fleetId: input.fleetId } : {}),
          status: input.status ?? 'active',
          source: input.source ?? 'identity_resolution',
          verifiedAt: input.verifiedAt ?? new Date(),
        },
        update: {
          ...(input.businessEntityId ? { businessEntityId: input.businessEntityId } : {}),
          ...(input.operatingUnitId ? { operatingUnitId: input.operatingUnitId } : {}),
          ...(input.fleetId ? { fleetId: input.fleetId } : {}),
          status: input.status ?? 'active',
          source: input.source ?? 'identity_resolution',
          verifiedAt: input.verifiedAt ?? new Date(),
        },
      }),
      oppositeRole
        ? this.prisma.intelPersonTenantPresence.findFirst({
            where: {
              personId: input.personId,
              tenantId: input.tenantId,
              roleType: oppositeRole,
            },
          })
        : Promise.resolve(null),
    ]);

    const crossRoleConflict = Boolean(oppositePresence);

    if (crossRoleConflict) {
      // Emit a risk signal for cross-role presence. Idempotent — if one
      // already exists for this (personId, tenantId) pair it is a duplicate
      // but acceptable; duplicate detection is handled upstream if needed.
      await this.prisma.intelRiskSignal.create({
        data: {
          personId: input.personId,
          type: 'cross_role_presence',
          severity: 'medium',
          source: 'system',
          metadata: {
            tenantId: input.tenantId,
            roles: [input.roleType, oppositeRole],
            detectedDuring: input.roleType,
            localEntityType: input.localEntityType,
            localEntityId: input.localEntityId,
          },
        },
      });
    }

    return { crossRoleConflict };
  }

  /**
   * Returns the aggregated role presence for a person — which operational roles
   * they hold across the platform. Tenant names are never included; only
   * aggregate counts and role flags are returned, preserving cross-tenant privacy.
   */
  async queryRolePresence(personId: string): Promise<{
    isDriver: boolean;
    isGuarantor: boolean;
    tenantCount: number;
    hasMultiTenantPresence: boolean;
    hasMultiRolePresence: boolean;
  }> {
    await this.findById(personId); // throws NotFoundException if missing

    const presences = await this.prisma.intelPersonTenantPresence.findMany({
      where: { personId },
      select: { tenantId: true, roleType: true },
    });

    const tenantIds = new Set(presences.map((p) => p.tenantId));
    const roles = new Set(presences.map((p) => p.roleType));

    return {
      isDriver: roles.has('driver'),
      isGuarantor: roles.has('guarantor'),
      tenantCount: tenantIds.size,
      hasMultiTenantPresence: tenantIds.size > 1,
      hasMultiRolePresence: roles.size > 1,
    };
  }

  async listAssociations(personId: string) {
    await this.findById(personId);

    return this.prisma.intelPersonTenantPresence.findMany({
      where: { personId },
      orderBy: [{ verifiedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async listLinkageEvents(personId: string) {
    await this.findById(personId);
    return this.linkageEventsService.listByPerson(personId);
  }

  async listIdentityChanges(personId: string) {
    await this.findById(personId);
    return this.prisma.intelIdentityChangeEvent.findMany({
      where: { personId },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async ensureGlobalPersonCode(personId: string, countryCode?: string): Promise<IntelPerson> {
    const person = await this.findById(personId);
    if (person.globalPersonCode) {
      return person;
    }

    const region = (countryCode ?? person.verificationCountryCode ?? 'XX').toUpperCase();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = `MPS-${region}-${randomBytes(4).toString('hex').toUpperCase()}`;
      try {
        return await this.prisma.intelPerson.update({
          where: { id: personId },
          data: { globalPersonCode: candidate },
        });
      } catch {}
    }

    throw new BadRequestException('Unable to allocate a unique global person code');
  }

  async retireBiometricAssets(urls: string[]): Promise<{ affectedPeople: number }> {
    const normalized = Array.from(
      new Set(urls.map((value) => value.trim()).filter((value) => value.length > 0)),
    );

    if (normalized.length === 0) {
      return { affectedPeople: 0 };
    }

    const [selfieResult, providerResult] = await Promise.all([
      this.prisma.intelPerson.updateMany({
        where: { selfieImageUrl: { in: normalized } },
        data: { selfieImageUrl: null },
      }),
      this.prisma.intelPerson.updateMany({
        where: { providerImageUrl: { in: normalized } },
        data: {
          providerImageUrl: null,
          photoUrl: null,
        },
      }),
    ]);

    return {
      affectedPeople: selfieResult.count + providerResult.count,
    };
  }

  async applyIdentityEnrichment(input: CanonicalIdentityEnrichmentInput): Promise<IntelPerson> {
    const person = await this.findById(input.personId);

    const nextValues = {
      ...(input.fullName ? { fullName: input.fullName } : {}),
      ...(input.dateOfBirth ? { dateOfBirth: input.dateOfBirth } : {}),
      ...(input.address ? { address: input.address } : {}),
      ...(input.gender ? { gender: input.gender } : {}),
      ...(input.photoUrl ? { photoUrl: input.photoUrl } : {}),
      ...(!input.photoUrl && input.providerImageUrl ? { photoUrl: input.providerImageUrl } : {}),
      ...(input.selfieImageUrl ? { selfieImageUrl: input.selfieImageUrl } : {}),
      ...(input.providerImageUrl ? { providerImageUrl: input.providerImageUrl } : {}),
      ...(input.verificationStatus ? { verificationStatus: input.verificationStatus } : {}),
      ...(input.verificationProvider ? { verificationProvider: input.verificationProvider } : {}),
      ...(input.verificationCountryCode
        ? { verificationCountryCode: input.verificationCountryCode }
        : {}),
      ...(input.verificationConfidence !== undefined
        ? { verificationConfidence: input.verificationConfidence }
        : {}),
    };

    const changedFields = this.detectCanonicalChanges(person, nextValues);

    const updated = await this.prisma.intelPerson.update({
      where: { id: input.personId },
      data: nextValues,
    });

    if (changedFields.length > 0) {
      const previousValues = Object.fromEntries(
        changedFields.map((field) => [field, person[field]]),
      );
      const newValues = Object.fromEntries(changedFields.map((field) => [field, updated[field]]));
      const reverificationReason = `Canonical verified identity changed: ${changedFields.join(', ')}`;

      await Promise.all([
        this.prisma.intelIdentityChangeEvent.create({
          data: {
            personId: input.personId,
            source: input.source ?? 'verified_enrichment',
            ...(input.verificationProvider
              ? { verificationProvider: input.verificationProvider }
              : {}),
            ...(input.verificationCountryCode
              ? { verificationCountryCode: input.verificationCountryCode }
              : {}),
            ...(input.tenantId ? { tenantId: input.tenantId } : {}),
            ...(input.localEntityType ? { localEntityType: input.localEntityType } : {}),
            ...(input.localEntityId ? { localEntityId: input.localEntityId } : {}),
            changedFields,
            previousValues,
            newValues,
            reason: reverificationReason,
            verifiedAt: new Date(),
          },
        }),
        this.prisma.intelPersonTenantPresence.updateMany({
          where: {
            personId: input.personId,
            ...(input.localEntityType && input.localEntityId
              ? {
                  NOT: {
                    localEntityType: input.localEntityType,
                    localEntityId: input.localEntityId,
                  },
                }
              : {}),
          },
          data: {
            reverificationRequired: true,
            reverificationReason,
            staleFieldKeys: changedFields,
          },
        }),
        this.linkageEventsService.record({
          personId: input.personId,
          eventType: 'canonical_identity_updated',
          actor: 'system',
          reason: reverificationReason,
          metadata: {
            changedFields,
            ...(input.tenantId ? { tenantId: input.tenantId } : {}),
            ...(input.localEntityType ? { localEntityType: input.localEntityType } : {}),
            ...(input.localEntityId ? { localEntityId: input.localEntityId } : {}),
          },
        }),
      ]);
    }

    return updated;
  }

  private detectCanonicalChanges(
    person: IntelPerson,
    nextValues: Partial<IntelPerson>,
  ): Array<keyof IntelPerson> {
    const trackedFields: Array<keyof IntelPerson> = [
      'fullName',
      'dateOfBirth',
      'address',
      'gender',
      'photoUrl',
      'providerImageUrl',
    ];

    return trackedFields.filter((field) => {
      const nextValue = nextValues[field];
      return nextValue !== undefined && nextValue !== person[field];
    });
  }

  private riskBandToScoreWhere(riskBand?: string): { lte?: number; gt?: number } | undefined {
    switch (riskBand) {
      case 'low':
        return { lte: 30 };
      case 'medium':
        return { gt: 30, lte: 60 };
      case 'high':
        return { gt: 60, lte: 80 };
      case 'critical':
        return { gt: 80 };
      default:
        return undefined;
    }
  }

  private scoreToRiskBand(score: number): string {
    if (score <= 30) return 'low';
    if (score <= 60) return 'medium';
    if (score <= 80) return 'high';
    return 'critical';
  }

  private deriveSecondaryIdentityRiskScore(
    currentScore: number,
    input: {
      linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
      validity: string | null;
      expiryDate: string | null;
      manualReviewRequired: boolean;
    },
  ): number {
    if (
      input.validity === 'invalid' ||
      (input.expiryDate ? new Date(input.expiryDate).getTime() < Date.now() : false)
    ) {
      return Math.min(100, currentScore + 25);
    }
    if (input.linkageDecision === 'fail') {
      return Math.min(100, currentScore + 20);
    }
    if (input.linkageDecision === 'pending_human_review' || input.manualReviewRequired) {
      return Math.min(100, currentScore + 10);
    }
    return Math.max(0, currentScore - 5);
  }

  private deriveManualReviewRiskScore(
    currentScore: number,
    decision: 'approved' | 'rejected' | 'request_reverification',
  ): number {
    if (decision === 'approved') {
      return Math.max(0, currentScore - 10);
    }
    if (decision === 'request_reverification') {
      return Math.min(100, currentScore + 5);
    }
    return Math.min(100, currentScore + 20);
  }
}
