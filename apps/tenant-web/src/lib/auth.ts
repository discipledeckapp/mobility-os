export const TENANT_AUTH_COOKIE_NAME = 'mobility_os_tenant_jwt';
export const TENANT_REFRESH_COOKIE_NAME = 'mobility_os_refresh';

type TenantCookieOptions = {
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  path: '/';
  maxAge?: number;
};

interface JwtPayload {
  exp?: number;
  tenantId?: string;
  sub?: string;
  businessEntityId?: string;
  role?: string;
  operatingUnitId?: string;
  accessMode?: 'tenant_user' | 'driver_mobile';
  mobileRole?: 'driver' | 'field_officer' | null;
  linkedDriverId?: string;
  selfServiceSubjectType?: 'driver' | 'guarantor';
  selfServiceDriverId?: string;
}

type SelfServiceRoutingContext = {
  accessMode?: JwtPayload['accessMode'] | null;
  mobileRole?: JwtPayload['mobileRole'] | null;
  selfServiceSubjectType?: JwtPayload['selfServiceSubjectType'] | null;
  linkedDriverId?: string | null;
  selfServiceDriverId?: string | null;
};

function getMaxAgeFromToken(token: string | undefined): number | undefined {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp || Number.isNaN(payload.exp)) {
    return undefined;
  }

  const maxAgeSeconds = payload.exp - Math.floor(Date.now() / 1000);
  return maxAgeSeconds > 0 ? maxAgeSeconds : undefined;
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

export function isTenantJwtUsable(token: string | undefined): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }

  return payload.exp * 1000 > Date.now() + 15_000;
}

export function parseTenantJwtPayload(token: string | undefined): JwtPayload | null {
  return decodeJwtPayload(token);
}

export function getSelfServiceContinuationPath(
  payload: SelfServiceRoutingContext | null | undefined,
): string | null {
  if (!payload) {
    return null;
  }

  if (payload.selfServiceSubjectType === 'guarantor') {
    return '/guarantor-self-service/continue';
  }

  if (
    payload.selfServiceSubjectType === 'driver' ||
    payload.accessMode === 'driver_mobile' ||
    payload.mobileRole === 'driver' ||
    typeof payload.linkedDriverId === 'string' ||
    typeof payload.selfServiceDriverId === 'string'
  ) {
    return '/driver-self-service/continue';
  }

  return null;
}

export function getTenantAccessCookieOptions(accessToken: string): TenantCookieOptions {
  const maxAge = getMaxAgeFromToken(accessToken);
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
  };
}

export function getTenantRefreshCookieOptions(refreshToken: string): TenantCookieOptions {
  const maxAge = getMaxAgeFromToken(refreshToken);
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
  };
}
