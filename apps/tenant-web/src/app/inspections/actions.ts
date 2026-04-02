'use server';

import { revalidatePath } from 'next/cache';
import { createVehicleInspection } from '../../lib/api-core';

export interface InspectionWorkbenchActionState {
  error?: string;
  success?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function parseOptionalInteger(value: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = Number.parseInt(value, 10);
  return Number.isFinite(normalized) ? normalized : undefined;
}

export async function createInspectionAction(
  _prevState: InspectionWorkbenchActionState,
  formData: FormData,
): Promise<InspectionWorkbenchActionState> {
  const vehicleId = getTrimmedValue(formData, 'vehicleId');
  const inspectionDate = getTrimmedValue(formData, 'inspectionDate');
  const status = getTrimmedValue(formData, 'status');
  const summary = getTrimmedValue(formData, 'summary');

  if (!vehicleId || !inspectionDate || !status || !summary) {
    return {
      error: 'Vehicle, inspection date, outcome, and summary are required.',
    };
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
    summary,
  };

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

  revalidatePath('/inspections');
  revalidatePath('/maintenance');
  revalidatePath('/vehicles/health');
  revalidatePath('/reports/readiness');
  revalidatePath(`/vehicles/${vehicleId}`);
  return {
    success: 'Inspection saved successfully.',
  };
}
