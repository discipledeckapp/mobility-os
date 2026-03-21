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
    const activeSignals = await this.prisma.intelRiskSignal.findMany({
      where: { personId, isActive: true },
      select: { severity: true },
    });

    const rawScore = activeSignals.reduce<number>(
      (sum: number, signal: { severity: string }) => sum + (SEVERITY_WEIGHT[signal.severity] ?? 0),
      0,
    );

    const globalRiskScore = Math.min(rawScore, 100);

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
}
