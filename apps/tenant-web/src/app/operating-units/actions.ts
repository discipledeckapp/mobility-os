'use server';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createOperatingUnit,
  updateOperatingUnit,
  type CreateOperatingUnitInput,
  type UpdateOperatingUnitInput,
} from '../../lib/api-core';

export interface OperatingUnitActionState {
  error?: string;
  success?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getPayload(
  formData: FormData,
): CreateOperatingUnitInput & UpdateOperatingUnitInput {
  return {
    name: getTrimmedValue(formData, 'name'),
    businessEntityId: getTrimmedValue(formData, 'businessEntityId'),
  };
}

function getRedirectPath(businessEntityId: string): Route {
  return `/business-entities?entityId=${encodeURIComponent(businessEntityId)}`;
}

export async function createOperatingUnitAction(
  _prevState: OperatingUnitActionState,
  formData: FormData,
): Promise<OperatingUnitActionState> {
  const payload = getPayload(formData);

  if (!payload.name || !payload.businessEntityId) {
    return {
      error: 'Operating unit name and business entity are required.',
    };
  }

  try {
    await createOperatingUnit(payload);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to create operating unit at this time.',
    };
  }

  revalidatePath('/business-entities');
  redirect(getRedirectPath(payload.businessEntityId));
}

export async function updateOperatingUnitAction(
  _prevState: OperatingUnitActionState,
  formData: FormData,
): Promise<OperatingUnitActionState> {
  const operatingUnitId = getTrimmedValue(formData, 'operatingUnitId');
  const payload = getPayload(formData);

  if (!operatingUnitId || !payload.name || !payload.businessEntityId) {
    return {
      error: 'Operating unit name and business entity are required.',
    };
  }

  try {
    await updateOperatingUnit(operatingUnitId, payload);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to update operating unit at this time.',
    };
  }

  revalidatePath('/business-entities');
  redirect(getRedirectPath(payload.businessEntityId));
}
