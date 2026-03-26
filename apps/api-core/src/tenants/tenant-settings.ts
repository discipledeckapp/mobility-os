import {
  DocumentScope,
  getCountryConfig,
  getDocumentTypesByScope,
  isCountrySupported,
} from '@mobility-os/domain-config';

export type SupportedLanguage = 'en' | 'fr';

export interface OrganisationBrandingSettings {
  displayName?: string | null;
  logoUrl?: string | null;
}

export interface OrganisationOperationsSettings {
  defaultLanguage: SupportedLanguage;
  guarantorMaxActiveDrivers: number;
  autoSendDriverSelfServiceLinkOnCreate: boolean;
  requireIdentityVerificationForActivation: boolean;
  requireBiometricVerification: boolean;
  requireGovernmentVerificationLookup: boolean;
  requiredDriverDocumentSlugs: string[];
  requiredVehicleDocumentSlugs: string[];
  /** When true, drivers are charged ₦5,000 (or currency-equivalent) for their own KYC check. */
  driverPaysKyc: boolean;
  /** When false, guarantors are not required for driver onboarding. Defaults true. */
  requireGuarantor: boolean;
  /** When true, guarantors must also pass identity verification. Defaults false. */
  requireGuarantorVerification: boolean;
}

export interface OrganisationSettings {
  branding: OrganisationBrandingSettings;
  operations: OrganisationOperationsSettings;
}

const FRANCOPHONE_COUNTRIES = new Set([
  'BJ',
  'BF',
  'BI',
  'CD',
  'CF',
  'CG',
  'CI',
  'CM',
  'DJ',
  'GA',
  'GN',
  'KM',
  'LU',
  'MA',
  'MC',
  'ML',
  'NE',
  'RW',
  'SC',
  'SN',
  'TD',
  'TG',
]);

const DRIVER_DOCUMENT_SLUGS = new Set(
  getDocumentTypesByScope(DocumentScope.Driver).map((document) => document.slug),
);
const VEHICLE_DOCUMENT_SLUGS = new Set(
  getDocumentTypesByScope(DocumentScope.Vehicle).map((document) => document.slug),
);

function getCountryDocumentDefaults(countryCode?: string | null): {
  requiredDriverDocumentSlugs: string[];
  requiredVehicleDocumentSlugs: string[];
} {
  if (!countryCode || !isCountrySupported(countryCode)) {
    return {
      requiredDriverDocumentSlugs: ['national-id', 'drivers-license'],
      requiredVehicleDocumentSlugs: ['vehicle-license', 'insurance'],
    };
  }

  const country = getCountryConfig(countryCode as string);
  return {
    requiredDriverDocumentSlugs: country.requiredDriverDocumentSlugs,
    requiredVehicleDocumentSlugs: country.requiredVehicleDocumentSlugs,
  };
}

function normalizeDocumentSlugList(
  value: unknown,
  allowedSlugs: Set<string>,
  fallback: string[],
): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && allowedSlugs.has(item));

  return normalized.length > 0 ? Array.from(new Set(normalized)) : fallback;
}

export function getDefaultLanguageForCountry(countryCode?: string | null): SupportedLanguage {
  return FRANCOPHONE_COUNTRIES.has((countryCode ?? '').toUpperCase()) ? 'fr' : 'en';
}

