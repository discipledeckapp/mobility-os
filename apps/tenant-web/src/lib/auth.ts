export const TENANT_AUTH_COOKIE_NAME = 'mobility_os_tenant_jwt';
export const TENANT_REFRESH_COOKIE_NAME = 'mobility_os_refresh';

interface JwtPayload {
  exp?: number;
  tenantId?: string;
  sub?: string;
  businessEntityId?: string;
  role?: string;
  operatingUnitId?: string;
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

export function isTenantJwtUsable(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const payloadSegment = parts[1];
  if (!payloadSegment) {
    return false;
  }

  const decodedPayload = decodeBase64Url(payloadSegment);
  if (!decodedPayload) {
    return false;
  }

  let payload: JwtPayload;
  try {
    payload = JSON.parse(decodedPayload) as JwtPayload;
  } catch {
    return false;
  }

  if (typeof payload.exp !== 'number') {
    return false;
  }

  return payload.exp * 1000 > Date.now();
}

export function parseTenantJwtPayload(token: string | undefined): JwtPayload | null {
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
