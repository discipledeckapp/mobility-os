'use server';

import { revalidatePath } from 'next/cache';
import {
  transitionTenantLifecycle,
  createTenantPlatformWalletEntry,
} from '../../../lib/api-control-plane';

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

export interface CreditWalletActionState {
  error?: string;
  success?: string;
}

export async function creditTenantWalletAction(
  tenantId: string,
  _prevState: CreditWalletActionState,
  formData: FormData,
): Promise<CreditWalletActionState> {
  const amountRaw = String(formData.get('amountMinorUnits') ?? '').trim();
  const currency = String(formData.get('currency') ?? 'NGN').trim();
  const description = String(formData.get('description') ?? '').trim();

  const amountMinorUnits = Number.parseInt(amountRaw, 10);
  if (!amountRaw || Number.isNaN(amountMinorUnits) || amountMinorUnits <= 0) {
    return { error: 'Enter a valid credit amount in minor units (e.g. 100000 = ₦1,000).' };
  }

  try {
    await createTenantPlatformWalletEntry(tenantId, {
      type: 'credit',
      amountMinorUnits,
      currency,
      ...(description ? { description } : {}),
      referenceType: 'manual_staff_credit',
    });
    revalidatePath(`/tenants/${tenantId}`);
    revalidatePath('/platform-wallets');
    return {
      success: `Credited ${currency} ${(amountMinorUnits / 100).toFixed(2)} to tenant platform wallet.`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to credit wallet.',
    };
  }
}
