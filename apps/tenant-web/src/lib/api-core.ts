import { cookies } from 'next/headers';
import { TENANT_AUTH_COOKIE_NAME, parseTenantJwtPayload } from './auth';

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

if (process.env.NODE_ENV === 'production' && !configuredApiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required in production.');
}

const apiBaseUrl = configuredApiBaseUrl ?? 'http://localhost:3001/api/v1';

export interface ApiCoreRequestOptions extends RequestInit {
  token?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TenantApiContext {
  tenantId?: string | undefined;
  userId?: string | undefined;
  businessEntityId?: string | undefined;
  role?: string | undefined;
  operatingUnitId?: string | undefined;
}

export interface TenantRecord {
  id: string;
  slug: string;
  name: string;
  country: string;
  status: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantLoginInput {
  identifier: string;
  password: string;
}

export interface UpdateTenantProfileInput {
  name: string;
  phone?: string;
}

export interface ChangeTenantPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface DriverRecord {
  id: string;
  tenantId: string;
  fleetId: string;
  businessEntityId: string;
  operatingUnitId: string;
  status: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  hasResolvedIdentity: boolean;
  identityStatus: string;
  identityReviewCaseId?: string | null;
  identityReviewStatus?: string | null;
  identityLastDecision?: string | null;
  identityVerificationConfidence?: number | null;
  identityLastVerifiedAt?: string | null;
  identityLivenessPassed?: boolean | null;
  identityLivenessProvider?: string | null;
  identityLivenessConfidence?: number | null;
  identityLivenessReason?: string | null;
  verificationProvider?: string | null;
  verificationStatus?: string | null;
  verificationCountryCode?: string | null;
  globalRiskScore?: number | null;
  riskBand?: string | null;
  isWatchlisted?: boolean | null;
  duplicateIdentityFlag?: boolean | null;
  hasGuarantor: boolean;
  guarantorStatus?: string | null;
  guarantorDisconnectedAt?: string | null;
  guarantorPersonId?: string | null;
  guarantorRiskBand?: string | null;
  guarantorIsWatchlisted?: boolean | null;
  guarantorIsAlsoDriver?: boolean;
  hasApprovedLicence: boolean;
  hasMobileAccess: boolean;
  mobileAccessStatus?: string | null;
  pendingDocumentCount: number;
  rejectedDocumentCount: number;
  expiredDocumentCount: number;
  activationReadiness: string;
  activationReadinessReasons: string[];
  assignmentReadiness: string;
  assignmentReadinessReasons: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DriverMobileAccessUserRecord {
  id: string;
  email: string;
  phone?: string | null;
  name: string;
  role: string;
  isActive: boolean;
  driverId?: string | null;
  matchReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriverMobileAccessRecord {
  linkedUser?: DriverMobileAccessUserRecord | null;
  suggestedUsers: DriverMobileAccessUserRecord[];
}

export interface DriverLivenessSessionRecord {
  providerName: string;
  sessionId: string;
  expiresAt?: string;
  fallbackChain: string[];
}

export interface DriverSelfServiceDeliveryRecord {
  delivery: 'email';
  verificationUrl: string;
  destination: string;
}

export interface DriverDocumentRecord {
  id: string;
  tenantId: string;
  driverId: string;
  documentType: string;
  fileName: string;
  contentType: string;
  storageKey?: string | null;
  previewUrl?: string | null;
  uploadedBy: string;
  status: string;
  expiresAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriverGuarantorRecord {
  id: string;
  tenantId: string;
  driverId: string;
  personId?: string | null;
  name: string;
  phone: string;
  countryCode?: string | null;
  relationship?: string | null;
  status: string;
  disconnectedAt?: string | null;
  disconnectedReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriverIdentityResolutionInput {
  countryCode?: string;
  livenessPassed?: boolean;
  identifiers: Array<{
    type: string;
    value: string;
    countryCode?: string;
  }>;
  selfieImageBase64?: string;
  subjectConsent?: boolean;
  livenessCheck?: {
    provider?: string;
    sessionId?: string;
    passed?: boolean;
    confidenceScore?: number;
  };
}

export interface DriverIdentityResolutionResult {
  decision: string;
  personId?: string;
  reviewCaseId?: string;
  providerLookupStatus?: string;
  providerVerificationStatus?: string;
  providerName?: string;
  matchedIdentifierType?: string;
  isVerifiedMatch?: boolean;
  verifiedProfile?: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    photoUrl?: string;
  };
  globalRiskScore?: number;
  riskBand?: string;
  isWatchlisted?: boolean;
  hasDuplicateIdentityFlag?: boolean;
  fraudIndicatorCount?: number;
  verificationConfidence?: number;
  livenessPassed?: boolean;
  livenessProviderName?: string;
  livenessConfidenceScore?: number;
  livenessReason?: string;
}

export interface DriverReadinessReportRecord {
  id: string;
  fullName: string;
  fleetId: string;
  activationReadiness: string;
  activationReadinessReasons: string[];
  assignmentReadiness: string;
  approvedLicenceExpiresAt?: string | null;
  lastAssignmentDate?: string | null;
  riskBand?: string | null;
}

export interface VehicleReadinessReportRecord {
  id: string;
  primaryLabel: string;
  fleetId: string;
  status: string;
  currentValuationMinorUnits?: number | null;
  currentValuationCurrency?: string | null;
  maintenanceSummary: string;
  lifecycleStage: string;
}

export interface OperationalReadinessReportRecord {
  drivers: DriverReadinessReportRecord[];
  vehicles: VehicleReadinessReportRecord[];
}

export interface LicenceExpiryReportRecord {
  driverId: string;
  fullName: string;
  fleetId: string;
  expiresAt: string;
  daysUntilExpiry: number;
}

export interface FleetRecord {
  id: string;
  tenantId: string;
  operatingUnitId: string;
  name: string;
  businessModel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessEntityRecord {
  id: string;
  tenantId: string;
  name: string;
  country: string;
  businessModel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatingUnitRecord {
  id: string;
  tenantId: string;
  businessEntityId: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverInput {
  fleetId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface VehicleRecord {
  id: string;
  tenantId: string;
  fleetId: string;
  systemVehicleCode: string;
  tenantVehicleCode: string;
  businessEntityId: string;
  operatingUnitId: string;
  status: string;
  vehicleType: string;
  make: string;
  model: string;
  trim?: string | null;
  year: number;
  plate?: string | null;
  color?: string | null;
  vin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleInput {
  fleetId: string;
  tenantVehicleCode?: string;
  vehicleType: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  plate?: string;
  color?: string;
  vin?: string;
  acquisitionCostMinorUnits?: number;
  acquisitionDate?: string;
  currentEstimatedValueMinorUnits?: number;
  valuationSource?: string;
}

export interface UpdateVehicleInput {
  tenantVehicleCode?: string;
  plate?: string;
  vin?: string;
  color?: string;
  year?: number;
  acquisitionCostMinorUnits?: number;
  acquisitionDate?: string;
  currentEstimatedValueMinorUnits?: number;
  valuationSource?: string;
}

export interface VehicleValuationRecord {
  id: string;
  tenantId: string;
  vehicleId: string;
  valuationKind: string;
  amountMinorUnits: number;
  currency?: string | null;
  valuationDate: string;
  source?: string | null;
  notes?: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleCodeSuggestionRecord {
  suggestedTenantVehicleCode: string;
  prefix: string;
}

export interface VehicleDetailRecord extends VehicleRecord {
  fleetName: string;
  operatingUnitName: string;
  businessEntityName: string;
  valuations: VehicleValuationRecord[];
  assignmentSummary: {
    totalAssignments: number;
    activeAssignments: number;
    latestAssignmentId?: string | null;
    latestAssignmentStatus?: string | null;
    latestAssignmentStartedAt?: string | null;
  };
  maintenanceSummary: string;
  latestVinDecode?: {
    id: string;
    decodedMake?: string | null;
    decodedModel?: string | null;
    decodedModelYear?: number | null;
    vehicleType?: string | null;
    bodyClass?: string | null;
    createdAt: string;
  } | null;
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
}

export interface CreateAssignmentInput {
  fleetId?: string;
  driverId: string;
  vehicleId: string;
  notes?: string;
}

export interface RemittanceRecord {
  id: string;
  tenantId: string;
  assignmentId: string;
  driverId: string;
  vehicleId: string;
  fleetId: string;
  businessEntityId: string;
  operatingUnitId: string;
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
  fleetId?: string;
  assignmentId: string;
  amountMinorUnits: number;
  currency: string;
  dueDate: string;
  notes?: string;
}

export interface WalletBalanceRecord {
  walletId: string;
  businessEntityId: string;
  currency: string;
  balanceMinorUnits: number;
  updatedAt: string;
}

export interface WalletEntryRecord {
  id: string;
  walletId: string;
  type: string;
  amountMinorUnits: number;
  currency: string;
  referenceId?: string | null;
  referenceType?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface TenantAuthSessionRecord {
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
}

export interface TenantBillingSubscriptionRecord {
  id: string;
  planId: string;
  planName: string;
  planTier: string;
  currency: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string | null;
}

export interface TenantBillingInvoiceRecord {
  id: string;
  subscriptionId: string;
  status: string;
  amountDueMinorUnits: number;
  amountPaidMinorUnits: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  dueAt?: string | null;
  paidAt?: string | null;
}

export interface TenantVerificationWalletEntryRecord {
  id: string;
  type: string;
  amountMinorUnits: number;
  currency: string;
  referenceId?: string | null;
  referenceType?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface TenantVerificationWalletRecord {
  walletId: string;
  currency: string;
  balanceMinorUnits: number;
  entries: TenantVerificationWalletEntryRecord[];
}

export interface TenantBillingSummaryRecord {
  subscription: TenantBillingSubscriptionRecord;
  invoices: TenantBillingInvoiceRecord[];
  outstandingInvoice?: TenantBillingInvoiceRecord | null;
  verificationWallet: TenantVerificationWalletRecord;
  customerEmail: string;
  customerName: string;
}

export interface TenantPaymentCheckoutRecord {
  provider: string;
  reference: string;
  checkoutUrl: string;
  accessCode?: string;
  purpose: string;
}

export interface VerifyAndApplyTenantPaymentInput {
  provider: string;
  purpose: string;
  reference: string;
  invoiceId?: string;
}

export interface VehicleMakerRecord {
  id: string;
  name: string;
  status: string;
  externalSource?: string | null;
  externalId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleModelCatalogRecord {
  id: string;
  makerId: string;
  makerName: string;
  name: string;
  status: string;
  vehicleCategory?: string | null;
  sourceTypeLabel?: string | null;
  externalSource?: string | null;
  externalId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DecodeVehicleVinInput {
  vin: string;
  modelYear?: number;
}

export interface VehicleVinDecodeRecord {
  id: string;
  vin: string;
  normalizedVin: string;
  decodeKey: string;
  requestedModelYear?: number | null;
  status: string;
  source: string;
  sourceVersion?: string | null;
  errorCode?: string | null;
  errorText?: string | null;
  decodedMake?: string | null;
  decodedModel?: string | null;
  decodedModelYear?: number | null;
  vehicleType?: string | null;
  bodyClass?: string | null;
  manufacturerName?: string | null;
  makerId?: string | null;
  makerName?: string | null;
  modelId?: string | null;
  modelName?: string | null;
  rawPayload: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleMakerInput {
  name: string;
}

export interface CreateVehicleModelInput {
  makerId: string;
  name: string;
  vehicleType?: string;
}

export async function getTenantApiToken(explicitToken?: string): Promise<string> {
  if (explicitToken) {
    return explicitToken;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(TENANT_AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  throw new Error('No tenant auth token is available. Log in to continue.');
}

export async function getTenantApiContext(explicitToken?: string): Promise<TenantApiContext> {
  const token = await getTenantApiToken(explicitToken);
  const payload = parseTenantJwtPayload(token);

  if (!payload) {
    throw new Error('Unable to read tenant session context from JWT.');
  }

  return {
    tenantId: payload.tenantId,
    userId: payload.sub,
    businessEntityId: payload.businessEntityId,
    role: payload.role,
    operatingUnitId: payload.operatingUnitId,
  };
}

export async function apiCoreFetch<T>(
  path: string,
  options: ApiCoreRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('content-type', 'application/json');
  if (options.token) {
    headers.set('authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `api-core returned status ${response.status}`;
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
      // Keep default message when the response is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

// ── Self-signup types ─────────────────────────────────────────────────────────

export interface RegisterOrganisationInput {
  orgName: string;
  slug: string;
  country: string;
  businessModel: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword: string;
}

export interface RegisterOrganisationResult {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  message: string;
}

export async function registerOrganisation(
  input: RegisterOrganisationInput,
): Promise<RegisterOrganisationResult> {
  return apiCoreFetch<RegisterOrganisationResult>('/signup/register', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
  });
}

export async function verifyOrgSignupOtp(
  email: string,
  code: string,
): Promise<{ verified: boolean; tenantSlug: string }> {
  return apiCoreFetch<{ verified: boolean; tenantSlug: string }>('/signup/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
    cache: 'no-store',
  });
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ identifier: email }),
    cache: 'no-store',
  });
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    cache: 'no-store',
  });
}

export async function loginTenantUser(
  input: TenantLoginInput,
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await apiCoreFetch<{
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    jwt?: string;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
  });

  const accessToken = response.accessToken ?? response.token ?? response.jwt;
  if (!accessToken) {
    throw new Error('api-core login response did not include a JWT');
  }

  if (!response.refreshToken) {
    throw new Error('api-core login response did not include a refresh token');
  }

  return { accessToken, refreshToken: response.refreshToken };
}

export async function listFleets(token?: string): Promise<FleetRecord[]> {
  return apiCoreFetch<FleetRecord[]>('/fleets', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getFleet(fleetId: string, token?: string): Promise<FleetRecord> {
  return apiCoreFetch<FleetRecord>(`/fleets/${fleetId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listBusinessEntities(token?: string): Promise<BusinessEntityRecord[]> {
  return apiCoreFetch<BusinessEntityRecord[]>('/business-entities', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getBusinessEntity(
  businessEntityId: string,
  token?: string,
): Promise<BusinessEntityRecord> {
  return apiCoreFetch<BusinessEntityRecord>(`/business-entities/${businessEntityId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listOperatingUnits(
  input: { businessEntityId?: string } = {},
  token?: string,
): Promise<OperatingUnitRecord[]> {
  const params = new URLSearchParams();
  if (input.businessEntityId) {
    params.set('businessEntityId', input.businessEntityId);
  }
  const query = params.toString();

  return apiCoreFetch<OperatingUnitRecord[]>(`/operating-units${query ? `?${query}` : ''}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getTenantMe(token?: string): Promise<TenantRecord> {
  return apiCoreFetch<TenantRecord>('/tenants/me', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getTenantSession(token?: string): Promise<TenantAuthSessionRecord> {
  return apiCoreFetch<TenantAuthSessionRecord>('/auth/session', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateTenantProfile(
  input: UpdateTenantProfileInput,
  token?: string,
): Promise<TenantAuthSessionRecord> {
  return apiCoreFetch<TenantAuthSessionRecord>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function changeTenantPassword(
  input: ChangeTenantPasswordInput,
  token?: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/auth/password-change', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getTenantBillingSummary(token?: string): Promise<TenantBillingSummaryRecord> {
  return apiCoreFetch<TenantBillingSummaryRecord>('/tenant-billing/summary', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function initializeTenantWalletTopUpCheckout(
  input: { provider: string; amountMinorUnits: number },
  token?: string,
): Promise<TenantPaymentCheckoutRecord> {
  return apiCoreFetch<TenantPaymentCheckoutRecord>('/tenant-billing/wallet-top-ups/checkout', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function initializeTenantInvoiceCheckout(
  input: { provider: string; invoiceId: string },
  token?: string,
): Promise<TenantPaymentCheckoutRecord> {
  return apiCoreFetch<TenantPaymentCheckoutRecord>('/tenant-billing/invoice-checkouts', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function verifyAndApplyTenantPayment(
  input: VerifyAndApplyTenantPaymentInput,
  token?: string,
): Promise<{
  provider: string;
  reference: string;
  purpose: string;
  status: string;
  amountMinorUnits: number;
  currency: string;
  invoiceId?: string;
}> {
  return apiCoreFetch('/tenant-billing/payments/verify-and-apply', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listDrivers(
  input: PaginationParams & { fleetId?: string } = {},
  token?: string,
): Promise<PaginatedApiResponse<DriverRecord>> {
  const params = new URLSearchParams();
  if (input.fleetId) {
    params.set('fleetId', input.fleetId);
  }
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return apiCoreFetch<PaginatedApiResponse<DriverRecord>>(`/drivers${query ? `?${query}` : ''}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getDriver(driverId: string, token?: string): Promise<DriverRecord> {
  return apiCoreFetch<DriverRecord>(`/drivers/${driverId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getDriverMobileAccess(
  driverId: string,
  token?: string,
): Promise<DriverMobileAccessRecord> {
  return apiCoreFetch<DriverMobileAccessRecord>(`/drivers/${driverId}/mobile-access`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function linkDriverMobileAccessUser(
  driverId: string,
  userId: string,
  token?: string,
): Promise<DriverMobileAccessUserRecord> {
  return apiCoreFetch<DriverMobileAccessUserRecord>(`/drivers/${driverId}/mobile-access/link`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function unlinkDriverMobileAccessUser(
  driverId: string,
  userId: string,
  token?: string,
): Promise<{ success: true }> {
  return apiCoreFetch<{ success: true }>(`/drivers/${driverId}/mobile-access/${userId}`, {
    method: 'DELETE',
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createDriver(
  input: CreateDriverInput,
  token?: string,
): Promise<DriverRecord> {
  return apiCoreFetch<DriverRecord>('/drivers', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateDriverStatus(
  driverId: string,
  status: string,
  token?: string,
): Promise<DriverRecord> {
  return apiCoreFetch<DriverRecord>(`/drivers/${driverId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createDriverLivenessSession(
  driverId: string,
  input: { countryCode?: string } = {},
  token?: string,
): Promise<DriverLivenessSessionRecord> {
  return apiCoreFetch<DriverLivenessSessionRecord>(
    `/drivers/${driverId}/identity/liveness-sessions`,
    {
      method: 'POST',
      body: JSON.stringify(input),
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function sendDriverSelfServiceLink(
  driverId: string,
  token?: string,
): Promise<DriverSelfServiceDeliveryRecord> {
  return apiCoreFetch<DriverSelfServiceDeliveryRecord>(`/drivers/${driverId}/self-service-links`, {
    method: 'POST',
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getDriverGuarantor(
  driverId: string,
  token?: string,
): Promise<DriverGuarantorRecord> {
  return apiCoreFetch<DriverGuarantorRecord>(`/drivers/${driverId}/guarantor`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createOrUpdateDriverGuarantor(
  driverId: string,
  input: {
    name: string;
    phone: string;
    countryCode?: string;
    relationship?: string;
  },
  token?: string,
): Promise<DriverGuarantorRecord> {
  return apiCoreFetch<DriverGuarantorRecord>(`/drivers/${driverId}/guarantor`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function removeDriverGuarantor(
  driverId: string,
  reason?: string,
  token?: string,
): Promise<{ success: true }> {
  return apiCoreFetch<{ success: true }>(`/drivers/${driverId}/guarantor`, {
    method: 'DELETE',
    ...(reason ? { body: JSON.stringify({ reason }) } : {}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listDriverDocuments(
  driverId: string,
  token?: string,
): Promise<DriverDocumentRecord[]> {
  return apiCoreFetch<DriverDocumentRecord[]>(`/drivers/${driverId}/documents`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function uploadDriverDocument(
  driverId: string,
  input: {
    documentType: string;
    fileName: string;
    contentType: string;
    fileBase64: string;
    uploadedBy: 'operator' | 'driver_self_service';
  },
  token?: string,
): Promise<DriverDocumentRecord> {
  return apiCoreFetch<DriverDocumentRecord>(`/drivers/${driverId}/documents`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function reviewDriverDocument(
  driverId: string,
  documentId: string,
  input: {
    status: 'approved' | 'rejected';
    expiresAt?: string;
  },
  token?: string,
): Promise<DriverDocumentRecord> {
  return apiCoreFetch<DriverDocumentRecord>(`/drivers/${driverId}/documents/${documentId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function resolveDriverIdentity(
  driverId: string,
  input: DriverIdentityResolutionInput,
  token?: string,
): Promise<DriverIdentityResolutionResult> {
  return apiCoreFetch<DriverIdentityResolutionResult>(`/drivers/${driverId}/identity-resolution`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listVehicles(
  input: PaginationParams & { fleetId?: string } = {},
  token?: string,
): Promise<PaginatedApiResponse<VehicleRecord>> {
  const params = new URLSearchParams();
  if (input.fleetId) {
    params.set('fleetId', input.fleetId);
  }
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return apiCoreFetch<PaginatedApiResponse<VehicleRecord>>(`/vehicles${query ? `?${query}` : ''}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getOperationalReadinessReport(
  token?: string,
): Promise<OperationalReadinessReportRecord> {
  return apiCoreFetch<OperationalReadinessReportRecord>('/reports/operational-readiness', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getLicenceExpiryReport(token?: string): Promise<LicenceExpiryReportRecord[]> {
  return apiCoreFetch<LicenceExpiryReportRecord[]>('/reports/licence-expiry', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getDriverSelfServiceContext(selfServiceToken: string): Promise<DriverRecord> {
  return apiCoreFetch<DriverRecord>('/driver-self-service/context', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken }),
    cache: 'no-store',
  });
}

export async function createDriverSelfServiceLivenessSession(
  selfServiceToken: string,
  input: { countryCode?: string } = {},
): Promise<DriverLivenessSessionRecord> {
  return apiCoreFetch<DriverLivenessSessionRecord>('/driver-self-service/liveness-sessions', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken, ...input }),
    cache: 'no-store',
  });
}

export async function resolveDriverSelfServiceIdentity(
  selfServiceToken: string,
  input: DriverIdentityResolutionInput,
): Promise<DriverIdentityResolutionResult> {
  return apiCoreFetch<DriverIdentityResolutionResult>('/driver-self-service/identity-resolution', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken, ...input }),
    cache: 'no-store',
  });
}

export async function listDriverSelfServiceDocuments(
  selfServiceToken: string,
): Promise<DriverDocumentRecord[]> {
  return apiCoreFetch<DriverDocumentRecord[]>('/driver-self-service/documents/list', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken }),
    cache: 'no-store',
  });
}

export async function uploadDriverSelfServiceDocument(
  selfServiceToken: string,
  input: {
    documentType: string;
    fileName: string;
    contentType: string;
    fileBase64: string;
    uploadedBy: 'operator' | 'driver_self_service';
  },
): Promise<DriverDocumentRecord> {
  return apiCoreFetch<DriverDocumentRecord>('/driver-self-service/documents', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken, ...input }),
    cache: 'no-store',
  });
}

export async function getVehicle(vehicleId: string, token?: string): Promise<VehicleDetailRecord> {
  return apiCoreFetch<VehicleDetailRecord>(`/vehicles/${vehicleId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getVehicleCodeSuggestion(
  fleetId: string,
  token?: string,
): Promise<VehicleCodeSuggestionRecord> {
  return apiCoreFetch<VehicleCodeSuggestionRecord>(
    `/vehicles/code-suggestion?fleetId=${encodeURIComponent(fleetId)}`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function createVehicle(
  input: CreateVehicleInput,
  token?: string,
): Promise<VehicleRecord> {
  return apiCoreFetch<VehicleRecord>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateVehicle(
  vehicleId: string,
  input: UpdateVehicleInput,
  token?: string,
): Promise<VehicleRecord> {
  return apiCoreFetch<VehicleRecord>(`/vehicles/${vehicleId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listVehicleMakers(token?: string, q?: string): Promise<VehicleMakerRecord[]> {
  const search = q ? `?q=${encodeURIComponent(q)}` : '';
  return apiCoreFetch<VehicleMakerRecord[]>(`/vehicle-catalog/makers${search}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createVehicleMaker(
  input: CreateVehicleMakerInput,
  token?: string,
): Promise<VehicleMakerRecord> {
  return apiCoreFetch<VehicleMakerRecord>('/vehicle-catalog/makers', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listVehicleModels(
  input: {
    makerId?: string;
    q?: string;
    vehicleType?: string;
  } = {},
  token?: string,
): Promise<VehicleModelCatalogRecord[]> {
  const params = new URLSearchParams();
  if (input.makerId) {
    params.set('makerId', input.makerId);
  }
  if (input.q) {
    params.set('q', input.q);
  }
  if (input.vehicleType) {
    params.set('vehicleType', input.vehicleType);
  }

  const query = params.toString();
  return apiCoreFetch<VehicleModelCatalogRecord[]>(
    `/vehicle-catalog/models${query ? `?${query}` : ''}`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function createVehicleModel(
  input: CreateVehicleModelInput,
  token?: string,
): Promise<VehicleModelCatalogRecord> {
  return apiCoreFetch<VehicleModelCatalogRecord>('/vehicle-catalog/models', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function decodeVehicleVin(
  input: DecodeVehicleVinInput,
  token?: string,
): Promise<VehicleVinDecodeRecord> {
  return apiCoreFetch<VehicleVinDecodeRecord>('/vehicle-catalog/decode-vin', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateVehicleStatus(
  vehicleId: string,
  status: string,
  token?: string,
): Promise<VehicleRecord> {
  return apiCoreFetch<VehicleRecord>(`/vehicles/${vehicleId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export function listAssignments(
  input: PaginationParams & {
    driverId?: string;
    vehicleId?: string;
    fleetId?: string;
  } = {},
  token?: string,
): Promise<PaginatedApiResponse<AssignmentRecord>> {
  const params = new URLSearchParams();
  if (input.driverId) {
    params.set('driverId', input.driverId);
  }
  if (input.vehicleId) {
    params.set('vehicleId', input.vehicleId);
  }
  if (input.fleetId) {
    params.set('fleetId', input.fleetId);
  }
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return getTenantApiToken(token).then((resolvedToken) =>
    apiCoreFetch<PaginatedApiResponse<AssignmentRecord>>(
      `/assignments${query ? `?${query}` : ''}`,
      {
        cache: 'no-store',
        token: resolvedToken,
      },
    ),
  );
}

export async function getAssignment(
  assignmentId: string,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createAssignment(
  input: CreateAssignmentInput,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>('/assignments', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function startAssignment(
  assignmentId: string,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}/start`, {
    method: 'POST',
    body: JSON.stringify({}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function completeAssignment(
  assignmentId: string,
  notes?: string,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}/complete`, {
    method: 'POST',
    body: JSON.stringify(notes ? { notes } : {}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function cancelAssignment(
  assignmentId: string,
  notes?: string,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(notes ? { notes } : {}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export function listRemittances(
  input: PaginationParams & {
    assignmentId?: string;
    driverId?: string;
    status?: string;
  } = {},
  token?: string,
): Promise<PaginatedApiResponse<RemittanceRecord>> {
  const params = new URLSearchParams();
  if (input.assignmentId) {
    params.set('assignmentId', input.assignmentId);
  }
  if (input.driverId) {
    params.set('driverId', input.driverId);
  }
  if (input.status) {
    params.set('status', input.status);
  }
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return getTenantApiToken(token).then((resolvedToken) =>
    apiCoreFetch<PaginatedApiResponse<RemittanceRecord>>(`/remittance${query ? `?${query}` : ''}`, {
      cache: 'no-store',
      token: resolvedToken,
    }),
  );
}

export async function recordRemittance(
  input: RecordRemittanceInput,
  token?: string,
): Promise<RemittanceRecord> {
  return apiCoreFetch<RemittanceRecord>('/remittance', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function confirmRemittance(
  remittanceId: string,
  paidDate: string,
  token?: string,
): Promise<RemittanceRecord> {
  return apiCoreFetch<RemittanceRecord>(`/remittance/${remittanceId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ paidDate }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function disputeRemittance(
  remittanceId: string,
  notes: string,
  token?: string,
): Promise<RemittanceRecord> {
  return apiCoreFetch<RemittanceRecord>(`/remittance/${remittanceId}/dispute`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function waiveRemittance(
  remittanceId: string,
  notes: string,
  token?: string,
): Promise<RemittanceRecord> {
  return apiCoreFetch<RemittanceRecord>(`/remittance/${remittanceId}/waive`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getOperationalWalletBalance(
  businessEntityId: string,
  token?: string,
): Promise<WalletBalanceRecord> {
  return apiCoreFetch<WalletBalanceRecord>(`/operational-wallets/${businessEntityId}/balance`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listOperationalWalletEntries(
  businessEntityId: string,
  token?: string,
): Promise<WalletEntryRecord[]> {
  return apiCoreFetch<WalletEntryRecord[]>(`/operational-wallets/${businessEntityId}/entries`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}
