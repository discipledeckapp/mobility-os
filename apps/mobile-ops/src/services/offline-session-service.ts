import * as SecureStore from 'expo-secure-store';
import type { SessionRecord } from '../api';
import { STORAGE_KEYS } from '../constants';

type CachedSessionEnvelope = {
  identifier: string;
  session: SessionRecord;
  cachedAt: string;
};

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

export async function cacheOfflineSession(identifier: string, session: SessionRecord): Promise<void> {
  const payload: CachedSessionEnvelope = {
    identifier: normalizeIdentifier(identifier),
    session,
    cachedAt: new Date().toISOString(),
  };

  await Promise.all([
    SecureStore.setItemAsync(STORAGE_KEYS.cachedSession, JSON.stringify(payload)),
    SecureStore.setItemAsync(STORAGE_KEYS.lastLoginIdentifier, payload.identifier),
  ]);
}

export async function getCachedOfflineSession(): Promise<CachedSessionEnvelope | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEYS.cachedSession);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as CachedSessionEnvelope;
    if (!parsed?.identifier || !parsed?.session) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function getCachedSessionForIdentifier(
  identifier: string,
): Promise<SessionRecord | null> {
  const cached = await getCachedOfflineSession();
  if (!cached) {
    return null;
  }

  return cached.identifier === normalizeIdentifier(identifier) ? cached.session : null;
}

export async function isBiometricLoginEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(STORAGE_KEYS.biometricLoginEnabled)) === '1';
}

export async function setBiometricLoginEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.biometricLoginEnabled, enabled ? '1' : '0');
}

export async function clearOfflineSessionArtifacts(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.cachedSession),
    SecureStore.deleteItemAsync(STORAGE_KEYS.lastLoginIdentifier),
    SecureStore.deleteItemAsync(STORAGE_KEYS.biometricLoginEnabled),
  ]);
}
