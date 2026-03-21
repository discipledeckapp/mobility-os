'use server';

import { revalidatePath } from 'next/cache';
import {
  createFeatureFlagOverride,
  removeFeatureFlagOverride,
  updateFeatureFlag,
} from '../../lib/api-control-plane';

export interface FeatureFlagActionState {
  error?: string;
  success?: string;
}

export async function toggleFeatureFlagAction(
  key: string,
  enabled: boolean,
): Promise<FeatureFlagActionState> {
  try {
    await updateFeatureFlag(key, { isEnabled: enabled });
    revalidatePath('/feature-flags');
    return { success: `Flag ${enabled ? 'enabled' : 'disabled'}.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to update feature flag.',
    };
  }
}

export async function createFeatureFlagOverrideAction(
  key: string,
  _previousState: FeatureFlagActionState,
  formData: FormData,
): Promise<FeatureFlagActionState> {
  const tenantId = String(formData.get('tenantId') ?? '').trim();
  const planTier = String(formData.get('planTier') ?? '').trim();
  const countryCode = String(formData.get('countryCode') ?? '').trim();
  const isEnabled = String(formData.get('isEnabled') ?? 'false') === 'true';

  try {
    await createFeatureFlagOverride(key, {
      ...(tenantId ? { tenantId } : {}),
      ...(planTier ? { planTier } : {}),
      ...(countryCode ? { countryCode } : {}),
      isEnabled,
      value: isEnabled,
    });
    revalidatePath('/feature-flags');
    return { success: 'Override created.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to create override.',
    };
  }
}

export async function removeFeatureFlagOverrideAction(
  overrideId: string,
): Promise<FeatureFlagActionState> {
  try {
    await removeFeatureFlagOverride(overrideId);
    revalidatePath('/feature-flags');
    return { success: 'Override removed.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to remove override.',
    };
  }
}
