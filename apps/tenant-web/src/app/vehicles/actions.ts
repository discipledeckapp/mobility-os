'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  type CreateVehicleInput,
  type UpdateVehicleInput,
  createVehicle,
  createVehicleIncident,
  createVehicleInspection,
  createVehicleMaintenanceEvent,
  importVehiclesCsv,
  updateVehicle,
  updateVehicleStatus,
  upsertVehicleMaintenanceSchedule,
} from '../../lib/api-core';
import { readBulkImportFileAsCsv } from '../../lib/bulk-import-spreadsheet';
import { normalizeVehicleValuationInput } from './valuation-input';

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

export interface VehicleLifecycleActionState {
  error?: string;
  success?: string;
}

export interface VehicleBulkImportActionState {
  error?: string;
  success?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function parseAmountToMinorUnits(value: string): number | undefined {
  const normalized = value.trim().replace(/,/g, '');
  if (!normalized) {
    return undefined;
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    return undefined;
  }

  return Math.round(amount * 100);
}

function parseOptionalInteger(value: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = Number.parseInt(value, 10);
  return Number.isFinite(normalized) ? normalized : undefined;
}

async function getCsvFileContents(formData: FormData): Promise<string> {
  const file = formData.get('csvFile');
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Choose a CSV or Excel file to import.');
  }

  const content = await readBulkImportFileAsCsv(file);
  if (!content.trim()) {
    throw new Error('The uploaded import file is empty.');
  }

  return content;
}

