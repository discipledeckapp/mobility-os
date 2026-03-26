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
}

async function getPlatformApiToken(explicitToken?: string): Promise<string> {
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
}

export interface CreateStaffMemberInput {
  name: string;
  email: string;
  role: string;
  password: string;
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

export async function getTenantPlatformWalletBalance(
  tenantId: string,
  token?: string,
): Promise<PlatformWalletBalanceRecord> {
  return apiControlPlaneFetch<PlatformWalletBalanceRecord>(
    `/platform-wallets/tenant/${tenantId}/balance`,
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

export async function createPlan(input: CreatePlanInput, token?: string): Promise<PlanRecord> {
  return apiControlPlaneFetch<PlanRecord>('/plans', {
    method: 'POST',
    body: JSON.stringify(input),
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
  return apiControlPlaneFetch(
    `/platform-wallets/tenant/${tenantId}/entries`,
    {
      method: 'POST',
      body: JSON.stringify(input),
      token: await getPlatformApiToken(token),
    },
  );
}
