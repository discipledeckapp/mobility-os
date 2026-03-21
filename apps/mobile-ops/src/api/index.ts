import { mobileEnv } from '../config/env';
import { API_PATHS, DEFAULT_RETRY_ATTEMPTS, RETRYABLE_STATUS_CODES } from '../constants';
import { reportMobileLog } from '../services/mobile-log-service';

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SessionRecord {
  userId: string;
  tenantId: string;
  email: string;
  phone?: string | null;
  name: string;
  role: string;
  businessEntityId?: string | null;
  operatingUnitId?: string | null;
  tenantName?: string | null;
  tenantCountry?: string | null;
  defaultCurrency?: string | null;
  currencyMinorUnit?: number | null;
  formattingLocale?: string | null;
  permissions: string[];
  linkedDriverId?: string | null;
  linkedDriverStatus?: string | null;
  linkedDriverIdentityStatus?: string | null;
  mobileRole?: 'driver' | 'field_officer' | null;
  mobileAccessRevoked?: boolean | null;
}

export interface AssignmentRecord {
  id: string;
  tenantId: string;
  fleetId: string;
  businessEntityId: string;
  operatingUnitId: string;
  driverId: string;
  vehicleId: string;
  status: string;
  startedAt: string;
  endedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: {
    id: string;
    systemVehicleCode: string;
    tenantVehicleCode: string;
    status: string;
    vehicleType: string;
    make: string;
    model: string;
    trim?: string | null;
    year: number;
    plate?: string | null;
  };
}

export interface DriverRecord {
  id: string;
  status: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  identityStatus: string;
  identityReviewCaseId?: string | null;
  identityReviewStatus?: string | null;
  identityLastVerifiedAt?: string | null;
  riskBand?: string | null;
  isWatchlisted?: boolean | null;
  hasApprovedLicence: boolean;
  pendingDocumentCount: number;
  rejectedDocumentCount: number;
  expiredDocumentCount: number;
}

export interface RemittanceRecord {
  id: string;
  assignmentId: string;
  driverId: string;
  vehicleId: string;
  status: string;
  amountMinorUnits: number;
  currency: string;
  dueDate: string;
  paidDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordRemittanceInput {
  assignmentId: string;
  amountMinorUnits: number;
  currency: string;
  dueDate: string;
  notes?: string;
}

export interface MobileLogInput {
  level: 'info' | 'warning' | 'error';
  message: string;
  category?: string;
  route?: string;
  stack?: string;
  userId?: string | null;
  tenantId?: string | null;
  metadata?: Record<string, unknown>;
}

let getAccessToken: (() => Promise<string | null>) | null = null;
let getRefreshToken: (() => Promise<string | null>) | null = null;
let attemptTokenRefresh: (() => Promise<boolean>) | null = null;
let onUnauthorized: (() => Promise<void> | void) | null = null;

export function configureApiTokenGetter(reader: () => Promise<string | null>) {
  getAccessToken = reader;
}

export function configureApiRefreshTokenGetter(reader: () => Promise<string | null>) {
  getRefreshToken = reader;
}

export function configureApiRefreshHandler(handler: (() => Promise<boolean>) | null) {
  attemptTokenRefresh = handler;
}

export function configureApiUnauthorizedHandler(handler: (() => Promise<void> | void) | null) {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseError(response: Response) {
  let message = `Request failed with status ${response.status}`;
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };
    if (Array.isArray(payload.message)) {
      message = payload.message.join(', ');
    } else if (payload.message) {
      message = payload.message;
    } else if (payload.error) {
      message = payload.error;
    }
  } catch {
    // Keep default message.
  }
  return new ApiError(message, response.status);
}

