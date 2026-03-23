'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createBusinessEntity,
  updateBusinessEntity,
  type CreateBusinessEntityInput,
  type UpdateBusinessEntityInput,
} from '../../lib/api-core';

export interface BusinessEntityActionState {
  error?: string;
  success?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getPayload(
  formData: FormData,
): CreateBusinessEntityInput & UpdateBusinessEntityInput {
  return {
    name: getTrimmedValue(formData, 'name'),
    country: getTrimmedValue(formData, 'country').toUpperCase(),
    businessModel: getTrimmedValue(formData, 'businessModel'),
  };
}

export async function createBusinessEntityAction(
  _prevState: BusinessEntityActionState,
  formData: FormData,
): Promise<BusinessEntityActionState> {
  const payload = getPayload(formData);

  if (!payload.name || !payload.country || !payload.businessModel) {
    return {
      error: 'Name, country, and business model are required.',
    };
  }

  try {
    await createBusinessEntity(payload);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to create business entity at this time.',
    };
  }

  revalidatePath('/business-entities');
  redirect('/business-entities');
}

export async function updateBusinessEntityAction(
  _prevState: BusinessEntityActionState,
  formData: FormData,
): Promise<BusinessEntityActionState> {
  const businessEntityId = getTrimmedValue(formData, 'businessEntityId');
  const payload = getPayload(formData);

  if (!businessEntityId || !payload.name || !payload.country || !payload.businessModel) {
    return {
      error: 'Name, country, and business model are required.',
    };
  }

  try {
    await updateBusinessEntity(businessEntityId, payload);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to update business entity at this time.',
    };
  }

  revalidatePath('/business-entities');
  redirect('/business-entities');
}
