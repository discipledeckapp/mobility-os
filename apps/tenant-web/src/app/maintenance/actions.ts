'use server';

import { revalidatePath } from 'next/cache';
import {
  createWorkOrder,
  type CreateWorkOrderInput,
  updateWorkOrder,
  type UpdateWorkOrderInput,
} from '../../lib/api-core';

export interface MaintenanceWorkbenchActionState {
  error?: string;
  success?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function parseMinorUnits(value: string): number | undefined {
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

export async function createWorkOrderAction(
  _prevState: MaintenanceWorkbenchActionState,
  formData: FormData,
): Promise<MaintenanceWorkbenchActionState> {
  const vehicleId = getTrimmedValue(formData, 'vehicleId');
  const issueDescription = getTrimmedValue(formData, 'issueDescription');
  const priority = getTrimmedValue(formData, 'priority');

  if (!vehicleId || !issueDescription || !priority) {
    return {
      error: 'Vehicle, issue description, and priority are required.',
    };
  }

  const payload: CreateWorkOrderInput = {
    vehicleId,
    issueDescription,
    priority,
  };

  const vendorName = getTrimmedValue(formData, 'vendorName');
  const notes = getTrimmedValue(formData, 'notes');
  const currency = getTrimmedValue(formData, 'currency').toUpperCase();
  const partsCostMinorUnits = parseMinorUnits(getTrimmedValue(formData, 'partsCost'));
  const labourCostMinorUnits = parseMinorUnits(getTrimmedValue(formData, 'labourCost'));

  if (vendorName) {
    payload.vendorName = vendorName;
  }
  if (notes) {
    payload.notes = notes;
  }
  if (currency) {
    payload.currency = currency;
  }
  if (partsCostMinorUnits !== undefined) {
    payload.partsCostMinorUnits = partsCostMinorUnits;
  }
  if (labourCostMinorUnits !== undefined) {
    payload.labourCostMinorUnits = labourCostMinorUnits;
  }

  try {
    await createWorkOrder(payload);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to create work order right now.',
    };
  }

  revalidatePath('/maintenance');
  revalidatePath('/vehicles/health');
  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath('/reports/readiness');
  return {
    success: 'Work order created successfully.',
  };
}

export async function updateWorkOrderAction(
  _prevState: MaintenanceWorkbenchActionState,
  formData: FormData,
): Promise<MaintenanceWorkbenchActionState> {
  const workOrderId = getTrimmedValue(formData, 'workOrderId');
  const vehicleId = getTrimmedValue(formData, 'vehicleId');
  const status = getTrimmedValue(formData, 'status');

  if (!workOrderId || !vehicleId || !status) {
    return {
      error: 'Work order, vehicle, and status are required.',
    };
  }

  const payload: UpdateWorkOrderInput = {
    status,
  };

  const issueDescription = getTrimmedValue(formData, 'issueDescription');
  const priority = getTrimmedValue(formData, 'priority');
  const currency = getTrimmedValue(formData, 'currency').toUpperCase();
  const notes = getTrimmedValue(formData, 'notes');
  const partsCostMinorUnits = parseMinorUnits(getTrimmedValue(formData, 'partsCost'));
  const labourCostMinorUnits = parseMinorUnits(getTrimmedValue(formData, 'labourCost'));

  if (issueDescription) {
    payload.issueDescription = issueDescription;
  }
  if (priority) {
    payload.priority = priority;
  }
  if (currency) {
    payload.currency = currency;
  }
  if (notes) {
    payload.notes = notes;
  }
  if (partsCostMinorUnits !== undefined) {
    payload.partsCostMinorUnits = partsCostMinorUnits;
  }
  if (labourCostMinorUnits !== undefined) {
    payload.labourCostMinorUnits = labourCostMinorUnits;
  }

  try {
    await updateWorkOrder(workOrderId, payload);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to update work order right now.',
    };
  }

  revalidatePath('/maintenance');
  revalidatePath('/vehicles/health');
  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath('/reports/readiness');
  return {
    success: 'Work order updated successfully.',
  };
}
