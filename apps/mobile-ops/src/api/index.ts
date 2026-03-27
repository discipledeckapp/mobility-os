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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

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

export interface RegisterOrganisationResponse {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  message: string;
}

export interface VerifySignupOtpResponse {
  verified: boolean;
  tenantSlug: string;
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
  organisationDisplayName?: string | null;
  organisationLogoUrl?: string | null;
  defaultLanguage?: 'en' | 'fr';
  preferredLanguage?: 'en' | 'fr';
  guarantorMaxActiveDrivers?: number;
  autoSendDriverSelfServiceLinkOnCreate?: boolean;
  requireIdentityVerificationForActivation?: boolean;
  requireBiometricVerification?: boolean;
  requireGovernmentVerificationLookup?: boolean;
  requiredDriverDocumentSlugs?: string[];
  requiredVehicleDocumentSlugs?: string[];
  notificationPreferences?: NotificationPreferencesRecord;
  permissions: string[];
  assignedFleetIds?: string[];
  assignedVehicleIds?: string[];
  customPermissions?: string[];
  linkedDriverId?: string | null;
  linkedDriverStatus?: string | null;
  linkedDriverIdentityStatus?: string | null;
  accessMode?: 'tenant_user' | 'driver_mobile';
  mobileRole?: 'driver' | 'field_officer' | null;
  mobileAccessRevoked?: boolean | null;
  selfServiceSubjectType?: 'driver' | 'guarantor' | null;
  selfServiceDriverId?: string | null;
}

export interface NotificationChannelPreferenceRecord {
  email: boolean;
  inApp: boolean;
  push: boolean;
}

export interface NotificationPreferencesRecord {
  remittance_due: NotificationChannelPreferenceRecord;
  remittance_overdue: NotificationChannelPreferenceRecord;
  remittance_reconciled: NotificationChannelPreferenceRecord;
  late_remittance_risk: NotificationChannelPreferenceRecord;
  compliance_risk: NotificationChannelPreferenceRecord;
  maintenance_due: NotificationChannelPreferenceRecord;
  maintenance_overdue: NotificationChannelPreferenceRecord;
  vehicle_incident_reported: NotificationChannelPreferenceRecord;
  self_service_invite: NotificationChannelPreferenceRecord;
  billing_updates: NotificationChannelPreferenceRecord;
  trial_guidance: NotificationChannelPreferenceRecord;
  product_updates: NotificationChannelPreferenceRecord;
  marketing_updates: NotificationChannelPreferenceRecord;
}

export interface UserNotificationRecord {
  id: string;
  topic: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}