export async function importVehiclesCsvAction(
  _prevState: VehicleBulkImportActionState,
  formData: FormData,
): Promise<VehicleBulkImportActionState> {
  try {
    const csvContent = await getCsvFileContents(formData);
    const result = await importVehiclesCsv(csvContent);
    revalidatePath('/vehicles');
    revalidatePath('/reports/readiness');
    return {
      success: `Imported ${result.createdCount} vehicles. ${result.failedCount} rows failed.`,
      ...(result.errors.length > 0 ? { error: result.errors.slice(0, 5).join(' ') } : {}),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to import vehicle CSV.',
    };
  }
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
  const valuationSource = getTrimmedValue(formData, 'valuationSource');
  const valuationInput = normalizeVehicleValuationInput({
    acquisitionCost: getTrimmedValue(formData, 'acquisitionCost'),
    acquisitionDate: getTrimmedValue(formData, 'acquisitionDate'),
    currentEstimatedValue: getTrimmedValue(formData, 'currentEstimatedValue'),
  });

  if (
    !payload.fleetId ||
    !payload.vehicleType ||
    !payload.make ||
    !yearValue ||
    !Number.isInteger(year)
  ) {
    return {
      error: 'Fleet, vehicle type, make, and year are required.',
    };
  }

  if (valuationInput.validationErrors.length > 0) {
    return {
      error: valuationInput.validationErrors[0] ?? 'Vehicle valuation details are invalid.',
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
  if (
    valuationInput.acquisitionDate.value &&
    valuationInput.acquisitionCost.minorUnits !== undefined
  ) {
    payload.acquisitionDate = valuationInput.acquisitionDate.value;
    payload.acquisitionCostMinorUnits = valuationInput.acquisitionCost.minorUnits;
  }
  if (valuationInput.currentEstimatedValue.minorUnits !== undefined) {
    payload.currentEstimatedValueMinorUnits = valuationInput.currentEstimatedValue.minorUnits;
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
  const valuationSource = getTrimmedValue(formData, 'valuationSource');
  const odometerKm = parseOptionalInteger(getTrimmedValue(formData, 'odometerKm'));
  const valuationInput = normalizeVehicleValuationInput({
    acquisitionCost: getTrimmedValue(formData, 'acquisitionCost'),
    acquisitionDate: getTrimmedValue(formData, 'acquisitionDate'),
    currentEstimatedValue: getTrimmedValue(formData, 'currentEstimatedValue'),
  });

  if (valuationInput.validationErrors.length > 0) {
    return {
      error: valuationInput.validationErrors[0] ?? 'Vehicle valuation details are invalid.',
    };
  }

  if (color) {
    payload.color = color;
  }
  if (odometerKm !== undefined) {
    payload.odometerKm = odometerKm;
  }
  if (
    valuationInput.acquisitionDate.value &&
    valuationInput.acquisitionCost.minorUnits !== undefined
  ) {
    payload.acquisitionDate = valuationInput.acquisitionDate.value;
    payload.acquisitionCostMinorUnits = valuationInput.acquisitionCost.minorUnits;
  }
  if (valuationInput.currentEstimatedValue.minorUnits !== undefined) {
    payload.currentEstimatedValueMinorUnits = valuationInput.currentEstimatedValue.minorUnits;
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

export async function createVehicleInspectionAction(
  _prevState: VehicleLifecycleActionState,
  formData: FormData,
): Promise<VehicleLifecycleActionState> {
  const vehicleId = getTrimmedValue(formData, 'vehicleId');
  const inspectionDate = getTrimmedValue(formData, 'inspectionDate');
  const status = getTrimmedValue(formData, 'status');

  if (!vehicleId || !inspectionDate || !status) {
    return { error: 'Inspection date and outcome are required.' };
  }

  const payload: {
    inspectionType: string;
    inspectionDate: string;
    status: string;
    summary: string;
    odometerKm?: number;
    reportSource?: string;
    reportUrl?: string;
    nextInspectionDueAt?: string;
    issuesFoundCount?: number;
  } = {
    inspectionType: getTrimmedValue(formData, 'inspectionType') || 'routine',
    inspectionDate,
    status,
    summary: getTrimmedValue(formData, 'summary'),
  };

  if (!payload.summary) {
    return { error: 'Inspection summary is required.' };
  }

  const odometerKm = parseOptionalInteger(getTrimmedValue(formData, 'odometerKm'));
  const reportSource = getTrimmedValue(formData, 'reportSource');
  const reportUrl = getTrimmedValue(formData, 'reportUrl');
  const nextInspectionDueAt = getTrimmedValue(formData, 'nextInspectionDueAt');
  const issuesFoundCount = parseOptionalInteger(getTrimmedValue(formData, 'issuesFoundCount'));

  if (odometerKm !== undefined) {
    payload.odometerKm = odometerKm;
  }
  if (reportSource) {
    payload.reportSource = reportSource;
  }
  if (reportUrl) {
    payload.reportUrl = reportUrl;
  }
  if (nextInspectionDueAt) {
    payload.nextInspectionDueAt = nextInspectionDueAt;
  }
  if (issuesFoundCount !== undefined) {
    payload.issuesFoundCount = issuesFoundCount;
  }

  try {
    await createVehicleInspection(vehicleId, payload);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to save inspection right now.',
    };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath('/vehicles');
  return { success: 'Inspection saved.' };
}

export async function upsertVehicleMaintenanceScheduleAction(
  _prevState: VehicleLifecycleActionState,
  formData: FormData,
): Promise<VehicleLifecycleActionState> {
  const vehicleId = getTrimmedValue(formData, 'vehicleId');
  const name = getTrimmedValue(formData, 'name');

  if (!vehicleId || !name) {
    return { error: 'Schedule name is required.' };
  }

  const payload: {
    scheduleType: string;
    intervalDays?: number;
    intervalKm?: number;
    nextDueAt?: string;
    nextDueOdometerKm?: number;
    source?: string;
    notes?: string;
    isActive?: boolean;
  } = {
    scheduleType: name,
  };

  const intervalDays = parseOptionalInteger(getTrimmedValue(formData, 'intervalDays'));
  const intervalKm = parseOptionalInteger(getTrimmedValue(formData, 'intervalKm'));
  const firstDueAt = getTrimmedValue(formData, 'firstDueAt');
  const firstDueOdometerKm = parseOptionalInteger(getTrimmedValue(formData, 'firstDueOdometerKm'));
  const notes = getTrimmedValue(formData, 'notes');
  const source = getTrimmedValue(formData, 'source');
  const isActive = getTrimmedValue(formData, 'isActive');

  if (intervalDays !== undefined) {
    payload.intervalDays = intervalDays;
  }
  if (intervalKm !== undefined) {
    payload.intervalKm = intervalKm;
  }
  if (firstDueAt) {
    payload.nextDueAt = firstDueAt;
  }
  if (firstDueOdometerKm !== undefined) {
    payload.nextDueOdometerKm = firstDueOdometerKm;
  }
  if (notes) {
    payload.notes = notes;
  }
  if (source) {
    payload.source = source;
  }
  if (isActive) {
    payload.isActive = isActive === 'true';
  }

  try {
    await upsertVehicleMaintenanceSchedule(vehicleId, payload);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to update maintenance schedule right now.',
    };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath('/vehicles');
  return { success: 'Maintenance schedule saved.' };
}

export async function createVehicleMaintenanceEventAction(
  _prevState: VehicleLifecycleActionState,
  formData: FormData,
): Promise<VehicleLifecycleActionState> {
  const vehicleId = getTrimmedValue(formData, 'vehicleId');
  const maintenanceType = getTrimmedValue(formData, 'maintenanceType');
  const status = getTrimmedValue(formData, 'status');
  const startedAt = getTrimmedValue(formData, 'startedAt');

  if (!vehicleId || !maintenanceType || !status || !startedAt) {
    return { error: 'Maintenance type, status, and start date are required.' };
  }

  const payload: {
    category: string;
    title: string;
    status: string;
    scheduledFor: string;
    completedAt?: string;
    odometerKm?: number;
    vendor?: string;
    description?: string;
    costMinorUnits?: number;
    currency?: string;
  } = {
    category: maintenanceType,
    title: getTrimmedValue(formData, 'title') || maintenanceType,
    status,
    scheduledFor: startedAt,
  };

  const completedAt = getTrimmedValue(formData, 'completedAt');
  const odometerKm = parseOptionalInteger(getTrimmedValue(formData, 'odometerKm'));
  const providerName = getTrimmedValue(formData, 'providerName');
  const summary = getTrimmedValue(formData, 'summary');
  const notes = getTrimmedValue(formData, 'notes');
  const costMinorUnits = parseAmountToMinorUnits(getTrimmedValue(formData, 'cost'));
  const currency = getTrimmedValue(formData, 'currency');

  if (completedAt) {
    payload.completedAt = completedAt;
  }
  if (odometerKm !== undefined) {
    payload.odometerKm = odometerKm;
  }
  if (providerName) {
    payload.vendor = providerName;
  }
  if (summary) {
    payload.description = notes ? `${summary}\n\n${notes}` : summary;
  } else if (notes) {
    payload.description = notes;
  }
  if (costMinorUnits !== undefined) {
    payload.costMinorUnits = costMinorUnits;
  }
  if (currency) {
    payload.currency = currency;
  }

  try {
    await createVehicleMaintenanceEvent(vehicleId, payload);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to save maintenance activity right now.',
    };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath('/vehicles');
  return { success: 'Maintenance activity saved.' };
}

export async function createVehicleIncidentAction(
  _prevState: VehicleLifecycleActionState,
  formData: FormData,
): Promise<VehicleLifecycleActionState> {
  const vehicleId = getTrimmedValue(formData, 'vehicleId');
  const title = getTrimmedValue(formData, 'title');
  const occurredAt = getTrimmedValue(formData, 'occurredAt');

  if (!vehicleId || !title || !occurredAt) {
    return { error: 'Incident title and date are required.' };
  }

  const payload: {
    title: string;
    occurredAt: string;
    category: string;
    severity: string;
    description?: string;
    estimatedCostMinorUnits?: number;
    currency?: string;
    driverId?: string;
  } = {
    title,
    occurredAt,
    category: getTrimmedValue(formData, 'category') || 'incident',
    severity: getTrimmedValue(formData, 'severity') || 'moderate',
  };

  const description = getTrimmedValue(formData, 'description');
  const estimatedCostMinorUnits = parseAmountToMinorUnits(
    getTrimmedValue(formData, 'estimatedCost'),
  );
  const currency = getTrimmedValue(formData, 'currency');
  const driverId = getTrimmedValue(formData, 'driverId');

  if (description) {
    payload.description = description;
  }
  if (estimatedCostMinorUnits !== undefined) {
    payload.estimatedCostMinorUnits = estimatedCostMinorUnits;
  }
  if (currency) {
    payload.currency = currency;
  }
  if (driverId) {
    payload.driverId = driverId;
  }

  try {
    await createVehicleIncident(vehicleId, payload);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to report incident right now.',
    };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath('/vehicles');
  return { success: 'Incident logged.' };
}
