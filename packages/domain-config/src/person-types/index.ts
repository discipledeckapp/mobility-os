export type VerificationStatus =
  | 'unverified'
  | 'verified'
  | 'mismatch'
  | 'provider_unavailable'
  | 'review_required';

export interface CanonicalPersonIdentityEnrichment {
  fullName?: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  photoUrl?: string;
  verificationStatus?: VerificationStatus;
  sourceCountry?: string;
  sourceProvider?: string;
}

export interface CanonicalPersonRecord {
  id: string;
  enrichment?: CanonicalPersonIdentityEnrichment;
}

export interface TenantDriverProfileRecord {
  id: string;
  tenantId: string;
  canonicalPersonId?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
}

export interface NigeriaIdentityLookupInput {
  nin?: string;
  bvn?: string;
}

export interface NigeriaIdentityLookupResult {
  fullName?: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  photoUrl?: string;
  verificationStatus?: VerificationStatus;
}
