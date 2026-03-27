'use server';

import { revalidatePath } from 'next/cache';
import {
  addIdentifier,
  addRiskSignal,
  createWatchlistEntry,
  deactivateRiskSignal,
  deactivateWatchlistEntry,
  verifyIdentifier,
} from '../../../../lib/api-intelligence';

export interface PersonActionState {
  success?: string;
  error?: string;
}

export async function addRiskSignalAction(
  _previousState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const personId = String(formData.get('personId') ?? '').trim();
  const type = String(formData.get('type') ?? '').trim();
  const severity = String(formData.get('severity') ?? '').trim();
  const source = String(formData.get('source') ?? '').trim();

  if (!personId || !type || !severity || !source) {
    return { error: 'Person, signal type, severity, and source are required.' };
  }

  try {
    await addRiskSignal({ personId, type, severity, source });
    revalidatePath(`/intelligence/persons/${personId}`);
    return { success: 'Risk signal added.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to add risk signal.' };
  }
}

export async function deactivateRiskSignalAction(
  _previousState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const id = String(formData.get('id') ?? '').trim();
  const personId = String(formData.get('personId') ?? '').trim();
  if (!id || !personId) {
    return { error: 'Risk signal context is incomplete.' };
  }

  try {
    await deactivateRiskSignal(id);
    revalidatePath(`/intelligence/persons/${personId}`);
    return { success: 'Risk signal deactivated.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to deactivate risk signal.' };
  }
}

export async function addIdentifierAction(
  _previousState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const personId = String(formData.get('personId') ?? '').trim();
  const type = String(formData.get('type') ?? '').trim();
  const value = String(formData.get('value') ?? '').trim();
  const countryCode = String(formData.get('countryCode') ?? '').trim();

  if (!personId || !type || !value) {
    return { error: 'Person, identifier type, and identifier value are required.' };
  }

  try {
    await addIdentifier({
      personId,
      type,
      value,
      ...(countryCode ? { countryCode } : {}),
    });
    revalidatePath(`/intelligence/persons/${personId}`);
    return { success: 'Identifier added.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to add identifier.' };
  }
}

export async function verifyIdentifierAction(
  _previousState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const id = String(formData.get('id') ?? '').trim();
  const personId = String(formData.get('personId') ?? '').trim();
  if (!id || !personId) {
    return { error: 'Identifier context is incomplete.' };
  }

  try {
    await verifyIdentifier(id);
    revalidatePath(`/intelligence/persons/${personId}`);
    return { success: 'Identifier verified.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to verify identifier.' };
  }
}

export async function createWatchlistEntryAction(
  _previousState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const personId = String(formData.get('personId') ?? '').trim();
  const type = String(formData.get('type') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();
  const expiresAt = String(formData.get('expiresAt') ?? '').trim();
  if (!personId || !type || !reason) {
    return { error: 'Person, watchlist type, and reason are required.' };
  }

  try {
    await createWatchlistEntry({
      personId,
      type,
      reason,
      ...(expiresAt ? { expiresAt } : {}),
    });
    revalidatePath(`/intelligence/persons/${personId}`);
    return { success: 'Watchlist entry created.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to create watchlist entry.',
    };
  }
}

export async function deactivateWatchlistEntryAction(
  _previousState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const id = String(formData.get('id') ?? '').trim();
  const personId = String(formData.get('personId') ?? '').trim();
  if (!id || !personId) {
    return { error: 'Watchlist context is incomplete.' };
  }

  try {
    await deactivateWatchlistEntry(id);
    revalidatePath(`/intelligence/persons/${personId}`);
    return { success: 'Watchlist entry deactivated.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to deactivate watchlist entry.',
    };
  }
}
