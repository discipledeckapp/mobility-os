import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CpFeatureFlag, CpFeatureFlagOverride } from '../generated/prisma';
import type { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';

export interface SetOverrideParams {
  flagId: string;
  // Exactly one of these must be provided.
  tenantId?: string;
  countryCode?: string;
  planTier?: string;
  value: unknown;
  isEnabled: boolean;
}

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly prisma: PrismaService) {}

  async listFlags(enabledOnly = false): Promise<CpFeatureFlag[]> {
    return this.prisma.cpFeatureFlag.findMany({
      ...(enabledOnly ? { where: { isEnabled: true } } : {}),
      include: { overrides: true },
      orderBy: { key: 'asc' },
    });
  }

  async getFlag(key: string): Promise<CpFeatureFlag & { overrides: CpFeatureFlagOverride[] }> {
    const flag = await this.prisma.cpFeatureFlag.findUnique({
      where: { key },
      include: { overrides: true },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag '${key}' not found`);
    }

    return flag;
  }

  /**
   * Evaluates whether a flag is enabled for a given context.
   * Resolution order: tenant > plan > country > global.
   */
  async isEnabled(
    key: string,
    context: { tenantId?: string; planTier?: string; countryCode?: string },
  ): Promise<boolean> {
    const flag = await this.getFlag(key);

    // Tenant override — highest precedence.
    if (context.tenantId) {
      const tenantOverride = flag.overrides.find((o) => o.tenantId === context.tenantId);
      if (tenantOverride) return tenantOverride.isEnabled;
    }

    // Plan tier override.
    if (context.planTier) {
      const planOverride = flag.overrides.find((o) => o.planTier === context.planTier);
      if (planOverride) return planOverride.isEnabled;
    }

    // Country override.
    if (context.countryCode) {
      const countryOverride = flag.overrides.find((o) => o.countryCode === context.countryCode);
      if (countryOverride) return countryOverride.isEnabled;
    }

    // Global default.
    return flag.isEnabled;
  }

  async setOverride(params: SetOverrideParams): Promise<CpFeatureFlagOverride> {
    await this.getFlag(params.flagId); // validate flagId exists by key — use id below

    const scopeCount = [params.tenantId, params.countryCode, params.planTier].filter(
      Boolean,
    ).length;

    if (scopeCount !== 1) {
      throw new BadRequestException(
        'Exactly one of tenantId, countryCode, or planTier must be provided',
      );
    }

    // Find the flag by id (getFlag used key above for readability — look up id now).
    const flag = await this.prisma.cpFeatureFlag.findUnique({
      where: { key: params.flagId },
    });

    if (!flag) throw new NotFoundException(`Feature flag '${params.flagId}' not found`);

    return this.prisma.cpFeatureFlagOverride.create({
      data: {
        flagId: flag.id,
        tenantId: params.tenantId ?? null,
        countryCode: params.countryCode ?? null,
        planTier: params.planTier ?? null,
        value: params.value as never,
        isEnabled: params.isEnabled,
      },
    });
  }

  async removeOverride(overrideId: string): Promise<void> {
    const override = await this.prisma.cpFeatureFlagOverride.findUnique({
      where: { id: overrideId },
    });

    if (!override) {
      throw new NotFoundException(`FeatureFlagOverride '${overrideId}' not found`);
    }

    await this.prisma.cpFeatureFlagOverride.delete({ where: { id: overrideId } });
  }

  async updateFlag(
    key: string,
    dto: UpdateFeatureFlagDto,
  ): Promise<CpFeatureFlag & { overrides: CpFeatureFlagOverride[] }> {
    await this.getFlag(key);

    return this.prisma.cpFeatureFlag.update({
      where: { key },
      data: { isEnabled: dto.isEnabled },
      include: { overrides: true },
    });
  }
}
