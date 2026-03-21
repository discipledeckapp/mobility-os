// =============================================================================
// intelligence-domain
// Types, value objects, and result shapes for the cross-tenant intelligence plane.
// No database access. No framework dependencies.
// See docs/intelligence/ for the full design.
// =============================================================================

// ── Branded scalar types ──────────────────────────────────────────────────────

/** Opaque identifier for a canonical person record (platform-level). */
export type PersonId = string & { readonly __brand: 'PersonId' };

/** Opaque identifier for a biometric profile record. */
export type BiometricProfileId = string & { readonly __brand: 'BiometricProfileId' };

/** Opaque identifier for an identity review case. */
export type ReviewCaseId = string & { readonly __brand: 'ReviewCaseId' };

export const asPersonId = (id: string): PersonId => id as PersonId;
export const asBiometricProfileId = (id: string): BiometricProfileId => id as BiometricProfileId;
export const asReviewCaseId = (id: string): ReviewCaseId => id as ReviewCaseId;

// ── Enums ─────────────────────────────────────────────────────────────────────

/**
 * Risk band derived from a numeric score.
 * Thresholds are in RiskScore — band must not be set independently.
 */
export enum RiskBand {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

/**
 * Identifier types used for person deduplication.
 * Note: use generic slugs (e.g. NATIONAL_ID) rather than country-specific names
 * (e.g. NIN). Country-specific labels live in domain-config country profiles.
 */
export enum IdentifierType {
  NationalId = 'NATIONAL_ID',
  Passport = 'PASSPORT',
  DriversLicense = 'DRIVERS_LICENSE',
  Phone = 'PHONE',
  Email = 'EMAIL',
  TaxId = 'TAX_ID',
  BankId = 'BANK_ID',
}

export enum BiometricModality {
  Face = 'face',
  Fingerprint = 'fingerprint',
}

/**
 * Outcome of the identity resolution algorithm for a new enrollment.
 * See docs/intelligence/identity-resolution.md — Resolution Algorithm.
 */
export enum ResolutionDecision {
  /** Score ≥ AUTO_LINK threshold — linked to existing canonical person. */
  AutoLinked = 'auto_linked',
  /** Score in the review band — a ReviewCase is created for human adjudication. */
  ReviewRequired = 'review_required',
  /** Score below threshold — a new canonical person record is created. */
  NewPerson = 'new_person',
}

export enum WatchlistEntryType {
  PlatformBlacklist = 'platform_blacklist',
  FraudSuspect = 'fraud_suspect',
  DuplicateIdentity = 'duplicate_identity',
  DocumentFraud = 'document_fraud',
  ExternalSanctions = 'external_sanctions',
}

export enum FraudSignalType {
  BiometricConflict = 'biometric_conflict',
  IdentifierReuse = 'identifier_reuse',
  LivenessFailure = 'liveness_failure',
  HighChurnPattern = 'high_churn_pattern',
  RemittanceDefault = 'remittance_default',
}

export enum ReviewCaseStatus {
  Open = 'open',
  InReview = 'in_review',
  Resolved = 'resolved',
  Escalated = 'escalated',
}

// ── RiskScore value object ────────────────────────────────────────────────────

/** Score-to-band thresholds. Modify here to adjust global risk calibration. */
const BAND_THRESHOLDS = {
  [RiskBand.Low]: 30,
  [RiskBand.Medium]: 60,
  [RiskBand.High]: 80,
  // Critical: > 80
} as const;

/**
 * Immutable risk score value object.
 *
 * Score: integer 0–100 (higher = more risk).
 * Band: derived automatically from the score — cannot be set independently.
 *
 * See docs/intelligence/risk-scoring-model.md — Score Bands.
 */
export class RiskScore {
  readonly value: number;
  readonly band: RiskBand;

  private constructor(value: number) {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw new Error(`RiskScore must be an integer between 0 and 100. Got: ${value}`);
    }
    this.value = value;
    this.band = RiskScore.bandFor(value);
  }

  static of(value: number): RiskScore {
    return new RiskScore(value);
  }

  static zero(): RiskScore {
    return new RiskScore(0);
  }

  private static bandFor(value: number): RiskBand {
    if (value <= BAND_THRESHOLDS[RiskBand.Low]) return RiskBand.Low;
    if (value <= BAND_THRESHOLDS[RiskBand.Medium]) return RiskBand.Medium;
    if (value <= BAND_THRESHOLDS[RiskBand.High]) return RiskBand.High;
    return RiskBand.Critical;
  }

  isActionable(): boolean {
    return this.band === RiskBand.High || this.band === RiskBand.Critical;
  }

  isCritical(): boolean {
    return this.band === RiskBand.Critical;
  }

  toString(): string {
    return `${this.value} (${this.band})`;
  }
}

// ── Safe cross-tenant result shape ────────────────────────────────────────────

/**
 * The ONLY shape returned to tenant callers from the Intelligence API.
 *
 * This interface is the enforcement boundary of the cross-tenant data policy:
 * it exposes only DERIVED signals — never raw records from another tenant.
 *
 * See docs/intelligence/cross-tenant-linkage-policy.md — What Is Never Shared.
 */
export interface IntelligenceQueryResult {
  personId: PersonId;
  /** Global risk score: 0–100 (higher = more risk). */
  globalRiskScore: number;
  riskBand: RiskBand;
  /** True if the person appears on any platform watchlist. */
  isWatchlisted: boolean;
  /** True if an unresolved identity conflict exists for this person. */
  hasDuplicateIdentityFlag: boolean;
  /** Count of fraud signals — no source attribution exposed. */
  fraudIndicatorCount: number;
  /**
   * Confidence of the most recent identity verification (0–1).
   * Reflects match quality, not the number of verifications.
   */
  verificationConfidence: number;
}
