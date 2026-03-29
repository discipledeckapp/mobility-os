import { cookies } from 'next/headers';
import { PLATFORM_AUTH_COOKIE_NAME, parsePlatformJwtPayload } from './auth';

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_CONTROL_PLANE_API_URL?.replace(/\/$/, '');

if (process.env.NODE_ENV === 'production' && !configuredApiBaseUrl) {
  throw new Error('NEXT_PUBLIC_CONTROL_PLANE_API_URL is required in production.');
}

const apiBaseUrl = configuredApiBaseUrl ?? 'http://localhost:3100/api';

export interface ControlPlaneRequestOptions extends RequestInit {
  token?: string;
}

export interface PlatformLoginInput {
  email: string;
  password: string;
}

export interface PlatformApiContext {
  userId?: string;
  email?: string;
  role?: string;
}

export interface PlanRecord {
  id: string;
  name: string;
  tier: string;
  billingInterval: string;
  basePriceMinorUnits: number;
  currency: string;
  isActive: boolean;
  features: Record<string, unknown>;
}

export interface SubscriptionListItem {
  id: string;
  tenantId: string;
  planId: string;
  planName: string;
  planTier: string;
  currency: string;
  basePriceMinorUnits: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRecord {
  id: string;
  tenantId: string;
  subscriptionId: string;
  status: string;
  amountDueMinorUnits: number;
  amountPaidMinorUnits: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  dueAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ControlPlaneDocumentRecord {
  id: string;
  tenantId?: string | null;
  documentNumber: string;
  documentType: string;
  status: string;
  issuerType: string;
  issuerId?: string | null;
  recipientType?: string | null;
  recipientId?: string | null;
  relatedEntityType: string;
  relatedEntityId: string;
  fingerprint: string;
  signatureVersion: string;
  signedAt: string;
  signedBySystem: string;
  verificationReference: string;
  fileName: string;
  contentType: string;
  storageKey: string;
  fileUrl: string;
  fileHash: string;
  canonicalPayload: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ControlPlaneDisputeEvidenceRecord {
  id: string;
  disputeId: string;
  tenantId?: string | null;
  uploadedByType: string;
  uploadedById?: string | null;
  evidenceType: string;
  description?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  storageKey?: string | null;
  fileUrl: string;
  fileHash: string;
  integrityHash: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ControlPlaneDisputeTimelineRecord {
  id: string;
  disputeId: string;
  tenantId?: string | null;
  actorType: string;
  actorId?: string | null;
  actionType: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ControlPlaneDisputeRecord {
  id: string;
  disputeCode: string;
  tenantId?: string | null;
  disputeType: string;
  relatedEntityType: string;
  relatedEntityId: string;
  claimantType: string;
  claimantId: string;
  respondentType: string;
  respondentId?: string | null;
  title: string;
  reasonCode: string;
  narrative: string;
  status: string;
  priority: string;
  assignedTo?: string | null;
  resolvedAt?: string | null;
  resolvedByType?: string | null;
  resolvedById?: string | null;
  resolutionSummary?: Record<string, unknown> | null;
  finalAmountMinorUnits?: number | null;
  currency?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  timeline: ControlPlaneDisputeTimelineRecord[];
  evidence: ControlPlaneDisputeEvidenceRecord[];
}

export interface PlatformWalletSummary {
  walletId: string;
  tenantId: string;
  currency: string;
  balanceMinorUnits: number;
  entryCount: number;
  lastEntryAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformWalletLedgerItemRecord {
  id: string;
  walletId: string;
  tenantId: string;
  type: string;
  amountMinorUnits: number;
  currency: string;
  referenceId?: string | null;
  referenceType?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface FeatureFlagOverrideRecord {
  id: string;
  tenantId?: string | null;
  countryCode?: string | null;
  planTier?: string | null;
  value: unknown;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagRecord {
  id: string;
  key: string;
  description?: string | null;
  value: unknown;
  isEnabled: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  overrides: FeatureFlagOverrideRecord[];
}

export interface TenantLifecycleStateRecord {
  tenantId: string;
  subscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface TenantLifecycleEventRecord {
  id: string;
  tenantId: string;
  fromStatus?: string | null;
  toStatus: string;
  triggeredBy: string;
  actorId?: string | null;
  reason?: string | null;
  metadata?: unknown;
  occurredAt: string;
}

export interface BillingRunResult {
  processedAt: string;
  subscriptionCount: number;
  results: Array<{
    subscriptionId: string;
    tenantId: string;
    cyclesProcessed: number;
    finalStatus: string;
    invoices: Array<{
      invoiceId: string;
      status: string;
      amountDueMinorUnits: number;
      currency: string;
      settlementOutcome:
        | 'settled_from_platform_wallet'
        | 'insufficient_platform_wallet_balance'
        | 'already_paid'
        | 'skipped';
    }>;
  }>;
}

export interface CollectionsRunResult {
  processedAt: string;
  invoiceCount: number;
  results: Array<{
    invoiceId: string;
    tenantId: string;
    subscriptionId: string;
    status: string;
    amountOutstandingMinorUnits: number;
    currency: string;
    collectionOutcome:
      | 'settled_from_platform_wallet'
      | 'marked_past_due'
      | 'already_past_due'
      | 'already_paid'
      | 'skipped';
    subscriptionStatus: string;
  }>;
}

export interface ProvisionTenantInput {
  tenantSlug: string;
  tenantName: string;
  tenantCountry: string;
  businessEntityName: string;
  businessModel: string;
  operatingUnitName?: string;
  fleetName?: string;
  operatorName: string;
  operatorEmail: string;
  operatorPhone?: string;
  operatorPassword: string;
  planId: string;
  initialPlatformWalletCreditMinorUnits?: number;
}

export interface ProvisionTenantResult {
  tenant: {
    id: string;
    slug: string;
    name: string;
    country: string;
  };
  businessEntity: {
    id: string;
    name: string;
    country: string;
    businessModel: string;
  };
  operatingUnit: {
    id: string;
    name: string;
  };
  fleet: {
    id: string;
    name: string;
    businessModel: string;
  };
  operatorUser: {
    id: string;
    email: string;
    role: string;
    businessEntityId: string;
  };
  operationalWallet: {
    id: string;
    currency: string;
  };
  subscription: {
    id: string;
    planId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  platformWallet: {
    id: string;
    currency: string;
    initialCreditMinorUnits: number;
  };
}

export interface TenantListItemRecord {
  id: string;
  slug: string;
  name: string;
  country: string;
  status: string;
  planName?: string | null;
  planTier?: string | null;
  subscriptionStatus?: string | null;
  createdAt: string;
}

export interface TenantDetailRecord {
  id: string;
  slug: string;
  name: string;
  country: string;
  status: string;
  createdAt: string;
  subscription?: {
    id: string;
    planId: string;
    planName: string;
    planTier: string;
    status: string;
    currency: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  } | null;
  invoices: InvoiceRecord[];
  featureFlagOverrides: Array<{
    id: string;
    flagKey: string;
    countryCode?: string | null;
    planTier?: string | null;
    isEnabled: boolean;
  }>;
  lifecycleState?: TenantLifecycleStateRecord | null;
  lifecycleEvents: TenantLifecycleEventRecord[];
  ownerSummary?: {
    ownerUserId?: string | null;
    ownerName?: string | null;
    ownerEmail?: string | null;
    ownerPhone?: string | null;
    ownerRole?: string | null;
    ownerIsActive?: boolean | null;
    adminContacts?: Array<{
      userId: string;
      name: string;
      email: string;
      phone?: string | null;
      role: string;
      isActive: boolean;
    }>;
  } | null;
}

export interface OperationalDriverIssueRecord {
  driverId: string;
  fullName: string;
  fleetId: string;
  activationReadiness: string;
  activationReadinessReasons: string[];
  assignmentReadiness: string;
  remittanceRiskStatus?: string | null;
  remittanceRiskReason?: string | null;
  riskBand?: string | null;
}

export interface OperationalVehicleIssueRecord {
  vehicleId: string;
  primaryLabel: string;
  fleetId: string;
  status: string;
  maintenanceSummary: string;
  remittanceRiskStatus?: string | null;
  remittanceRiskReason?: string | null;
}

export interface OperationalLicenceExpiryRecord {
  driverId: string;
  fullName: string;
  fleetId: string;
  expiresAt: string;
  daysUntilExpiry: number;
}

export interface OperationsTenantSummaryRecord {
  tenantId: string;
  slug: string;
  tenantName: string;
  country: string;
  tenantStatus: string;
  generatedAt: string;
  attentionScore: number;
  driverActivity: {
    active: number;
    inactive: number;
    activeVerified: number;
    activeUnverified: number;
    onboardingPool: number;
  };
  verificationHealth: {
    driversAwaitingActivation: number;
    licenceVerificationIssueCount: number;
    providerRetryRequiredCount: number;
    expiringLicencesSoonCount: number;
    expiredLicencesCount: number;
  };
  riskSummary: {
    atRiskAssignmentCount: number;
    vehiclesAtRiskCount: number;
    criticalMaintenanceCount: number;
    inspectionComplianceRate: number;
  };
  topDriverIssues: OperationalDriverIssueRecord[];
  topVehicleIssues: OperationalVehicleIssueRecord[];
  topLicenceExpiries: OperationalLicenceExpiryRecord[];
}

export interface OperationsOverviewRecord {
  generatedAt: string;
  totals: {
    tenantCount: number;
    tenantsNeedingAttention: number;
    driversAwaitingActivation: number;
    pendingLicenceReviews: number;
    providerRetryRequired: number;
    expiringLicencesSoon: number;
    expiredLicences: number;
    atRiskAssignments: number;
    vehiclesAtRisk: number;
    criticalMaintenanceCount: number;
  };
  tenants: OperationsTenantSummaryRecord[];
}

export interface GovernanceTenantPrivacySummaryRecord {
  tenantId: string;
  openRequests: number;
  pendingReviewRequests: number;
  closedRequests: number;
  consentEventsLast30Days: number;
  lastRequestAt: string | null;
  lastConsentAt: string | null;
}

export interface GovernancePrivacyRequestRecord {
  id: string;
  tenantId: string;
  userId: string | null;
  subjectType: string;
  subjectId: string | null;
  requestType: string;
  status: string;
  contactEmail: string | null;
  details: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GovernanceConsentRecord {
  id: string;
  tenantId: string;
  userId: string | null;
  subjectType: string;
  subjectId: string | null;
  policyDocument: string;
  policyVersion: string;
  consentScope: string;
  granted: boolean;
  grantedAt: string;
}

export interface GovernancePrivacyOverviewRecord {
  generatedAt: string;
  totals: {
    openRequests: number;
    pendingReviewRequests: number;
    closedRequests: number;
    consentEventsLast30Days: number;
    tenantsWithOpenPrivacyRequests: number;
  };
  tenantSummaries: GovernanceTenantPrivacySummaryRecord[];
  requests: GovernancePrivacyRequestRecord[];
  consents: GovernanceConsentRecord[];
  support: {
    supportEmail: string;
    supportPhonePrimary: string | null;
    supportPhoneSecondary: string | null;
    privacyPolicyVersion: string;
    termsVersion: string;
  };
}

export interface GovernanceTenantNotificationSummaryRecord {
  tenantId: string;
  notificationsLast30Days: number;
  unreadNotifications: number;
  pushDevices: number;
  pushEnabledUsers: number;
  lastNotificationAt: string | null;
}

export interface GovernanceNotificationRecord {
  id: string;
  tenantId: string;
  userId: string;
  topic: string;
  title: string;
  body: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  } | null;
}

export interface GovernanceNotificationsOverviewRecord {
  generatedAt: string;
  totals: {
    notificationsLast30Days: number;
    unreadNotifications: number;
    pushDevices: number;
    pushEnabledUsers: number;
    tenantsWithUnreadNotifications: number;
    verificationNotifications: number;
    remittanceNotifications: number;
    assignmentNotifications: number;
    complianceRiskNotifications: number;
  };
  tenantSummaries: GovernanceTenantNotificationSummaryRecord[];
  notifications: GovernanceNotificationRecord[];
}

export interface GovernanceOverviewRecord {
  generatedAt: string;
  privacy: GovernancePrivacyOverviewRecord;
  notifications: GovernanceNotificationsOverviewRecord;
}

export async function getPlatformApiToken(explicitToken?: string): Promise<string> {
  if (explicitToken) {
    return explicitToken;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(PLATFORM_AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  throw new Error('No platform auth token is available. Log in to continue.');
}

export async function getPlatformApiContext(explicitToken?: string): Promise<PlatformApiContext> {
  const token = await getPlatformApiToken(explicitToken);
  const payload = parsePlatformJwtPayload(token);

  if (!payload) {
    throw new Error('Unable to read platform session context from JWT.');
  }

  return {
    ...(payload.sub ? { userId: payload.sub } : {}),
    ...(payload.email ? { email: payload.email } : {}),
    ...(payload.role ? { role: payload.role } : {}),
  };
}

export async function apiControlPlaneFetch<T>(
  path: string,
  options: ControlPlaneRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('content-type', 'application/json');
  if (options.token) {
    headers.set('authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText
        ? `api-control-plane returned status ${response.status}: ${errorText}`
        : `api-control-plane returned status ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

export async function loginPlatformUser(
  input: PlatformLoginInput,
): Promise<{ accessToken: string }> {
  return apiControlPlaneFetch<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function requestPlatformPasswordReset(email: string): Promise<{ message: string }> {
  return apiControlPlaneFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPlatformPassword(input: {
  token: string;
  password: string;
}): Promise<{ message: string }> {
  return apiControlPlaneFetch<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function listPlans(token?: string): Promise<PlanRecord[]> {
  return apiControlPlaneFetch<PlanRecord[]>('/plans', {
    token: await getPlatformApiToken(token),
  });
}

export async function listTenants(token?: string): Promise<TenantListItemRecord[]> {
  return apiControlPlaneFetch<TenantListItemRecord[]>('/tenants', {
    token: await getPlatformApiToken(token),
  });
}

export async function getTenantDetail(
  tenantId: string,
  token?: string,
): Promise<TenantDetailRecord> {
  return apiControlPlaneFetch<TenantDetailRecord>(`/tenants/${tenantId}`, {
    token: await getPlatformApiToken(token),
  });
}

export async function getOperationalOversight(token?: string): Promise<OperationsOverviewRecord> {
  return apiControlPlaneFetch<OperationsOverviewRecord>('/operations/oversight', {
    token: await getPlatformApiToken(token),
  });
}

export async function getTenantOperationalSummary(
  tenantId: string,
  token?: string,
): Promise<OperationsTenantSummaryRecord> {
  return apiControlPlaneFetch<OperationsTenantSummaryRecord>(
    `/operations/oversight/tenants/${tenantId}`,
    {
      token: await getPlatformApiToken(token),
    },
  );
}

export async function getGovernanceOversight(token?: string): Promise<GovernanceOverviewRecord> {
  return apiControlPlaneFetch<GovernanceOverviewRecord>('/governance/oversight', {
    token: await getPlatformApiToken(token),
  });
}

export async function getTenantGovernanceSummary(
  tenantId: string,
  token?: string,
): Promise<GovernanceOverviewRecord> {
  return apiControlPlaneFetch<GovernanceOverviewRecord>(
    `/governance/oversight/tenants/${tenantId}`,
    {
      token: await getPlatformApiToken(token),
    },
  );
}

export async function listSubscriptions(token?: string): Promise<SubscriptionListItem[]> {
  return apiControlPlaneFetch<SubscriptionListItem[]>('/subscriptions', {
    token: await getPlatformApiToken(token),
  });
}

export async function listInvoices(token?: string): Promise<InvoiceRecord[]> {
  return apiControlPlaneFetch<InvoiceRecord[]>('/billing/invoices', {
    token: await getPlatformApiToken(token),
  });
}

export async function listControlPlaneDocuments(
  input: {
    tenantId?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    documentType?: string;
  } = {},
  token?: string,
): Promise<ControlPlaneDocumentRecord[]> {
  const params = new URLSearchParams();
  if (input.tenantId) {
    params.set('tenantId', input.tenantId);
  }
  if (input.relatedEntityType) {
    params.set('relatedEntityType', input.relatedEntityType);
  }
  if (input.relatedEntityId) {
    params.set('relatedEntityId', input.relatedEntityId);
  }
  if (input.documentType) {
    params.set('documentType', input.documentType);
  }
  const query = params.toString();

  return apiControlPlaneFetch<ControlPlaneDocumentRecord[]>(
    `/records/documents${query ? `?${query}` : ''}`,
    {
      token: await getPlatformApiToken(token),
    },
  );
}

export async function listControlPlaneDisputes(
  input: {
    tenantId?: string;
    status?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  } = {},
  token?: string,
): Promise<ControlPlaneDisputeRecord[]> {
  const params = new URLSearchParams();
  if (input.tenantId) {
    params.set('tenantId', input.tenantId);
  }
  if (input.status) {
    params.set('status', input.status);
  }
  if (input.relatedEntityType) {
    params.set('relatedEntityType', input.relatedEntityType);
  }
  if (input.relatedEntityId) {
    params.set('relatedEntityId', input.relatedEntityId);
  }
  const query = params.toString();

  return apiControlPlaneFetch<ControlPlaneDisputeRecord[]>(
    `/records/disputes${query ? `?${query}` : ''}`,
    {
      token: await getPlatformApiToken(token),
    },
  );
}

export async function listPlatformWallets(token?: string): Promise<PlatformWalletSummary[]> {
  return apiControlPlaneFetch<PlatformWalletSummary[]>('/platform-wallets', {
    token: await getPlatformApiToken(token),
  });
}

export async function listPlatformWalletLedger(
  input: { page?: number; limit?: number } = {},
  token?: string,
): Promise<{
  data: PlatformWalletLedgerItemRecord[];
  total: number;
  page: number;
  limit: number;
}> {
  const params = new URLSearchParams();
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return apiControlPlaneFetch(`/platform-wallets/ledger${query ? `?${query}` : ''}`, {
    token: await getPlatformApiToken(token),
  });
}

export async function listFeatureFlags(token?: string): Promise<FeatureFlagRecord[]> {
  return apiControlPlaneFetch<FeatureFlagRecord[]>('/feature-flags', {
    token: await getPlatformApiToken(token),
  });
}

export async function updateFeatureFlag(
  key: string,
  input: { isEnabled: boolean },
  token?: string,
): Promise<FeatureFlagRecord> {
  return apiControlPlaneFetch<FeatureFlagRecord>(`/feature-flags/${key}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}

export async function createFeatureFlagOverride(
  key: string,
  input: {
    tenantId?: string;
    countryCode?: string;
    planTier?: string;
    value: unknown;
    isEnabled: boolean;
  },
  token?: string,
): Promise<FeatureFlagOverrideRecord> {
  return apiControlPlaneFetch<FeatureFlagOverrideRecord>(`/feature-flags/${key}/overrides`, {
    method: 'POST',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}

export async function removeFeatureFlagOverride(overrideId: string, token?: string): Promise<void> {
  await apiControlPlaneFetch(`/feature-flags/overrides/${overrideId}`, {
    method: 'DELETE',
    token: await getPlatformApiToken(token),
  });
}

export async function getTenantLifecycleState(
  tenantId: string,
  token?: string,
): Promise<TenantLifecycleStateRecord> {
  return apiControlPlaneFetch<TenantLifecycleStateRecord>(`/tenant-lifecycle/tenant/${tenantId}`, {
    token: await getPlatformApiToken(token),
  });
}

export async function listTenantLifecycleEvents(
  tenantId: string,
  token?: string,
): Promise<TenantLifecycleEventRecord[]> {
  return apiControlPlaneFetch<TenantLifecycleEventRecord[]>(
    `/tenant-lifecycle/tenant/${tenantId}/events`,
    {
      token: await getPlatformApiToken(token),
    },
  );
}

export async function transitionTenantLifecycle(
  tenantId: string,
  input: { toStatus: string; reason?: string; actorId?: string },
  token?: string,
): Promise<TenantLifecycleStateRecord> {
  return apiControlPlaneFetch<TenantLifecycleStateRecord>(
    `/tenant-lifecycle/tenant/${tenantId}/transition`,
    {
      method: 'POST',
      body: JSON.stringify(input),
      token: await getPlatformApiToken(token),
    },
  );
}

export async function runBillingCycle(
  input: { asOf?: string; autoSettleFromWallet?: boolean } = {},
  token?: string,
): Promise<BillingRunResult> {
  return apiControlPlaneFetch<BillingRunResult>('/billing/runs', {
    method: 'POST',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}

export async function runCollectionsCycle(
  input: { asOf?: string; autoSettleFromWallet?: boolean } = {},
  token?: string,
): Promise<CollectionsRunResult> {
  return apiControlPlaneFetch<CollectionsRunResult>('/billing/collections', {
    method: 'POST',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}

export async function provisionTenant(
  input: ProvisionTenantInput,
  token?: string,
): Promise<ProvisionTenantResult> {
  return apiControlPlaneFetch<ProvisionTenantResult>('/provisioning/tenants', {
    method: 'POST',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}

// ── Staff management ───────────────────────────────────────────────────────────

export interface StaffMemberRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  invitationToken?: string | null;
  invitationUrl?: string | null;
  invitationExpiresAt?: string | null;
}

export interface CreateStaffMemberInput {
  name: string;
  email: string;
  role: string;
  password: string;
}

export interface CreateStaffInvitationInput {
  name: string;
  email: string;
  role: string;
}

export interface StaffInvitationPreviewRecord {
  name: string;
  email: string;
  role: string;
  expiresAt: string;
}

export async function listStaffMembers(token?: string): Promise<StaffMemberRecord[]> {
  return apiControlPlaneFetch<StaffMemberRecord[]>('/staff', {
    token: await getPlatformApiToken(token),
  });
}

export async function createStaffMember(
  input: CreateStaffMemberInput,
  token?: string,
): Promise<StaffMemberRecord> {
  return apiControlPlaneFetch<StaffMemberRecord>('/staff', {
    method: 'POST',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}

export async function createStaffInvitation(
  input: CreateStaffInvitationInput,
  token?: string,
): Promise<StaffMemberRecord> {
  return apiControlPlaneFetch<StaffMemberRecord>('/staff/invitations', {
    method: 'POST',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}

export async function resolveStaffInvitation(token: string): Promise<StaffInvitationPreviewRecord> {
  const query = new URLSearchParams({ token }).toString();
  return apiControlPlaneFetch<StaffInvitationPreviewRecord>(`/staff/invitations/resolve?${query}`);
}

export async function completeStaffInvitation(input: {
  token: string;
  password: string;
}): Promise<{ message: string }> {
  return apiControlPlaneFetch<{ message: string }>('/staff/invitations/complete', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deactivateStaffMember(
  userId: string,
  token?: string,
): Promise<{ message: string }> {
  return apiControlPlaneFetch<{ message: string }>(`/staff/${userId}`, {
    method: 'DELETE',
    token: await getPlatformApiToken(token),
  });
}

// ── Platform wallet credit ──────────────────────────────────────────────────────

export interface PlatformWalletBalanceRecord {
  tenantId: string;
  walletId: string;
  currency: string;
  balanceMinorUnits: number;
  updatedAt: string;
}

export interface PlatformWalletEntryInput {
  type: 'credit' | 'debit' | 'reversal';
  amountMinorUnits: number;
  currency: string;
  description?: string;
  referenceId?: string;
  referenceType?: string;
}

export interface PlatformWalletEntryRecord {
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

export async function getTenantPlatformWalletBalance(
  tenantId: string,
  token?: string,
): Promise<PlatformWalletBalanceRecord> {
  return apiControlPlaneFetch<PlatformWalletBalanceRecord>(
    `/platform-wallets/tenant/${tenantId}/balance`,
    { token: await getPlatformApiToken(token) },
  );
}

export async function listTenantPlatformWalletEntries(
  tenantId: string,
  token?: string,
): Promise<PlatformWalletEntryRecord[]> {
  return apiControlPlaneFetch<PlatformWalletEntryRecord[]>(
    `/platform-wallets/tenant/${tenantId}/entries`,
    { token: await getPlatformApiToken(token) },
  );
}

// ── Plans management ───────────────────────────────────────────────────────────

export interface CreatePlanInput {
  name: string;
  tier: string;
  billingInterval: string;
  basePriceMinorUnits: number;
  currency: string;
  features: Record<string, unknown>;
  isActive?: boolean;
}

export interface CreateSubscriptionInput {
  tenantId: string;
  planId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
}

export async function createPlan(input: CreatePlanInput, token?: string): Promise<PlanRecord> {
  return apiControlPlaneFetch<PlanRecord>('/plans', {
    method: 'POST',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}

export async function createSubscription(
  input: CreateSubscriptionInput,
  token?: string,
): Promise<SubscriptionListItem> {
  return apiControlPlaneFetch<SubscriptionListItem>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}

export async function changeTenantSubscriptionPlan(
  tenantId: string,
  planId: string,
  token?: string,
): Promise<SubscriptionListItem> {
  return apiControlPlaneFetch<SubscriptionListItem>(`/subscriptions/tenant/${tenantId}/plan`, {
    method: 'PATCH',
    body: JSON.stringify({ planId }),
    token: await getPlatformApiToken(token),
  });
}

export async function createTenantPlatformWalletEntry(
  tenantId: string,
  input: PlatformWalletEntryInput,
  token?: string,
): Promise<{
  id: string;
  type: string;
  amountMinorUnits: number;
  currency: string;
  description?: string;
  createdAt: string;
}> {
  return apiControlPlaneFetch(`/platform-wallets/tenant/${tenantId}/entries`, {
    method: 'POST',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}

// ── Platform settings ─────────────────────────────────────────────────────────

export interface PlatformSettingRecord {
  id: string;
  key: string;
  description?: string | null;
  value: unknown;
  createdAt: string;
  updatedAt: string;
}

export async function listPlatformSettings(token?: string): Promise<PlatformSettingRecord[]> {
  return apiControlPlaneFetch<PlatformSettingRecord[]>('/platform-settings', {
    token: await getPlatformApiToken(token),
  });
}

export async function upsertPlatformSetting(
  key: string,
  input: { description?: string | null; value: Record<string, unknown> },
  token?: string,
): Promise<PlatformSettingRecord> {
  return apiControlPlaneFetch<PlatformSettingRecord>(`/platform-settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify(input),
    token: await getPlatformApiToken(token),
  });
}
