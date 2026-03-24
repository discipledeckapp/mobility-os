'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createFleet,
  updateFleet,
  type CreateFleetInput,
  type UpdateFleetInput,
} from '../../lib/api-core';

export interface FleetActionState {
  error?: string;
  success?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getPayload(formData: FormData): CreateFleetInput & UpdateFleetInput {
  return {
    name: getTrimmedValue(formData, 'name'),
    operatingUnitId: getTrimmedValue(formData, 'operatingUnitId'),
    businessModel: getTrimmedValue(formData, 'businessModel'),
  };
}

export async function createFleetAction(
  _prevState: FleetActionState,
  formData: FormData,
): Promise<FleetActionState> {
  const businessEntityId = getTrimmedValue(formData, 'businessEntityId');
  const payload = getPayload(formData);

  if (!payload.name || !businessEntityId || !payload.operatingUnitId || !payload.businessModel) {
    return {
      error: 'Fleet name, business entity, operating unit, and business model are required.',
    };
  }

  try {
    await createFleet(payload);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to create fleet at this time.',
    };
  }

  revalidatePath('/fleets');
  redirect('/fleets');
}

export async function updateFleetAction(
  _prevState: FleetActionState,
  formData: FormData,
): Promise<FleetActionState> {
  const fleetId = getTrimmedValue(formData, 'fleetId');
  const businessEntityId = getTrimmedValue(formData, 'businessEntityId');
  const payload = getPayload(formData);

  if (
    !fleetId ||
    !payload.name ||
    !businessEntityId ||
    !payload.operatingUnitId ||
    !payload.businessModel
  ) {
    return {
      error: 'Fleet name, business entity, operating unit, and business model are required.',
    };
  }

  try {
    await updateFleet(fleetId, payload);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to update fleet at this time.',
    };
  }

  revalidatePath('/fleets');
  redirect('/fleets');
}