export interface TenantRecord {
  id: string;
  slug: string;
  name: string;
  country: string;
  status: string;
  metadata?: Record<string, unknown> | null;
  displayName?: string | null;
  logoUrl?: string | null;
  defaultLanguage?: 'en' | 'fr';
  guarantorMaxActiveDrivers?: number;
  autoSendDriverSelfServiceLinkOnCreate?: boolean;
  requireIdentityVerificationForActivation?: boolean;
  requireBiometricVerification?: boolean;
  requireGovernmentVerificationLookup?: boolean;
  requiredDriverDocumentSlugs?: string[];
  requiredVehicleDocumentSlugs?: string[];
  driverPaysKyc?: boolean;
  createdAt: string;
  updatedAt: string;
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
  remittanceModel?: string | null;
  remittanceFrequency?: string | null;
  remittanceAmountMinorUnits?: number | null;
  remittanceCurrency?: string | null;
  remittanceStartDate?: string | null;
  remittanceCollectionDay?: number | null;
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

export interface OperatorAssignmentRecord {
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
  remittanceModel?: string | null;
  remittanceFrequency?: string | null;
  remittanceAmountMinorUnits?: number | null;
  remittanceCurrency?: string | null;
  remittanceStartDate?: string | null;
  remittanceCollectionDay?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriverRecord {
  id: string;
  tenantId?: string;
  businessEntityId?: string;
  operatingUnitId?: string;
  fleetId?: string;
  status: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  identityStatus: string;
  identityReviewCaseId?: string | null;
  identityReviewStatus?: string | null;
  identityLastVerifiedAt?: string | null;
  riskBand?: string | null;
  isWatchlisted?: boolean | null;
  hasApprovedLicence: boolean;
  hasMobileAccess?: boolean;
  mobileAccessStatus?: string | null;
  hasGuarantor?: boolean;
  guarantorStatus?: string | null;
  pendingDocumentCount: number;
  rejectedDocumentCount: number;
  expiredDocumentCount: number;
  authenticationAccess?: string;
  authenticationAccessReasons?: string[];
  activationReadiness?: string;
  activationReadinessReasons?: string[];
  assignmentReadiness?: string;
  assignmentReadinessReasons?: string[];
  remittanceReadiness?: string;
  remittanceReadinessReasons?: string[];
  requireIdentityVerificationForActivation?: boolean;
  requireBiometricVerification?: boolean;
  requireGovernmentVerificationLookup?: boolean;
  requiredDriverDocumentSlugs?: string[];
  driverPaysKyc?: boolean;
  kycPaymentVerified?: boolean;
  verificationPaymentStatus?:
    | 'not_required'
    | 'ready'
    | 'driver_payment_required'
    | 'wallet_missing'
    | 'insufficient_balance';
  verificationPaymentMessage?: string | null;
}

export interface DriverSelfServiceDocumentRecord {
  id: string;
  documentType: string;
  status: string;
  uploadedAt?: string | null;
  reviewedAt?: string | null;
  expiresAt?: string | null;
  rejectionReason?: string | null;
}

export interface DriverSelfServiceTokenExchangeResponse {
  token: string;
}

export interface DriverLivenessSessionRecord {
  providerName: string;
  sessionId: string;
  expiresAt?: string;
  fallbackChain: string[];
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
  verificationConfidence?: number;
  livenessPassed?: boolean;
  livenessProviderName?: string;
  livenessConfidenceScore?: number;
  livenessReason?: string;
  /** Verified profile data returned from the identity provider (e.g. Smile Identity NIN/BVN record). */
  verifiedProfile?: {
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    photoUrl?: string;
  };
}

export interface RemittanceRecord {
  fleetId?: string;
  businessEntityId?: string;
  operatingUnitId?: string;
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
  odometerKm?: number | null;
  fleetName?: string;
  businessEntityName?: string;
  operatingUnitName?: string;
  maintenanceSummary?: string;
  maintenanceDue?: {
    dueCount: number;
    overdueCount: number;
    nextDueAt?: string | null;
    nextDueOdometerKm?: number | null;
  };
  economics?: {
    acquisitionValueMinorUnits?: number | null;
    currentEstimatedValueMinorUnits?: number | null;
    valuationCurrency?: string | null;
    confirmedRevenueMinorUnits: number;
    trackedExpenseMinorUnits: number;
    profitMinorUnits: number;
    recommendation: string;
  };
  inspections?: VehicleInspectionRecord[];
  maintenanceSchedules?: VehicleMaintenanceScheduleRecord[];
  maintenanceEvents?: VehicleMaintenanceEventRecord[];
  incidents?: VehicleIncidentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInspectionRecord {
  id: string;
  vehicleId: string;
  inspectionType: string;
  status: string;
  inspectionDate: string;
  odometerKm?: number | null;
  issuesFoundCount: number;
  reportSource: string;
  summary: string;
  reportUrl?: string | null;
  nextInspectionDueAt?: string | null;
  createdAt: string;
}

export interface VehicleMaintenanceScheduleRecord {
  id: string;
  vehicleId: string;
  isActive: boolean;
  scheduleType: string;
  intervalDays?: number | null;
  intervalKm?: number | null;
  nextDueAt?: string | null;
  nextDueOdometerKm?: number | null;
  source?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface VehicleMaintenanceEventRecord {
  id: string;
  vehicleId: string;
  category: string;
  title: string;
  description?: string | null;
  status: string;
  scheduledFor?: string | null;
  completedAt?: string | null;
  odometerKm?: number | null;
  costMinorUnits?: number | null;
  currency?: string | null;
  vendor?: string | null;
  createdAt: string;
}

export interface VehicleIncidentRecord {
  id: string;
  vehicleId: string;
  driverId?: string | null;
  category: string;
  severity: string;
  title: string;
  description?: string | null;
  occurredAt: string;
  status: string;
  estimatedCostMinorUnits?: number | null;
  currency?: string | null;
  createdAt: string;
}

export interface FleetRecord {
  id: string;
  tenantId: string;
  operatingUnitId: string;
  name: string;
  businessModel: string;
  status: string;
  maintenanceScheduleType?: string | null;
  maintenanceIntervalDays?: number | null;
  maintenanceIntervalKm?: number | null;
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

export interface CreateBusinessEntityInput {
  name: string;
  country: string;
  businessModel: string;
}

export interface UpdateBusinessEntityInput {
  name?: string;
  country?: string;
  businessModel?: string;
}

export interface CreateOperatingUnitInput {
  businessEntityId: string;
  name: string;
}

export interface UpdateOperatingUnitInput {
  businessEntityId?: string;
  name?: string;
}

export interface CreateFleetInput {
  operatingUnitId: string;
  name: string;
  businessModel: string;
  maintenanceScheduleType?: string;
  maintenanceIntervalDays?: number;
  maintenanceIntervalKm?: number;
}

export interface UpdateFleetInput {
  operatingUnitId?: string;
  name?: string;
  businessModel?: string;
  maintenanceScheduleType?: string;
  maintenanceIntervalDays?: number;
  maintenanceIntervalKm?: number;
}

export interface TeamMemberRecord {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  assignedFleetIds: string[];
  assignedVehicleIds: string[];
  customPermissions: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface InviteTeamMemberInput {
  name: string;
  email: string;
  role: string;
  phone?: string;
  assignedFleetIds?: string[];
  assignedVehicleIds?: string[];
  customPermissions?: string[];
}

export interface UpdateTeamMemberAccessInput {
  assignedFleetIds?: string[];
  assignedVehicleIds?: string[];
  customPermissions?: string[];
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

export interface TenantBillingSummaryRecord {
  subscription: {
    id: string;
    planId: string;
    planName: string;
    planTier: string;
    currency: string;
    features: Record<string, unknown>;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEndsAt?: string | null;
  };
  invoices: TenantBillingInvoiceRecord[];
  outstandingInvoice?: TenantBillingInvoiceRecord | null;
  verificationWallet: {
    walletId: string;
    currency: string;
    balanceMinorUnits: number;
    entries: Array<{
      id: string;
      type: string;
      amountMinorUnits: number;
      currency: string;
      referenceId?: string | null;
      referenceType?: string | null;
      description?: string | null;
      createdAt: string;
    }>;
  };
  customerEmail: string;
  customerName: string;
}

export interface TenantBillingPlanRecord {
  id: string;
  name: string;
  tier: string;
  billingInterval: string;
  basePriceMinorUnits: number;
  currency: string;
  isActive: boolean;
  features: Record<string, unknown>;
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

export interface TenantPaymentApplicationRecord {
  provider: string;
  reference: string;
  purpose: string;
  status: string;
  amountMinorUnits: number;
  currency: string;
  invoiceId?: string;
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
  odometerKm?: number;
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
  odometerKm?: number;
  acquisitionCostMinorUnits?: number;
  acquisitionDate?: string;
  currentEstimatedValueMinorUnits?: number;
  valuationSource?: string;
}

export interface ReportsOverviewRecord {
  wallet: {
    currency: string;
    totalBalanceMinorUnits: number;
    totalInflowMinorUnits: number;
    totalOutflowMinorUnits: number;
  };
  dailyRemittanceTrend: Array<{ label: string; amountMinorUnits: number }>;
  weeklyRemittanceTrend: Array<{ label: string; amountMinorUnits: number }>;
  driverActivity: {
    active: number;
    inactive: number;
  };
  remittanceProjection: {
    currency: string;
    activeAssignmentsWithPlans: number;
    expectedTodayMinorUnits: number;
    expectedThisWeekMinorUnits: number;
    atRiskMinorUnits: number;
    atRiskAssignmentCount: number;
  };
  ownershipProgress: {
    currency: string;
    activeHirePurchaseUnits: number;
    targetValueMinorUnits: number;
    remittedValueMinorUnits: number;
    outstandingValueMinorUnits: number;
    completionRatio: number;
  };
  fleetPerformance: Array<{
    fleetId: string;
    fleetName: string;
    vehicleCount: number;
    activeAssignmentCount: number;
    confirmedRevenueMinorUnits: number;
    trackedExpenseMinorUnits: number;
    profitMinorUnits: number;
    atRiskAssignmentCount: number;
    overdueMaintenanceCount: number;
  }>;
  managerPerformance: Array<{
    userId: string;
    name: string;
    fleetCount: number;
    vehicleCount: number;
    confirmedRevenueMinorUnits: number;
    trackedExpenseMinorUnits: number;
    profitMinorUnits: number;
    atRiskAssignmentCount: number;
    overdueMaintenanceCount: number;
  }>;
}

export interface DriverReadinessReportItem {
  id: string;
  fullName: string;
  fleetId: string;
  activationReadiness: string;
  activationReadinessReasons: string[];
  assignmentReadiness: string;
  approvedLicenceExpiresAt?: string | null;
  lastAssignmentDate?: string | null;
  riskBand?: string | null;
  expectedRemittanceAmountMinorUnits?: number | null;
  remittanceCurrency?: string | null;
  nextRemittanceDueDate?: string | null;
  remittanceRiskStatus?: string | null;
  remittanceRiskReason?: string | null;
}

export interface VehicleReadinessReportItem {
  id: string;
  primaryLabel: string;
  fleetId: string;
  status: string;
  currentValuationMinorUnits?: number | null;
  currentValuationCurrency?: string | null;
  maintenanceSummary: string;
  lifecycleStage: string;
  remittanceRiskStatus?: string | null;
  remittanceRiskReason?: string | null;
}

export interface OperationalReadinessReport {
  drivers: DriverReadinessReportItem[];
  vehicles: VehicleReadinessReportItem[];
}

export interface LicenceExpiryReportItem {
  driverId: string;
  fullName: string;
  fleetId: string;
  expiresAt: string;
  daysUntilExpiry: number;
}

export interface WalletBalanceRecord {
  walletId: string;
  businessEntityId: string;
  currency: string;
  balanceMinorUnits: number;
  updatedAt: string;
}

export interface RecordRemittanceInput {
  assignmentId: string;
  amountMinorUnits?: number;
  currency?: string;
  dueDate?: string;
  notes?: string;
}

export interface CreateAssignmentInput {
  driverId: string;
  vehicleId: string;
  fleetId?: string;
  notes?: string;
  remittanceModel?: 'fixed' | 'hire_purchase';
  remittanceAmountMinorUnits: number;
  remittanceFrequency?: 'daily' | 'weekly';
  remittanceCurrency?: string;
  remittanceStartDate?: string;
  remittanceCollectionDay?: number;
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30_000);
      let response: Response;
      try {
        response = await fetch(`${mobileEnv.apiUrl}${path}`, {
          ...init,
          headers,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

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

function buildQuery(path: string, params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
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

export function registerOrganisation(
  input: RegisterOrganisationInput,
): Promise<RegisterOrganisationResponse> {
  return apiFetch<RegisterOrganisationResponse>(
    API_PATHS.signupRegister,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    false,
  );
}

export function verifySignupOtp(input: {
  email: string;
  code: string;
}): Promise<VerifySignupOtpResponse> {
  return apiFetch<VerifySignupOtpResponse>(
    API_PATHS.signupVerifyOtp,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    false,
  );
}

export function requestPasswordReset(input: { email: string }): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    API_PATHS.passwordResetRequest,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    false,
  );
}

export function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    API_PATHS.passwordResetConfirm,
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

export function updateProfile(input: {
  name: string;
  phone?: string;
  preferredLanguage?: 'en' | 'fr';
}): Promise<SessionRecord> {
  return apiFetch<SessionRecord>(API_PATHS.profile, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function getTenantMe(): Promise<TenantRecord> {
  return apiFetch<TenantRecord>(`${API_PATHS.tenants}/me`);
}

export function updateTenantSettings(input: {
  displayName?: string;
  logoUrl?: string;
  defaultLanguage?: 'en' | 'fr';
  guarantorMaxActiveDrivers?: number;
  autoSendDriverSelfServiceLinkOnCreate?: boolean;
  requireIdentityVerificationForActivation?: boolean;
  requireBiometricVerification?: boolean;
  requireGovernmentVerificationLookup?: boolean;
  requiredDriverDocumentSlugs?: string[];
  requiredVehicleDocumentSlugs?: string[];
  driverPaysKyc?: boolean;
}): Promise<TenantRecord> {
  return apiFetch<TenantRecord>(`${API_PATHS.tenants}/me/settings`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function listUserNotifications(): Promise<UserNotificationRecord[]> {
  return apiFetch<UserNotificationRecord[]>(API_PATHS.notifications);
}

export function getNotificationPreferences(): Promise<NotificationPreferencesRecord> {
  return apiFetch<NotificationPreferencesRecord>(`${API_PATHS.notifications}/preferences`);
}

export function updateNotificationPreferences(
  input: Partial<NotificationPreferencesRecord>,
): Promise<NotificationPreferencesRecord> {
  return apiFetch<NotificationPreferencesRecord>(`${API_PATHS.notifications}/preferences`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function registerPushDevice(input: {
  deviceToken: string;
  platform: 'ios' | 'android' | 'web';
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`${API_PATHS.notifications}/push-devices`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function syncRemittanceReminders(): Promise<{ created: number }> {
  return apiFetch<{ created: number }>(`${API_PATHS.notifications}/remittance-reminders/sync`, {
    method: 'POST',
  });
}

export function syncMaintenanceReminders(): Promise<{ created: number }> {
  return apiFetch<{ created: number }>(`${API_PATHS.notifications}/maintenance-reminders/sync`, {
    method: 'POST',
  });
}

export function exchangeDriverSelfServiceOtp(
  otpCode: string,
): Promise<DriverSelfServiceTokenExchangeResponse> {
  return apiFetch<DriverSelfServiceTokenExchangeResponse>(
    API_PATHS.selfServiceExchangeOtp,
    {
      method: 'POST',
      body: JSON.stringify({ otpCode }),
    },
    false,
  );
}

export function getDriverSelfServiceContext(selfServiceToken: string): Promise<DriverRecord> {
  return apiFetch<DriverRecord>(
    API_PATHS.selfServiceContext,
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken }),
    },
    false,
  );
}

export function listDriverSelfServiceDocuments(
  selfServiceToken: string,
): Promise<DriverSelfServiceDocumentRecord[]> {
  return apiFetch<DriverSelfServiceDocumentRecord[]>(
    API_PATHS.selfServiceDocuments,
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken }),
    },
    false,
  );
}

export function createDriverSelfServiceLivenessSession(
  selfServiceToken: string,
  input: { countryCode?: string } = {},
): Promise<DriverLivenessSessionRecord> {
  return apiFetch<DriverLivenessSessionRecord>(
    '/driver-self-service/liveness-sessions',
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken, ...input }),
    },
    false,
  );
}

export function resolveDriverSelfServiceIdentity(
  selfServiceToken: string,
  input: DriverIdentityResolutionInput,
): Promise<DriverIdentityResolutionResult> {
  return apiFetch<DriverIdentityResolutionResult>(
    '/driver-self-service/identity-resolution',
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken, ...input }),
    },
    false,
  );
}

export function uploadDriverSelfServiceDocument(
  selfServiceToken: string,
  input: {
    documentType: string;
    fileName: string;
    contentType: string;
    fileBase64: string;
    uploadedBy: 'driver_self_service';
  },
): Promise<DriverSelfServiceDocumentRecord> {
  return apiFetch<DriverSelfServiceDocumentRecord>(
    '/driver-self-service/documents',
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken, ...input }),
    },
    false,
  );
}

export function createDriverMobileAccount(
  selfServiceToken: string,
  input: { email: string; password: string },
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    '/driver-self-service/create-account',
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken, ...input }),
    },
    false,
  );
}

