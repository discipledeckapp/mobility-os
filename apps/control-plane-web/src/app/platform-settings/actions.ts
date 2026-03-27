'use server';

import { revalidatePath } from 'next/cache';
import { upsertPlatformSetting } from '../../lib/api-control-plane';

export interface PlatformSettingsActionState {
  success?: string;
  error?: string;
}

export async function upsertPlatformSettingAction(
  _previousState: PlatformSettingsActionState,
  formData: FormData,
): Promise<PlatformSettingsActionState> {
  const key = String(formData.get('key') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const rawValue = String(formData.get('value') ?? '').trim();

  if (!key || !rawValue) {
    return { error: 'Setting key and JSON value are required.' };
  }

  try {
    const value = JSON.parse(rawValue) as Record<string, unknown>;
    await upsertPlatformSetting(key, {
      ...(description ? { description } : {}),
      value,
    });
    revalidatePath('/platform-settings');
    return { success: 'Platform setting saved.' };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to save platform setting right now.',
    };
  }
}
