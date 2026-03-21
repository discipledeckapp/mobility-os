import type { VehicleRecord } from './api-core';

export function getVehiclePrimaryLabel(
  vehicle: Pick<VehicleRecord, 'tenantVehicleCode' | 'systemVehicleCode'>,
): string {
  return vehicle.tenantVehicleCode || vehicle.systemVehicleCode;
}

export function getVehicleSecondaryLabel(
  vehicle: Pick<VehicleRecord, 'plate' | 'make' | 'model' | 'year'>,
  options?: { includePlate?: boolean },
): string {
  const profile = [vehicle.make, vehicle.model, `(${vehicle.year})`].filter(Boolean).join(' ');
  if (options?.includePlate === false) {
    return profile;
  }

  return vehicle.plate ? `${vehicle.plate} • ${profile}` : profile;
}
