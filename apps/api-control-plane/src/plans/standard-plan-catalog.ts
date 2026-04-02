import { Prisma } from '../generated/prisma';

export interface StandardPlanSpec {
  name: string;
  tier: 'starter' | 'growth' | 'enterprise';
  billingInterval: 'monthly' | 'annual';
  currency: 'NGN' | 'USD' | 'GHS' | 'KES' | 'ZAR';
  basePriceMinorUnits: number;
  features: Record<string, unknown>;
  customTerms?: Record<string, unknown> | null;
}

type SupportedCurrency = StandardPlanSpec['currency'];
type PlanTier = StandardPlanSpec['tier'];
type PlanInterval = StandardPlanSpec['billingInterval'];

const STARTER_MONTHLY_PRICE: Record<SupportedCurrency, number> = {
  NGN: 1_500_000,
  USD: 9_900,
  GHS: 15_000,
  KES: 250_000,
  ZAR: 35_000,
};

const GROWTH_MONTHLY_PRICE: Record<SupportedCurrency, number> = {
  NGN: 3_500_000,
  USD: 29_900,
  GHS: 35_000,
  KES: 550_000,
  ZAR: 80_000,
};

const MONTHLY_TO_ANNUAL_MULTIPLIER = 10;

const STARTER_FEATURES = {
  operatingUnitCap: 1,
  vehicleCap: 10,
  assignmentCap: 25,
  seatLimit: 3,
  verificationEnabled: false,
  walletEnabled: false,
  intelligenceEnabled: false,
  bulkAssignmentsEnabled: false,
  exportsEnabled: false,
  supportTier: 'email',
};

const GROWTH_FEATURES_BY_CURRENCY: Record<SupportedCurrency, Record<string, unknown>> = {
  NGN: {
    operatingUnitCap: 5,
    vehicleCap: 20,
    assignmentCap: 50,
    vehicleOverageRateMinorUnits: 150_000,
    seatLimit: 25,
    verificationEnabled: true,
    verificationsIncluded: 10,
    verificationRateMinorUnits: 60_000,
    walletEnabled: true,
    intelligenceEnabled: true,
    bulkAssignmentsEnabled: true,
    exportsEnabled: true,
    supportTier: 'whatsapp_email',
  },
  USD: {
    operatingUnitCap: 5,
    vehicleCap: 20,
    assignmentCap: 50,
    vehicleOverageRateMinorUnits: 1_500,
    seatLimit: 25,
    verificationEnabled: true,
    verificationsIncluded: 10,
    verificationRateMinorUnits: 600,
    walletEnabled: true,
    intelligenceEnabled: true,
    bulkAssignmentsEnabled: true,
    exportsEnabled: true,
    supportTier: 'whatsapp_email',
  },
  GHS: {
    operatingUnitCap: 5,
    vehicleCap: 20,
    assignmentCap: 50,
    vehicleOverageRateMinorUnits: 1_500,
    seatLimit: 25,
    verificationEnabled: true,
    verificationsIncluded: 10,
    walletEnabled: true,
    intelligenceEnabled: true,
    bulkAssignmentsEnabled: true,
    exportsEnabled: true,
    supportTier: 'whatsapp_email',
  },
  KES: {
    operatingUnitCap: 5,
    vehicleCap: 20,
    assignmentCap: 50,
    vehicleOverageRateMinorUnits: 25_000,
    seatLimit: 25,
    verificationEnabled: true,
    verificationsIncluded: 10,
    walletEnabled: true,
    intelligenceEnabled: true,
    bulkAssignmentsEnabled: true,
    exportsEnabled: true,
    supportTier: 'whatsapp_email',
  },
  ZAR: {
    operatingUnitCap: 5,
    vehicleCap: 20,
    assignmentCap: 50,
    vehicleOverageRateMinorUnits: 3_500,
    seatLimit: 25,
    verificationEnabled: true,
    verificationsIncluded: 10,
    walletEnabled: true,
    intelligenceEnabled: true,
    bulkAssignmentsEnabled: true,
    exportsEnabled: true,
    supportTier: 'whatsapp_email',
  },
};

const ENTERPRISE_FEATURES = {
  operatingUnitCap: null,
  vehicleCap: null,
  assignmentCap: null,
  seatLimit: null,
  verificationEnabled: true,
  walletEnabled: true,
  intelligenceEnabled: true,
  bulkAssignmentsEnabled: true,
  exportsEnabled: true,
  whiteLabelAvailable: true,
  ssoAvailable: true,
  supportTier: 'dedicated',
  assistedUpgradeOnly: true,
};

const ENTERPRISE_CUSTOM_TERMS = {
  pricingModel: 'custom_quote_required',
  minimumFleetSize: 50,
  contactSalesRequired: true,
};

function buildPlanSpec(input: {
  name: string;
  tier: PlanTier;
  interval: PlanInterval;
  currency: SupportedCurrency;
  monthlyPriceMinorUnits: number;
  features: Record<string, unknown>;
  customTerms?: Record<string, unknown> | null;
}): StandardPlanSpec {
  return {
    name: input.name,
    tier: input.tier,
    billingInterval: input.interval,
    currency: input.currency,
    basePriceMinorUnits:
      input.interval === 'annual'
        ? input.monthlyPriceMinorUnits * MONTHLY_TO_ANNUAL_MULTIPLIER
        : input.monthlyPriceMinorUnits,
    features: input.features,
    customTerms: input.customTerms ?? null,
  };
}

function buildTierCatalog(
  tier: PlanTier,
  name: string,
  monthlyPrices: Record<SupportedCurrency, number>,
  featuresByCurrency: Record<SupportedCurrency, Record<string, unknown>>,
  options?: { customTerms?: Record<string, unknown> | null; annual?: boolean },
): StandardPlanSpec[] {
  const intervals: PlanInterval[] = options?.annual === false ? ['monthly'] : ['monthly', 'annual'];

  return (Object.keys(monthlyPrices) as SupportedCurrency[]).flatMap((currency) =>
    intervals.map((interval) =>
      buildPlanSpec({
        name,
        tier,
        interval,
        currency,
        monthlyPriceMinorUnits: monthlyPrices[currency],
        features: featuresByCurrency[currency],
        ...(options?.customTerms !== undefined ? { customTerms: options.customTerms } : {}),
      }),
    ),
  );
}

export const STANDARD_PLAN_CATALOG: StandardPlanSpec[] = [
  ...buildTierCatalog(
    'starter',
    'Starter',
    STARTER_MONTHLY_PRICE,
    {
      NGN: STARTER_FEATURES,
      USD: STARTER_FEATURES,
      GHS: STARTER_FEATURES,
      KES: STARTER_FEATURES,
      ZAR: STARTER_FEATURES,
    },
  ),
  ...buildTierCatalog('growth', 'Growth', GROWTH_MONTHLY_PRICE, GROWTH_FEATURES_BY_CURRENCY),
  ...buildTierCatalog(
    'enterprise',
    'Enterprise',
    {
      NGN: 0,
      USD: 0,
      GHS: 0,
      KES: 0,
      ZAR: 0,
    },
    {
      NGN: ENTERPRISE_FEATURES,
      USD: ENTERPRISE_FEATURES,
      GHS: ENTERPRISE_FEATURES,
      KES: ENTERPRISE_FEATURES,
      ZAR: ENTERPRISE_FEATURES,
    },
    { customTerms: ENTERPRISE_CUSTOM_TERMS },
  ),
];

export function toPlanJsonValue(
  value: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value == null) {
    return Prisma.JsonNull;
  }
  return value as Prisma.InputJsonValue;
}