async function runWithRetries<T>(
  executor: () => Promise<T>,
  attempts = DEFAULT_RETRY_ATTEMPTS,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await executor();
    } catch (error) {
      lastError = error;
      const status = error instanceof ApiError ? error.status : null;
      const isRetryable =
        status !== null
          ? RETRYABLE_STATUS_CODES.includes(status as (typeof RETRYABLE_STATUS_CODES)[number])
          : true;

      if (!isRetryable || attempt === attempts - 1) {
        throw error;
      }

      await sleep(400 * 2 ** attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Request failed.');
}

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  useAuth = true,
  hasRetriedAfterRefresh = false,
): Promise<T> {
  if (!mobileEnv.apiUrl) {
    throw new ApiError('EXPO_PUBLIC_API_URL is required for mobile-ops.', 500);
  }

  try {
    return await runWithRetries(async () => {
      const headers = new Headers(init.headers);
      headers.set('content-type', 'application/json');

      if (useAuth) {
        const token = await getAccessToken?.();
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }

      const response = await fetch(`${mobileEnv.apiUrl}${path}`, {
        ...init,
        headers,
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      if (response.status === 401 && useAuth && !hasRetriedAfterRefresh) {
        const refreshed = (await attemptTokenRefresh?.()) ?? false;
        if (refreshed) {
          return apiFetch<T>(path, init, useAuth, true);
        }
        await onUnauthorized?.();
      }

      throw await parseError(response);
    });
  } catch (error) {
    await reportMobileLog({
      level: error instanceof ApiError && error.status >= 500 ? 'error' : 'warning',
      category: 'api_request',
      message: error instanceof Error ? error.message : 'Mobile API request failed.',
      route: path,
      metadata: {
        method: init.method ?? 'GET',
        authenticated: useAuth,
      },
    });
    throw error;
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function isNetworkError(error: unknown): boolean {
  return !(error instanceof ApiError);
}

export function login(input: LoginInput): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(
    API_PATHS.login,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    false,
  );
}

export async function postMobileLog(input: MobileLogInput): Promise<void> {
  if (!mobileEnv.apiUrl) {
    return;
  }

  try {
    await fetch(`${mobileEnv.apiUrl}${API_PATHS.mobileLogs}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
    });
  } catch {
    // Logging must stay best-effort.
  }
}

export function refreshAuthToken(refreshToken?: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(
    API_PATHS.refresh,
    {
      method: 'POST',
      body: JSON.stringify({
        refreshToken,
      }),
    },
    false,
  );
}

export function getSession(): Promise<SessionRecord> {
  return apiFetch<SessionRecord>(API_PATHS.session);
}

export function listAssignments(): Promise<AssignmentRecord[]> {
  return apiFetch<AssignmentRecord[]>(API_PATHS.mobileAssignments);
}

export function getAssignment(assignmentId: string): Promise<AssignmentRecord> {
  return apiFetch<AssignmentRecord>(`${API_PATHS.mobileAssignments}/${assignmentId}`);
}

export function startAssignment(assignmentId: string): Promise<AssignmentRecord> {
  return apiFetch<AssignmentRecord>(`${API_PATHS.mobileAssignments}/${assignmentId}/start`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function completeAssignment(
  assignmentId: string,
  notes?: string,
): Promise<AssignmentRecord> {
  return apiFetch<AssignmentRecord>(`${API_PATHS.mobileAssignments}/${assignmentId}/complete`, {
    method: 'POST',
    body: JSON.stringify(notes ? { notes } : {}),
  });
}

export function cancelAssignment(assignmentId: string, notes?: string): Promise<AssignmentRecord> {
  return apiFetch<AssignmentRecord>(`${API_PATHS.mobileAssignments}/${assignmentId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(notes ? { notes } : {}),
  });
}

export function getDriverProfile(): Promise<DriverRecord> {
  return apiFetch<DriverRecord>(API_PATHS.mobileProfile);
}

export function recordRemittance(input: RecordRemittanceInput): Promise<RemittanceRecord> {
  return apiFetch<RemittanceRecord>(API_PATHS.mobileRemittance, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getStoredRefreshToken() {
  return getRefreshToken?.() ?? null;
}
