// =============================================================================
// domain-config — main barrel
// Re-exports all static domain configuration from subdirectories.
// =============================================================================

export {
  // Types
  type CountryConfig,
  type SupportedIdentifierType,
  type IdentityVerificationProviderCapability,
  // Registry
  COUNTRIES,
  // Utilities
  getFormattingLocale,
  getCountryConfig,
  getSupportedCountryCodes,
  isCountrySupported,
  normalizePhoneNumberForCountry,
} from './countries/index';

export {
  DocumentScope,
  type DocumentTypeConfig,
  DOCUMENT_TYPES,
  getDocumentType,
  getDocumentTypesByScope,
  getRequiredDocuments,
} from './document-types/index';

export {
  VehicleCategory,
  type VehicleTypeConfig,
  VEHICLE_TYPES,
  getVehicleType,
  getVehicleTypesByCategory,
  getAllVehicleTypeSlugs,
} from './vehicle-types/index';

export {
  type StatusCodeConfig,
  DRIVER_STATUS_CODES,
  VEHICLE_STATUS_CODES,
  ASSIGNMENT_STATUS_CODES,
  REMITTANCE_STATUS_CODES,
  INSPECTION_STATUS_CODES,
  MAINTENANCE_STATUS_CODES,
  type DriverStatusCode,
  type VehicleStatusCode,
  type AssignmentStatusCode,
  type RemittanceStatusCode,
  type InspectionStatusCode,
  type MaintenanceStatusCode,
} from './status-codes/index';

export {
  type BusinessModelConfig,
  BUSINESS_MODELS,
  getBusinessModel,
  getAllBusinessModelSlugs,
} from './business-models/index';

export {
  type CountryCode,
  type GenericIdentifierType,
  type CountryIdentifierOption,
  type VerificationProviderName,
  type VerificationProviderOption,
  type LivenessPolicy,
  type ProviderLookupOption,
  type ProviderLookupPolicy,
  type ProviderEnrichmentPolicy,
  type CountryIdentityConfig,
  type CountryIdentityRoutingConfig,
  type CountryIdentityProfile,
} from './identity-types/index';

export {
  type VerificationStatus,
  type CanonicalPersonIdentityEnrichment,
  type CanonicalPersonRecord,
  type TenantDriverProfileRecord,
  type NigeriaIdentityLookupInput,
  type NigeriaIdentityLookupResult,
} from './person-types/index';

export {
  type AssignmentRemittanceTerms,
  type RemittanceFrequency,
  computeNextRemittanceDueDate,
  describeRemittanceSchedule,
  normalizeRemittanceFrequency,
  toIsoDate,
} from './remittance-planning/index';

export {
  type ProcessingVariant,
  type ProcessingContentDefinition,
  PROCESSING_CONTENT,
  getProcessingContent,
} from './processing-content/index';

export {
  type ConsentScope,
  type LegalDocumentDefinition,
  type LegalDocumentKind,
  LEGAL_DOCUMENTS,
  LEGAL_DOCUMENT_VERSIONS,
  CONSENT_SCOPES,
} from './legal/index';
