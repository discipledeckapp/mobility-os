export type CountryCode = string;

export type GenericIdentifierType =
  | 'NATIONAL_ID'
  | 'BANK_ID'
  | 'PASSPORT'
  | 'DRIVERS_LICENSE'
  | 'PHONE'
  | 'EMAIL'
  | 'TAX_ID';

export interface CountryIdentifierOption {
  type: GenericIdentifierType;
  label: string;
  enabled: boolean;
}

export type VerificationProviderName = 'youverify' | 'smile_identity' | 'internal_free_service';

export interface VerificationProviderOption {
  name: VerificationProviderName;
  enabled: boolean;
}

export interface LivenessPolicy {
  required: boolean;
  requiredBeforeProviderLookup: boolean;
  provider?: VerificationProviderName;
}

export interface ProviderLookupOption extends VerificationProviderOption {
  priority: number;
  allowedIdentifierTypes: GenericIdentifierType[];
}

export interface ProviderLookupPolicy {
  enabled: boolean;
  providers: ProviderLookupOption[];
  fallbackOnProviderError: boolean;
  fallbackOnProviderUnavailable: boolean;
  fallbackOnNoMatch: boolean;
}

export interface ProviderEnrichmentPolicy {
  fullName: boolean;
  dateOfBirth: boolean;
  address: boolean;
  gender: boolean;
  photo: boolean;
  verificationStatus: boolean;
}

export interface CountryIdentityConfig {
  supportedIdentifiers: CountryIdentifierOption[];
  liveness: LivenessPolicy;
  providerLookup: ProviderLookupPolicy;
  providerEnrichment: ProviderEnrichmentPolicy;
}

export interface CountryIdentityRoutingConfig {
  countryCode: CountryCode;
  livenessProvider?: VerificationProviderName;
  lookupProviders: ProviderLookupOption[];
  fallbackOnProviderError: boolean;
  fallbackOnProviderUnavailable: boolean;
  fallbackOnNoMatch: boolean;
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  defaultCurrency: string;
  defaultTimezone: string;
  identity: CountryIdentityConfig;
}
