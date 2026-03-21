// =============================================================================
// Vehicle type registry
// Platform-wide vehicle category and type definitions, country-agnostic.
// =============================================================================

export enum VehicleCategory {
  Motorcycle = 'motorcycle',
  Tricycle = 'tricycle',
  Car = 'car',
  Minibus = 'minibus',
  Bus = 'bus',
  Truck = 'truck',
}

export interface VehicleTypeConfig {
  /** Stable URL-safe slug, used as the canonical identifier. */
  slug: string;
  /** Human-readable display name. */
  name: string;
  category: VehicleCategory;
  /**
   * Typical passenger capacity range (indicative, not enforced).
   * undefined for cargo vehicles.
   */
  passengerCapacity?: { min: number; max: number };
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const VEHICLE_TYPES: Readonly<VehicleTypeConfig[]> = [
  // Motorcycles
  {
    slug: 'motorcycle',
    name: 'Motorcycle',
    category: VehicleCategory.Motorcycle,
    passengerCapacity: { min: 1, max: 1 },
  },
  // Tricycles
  {
    slug: 'tricycle',
    name: 'Tricycle',
    category: VehicleCategory.Tricycle,
    passengerCapacity: { min: 1, max: 3 },
  },
  // Cars
  {
    slug: 'saloon',
    name: 'Saloon Car',
    category: VehicleCategory.Car,
    passengerCapacity: { min: 1, max: 4 },
  },
  {
    slug: 'suv',
    name: 'SUV',
    category: VehicleCategory.Car,
    passengerCapacity: { min: 1, max: 6 },
  },
  {
    slug: 'minivan',
    name: 'Minivan',
    category: VehicleCategory.Car,
    passengerCapacity: { min: 1, max: 7 },
  },
  // Minibuses
  {
    slug: 'minibus-14',
    name: 'Minibus (14-seater)',
    category: VehicleCategory.Minibus,
    passengerCapacity: { min: 10, max: 14 },
  },
  {
    slug: 'minibus-18',
    name: 'Minibus (18-seater)',
    category: VehicleCategory.Minibus,
    passengerCapacity: { min: 14, max: 18 },
  },
  // Buses
  {
    slug: 'bus-32',
    name: 'Bus (32-seater)',
    category: VehicleCategory.Bus,
    passengerCapacity: { min: 28, max: 32 },
  },
  {
    slug: 'bus-45',
    name: 'Coach Bus (45-seater)',
    category: VehicleCategory.Bus,
    passengerCapacity: { min: 40, max: 45 },
  },
  // Trucks (cargo)
  {
    slug: 'pickup-truck',
    name: 'Pickup Truck',
    category: VehicleCategory.Truck,
  },
  {
    slug: 'flatbed-truck',
    name: 'Flatbed Truck',
    category: VehicleCategory.Truck,
  },
] as const;

// ── Lookup utilities ──────────────────────────────────────────────────────────

export function getVehicleType(slug: string): VehicleTypeConfig {
  const found = VEHICLE_TYPES.find((v) => v.slug === slug);
  if (found === undefined) {
    throw new Error(
      `Vehicle type '${slug}' is not registered. ` +
        `Available: ${VEHICLE_TYPES.map((v) => v.slug).join(', ')}`,
    );
  }
  return found;
}

export function getVehicleTypesByCategory(category: VehicleCategory): VehicleTypeConfig[] {
  return VEHICLE_TYPES.filter((v) => v.category === category);
}

export function getAllVehicleTypeSlugs(): string[] {
  return VEHICLE_TYPES.map((v) => v.slug);
}
