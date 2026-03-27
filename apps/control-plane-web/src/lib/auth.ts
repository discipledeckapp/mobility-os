export const PLATFORM_AUTH_COOKIE_NAME = 'cp_access_token';

interface JwtPayload {
  exp?: number;
  sub?: string;
  email?: string;
  role?: string;
}

function decodeBase64Url(value: string): string | null {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized.padEnd(normalized.length + (4 - padding), '=');

  try {
    return atob(padded);
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string | undefined): JwtPayload | null {
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const payloadSegment = parts[1];
  if (!payloadSegment) {
    return null;
  }

  const decodedPayload = decodeBase64Url(payloadSegment);
  if (!decodedPayload) {
    return null;
  }

  try {
    return JSON.parse(decodedPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function isPlatformJwtUsable(token: string | undefined): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }

  return payload.exp * 1000 > Date.now() + 15_000;
}

export function parsePlatformJwtPayload(token: string | undefined): JwtPayload | null {
  return decodeJwtPayload(token);
}
