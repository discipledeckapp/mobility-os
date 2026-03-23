// =============================================================================
// Country configuration registry
// =============================================================================

import { GH } from './gh';
import { KE } from './ke';
import { NG } from './ng';
import { ZA } from './za';

// ── CountryConfig interface ───────────────────────────────────────────────────

export interface SupportedIdentifierType {
  /** Maps to IdentifierType enum in @mobility-os/intelligence-domain. */
  type: string;
  /** Human-readable label shown in UI — country-specific (e.g. 'NIN', 'CNI'). */
  label: string;
  /** If set, the value must be exactly this many characters. */
  exactLength?: number;
  /** If true, only digit characters are accepted. */
  numericOnly?: boolean;
  /** If true, this identifier must be provided before verification can proceed. */
  required?: boolean;
}

export interface IdentityVerificationProviderConfig {
  /** Internal provider slug used by the intelligence plane. */
  name: string;
  /** Priority order for provider selection and fallback. Lower index = earlier. */
  priority: number;
  /** Whether this provider is enabled for the country profile. */
  enabled: boolean;
  /** Generic identifier types this provider accepts. */
  allowedLookupIdentifierTypes: string[];
}

export interface IdentityVerificationProviderCapability {
  /** Internal provider slug used by the intelligence plane. */
  name: string;
  /** Whether this provider can initialize/evaluate liveness. */
  supportsLiveness: boolean;
  /** Whether this provider can perform identity lookup/enrichment. */
  supportsLookup: boolean;
  /** Generic identifier types this provider accepts for lookup. */
  allowedLookupIdentifierTypes: string[];
}

export interface IdentityVerificationConfig {
  /** Whether a liveness result is required before any provider lookup. */
  livenessRequired: boolean;
  /** Whether liveness must be completed before provider lookup is attempted. */
  livenessRequiredBeforeProviderLookup: boolean;
  /** Whether external provider lookup is enabled for this country. */
  providerLookupEnabled: boolean;
  /** Ordered provider list. Matching may fall back through this sequence. */
  providers: IdentityVerificationProviderConfig[];
  /** Country-supported provider capability matrix used for admin validation. */
  providerCapabilities: IdentityVerificationProviderCapability[];
  /** Canonical enrichment fields a provider may contribute. */
  enrichmentFields: string[];
  /** Provider enrichment belongs only to the canonical person layer. */
  canonicalPersonEnrichmentOnly: boolean;
}

/**
 * All configuration the platform needs to operate in a given country.
 * Adding a new country = adding a new file in countries/ and registering it here.
 * No core module should ever switch on countryCode — read the config instead.
 */
export interface CountryConfig {
  /** ISO 3166-1 alpha-2 code. */
  code: string;
  name: string;
  /** Default BCP 47 locale used for formatting dates, numbers, and currency. */
  formattingLocale: string;
  /** ISO 4217 currency code. */
  currency: string;
  /** Number of minor units in one major unit (e.g. 100 for NGN kobo). */
  currencyMinorUnit: number;
  /** E.164 international dialling prefix (e.g. '+234'). */
  phonePrefix: string;
  /** National trunk prefix used for local phone input, e.g. '0'. */
  localPhoneTrunkPrefix?: string;
  /** Expected local subscriber length excluding the trunk prefix. */
  localPhoneSubscriberLength?: number;
  /** IANA timezone identifier. */
  defaultTimezone: string;
  /** Identifier types supported for person enrollment in this country. */
  supportedIdentifierTypes: SupportedIdentifierType[];
  /** Document type slugs required for driver onboarding in this country. */
  requiredDriverDocumentSlugs: string[];
  /** Document type slugs required for vehicle registration in this country. */
  requiredVehicleDocumentSlugs: string[];
  /** Optional country-specific identity verification workflow configuration. */
  identityVerification?: IdentityVerificationConfig;
}

// ── Country registry ──────────────────────────────────────────────────────────

/**
 * All supported countries, keyed by ISO 3166-1 alpha-2 code (uppercase).
 * To add a country: create countries/<cc>.ts and add it here.
 */
export const COUNTRIES: Readonly<Record<string, CountryConfig>> = {
  GH,
  KE,
  NG,
  ZA,
} as const;

// ── Lookup utilities ──────────────────────────────────────────────────────────

/**
 * Retrieve the configuration for a supported country.
 * Throws if the country code is not registered.
 */
export function getCountryConfig(countryCode: string): CountryConfig {
  const normalized = countryCode.toUpperCase();
  const config = COUNTRIES[normalized];
  if (config === undefined) {
    const supported = Object.keys(COUNTRIES).join(', ');
    throw new Error(`Country '${normalized}' is not supported. Registered countries: ${supported}`);
  }
  return config;
}

/** Returns all registered ISO country codes (uppercase). */
export function getSupportedCountryCodes(): string[] {
  return Object.keys(COUNTRIES);
}

/** Returns true if the given country code is registered. */
export function isCountrySupported(countryCode: string): boolean {
  return Object.prototype.hasOwnProperty.call(COUNTRIES, countryCode.toUpperCase());
}

export function getFormattingLocale(countryCode?: string | null): string {
  if (!countryCode || !isCountrySupported(countryCode)) {
    return 'en-US';
  }

  return getCountryConfig(countryCode).formattingLocale;
}

export function normalizePhoneNumberForCountry(phone: string, countryCode?: string | null): string {
  const trimmed = phone.trim();
  const sanitized = trimmed.replace(/[^\d+]/g, '');

  if (sanitized.startsWith('+')) {
    return sanitized;
  }

  if (!countryCode || !isCountrySupported(countryCode)) {
    return sanitized;
  }

  const config = getCountryConfig(countryCode);
  const dialDigits = config.phonePrefix.replace(/^\+/, '');

  if (/^\d+$/.test(sanitized) && sanitized.startsWith(dialDigits)) {
    return `+${sanitized}`;
  }

  if (
    config.localPhoneTrunkPrefix &&
    config.localPhoneSubscriberLength &&
    sanitized.startsWith(config.localPhoneTrunkPrefix)
  ) {
    const subscriber = sanitized.slice(config.localPhoneTrunkPrefix.length);
    if (/^\d+$/.test(subscriber) && subscriber.length === config.localPhoneSubscriberLength) {
      return `${config.phonePrefix}${subscriber}`;
    }
  }

  return sanitized;
}

export { GH, KE, NG, ZA };
