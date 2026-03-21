// =============================================================================
// Business model registry
// Supported fleet business model configurations.
// These describe the commercial relationship between an operator and a driver.
// =============================================================================

export interface BusinessModelConfig {
  /** Stable URL-safe slug used as the canonical identifier. */
  slug: string;
  name: string;
  description: string;
  /** True if the driver holds (or is acquiring) ownership of the vehicle. */
  driverOwnsVehicle: boolean;
  /** True if the operator retains ownership of the vehicle. */
  operatorOwnsVehicle: boolean;
  /**
   * Whether remittance targets are typically configured for this model.
   * Owner-operator models may still use remittance for fee collection.
   */
  hasRemittanceTarget: boolean;
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const BUSINESS_MODELS: Readonly<Record<string, BusinessModelConfig>> = {
  'hire-purchase': {
    slug: 'hire-purchase',
    name: 'Hire Purchase',
    description:
      'Operator owns the vehicle. Driver purchases equity over time ' +
      'through scheduled remittance deductions. Ownership transfers at ' +
      'the end of the purchase period.',
    driverOwnsVehicle: false,
    operatorOwnsVehicle: true,
    hasRemittanceTarget: true,
  },
  lease: {
    slug: 'lease',
    name: 'Lease',
    description:
      'Operator owns the vehicle. Driver pays a periodic lease fee to ' +
      'operate it. No equity transfer — vehicle returns to operator at ' +
      'end of lease.',
    driverOwnsVehicle: false,
    operatorOwnsVehicle: true,
    hasRemittanceTarget: true,
  },
  'owner-operator': {
    slug: 'owner-operator',
    name: 'Owner-Operator',
    description:
      'Driver owns the vehicle and operates independently. The operator ' +
      'manages compliance, scheduling, and may collect platform fees through ' +
      'remittance.',
    driverOwnsVehicle: true,
    operatorOwnsVehicle: false,
    hasRemittanceTarget: false,
  },
  'daily-rental': {
    slug: 'daily-rental',
    name: 'Daily Rental',
    description:
      'Operator owns the vehicle. Driver pays a flat daily fee. Short-term ' +
      'commitment with no equity component.',
    driverOwnsVehicle: false,
    operatorOwnsVehicle: true,
    hasRemittanceTarget: true,
  },
} as const;

// ── Lookup utilities ──────────────────────────────────────────────────────────

export function getBusinessModel(slug: string): BusinessModelConfig {
  const model = BUSINESS_MODELS[slug];
  if (model === undefined) {
    throw new Error(
      `Business model '${slug}' is not registered. ` +
        `Available: ${Object.keys(BUSINESS_MODELS).join(', ')}`,
    );
  }
  return model;
}

export function getAllBusinessModelSlugs(): string[] {
  return Object.keys(BUSINESS_MODELS);
}
