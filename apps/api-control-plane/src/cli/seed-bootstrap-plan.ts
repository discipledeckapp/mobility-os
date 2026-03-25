/**
 * Seed the canonical Starter and Growth billing plans for all supported currencies.
 * Safe to run on every deploy — upserts by (tier, billingInterval, currency).
 *
 * Pricing as per docs/marketing/copy/website/pricing-page.md:
 *   Starter  NGN ₦15,000/mo  | vehicleCap:10  driverCap:15  seatLimit:3
 *   Growth   NGN ₦35,000/mo  | vehicleCap:20  driverCap:null seatLimit:25
 *   (GHS / KES / ZAR equivalents at country-config rates)
 */
import { Prisma, PrismaClient } from '../generated/prisma';

interface PlanSpec {
  name: string;
  tier: string;
  billingInterval: string;
  currency: string;
  basePriceMinorUnits: number;
  features: Record<string, unknown>;
}

const PLANS: PlanSpec[] = [
  // ── Starter ───────────────────────────────────────────────────────────────
  {
    name: 'Starter',
    tier: 'starter',
    billingInterval: 'monthly',
    currency: 'NGN',
    basePriceMinorUnits: 1_500_000, // ₦15,000
    features: {
      vehicleCap: 10,
      driverCap: 15,
      seatLimit: 3,
      verificationEnabled: false,
      walletEnabled: false,
      intelligenceEnabled: false,
      supportTier: 'email',
    },
  },
  {
    name: 'Starter',
    tier: 'starter',
    billingInterval: 'monthly',
    currency: 'GHS',
    basePriceMinorUnits: 15_000, // GHS 150
    features: {
      vehicleCap: 10,
      driverCap: 15,
      seatLimit: 3,
      verificationEnabled: false,
      walletEnabled: false,
      intelligenceEnabled: false,
      supportTier: 'email',
    },
  },
  {
    name: 'Starter',
    tier: 'starter',
    billingInterval: 'monthly',
    currency: 'KES',
    basePriceMinorUnits: 250_000, // KES 2,500
    features: {
      vehicleCap: 10,
      driverCap: 15,
      seatLimit: 3,
      verificationEnabled: false,
      walletEnabled: false,
      intelligenceEnabled: false,
      supportTier: 'email',
    },
  },
  {
    name: 'Starter',
    tier: 'starter',
    billingInterval: 'monthly',
    currency: 'ZAR',
    basePriceMinorUnits: 35_000, // ZAR 350
    features: {
      vehicleCap: 10,
      driverCap: 15,
      seatLimit: 3,
      verificationEnabled: false,
      walletEnabled: false,
      intelligenceEnabled: false,
      supportTier: 'email',
    },
  },

  // ── Growth ────────────────────────────────────────────────────────────────
  {
    name: 'Growth',
    tier: 'growth',
    billingInterval: 'monthly',
    currency: 'NGN',
    basePriceMinorUnits: 3_500_000, // ₦35,000
    features: {
      vehicleCap: 20,
      vehicleOverageRateMinorUnits: 150_000, // ₦1,500/vehicle above 20
      driverCap: null, // unlimited
      seatLimit: 25,
      verificationEnabled: true,
      verificationsIncluded: 10,
      verificationRateMinorUnits: 60_000, // ₦600 add-on
      walletEnabled: true,
      intelligenceEnabled: true,
      supportTier: 'whatsapp_email',
    },
  },
  {
    name: 'Growth',
    tier: 'growth',
    billingInterval: 'monthly',
    currency: 'GHS',
    basePriceMinorUnits: 35_000, // GHS 350
    features: {
      vehicleCap: 20,
      vehicleOverageRateMinorUnits: 1_500, // GHS 15
      driverCap: null,
      seatLimit: 25,
      verificationEnabled: true,
      verificationsIncluded: 10,
      walletEnabled: true,
      intelligenceEnabled: true,
      supportTier: 'whatsapp_email',
    },
  },
  {
    name: 'Growth',
    tier: 'growth',
    billingInterval: 'monthly',
    currency: 'KES',
    basePriceMinorUnits: 550_000, // KES 5,500
    features: {
      vehicleCap: 20,
      vehicleOverageRateMinorUnits: 25_000, // KES 250
      driverCap: null,
      seatLimit: 25,
      verificationEnabled: true,
      verificationsIncluded: 10,
      walletEnabled: true,
      intelligenceEnabled: true,
      supportTier: 'whatsapp_email',
    },
  },
  {
    name: 'Growth',
    tier: 'growth',
    billingInterval: 'monthly',
    currency: 'ZAR',
    basePriceMinorUnits: 80_000, // ZAR 800
    features: {
      vehicleCap: 20,
      vehicleOverageRateMinorUnits: 3_500, // ZAR 35
      driverCap: null,
      seatLimit: 25,
      verificationEnabled: true,
      verificationsIncluded: 10,
      walletEnabled: true,
      intelligenceEnabled: true,
      supportTier: 'whatsapp_email',
    },
  },
];

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const results: Array<{ status: string; plan: object }> = [];

    for (const spec of PLANS) {
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
            customTerms: Prisma.JsonNull,
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
