import { cookies } from 'next/headers';
import { PLATFORM_AUTH_COOKIE_NAME } from './auth';

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_INTELLIGENCE_API_URL?.replace(/\/$/, '');
const apiBaseUrl = configuredApiBaseUrl ?? 'http://localhost:3200/api';

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

async function intelligenceFetch<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');
  headers.set('authorization', `Bearer ${await getPlatformApiToken(token)}`);

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText
        ? `api-intelligence returned status ${response.status}: ${errorText}`
        : `api-intelligence returned status ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

export interface IntelligencePersonRecord {
  id: string;
  globalPersonCode?: string | null;
  fullName?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  gender?: string | null;
  photoUrl?: string | null;
  selfieImageUrl?: string | null;
  providerImageUrl?: string | null;
  globalRiskScore: number;
  riskBand: string;
  isWatchlisted: boolean;
  hasDuplicateFlag: boolean;
  fraudSignalCount: number;
  verificationConfidence: number;
  verificationStatus?: string | null;
  verificationProvider?: string | null;
  verificationCountryCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonAssociationRecord {
  id: string;
  personId: string;
  tenantId: string;
  businessEntityId?: string | null;
  operatingUnitId?: string | null;
  fleetId?: string | null;
  localEntityType: string;
  localEntityId?: string | null;
  roleType: string;
  status: string;
  source: string;
  verifiedAt?: string | null;
  reverificationRequired: boolean;
  reverificationReason?: string | null;
  staleFieldKeys?: string[] | null;
  createdAt: string;
}

export interface LinkageEventRecord {
  id: string;
  personId: string;
  eventType: string;
  confidenceScore?: number | null;
  actor: string;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  occurredAt: string;
}

export interface IdentityChangeEventRecord {
  id: string;
  personId: string;
  eventType: string;
  source: string;
  verificationProvider?: string | null;
  verificationCountryCode?: string | null;
  tenantId?: string | null;
  localEntityType?: string | null;
  localEntityId?: string | null;
  changedFields: string[];
  previousValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  reason?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface PersonRiskSummaryRecord {
  personId: string;
  score: number;
  riskBand: string;
  contributingFactors: Array<{
    code: string;
    label: string;
    weight: number;
    detail?: string;
  }>;
  linkedOrganisationCount: number;
  linkedRecordCount: number;
  staleLinkedRecordCount: number;
  activeReviewCaseCount: number;
  activeWatchlistCount: number;
  guarantorLinkedDriverCount: number;
  guarantorExposureExceeded: boolean;
  correctiveAction?: string;
}

export interface ReviewCaseRecord {
  id: string;
  personId: string;
  status: string;
  resolution?: string | null;
  confidenceScore: number;
  evidence: Record<string, unknown>;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistEntryRecord {
  id: string;
  personId: string;
  type: string;
  reason: string;
  addedBy: string;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RiskSignalRecord {
  id: string;
  personId: string;
  type: string;
  severity: string;
  source: string;
  isActive: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface IdentifierRecord {
  id: string;
  personId: string;
  type: string;
  maskedValue: string;
  countryCode?: string | null;
  isVerified: boolean;
  createdAt: string;
}

export function listIntelligencePersons(
  input: {
    q?: string;
    riskBand?: string;
    countryCode?: string;
    watchlistStatus?: string;
    reviewState?: string;
    roleType?: string;
    reverificationRequired?: string;
  } = {},
  token?: string,
) {
  const params = new URLSearchParams();
  if (input.q) params.set('q', input.q);
  if (input.riskBand) params.set('riskBand', input.riskBand);
  if (input.countryCode) params.set('countryCode', input.countryCode);
  if (input.watchlistStatus) params.set('watchlistStatus', input.watchlistStatus);
  if (input.reviewState) params.set('reviewState', input.reviewState);
  if (input.roleType) params.set('roleType', input.roleType);
  if (input.reverificationRequired) params.set('reverificationRequired', input.reverificationRequired);
  const query = params.toString() ? `?${params.toString()}` : '';
  return intelligenceFetch<IntelligencePersonRecord[]>(`/staff/persons${query}`, {}, token);
}

export function getIntelligencePerson(personId: string, token?: string) {
  return intelligenceFetch<IntelligencePersonRecord>(`/staff/persons/${personId}`, {}, token);
}

export function listPersonAssociations(personId: string, token?: string) {
  return intelligenceFetch<PersonAssociationRecord[]>(
    `/staff/persons/${personId}/associations`,
    {},
    token,
  );
}

export function listPersonLinkageEvents(personId: string, token?: string) {
  return intelligenceFetch<LinkageEventRecord[]>(
    `/staff/persons/${personId}/linkage-events`,
    {},
    token,
  );
}

export function listPersonIdentityChanges(personId: string, token?: string) {
  return intelligenceFetch<IdentityChangeEventRecord[]>(
    `/staff/persons/${personId}/identity-changes`,
    {},
    token,
  );
}

export function getPersonRiskSummary(personId: string, token?: string) {
  return intelligenceFetch<PersonRiskSummaryRecord>(
    `/staff/risk-signals/persons/${personId}/summary`,
    {},
    token,
  );
}

export function listReviewCases(
  input: { status?: string; personId?: string } = {},
  token?: string,
) {
  const params = new URLSearchParams();
  if (input.status) {
    params.set('status', input.status);
  }
  if (input.personId) {
    params.set('personId', input.personId);
  }
  const query = params.toString();
  return intelligenceFetch<ReviewCaseRecord[]>(`/staff/review-cases${query}`, {}, token);
}

export function getReviewCase(id: string, token?: string) {
  return intelligenceFetch<ReviewCaseRecord>(`/staff/review-cases/${id}`, {}, token);
}

export function updateReviewCaseStatus(
  id: string,
  input: { status: string; notes?: string },
  token?: string,
) {
  return intelligenceFetch<ReviewCaseRecord>(
    `/staff/review-cases/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
    token,
  );
}

