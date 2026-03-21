'use server';

import { revalidatePath } from 'next/cache';
import { transitionTenantLifecycle } from '../../lib/api-control-plane';

export interface TransitionLifecycleActionState {
  error?: string;
  success?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function transitionTenantLifecycleAction(
  _prevState: TransitionLifecycleActionState,
  formData: FormData,
): Promise<TransitionLifecycleActionState> {
  const tenantId = getTrimmedValue(formData, 'tenantId');
  const toStatus = getTrimmedValue(formData, 'toStatus');
  const reason = getTrimmedValue(formData, 'reason');

  if (!tenantId || !toStatus) {
    return { error: 'Tenant and target status are required.' };
  }

  try {
    await transitionTenantLifecycle(tenantId, {
      toStatus,
      ...(reason ? { reason } : {}),
    });

    revalidatePath('/tenant-lifecycle');
    revalidatePath('/');

    return { success: `Organisation '${tenantId}' moved to '${toStatus}'.` };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to transition organisation lifecycle.',
    };
  }
}
