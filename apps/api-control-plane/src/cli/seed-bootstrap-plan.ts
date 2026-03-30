/**
 * Seed the canonical Starter, Growth, and Enterprise billing plans for all
 * supported currencies. Safe to run on every deploy — upserts by
 * (tier, billingInterval, currency).
 */
import { Prisma, PrismaClient } from '../generated/prisma';
import { STANDARD_PLAN_CATALOG, toPlanJsonValue } from '../plans/standard-plan-catalog';

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const results: Array<{ status: string; plan: object }> = [];

    for (const spec of STANDARD_PLAN_CATALOG) {
      const existing = await prisma.cpPlan.findFirst({
        where: {
          tier: spec.tier,
          billingInterval: spec.billingInterval,
          currency: spec.currency,
          isActive: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (existing) {
        // Update price and features so re-deploys pick up pricing changes.
        const updated = await prisma.cpPlan.update({
          where: { id: existing.id },
          data: {
            name: spec.name,
            basePriceMinorUnits: spec.basePriceMinorUnits,
            features: spec.features as Prisma.InputJsonValue,
            customTerms: toPlanJsonValue(spec.customTerms),
          },
        });
        results.push({
          status: 'updated',
          plan: {
            id: updated.id,
            name: updated.name,
            tier: updated.tier,
            currency: updated.currency,
            basePriceMinorUnits: updated.basePriceMinorUnits,
          },
        });
      } else {
        const created = await prisma.cpPlan.create({
          data: {
            name: spec.name,
            tier: spec.tier,
            billingInterval: spec.billingInterval,
            basePriceMinorUnits: spec.basePriceMinorUnits,
            currency: spec.currency,
            isActive: true,
            features: spec.features as Prisma.InputJsonValue,
            customTerms: toPlanJsonValue(spec.customTerms),
          },
        });
        results.push({
          status: 'created',
          plan: {
            id: created.id,
            name: created.name,
            tier: created.tier,
            currency: created.currency,
            basePriceMinorUnits: created.basePriceMinorUnits,
          },
        });
      }
    }

    console.log(JSON.stringify({ status: 'done', results }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

void main();
