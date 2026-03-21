'use server';

import { revalidatePath } from 'next/cache';
import { transitionTenantLifecycle } from '../../../lib/api-control-plane';

export interface TenantDetailActionState {
  error?: string;
  success?: string;
}

export async function transitionTenantAction(
  tenantId: string,
  _previousState: TenantDetailActionState,
  formData: FormData,
): Promise<TenantDetailActionState> {
  const toStatus = String(formData.get('toStatus') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();

  if (!toStatus) {
    return { error: 'Choose a lifecycle transition.' };
  }

  try {
    await transitionTenantLifecycle(tenantId, {
      toStatus,
      ...(reason ? { reason } : {}),
    });
    revalidatePath(`/tenants/${tenantId}`);
    revalidatePath('/tenants');
    return { success: `Tenant moved to ${toStatus}.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to transition tenant.',
    };
  }
}
