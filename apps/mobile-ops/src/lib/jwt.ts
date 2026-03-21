function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  if (!globalThis.atob) {
    return '';
  }
  return globalThis.atob(padded);
}

export function parseJwtExpiry(token: string): number | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  const payloadSegment = parts[1];
  if (!payloadSegment) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadSegment)) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function getRefreshDelayMs(token: string, leadTimeMs = 60_000): number | null {
  const expiryMs = parseJwtExpiry(token);
  if (!expiryMs) {
    return null;
  }
  return Math.max(expiryMs - Date.now() - leadTimeMs, 0);
}