export function resolveReviewCase(
  id: string,
  input: { resolution: string; notes?: string },
  token?: string,
) {
  return intelligenceFetch<ReviewCaseRecord>(
    `/staff/review-cases/${id}/resolve`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
    token,
  );
}

export function listWatchlistEntriesByPerson(personId: string, token?: string) {
  return intelligenceFetch<WatchlistEntryRecord[]>(
    `/staff/watchlists/persons/${personId}`,
    {},
    token,
  );
}

export function createWatchlistEntry(
  input: { personId: string; type: string; reason: string; expiresAt?: string },
  token?: string,
) {
  return intelligenceFetch<WatchlistEntryRecord>(
    '/staff/watchlists',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export function deactivateWatchlistEntry(id: string, token?: string) {
  return intelligenceFetch<WatchlistEntryRecord>(
    `/staff/watchlists/${id}/deactivate`,
    { method: 'PATCH' },
    token,
  );
}

export function listRiskSignalsByPerson(personId: string, activeOnly = true, token?: string) {
  return intelligenceFetch<RiskSignalRecord[]>(
    `/staff/risk-signals/persons/${personId}?activeOnly=${activeOnly ? 'true' : 'false'}`,
    {},
    token,
  );
}

export function addRiskSignal(
  input: {
    personId: string;
    type: string;
    severity: string;
    source: string;
    metadata?: Record<string, unknown>;
  },
  token?: string,
) {
  return intelligenceFetch<RiskSignalRecord>(
    '/staff/risk-signals',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export function deactivateRiskSignal(id: string, token?: string) {
  return intelligenceFetch<RiskSignalRecord>(
    `/staff/risk-signals/${id}/deactivate`,
    { method: 'PATCH' },
    token,
  );
}

export function listIdentifiersByPerson(personId: string, token?: string) {
  return intelligenceFetch<IdentifierRecord[]>(
    `/staff/identifiers/persons/${personId}`,
    {},
    token,
  );
}

export function addIdentifier(
  input: { personId: string; type: string; value: string; countryCode?: string },
  token?: string,
) {
  return intelligenceFetch<IdentifierRecord>(
    '/staff/identifiers',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export function verifyIdentifier(id: string, token?: string) {
  return intelligenceFetch<IdentifierRecord>(
    `/staff/identifiers/${id}/verify`,
    { method: 'PATCH' },
    token,
  );
}
