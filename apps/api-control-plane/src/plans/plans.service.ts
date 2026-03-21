import { Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '../generated/prisma';
import type { CpPlan } from '../generated/prisma';
import type { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlans(activeOnly = true): Promise<CpPlan[]> {
    return this.prisma.cpPlan.findMany({
      ...(activeOnly ? { where: { isActive: true } } : {}),
      orderBy: [{ tier: 'asc' }, { billingInterval: 'asc' }],
    });
  }

  async getPlan(id: string): Promise<CpPlan> {
    const plan = await this.prisma.cpPlan.findUnique({ where: { id } });

    if (!plan) {
      throw new NotFoundException(`Plan '${id}' not found`);
    }

    return plan;
  }

  async createPlan(dto: CreatePlanDto): Promise<CpPlan> {
    return this.prisma.cpPlan.create({
      data: {
        name: dto.name,
        tier: dto.tier,
        billingInterval: dto.billingInterval,
        basePriceMinorUnits: dto.basePriceMinorUnits,
        currency: dto.currency,
        features: dto.features as Prisma.InputJsonValue,
        customTerms:
          dto.customTerms !== undefined
            ? (dto.customTerms as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async deactivatePlan(id: string): Promise<CpPlan> {
    await this.getPlan(id); // throws NotFoundException if missing
    return this.prisma.cpPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
