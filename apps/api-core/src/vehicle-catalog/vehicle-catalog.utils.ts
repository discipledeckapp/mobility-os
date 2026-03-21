import { VehicleCategory, getVehicleType } from '@mobility-os/domain-config';

export function normalizeVehicleCatalogName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function mapVehicleTypeSlugToCategory(vehicleType?: string): string | undefined {
  if (!vehicleType) {
    return undefined;
  }

  return getVehicleType(vehicleType).category;
}

export function mapExternalTypeLabelToVehicleCategory(typeLabel?: string | null): string | null {
  const normalized = typeLabel?.trim().toLowerCase();
  switch (normalized) {
    case 'motorcycle':
      return VehicleCategory.Motorcycle;
    case 'car':
    case 'passenger car':
      return VehicleCategory.Car;
    case 'multipurpose passenger vehicle (mpv)':
      return VehicleCategory.Car;
    case 'bus':
    case 'incomplete vehicle':
      return VehicleCategory.Bus;
    case 'truck':
    case 'heavy vehicle':
      return VehicleCategory.Truck;
    default:
      return null;
  }
}
