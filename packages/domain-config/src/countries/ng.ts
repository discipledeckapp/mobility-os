// =============================================================================
// Nigeria country profile
//
// This is a DATA FILE — it contains zero business logic.
// Country-specific logic must not leak into core domain code.
// Core code works against the CountryConfig interface; it never references
// this file directly.
// =============================================================================

import type { CountryConfig } from './index';

export const NG: CountryConfig = {
  code: 'NG',
  name: 'Nigeria',
  formattingLocale: 'en-NG',
  currency: 'NGN',
  /** Minor currency unit: kobo (1 NGN = 100 kobo). */
  currencyMinorUnit: 100,
  phonePrefix: '+234',
  localPhoneTrunkPrefix: '0',
  localPhoneSubscriberLength: 10,
  defaultTimezone: 'Africa/Lagos',
  /**
   * Identifier type slugs supported for person enrollment in this country.
   * These map to generic identifier types in the intelligence/domain layer.
   */
  supportedIdentifierTypes: [
    {
      type: 'NATIONAL_ID',
      label: 'NIN (National Identification Number)',
      exactLength: 11,
      numericOnly: true,
      required: true,
    },
    {
      type: 'BANK_ID',
      label: 'BVN (Bank Verification Number)',
      exactLength: 11,
      numericOnly: true,
      required: false,
    },
    { type: 'PHONE', label: 'Phone Number' },
  ],
  /**
   * Document type slugs required for driver onboarding.
   * These map to slugs in the document-types registry.
   */
  requiredDriverDocumentSlugs: ['national-id'],
  /**
   * Document type slugs required for vehicle registration.
   */
  requiredVehicleDocumentSlugs: ['vehicle-license', 'road-worthiness', 'insurance'],
  /**
   * Country-specific identity verification context for Nigeria.
   *
   * Rules:
   * - liveness must succeed before provider lookup
   * - configured providers may be called using NIN or BVN
   * - provider response may enrich the canonical person record
   * - tenant-specific driver profiles remain separate
   */
  identityVerification: {
    livenessRequired: true,
    livenessRequiredBeforeProviderLookup: true,
    providerLookupEnabled: true,
    providerCapabilities: [
      {
        name: 'azure_face',
        supportsLiveness: true,
        supportsLookup: false,
        allowedLookupIdentifierTypes: [],
      },
      {
        name: 'amazon_rekognition',
        supportsLiveness: true,
        supportsLookup: false,
        allowedLookupIdentifierTypes: [],
      },
      {
        name: 'youverify',
        supportsLiveness: true,
        supportsLookup: true,
        allowedLookupIdentifierTypes: ['NATIONAL_ID', 'BANK_ID', 'DRIVERS_LICENSE'],
      },
      {
        name: 'smile_identity',
        supportsLiveness: true,
        supportsLookup: true,
        allowedLookupIdentifierTypes: ['NATIONAL_ID', 'BANK_ID'],
      },
      {
        name: 'internal_free_service',
        supportsLiveness: false,
        supportsLookup: false,
        allowedLookupIdentifierTypes: [],
      },
    ],
    providers: [
      {
        name: 'youverify',
        priority: 1,
        enabled: true,
        allowedLookupIdentifierTypes: ['NATIONAL_ID', 'BANK_ID', 'DRIVERS_LICENSE'],
      },
      {
        name: 'smile_identity',
        priority: 2,
        enabled: true,
        allowedLookupIdentifierTypes: ['NATIONAL_ID', 'BANK_ID'],
      },
    ],
    enrichmentFields: [
      'full_name',
      'date_of_birth',
      'address',
      'gender',
      'photo',
      'verification_status',
    ],
    canonicalPersonEnrichmentOnly: true,
  },
};
