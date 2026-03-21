'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  type CreateVehicleInput,
  type UpdateVehicleInput,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
} from '../../lib/api-core';

export interface CreateVehicleActionState {
  error?: string;
  success?: string;
}

export interface UpdateVehicleStatusActionState {
  error?: string;
  success?: string;
}

export interface UpdateVehicleActionState {
  error?: string;
  success?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function parseAmountToMinorUnits(value: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 0) {
    return undefined;
  }

  return Math.round(normalized * 100);
}

export async function createVehicleAction(
  _prevState: CreateVehicleActionState,
  formData: FormData,
): Promise<CreateVehicleActionState> {
  const yearValue = getTrimmedValue(formData, 'year');
  const year = Number(yearValue);
  const tenantVehicleCode = getTrimmedValue(formData, 'tenantVehicleCode').toUpperCase();

  const payload: CreateVehicleInput = {
    fleetId: getTrimmedValue(formData, 'fleetId'),
    vehicleType: getTrimmedValue(formData, 'vehicleType'),
    make: getTrimmedValue(formData, 'make'),
    model: getTrimmedValue(formData, 'model'),
    year,
  };

  const color = getTrimmedValue(formData, 'color');
  const trim = getTrimmedValue(formData, 'trim');
  const plate = getTrimmedValue(formData, 'plate').toUpperCase();
  const vin = getTrimmedValue(formData, 'vin').toUpperCase();
  const acquisitionDate = getTrimmedValue(formData, 'acquisitionDate');
  const valuationSource = getTrimmedValue(formData, 'valuationSource');
  const acquisitionCostMinorUnits = parseAmountToMinorUnits(
    getTrimmedValue(formData, 'acquisitionCost'),
  );
  const currentEstimatedValueMinorUnits = parseAmountToMinorUnits(
    getTrimmedValue(formData, 'currentEstimatedValue'),
  );

  if (
    !payload.fleetId ||
    !payload.vehicleType ||
    !payload.make ||
    !payload.model ||
    !yearValue ||
    !Number.isInteger(year)
  ) {
    return {
      error: 'Fleet, vehicle type, make, model, and year are required.',
    };
  }

  if (
    (acquisitionDate && acquisitionCostMinorUnits === undefined) ||
    (!acquisitionDate && acquisitionCostMinorUnits !== undefined)
  ) {
    return {
      error: 'Acquisition cost and acquisition date must be entered together.',
    };
  }

  if (tenantVehicleCode) {
    payload.tenantVehicleCode = tenantVehicleCode;
  }
  if (color) {
    payload.color = color;
  }
  if (trim) {
    payload.trim = trim;
  }
  if (vin) {
    payload.vin = vin;
  }
  if (plate) {
    payload.plate = plate;
  }
  if (acquisitionDate && acquisitionCostMinorUnits !== undefined) {
    payload.acquisitionDate = acquisitionDate;
    payload.acquisitionCostMinorUnits = acquisitionCostMinorUnits;
  }
  if (currentEstimatedValueMinorUnits !== undefined) {
    payload.currentEstimatedValueMinorUnits = currentEstimatedValueMinorUnits;
  }
  if (valuationSource) {
    payload.valuationSource = valuationSource;
  }

  try {
    await createVehicle(payload);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to create vehicle at this time.',
    };
  }

  revalidatePath('/vehicles');
  redirect('/vehicles');
}

export async function updateVehicleStatusAction(
  _prevState: UpdateVehicleStatusActionState,
  formData: FormData,
): Promise<UpdateVehicleStatusActionState> {
  const vehicleId = getTrimmedValue(formData, 'vehicleId');
  const status = getTrimmedValue(formData, 'status');

  if (!vehicleId || !status) {
    return { error: 'Vehicle and status are required.' };
  }

  try {
    await updateVehicleStatus(vehicleId, status);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to update vehicle status at this time.',
    };
  }

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${vehicleId}`);
  return {
    success: `Vehicle status updated to ${status}.`,
  };
}

export async function updateVehicleAction(
  _prevState: UpdateVehicleActionState,
  formData: FormData,
): Promise<UpdateVehicleActionState> {
  const vehicleId = getTrimmedValue(formData, 'vehicleId');
  const tenantVehicleCode = getTrimmedValue(formData, 'tenantVehicleCode').toUpperCase();

  if (!vehicleId || !tenantVehicleCode) {
    return { error: 'Vehicle and organisation vehicle code are required.' };
  }

  const payload: UpdateVehicleInput = {
    tenantVehicleCode,
    plate: getTrimmedValue(formData, 'plate').toUpperCase(),
    vin: getTrimmedValue(formData, 'vin').toUpperCase(),
  };

  const color = getTrimmedValue(formData, 'color');
  const acquisitionDate = getTrimmedValue(formData, 'acquisitionDate');
  const valuationSource = getTrimmedValue(formData, 'valuationSource');
  const acquisitionCostMinorUnits = parseAmountToMinorUnits(
    getTrimmedValue(formData, 'acquisitionCost'),
  );
  const currentEstimatedValueMinorUnits = parseAmountToMinorUnits(
    getTrimmedValue(formData, 'currentEstimatedValue'),
  );

  if (
    (acquisitionDate && acquisitionCostMinorUnits === undefined) ||
    (!acquisitionDate && acquisitionCostMinorUnits !== undefined)
  ) {
    return {
      error: 'Acquisition cost and acquisition date must be entered together.',
    };
  }

  if (color) {
    payload.color = color;
  }
  if (acquisitionDate && acquisitionCostMinorUnits !== undefined) {
    payload.acquisitionDate = acquisitionDate;
    payload.acquisitionCostMinorUnits = acquisitionCostMinorUnits;
  }
  if (currentEstimatedValueMinorUnits !== undefined) {
    payload.currentEstimatedValueMinorUnits = currentEstimatedValueMinorUnits;
  }
  if (valuationSource) {
    payload.valuationSource = valuationSource;
  }

  try {
    await updateVehicle(vehicleId, payload);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to update vehicle at this time.',
    };
  }

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${vehicleId}`);
  return {
    success: 'Vehicle updated successfully.',
  };
}
