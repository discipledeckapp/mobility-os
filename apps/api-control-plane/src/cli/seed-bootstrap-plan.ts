import { Prisma } from '../generated/prisma';
import { PrismaClient } from '../generated/prisma';

interface ParsedArgs {
  name: string;
  tier: string;
  billingInterval: string;
  currency: string;
  basePriceMinorUnits: number;
}

const DEFAULT_PLAN = {
  name: 'Growth Monthly',
  tier: 'growth',
  billingInterval: 'monthly',
  currency: 'NGN',
  basePriceMinorUnits: 5000000,
  features: {
    seatLimit: 25,
    fleetCap: 250,
    intelligenceEnabled: true,
    walletEnabled: true,
    supportTier: 'standard',
  },
} as const;

function parseArgs(argv: string[]): ParsedArgs {
  const args = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (!current?.startsWith('--') || !next) {
      continue;
    }

    args.set(current.slice(2), next);
    index += 1;
  }

  const basePriceMinorUnitsRaw =
    args.get('basePriceMinorUnits') ?? `${DEFAULT_PLAN.basePriceMinorUnits}`;
  const basePriceMinorUnits = Number.parseInt(basePriceMinorUnitsRaw, 10);

  if (Number.isNaN(basePriceMinorUnits) || basePriceMinorUnits < 0) {
    throw new Error('--basePriceMinorUnits must be a non-negative integer');
  }

  return {
    name: args.get('name') ?? DEFAULT_PLAN.name,
    tier: args.get('tier') ?? DEFAULT_PLAN.tier,
    billingInterval: args.get('billingInterval') ?? DEFAULT_PLAN.billingInterval,
    currency: (args.get('currency') ?? DEFAULT_PLAN.currency).toUpperCase(),
    basePriceMinorUnits,
  };
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const args = parseArgs(process.argv.slice(2));

    const existing = await prisma.cpPlan.findFirst({
      where: {
        tier: args.tier,
        billingInterval: args.billingInterval,
        currency: args.currency,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (existing) {
      console.log(
        JSON.stringify(
          {
            status: 'exists',
            message: 'Active bootstrap plan already present.',
            plan: {
              id: existing.id,
              name: existing.name,
              tier: existing.tier,
              billingInterval: existing.billingInterval,
              currency: existing.currency,
            },
          },
          null,
          2,
        ),
      );
      return;
    }

    const plan = await prisma.cpPlan.create({
      data: {
        name: args.name,
        tier: args.tier,
        billingInterval: args.billingInterval,
        basePriceMinorUnits: args.basePriceMinorUnits,
        currency: args.currency,
        isActive: true,
        features: DEFAULT_PLAN.features as Prisma.InputJsonValue,
        customTerms: Prisma.JsonNull,
      },
    });

    console.log(
      JSON.stringify(
        {
          status: 'created',
          plan: {
            id: plan.id,
            name: plan.name,
            tier: plan.tier,
            billingInterval: plan.billingInterval,
            basePriceMinorUnits: plan.basePriceMinorUnits,
            currency: plan.currency,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