export function issueAuthenticatedDriverSelfServiceContinuationToken(): Promise<{ token: string }> {
  return apiFetch<{ token: string }>(
    '/driver-self-service/authenticated-token',
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
  );
}

export function updateDriverSelfServiceContact(
  selfServiceToken: string,
  input: { email?: string },
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    '/driver-self-service/update-contact',
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken, ...input }),
    },
    false,
  );
}

export function updateDriverSelfServiceProfile(
  selfServiceToken: string,
  input: { firstName?: string; lastName?: string; dateOfBirth?: string },
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    '/driver-self-service/update-profile',
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken, ...input }),
    },
    false,
  );
}

export function submitDriverSelfServiceGuarantor(
  selfServiceToken: string,
  input: {
    name: string;
    phone: string;
    email?: string;
    countryCode?: string;
    relationship?: string;
  },
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    '/driver-self-service/guarantor',
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken, ...input }),
    },
    false,
  );
}

export function initiateDriverKycCheckout(
  selfServiceToken: string,
  provider: 'paystack' | 'flutterwave' = 'paystack',
  returnUrl?: string,
): Promise<{ checkoutUrl: string; amountMinorUnits: number; currency: string }> {
  return apiFetch<{ checkoutUrl: string; amountMinorUnits: number; currency: string }>(
    '/driver-self-service/kyc-checkout',
    {
      method: 'POST',
      body: JSON.stringify({
        token: selfServiceToken,
        provider,
        ...(returnUrl ? { returnUrl } : {}),
      }),
    },
    false,
  );
}

