// =============================================================================
// Document type registry
// Platform-wide document type definitions, country-agnostic.
// Country profiles in countries/ reference these slugs to declare requirements.
// =============================================================================

export enum DocumentScope {
  Driver = 'driver',
  Vehicle = 'vehicle',
  Business = 'business',
}

export interface DocumentTypeConfig {
  /** Stable URL-safe slug used as the canonical identifier in DB and API. */
  slug: string;
  /** Human-readable name shown in UI. */
  name: string;
  scope: DocumentScope;
  /** Whether this document has a calendar expiry date. */
  hasExpiry: boolean;
  /**
   * Whether this document is an identity document for the purpose of
   * person deduplication. Identity documents are cross-checked against the
   * canonical person graph in api-intelligence.
   */
  isIdentityDocument: boolean;
}

// ── Registry ──────────────────────────────────────────────────────────────────

/**
 * All supported document types, keyed by slug.
 * This list is country-agnostic. Country profiles declare which slugs they require.
 * To add a new document type: add an entry here and reference the slug
 * in the relevant country profile's requiredDriverDocumentSlugs /
 * requiredVehicleDocumentSlugs arrays.
 */
export const DOCUMENT_TYPES: Readonly<Record<string, DocumentTypeConfig>> = {
  // ── Driver identity documents ──────────────────────────────────────────────
  'national-id': {
    slug: 'national-id',
    name: 'National Identity Document',
    scope: DocumentScope.Driver,
    hasExpiry: false,
    isIdentityDocument: true,
  },
  passport: {
    slug: 'passport',
    name: 'International Passport',
    scope: DocumentScope.Driver,
    hasExpiry: true,
    isIdentityDocument: true,
  },
  'drivers-license': {
    slug: 'drivers-license',
    name: "Driver's Licence",
    scope: DocumentScope.Driver,
    hasExpiry: true,
    isIdentityDocument: true,
  },
  // ── Vehicle documents ──────────────────────────────────────────────────────
  'vehicle-license': {
    slug: 'vehicle-license',
    name: 'Vehicle Licence',
    scope: DocumentScope.Vehicle,
    hasExpiry: true,
    isIdentityDocument: false,
  },
  'road-worthiness': {
    slug: 'road-worthiness',
    name: 'Road Worthiness Certificate',
    scope: DocumentScope.Vehicle,
    hasExpiry: true,
    isIdentityDocument: false,
  },
  insurance: {
    slug: 'insurance',
    name: 'Motor Insurance Certificate',
    scope: DocumentScope.Vehicle,
    hasExpiry: true,
    isIdentityDocument: false,
  },
  'hackney-permit': {
    slug: 'hackney-permit',
    name: 'Hackney Permit',
    scope: DocumentScope.Vehicle,
    hasExpiry: true,
    isIdentityDocument: false,
  },
  // ── Business documents ─────────────────────────────────────────────────────
  'business-registration': {
    slug: 'business-registration',
    name: 'Business Registration Certificate',
    scope: DocumentScope.Business,
    hasExpiry: false,
    isIdentityDocument: false,
  },
  'tax-clearance': {
    slug: 'tax-clearance',
    name: 'Tax Clearance Certificate',
    scope: DocumentScope.Business,
    hasExpiry: true,
    isIdentityDocument: false,
  },
} as const;

// ── Lookup utilities ──────────────────────────────────────────────────────────

export function getDocumentType(slug: string): DocumentTypeConfig {
  const doc = DOCUMENT_TYPES[slug];
  if (doc === undefined) {
    throw new Error(
      `Document type '${slug}' is not registered. ` +
        `Available: ${Object.keys(DOCUMENT_TYPES).join(', ')}`,
    );
  }
  return doc;
}

/** Returns all document types for a given scope. */
export function getDocumentTypesByScope(scope: DocumentScope): DocumentTypeConfig[] {
  return Object.values(DOCUMENT_TYPES).filter((d) => d.scope === scope);
}

/**
 * Returns the required document types for a country and scope,
 * using the country profile's slug list.
 * Throws if any declared slug is not in the registry (config integrity check).
 */
export function getRequiredDocuments(requiredSlugs: string[]): DocumentTypeConfig[] {
  return requiredSlugs.map((slug) => getDocumentType(slug));
}
