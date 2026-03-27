import { RiskScore } from '@mobility-os/intelligence-domain';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PrismaService } from '../database/prisma.service';
import type { IntelRiskSignal } from '../generated/prisma';
import { Prisma } from '../generated/prisma';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PersonsService } from '../persons/persons.service';
import type { AddRiskSignalDto } from './dto/add-risk-signal.dto';

// Severity → numeric weight used in score computation.
const SEVERITY_WEIGHT: Record<string, number> = {
  low: 10,
  medium: 25,
  high: 50,
  critical: 100,
};

const FACTOR_WEIGHT = {
  multiTenantPresence: 10,
  staleIdentityLinks: 15,
  watchlisted: 15,
  duplicateIdentity: 15,
  activeReviewCases: 10,
  guarantorOverexposure: 20,
} as const;

@Injectable()
export class RiskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly personsService: PersonsService,
  ) {}

  async listSignals(personId: string, activeOnly = true): Promise<IntelRiskSignal[]> {
    await this.personsService.findById(personId);

    return this.prisma.intelRiskSignal.findMany({
      where: { personId, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addSignal(dto: AddRiskSignalDto): Promise<IntelRiskSignal> {
    await this.personsService.findById(dto.personId);

    const signal = await this.prisma.intelRiskSignal.create({
      data: {
        personId: dto.personId,
        type: dto.type,
        severity: dto.severity,
        source: dto.source,
        metadata: dto.metadata ? (dto.metadata as Prisma.InputJsonObject) : Prisma.JsonNull,
        isActive: true,
      },
    });

    // Recompute derived fields on the person record after every signal change.
    await this.recomputeAndPersist(dto.personId);

    return signal;
  }

  async deactivateSignal(id: string): Promise<IntelRiskSignal> {
    const signal = await this.prisma.intelRiskSignal.findUnique({ where: { id } });

    if (!signal) {
      throw new NotFoundException(`RiskSignal '${id}' not found`);
    }

    if (!signal.isActive) {
      throw new BadRequestException(`RiskSignal '${id}' is already inactive`);
    }

    const updated = await this.prisma.intelRiskSignal.update({
      where: { id },
      data: { isActive: false },
    });

    await this.recomputeAndPersist(signal.personId);

    return updated;
  }

  /**
   * Recomputes globalRiskScore and fraudSignalCount from all active signals
   * and persists the result back to intel_persons.
   *
   * Score algorithm:
   *   - Each active signal contributes its severity weight.
   *   - Weights are summed and clamped to [0, 100].
   *   - Multiple signals of the same type stack (e.g. two `high` signals = 100).
   *
   * This keeps the denormalized fields on IntelPerson consistent with the
   * signal table without requiring a join on every read.
   */
  async recomputeAndPersist(personId: string): Promise<void> {
    const [person, activeSignals, presences, activeReviewCases, activeWatchlists] = await Promise.all([
      this.prisma.intelPerson.findUnique({
        where: { id: personId },
        select: { isWatchlisted: true, hasDuplicateFlag: true },
      }),
      this.prisma.intelRiskSignal.findMany({
        where: { personId, isActive: true },
        select: { severity: true, type: true },
      }),
      this.prisma.intelPersonTenantPresence.findMany({
        where: { personId },
        select: { tenantId: true, roleType: true, reverificationRequired: true },
      }),
      this.prisma.intelReviewCase.count({
        where: { personId, status: { in: ['open', 'in_review', 'escalated'] } },
      }),
      this.prisma.intelWatchlistEntry.count({
        where: { personId, isActive: true },
      }),
    ]);

    const rawScore = activeSignals.reduce<number>(
      (sum: number, signal: { severity: string }) => sum + (SEVERITY_WEIGHT[signal.severity] ?? 0),
      0,
    );
    const linkedTenants = new Set(presences.map((presence) => presence.tenantId)).size;
    const staleLinkCount = presences.filter((presence) => presence.reverificationRequired).length;
    const guarantorLinks = presences.filter((presence) => presence.roleType === 'guarantor').length;
    const heuristicScore =
      rawScore +
      (linkedTenants > 1 ? FACTOR_WEIGHT.multiTenantPresence : 0) +
      (staleLinkCount > 0 ? FACTOR_WEIGHT.staleIdentityLinks : 0) +
      ((person?.isWatchlisted ?? false) || activeWatchlists > 0 ? FACTOR_WEIGHT.watchlisted : 0) +
      (person?.hasDuplicateFlag ? FACTOR_WEIGHT.duplicateIdentity : 0) +
      (activeReviewCases > 0 ? FACTOR_WEIGHT.activeReviewCases : 0) +
      (guarantorLinks >= 5 ? FACTOR_WEIGHT.guarantorOverexposure : 0);

    const globalRiskScore = Math.min(heuristicScore, 100);

    await this.prisma.intelPerson.update({
      where: { id: personId },
      data: {
        globalRiskScore,
        fraudSignalCount: activeSignals.length,
      },
    });
  }

  /**
   * Returns the RiskScore value object for a person.
   * Callers can use .band, .isActionable(), .isCritical() without knowing thresholds.
   */
  async getRiskScore(personId: string): Promise<RiskScore> {
    const person = await this.personsService.findById(personId);
    return RiskScore.of(person.globalRiskScore);
  }

  async getSummary(personId: string) {
    const [person, presences, signals, activeReviewCaseCount, activeWatchlistCount] = await Promise.all([
      this.personsService.findById(personId),
      this.prisma.intelPersonTenantPresence.findMany({
        where: { personId },
        orderBy: [{ verifiedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.intelRiskSignal.findMany({
        where: { personId, isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.intelReviewCase.count({
        where: { personId, status: { in: ['open', 'in_review', 'escalated'] } },
      }),
      this.prisma.intelWatchlistEntry.count({
        where: { personId, isActive: true },
      }),
    ]);

    const contributingFactors = signals.map((signal) => ({
      code: signal.type,
      label: signal.type.replace(/_/g, ' '),
      weight: SEVERITY_WEIGHT[signal.severity] ?? 0,
      detail: `${signal.severity} severity from ${signal.source}`,
    }));

    const linkedOrganisationCount = new Set(presences.map((presence) => presence.tenantId)).size;
    const stalePresences = presences.filter((presence) => presence.reverificationRequired);
    const guarantorLinkedDriverCount = presences.filter((presence) => presence.roleType === 'guarantor').length;

    if (linkedOrganisationCount > 1) {
      contributingFactors.push({
        code: 'multi_tenant_presence',
        label: 'Multi-tenant verified presence',
        weight: FACTOR_WEIGHT.multiTenantPresence,
        detail: `Linked across ${linkedOrganisationCount} organisations`,
      });
    }
    if (stalePresences.length > 0) {
      contributingFactors.push({
        code: 'stale_identity_links',
        label: 'Stale tenant identity snapshots',
        weight: FACTOR_WEIGHT.staleIdentityLinks,
        detail: `${stalePresences.length} linked record(s) require reverification`,
      });
    }
    if (person.isWatchlisted || activeWatchlistCount > 0) {
      contributingFactors.push({
        code: 'watchlist_match',
        label: 'Active watchlist entry',
        weight: FACTOR_WEIGHT.watchlisted,
        detail: `${activeWatchlistCount} active watchlist entr${activeWatchlistCount === 1 ? 'y' : 'ies'}`,
      });
    }
    if (person.hasDuplicateFlag) {
      contributingFactors.push({
        code: 'duplicate_identity',
        label: 'Duplicate identity conflict',
        weight: FACTOR_WEIGHT.duplicateIdentity,
        detail: 'Unresolved duplicate-identity flag is active',
      });
    }
    if (activeReviewCaseCount > 0) {
      contributingFactors.push({
        code: 'active_review_cases',
        label: 'Open intelligence review',
        weight: FACTOR_WEIGHT.activeReviewCases,
        detail: `${activeReviewCaseCount} review case(s) still open`,
      });
    }
    const guarantorExposureExceeded = guarantorLinkedDriverCount >= 5;
    if (guarantorExposureExceeded) {
      contributingFactors.push({
        code: 'guarantor_overexposure',
        label: 'Guarantor overexposure',
        weight: FACTOR_WEIGHT.guarantorOverexposure,
        detail: `Guarantor-linked across ${guarantorLinkedDriverCount} driver record(s)`,
      });
    }

    const correctiveAction =
      stalePresences.length > 0
        ? 'Refresh linked tenant records and complete reverification where required.'
        : activeReviewCaseCount > 0
          ? 'Resolve outstanding review cases before clearing risk posture.'
          : guarantorExposureExceeded
            ? 'Review guarantor exposure across linked organisations.'
            : undefined;

    return {
      personId,
      score: person.globalRiskScore,
      riskBand: RiskScore.of(person.globalRiskScore).band,
      contributingFactors,
      linkedOrganisationCount,
      linkedRecordCount: presences.length,
      staleLinkedRecordCount: stalePresences.length,
      activeReviewCaseCount,
      activeWatchlistCount,
      guarantorLinkedDriverCount,
      guarantorExposureExceeded,
      ...(correctiveAction ? { correctiveAction } : {}),
    };
  }
}