export function listAssignments(): Promise<AssignmentRecord[]> {
  return apiFetch<AssignmentRecord[]>(API_PATHS.mobileAssignments);
}

export function listOperatorAssignments(input: {
  page?: number;
  limit?: number;
  driverId?: string;
  vehicleId?: string;
  fleetId?: string;
} = {}): Promise<PaginatedResponse<OperatorAssignmentRecord>> {
  return apiFetch<PaginatedResponse<OperatorAssignmentRecord>>(
    buildQuery(API_PATHS.assignments, input),
  );
}

export function createOperatorAssignment(
  input: CreateAssignmentInput,
): Promise<OperatorAssignmentRecord> {
  return apiFetch<OperatorAssignmentRecord>(API_PATHS.assignments, {
    method: 'POST',
    body: JSON.stringify(input),
  });
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

export function listDrivers(input: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  identityStatus?: string;
  fleetId?: string;
} = {}): Promise<PaginatedResponse<DriverRecord>> {
  return apiFetch<PaginatedResponse<DriverRecord>>(buildQuery(API_PATHS.drivers, input));
}

export function getDriver(driverId: string): Promise<DriverRecord> {
  return apiFetch<DriverRecord>(`${API_PATHS.drivers}/${driverId}`);
}

export function sendDriverSelfServiceLink(driverId: string): Promise<{
  delivery: 'email';
  verificationUrl: string;
  destination: string;
}> {
  return apiFetch(`${API_PATHS.drivers}/${driverId}/self-service-links`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function recordRemittance(input: RecordRemittanceInput): Promise<RemittanceRecord> {
  return apiFetch<RemittanceRecord>(API_PATHS.mobileRemittance, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listRemittanceHistory(): Promise<RemittanceRecord[]> {
  return apiFetch<RemittanceRecord[]>(API_PATHS.mobileRemittanceHistory);
}

export function listOperatorRemittance(input: {
  page?: number;
  limit?: number;
  assignmentId?: string;
  driverId?: string;
  status?: string;
} = {}): Promise<PaginatedResponse<RemittanceRecord>> {
  return apiFetch<PaginatedResponse<RemittanceRecord>>(buildQuery(API_PATHS.remittance, input));
}

export function getRemittance(remittanceId: string): Promise<RemittanceRecord> {
  return apiFetch<RemittanceRecord>(`${API_PATHS.remittance}/${remittanceId}`);
}

export function confirmRemittance(
  remittanceId: string,
  paidDate: string,
): Promise<RemittanceRecord> {
  return apiFetch<RemittanceRecord>(`${API_PATHS.remittance}/${remittanceId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ paidDate }),
  });
}

export function disputeRemittance(remittanceId: string, notes: string): Promise<RemittanceRecord> {
  return apiFetch<RemittanceRecord>(`${API_PATHS.remittance}/${remittanceId}/dispute`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export function waiveRemittance(remittanceId: string, notes: string): Promise<RemittanceRecord> {
  return apiFetch<RemittanceRecord>(`${API_PATHS.remittance}/${remittanceId}/waive`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export function listVehicles(input: {
  page?: number;
  limit?: number;
  fleetId?: string;
} = {}): Promise<PaginatedResponse<VehicleRecord>> {
  return apiFetch<PaginatedResponse<VehicleRecord>>(buildQuery(API_PATHS.vehicles, input));
}

export function getReportsOverview(): Promise<ReportsOverviewRecord> {
  return apiFetch<ReportsOverviewRecord>(API_PATHS.reportsOverview);
}

export function getOperationalReadinessReport(): Promise<OperationalReadinessReport> {
  return apiFetch<OperationalReadinessReport>(API_PATHS.reportsOperationalReadiness);
}

export function getLicenceExpiryReport(): Promise<LicenceExpiryReportItem[]> {
  return apiFetch<LicenceExpiryReportItem[]>(API_PATHS.reportsLicenceExpiry);
}

export function getOperationalWalletBalance(
  businessEntityId: string,
): Promise<WalletBalanceRecord> {
  return apiFetch<WalletBalanceRecord>(
    `${API_PATHS.operationalWallets}/${businessEntityId}/balance`,
  );
}

export function listFleets(input: { operatingUnitId?: string } = {}): Promise<FleetRecord[]> {
  return apiFetch<FleetRecord[]>(buildQuery(API_PATHS.fleets, input));
}

export function getFleet(fleetId: string): Promise<FleetRecord> {
  return apiFetch<FleetRecord>(`${API_PATHS.fleets}/${encodeURIComponent(fleetId)}`);
}

export function createFleet(input: CreateFleetInput): Promise<FleetRecord> {
  return apiFetch<FleetRecord>(API_PATHS.fleets, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateFleet(fleetId: string, input: UpdateFleetInput): Promise<FleetRecord> {
  return apiFetch<FleetRecord>(`${API_PATHS.fleets}/${encodeURIComponent(fleetId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function listBusinessEntities(): Promise<BusinessEntityRecord[]> {
  return apiFetch<BusinessEntityRecord[]>(API_PATHS.businessEntities);
}

export function getBusinessEntity(businessEntityId: string): Promise<BusinessEntityRecord> {
  return apiFetch<BusinessEntityRecord>(
    `${API_PATHS.businessEntities}/${encodeURIComponent(businessEntityId)}`,
  );
}

export function createBusinessEntity(input: CreateBusinessEntityInput): Promise<BusinessEntityRecord> {
  return apiFetch<BusinessEntityRecord>(API_PATHS.businessEntities, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateBusinessEntity(
  businessEntityId: string,
  input: UpdateBusinessEntityInput,
): Promise<BusinessEntityRecord> {
  return apiFetch<BusinessEntityRecord>(
    `${API_PATHS.businessEntities}/${encodeURIComponent(businessEntityId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}

export function listOperatingUnits(
  input: { businessEntityId?: string } = {},
): Promise<OperatingUnitRecord[]> {
  return apiFetch<OperatingUnitRecord[]>(buildQuery(API_PATHS.operatingUnits, input));
}

export function getOperatingUnit(operatingUnitId: string): Promise<OperatingUnitRecord> {
  return apiFetch<OperatingUnitRecord>(
    `${API_PATHS.operatingUnits}/${encodeURIComponent(operatingUnitId)}`,
  );
}

export function createOperatingUnit(input: CreateOperatingUnitInput): Promise<OperatingUnitRecord> {
  return apiFetch<OperatingUnitRecord>(API_PATHS.operatingUnits, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateOperatingUnit(
  operatingUnitId: string,
  input: UpdateOperatingUnitInput,
): Promise<OperatingUnitRecord> {
  return apiFetch<OperatingUnitRecord>(
    `${API_PATHS.operatingUnits}/${encodeURIComponent(operatingUnitId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}

export function getVehicle(vehicleId: string): Promise<VehicleRecord> {
  return apiFetch<VehicleRecord>(`${API_PATHS.vehicles}/${vehicleId}`);
}

export function createVehicle(input: CreateVehicleInput): Promise<VehicleRecord> {
  return apiFetch<VehicleRecord>(API_PATHS.vehicles, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateVehicle(vehicleId: string, input: UpdateVehicleInput): Promise<VehicleRecord> {
  return apiFetch<VehicleRecord>(`${API_PATHS.vehicles}/${vehicleId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function updateVehicleStatus(vehicleId: string, status: string): Promise<VehicleRecord> {
  return apiFetch<VehicleRecord>(`${API_PATHS.vehicles}/${vehicleId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function createVehicleInspection(
  vehicleId: string,
  input: {
    inspectionType: string;
    status?: string;
    inspectionDate?: string;
    odometerKm?: number;
    issuesFoundCount?: number;
    reportSource?: string;
    summary: string;
    reportUrl?: string;
    nextInspectionDueAt?: string;
  },
): Promise<VehicleInspectionRecord> {
  return apiFetch<VehicleInspectionRecord>(`${API_PATHS.vehicles}/${vehicleId}/inspections`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function upsertVehicleMaintenanceSchedule(
  vehicleId: string,
  input: {
    scheduleType: string;
    intervalDays?: number;
    intervalKm?: number;
    nextDueAt?: string;
    nextDueOdometerKm?: number;
    source?: string;
    notes?: string;
    isActive?: boolean;
  },
): Promise<VehicleMaintenanceScheduleRecord> {
  return apiFetch<VehicleMaintenanceScheduleRecord>(
    `${API_PATHS.vehicles}/${vehicleId}/maintenance-schedules`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function createVehicleMaintenanceEvent(
  vehicleId: string,
  input: {
    category: string;
    title: string;
    description?: string;
    status?: string;
    scheduledFor?: string;
    completedAt?: string;
    odometerKm?: number;
    costMinorUnits?: number;
    currency?: string;
    vendor?: string;
  },
): Promise<VehicleMaintenanceEventRecord> {
  return apiFetch<VehicleMaintenanceEventRecord>(
    `${API_PATHS.vehicles}/${vehicleId}/maintenance-events`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function createVehicleIncident(
  vehicleId: string,
  input: {
    driverId?: string;
    occurredAt: string;
    category: string;
    severity: string;
    title: string;
    description?: string;
    estimatedCostMinorUnits?: number;
    currency?: string;
  },
): Promise<VehicleIncidentRecord> {
  return apiFetch<VehicleIncidentRecord>(`${API_PATHS.vehicles}/${vehicleId}/incidents`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function reportAssignmentIncident(
  assignmentId: string,
  input: {
    category: string;
    severity: string;
    title: string;
    description?: string;
    occurredAt: string;
    estimatedCostMinorUnits?: number;
    currency?: string;
  },
): Promise<VehicleIncidentRecord> {
  return apiFetch<VehicleIncidentRecord>(`${API_PATHS.mobileAssignments}/${assignmentId}/incidents`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateDriverStatus(driverId: string, status: string): Promise<DriverRecord> {
  return apiFetch<DriverRecord>(`${API_PATHS.drivers}/${driverId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function listTeamMembers(): Promise<TeamMemberRecord[]> {
  return apiFetch<TeamMemberRecord[]>(API_PATHS.team);
}

export function inviteTeamMember(input: InviteTeamMemberInput): Promise<TeamMemberRecord> {
  return apiFetch<TeamMemberRecord>(`${API_PATHS.team}/invite`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTeamMemberAccess(
  userId: string,
  input: UpdateTeamMemberAccessInput,
): Promise<TeamMemberRecord> {
  return apiFetch<TeamMemberRecord>(`${API_PATHS.team}/${encodeURIComponent(userId)}/access`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deactivateTeamMember(userId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`${API_PATHS.team}/${userId}`, {
    method: 'DELETE',
  });
}

export function resendTeamInvite(userId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`${API_PATHS.team}/${userId}/resend-invite`, {
    method: 'POST',
  });
}

export function getTenantBillingSummary(): Promise<TenantBillingSummaryRecord> {
  return apiFetch<TenantBillingSummaryRecord>(`${API_PATHS.tenantBilling}/summary`);
}

export function listTenantBillingPlans(): Promise<TenantBillingPlanRecord[]> {
  return apiFetch<TenantBillingPlanRecord[]>(`${API_PATHS.tenantBilling}/plans`);
}

export function changeTenantBillingPlan(planId: string): Promise<TenantBillingSummaryRecord> {
  return apiFetch<TenantBillingSummaryRecord>(
    `${API_PATHS.tenantBilling}/subscription/change-plan/${encodeURIComponent(planId)}`,
    {
      method: 'POST',
    },
  );
}

export function initializeWalletTopUp(input: {
  provider: 'paystack' | 'flutterwave';
  amountMinorUnits: number;
}): Promise<TenantPaymentCheckoutRecord> {
  return apiFetch<TenantPaymentCheckoutRecord>(`${API_PATHS.tenantBilling}/wallet-top-ups/checkout`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function initializeInvoicePayment(input: {
  provider: 'paystack' | 'flutterwave';
  invoiceId: string;
}): Promise<TenantPaymentCheckoutRecord> {
  return apiFetch<TenantPaymentCheckoutRecord>(`${API_PATHS.tenantBilling}/invoice-checkouts`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function verifyAndApplyTenantPayment(
  input: VerifyAndApplyTenantPaymentInput,
): Promise<TenantPaymentApplicationRecord> {
  return apiFetch<TenantPaymentApplicationRecord>(`${API_PATHS.tenantBilling}/payments/verify-and-apply`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getStoredRefreshToken() {
  return getRefreshToken?.() ?? null;
}