export function readOrganisationSettings(
  metadata: unknown,
  countryCode?: string | null,
): OrganisationSettings {
  const value =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {};

  const branding =
    value.branding && typeof value.branding === 'object' && !Array.isArray(value.branding)
      ? (value.branding as Record<string, unknown>)
      : {};
  const operations =
    value.operations && typeof value.operations === 'object' && !Array.isArray(value.operations)
      ? (value.operations as Record<string, unknown>)
      : {};

  const defaultLanguageCandidate =
    operations.defaultLanguage === 'fr' || operations.defaultLanguage === 'en'
      ? operations.defaultLanguage
      : getDefaultLanguageForCountry(countryCode);
  const documentDefaults = getCountryDocumentDefaults(countryCode);
  const guarantorLimitCandidate =
    typeof operations.guarantorMaxActiveDrivers === 'number' &&
    Number.isFinite(operations.guarantorMaxActiveDrivers) &&
    operations.guarantorMaxActiveDrivers >= 1
      ? Math.floor(operations.guarantorMaxActiveDrivers)
      : 2;

  return {
    branding: {
      displayName:
        typeof branding.displayName === 'string' && branding.displayName.trim()
          ? branding.displayName.trim()
          : null,
      logoUrl:
        typeof branding.logoUrl === 'string' && branding.logoUrl.trim()
          ? branding.logoUrl.trim()
          : null,
    },
    operations: {
      defaultLanguage: defaultLanguageCandidate,
      guarantorMaxActiveDrivers: guarantorLimitCandidate,
      autoSendDriverSelfServiceLinkOnCreate:
        typeof operations.autoSendDriverSelfServiceLinkOnCreate === 'boolean'
          ? operations.autoSendDriverSelfServiceLinkOnCreate
          : true,
      requireIdentityVerificationForActivation:
        typeof operations.requireIdentityVerificationForActivation === 'boolean'
          ? operations.requireIdentityVerificationForActivation
          : true,
      requireBiometricVerification:
        typeof operations.requireBiometricVerification === 'boolean'
          ? operations.requireBiometricVerification
          : true,
      requireGovernmentVerificationLookup:
        typeof operations.requireGovernmentVerificationLookup === 'boolean'
          ? operations.requireGovernmentVerificationLookup
          : true,
      requiredDriverDocumentSlugs: normalizeDocumentSlugList(
        operations.requiredDriverDocumentSlugs,
        DRIVER_DOCUMENT_SLUGS,
        documentDefaults.requiredDriverDocumentSlugs,
      ),
      requiredVehicleDocumentSlugs: normalizeDocumentSlugList(
        operations.requiredVehicleDocumentSlugs,
        VEHICLE_DOCUMENT_SLUGS,
        documentDefaults.requiredVehicleDocumentSlugs,
      ),
      driverPaysKyc:
        typeof operations.driverPaysKyc === 'boolean' ? operations.driverPaysKyc : false,
      requireGuarantor:
        typeof operations.requireGuarantor === 'boolean' ? operations.requireGuarantor : true,
      requireGuarantorVerification:
        typeof operations.requireGuarantorVerification === 'boolean'
          ? operations.requireGuarantorVerification
          : false,
    },
  };
}

export function writeOrganisationSettings(
  currentMetadata: unknown,
  input: Partial<{
    displayName: string | null;
    logoUrl: string | null;
    defaultLanguage: SupportedLanguage;
    guarantorMaxActiveDrivers: number;
    autoSendDriverSelfServiceLinkOnCreate: boolean;
    requireIdentityVerificationForActivation: boolean;
    requireBiometricVerification: boolean;
    requireGovernmentVerificationLookup: boolean;
    requiredDriverDocumentSlugs: string[];
    requiredVehicleDocumentSlugs: string[];
    driverPaysKyc: boolean;
    requireGuarantor: boolean;
    requireGuarantorVerification: boolean;
  }>,
  countryCode?: string | null,
): Record<string, unknown> {
  const current =
    currentMetadata && typeof currentMetadata === 'object' && !Array.isArray(currentMetadata)
      ? ({ ...(currentMetadata as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  const settings = readOrganisationSettings(currentMetadata, countryCode);

  current.branding = {
    displayName:
      input.displayName !== undefined ? input.displayName : settings.branding.displayName,
    logoUrl: input.logoUrl !== undefined ? input.logoUrl : settings.branding.logoUrl,
  };
  current.operations = {
    defaultLanguage: input.defaultLanguage ?? settings.operations.defaultLanguage,
    guarantorMaxActiveDrivers:
      input.guarantorMaxActiveDrivers ?? settings.operations.guarantorMaxActiveDrivers,
    autoSendDriverSelfServiceLinkOnCreate:
      input.autoSendDriverSelfServiceLinkOnCreate ??
      settings.operations.autoSendDriverSelfServiceLinkOnCreate,
    requireIdentityVerificationForActivation:
      input.requireIdentityVerificationForActivation ??
      settings.operations.requireIdentityVerificationForActivation,
    requireBiometricVerification:
      input.requireBiometricVerification ?? settings.operations.requireBiometricVerification,
    requireGovernmentVerificationLookup:
      input.requireGovernmentVerificationLookup ??
      settings.operations.requireGovernmentVerificationLookup,
    requiredDriverDocumentSlugs:
      input.requiredDriverDocumentSlugs ?? settings.operations.requiredDriverDocumentSlugs,
    requiredVehicleDocumentSlugs:
      input.requiredVehicleDocumentSlugs ?? settings.operations.requiredVehicleDocumentSlugs,
    driverPaysKyc: input.driverPaysKyc ?? settings.operations.driverPaysKyc,
    requireGuarantor: input.requireGuarantor ?? settings.operations.requireGuarantor,
    requireGuarantorVerification:
      input.requireGuarantorVerification ?? settings.operations.requireGuarantorVerification,
  };

  return current;
}
