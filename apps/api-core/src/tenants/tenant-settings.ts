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
  enabledDriverIdentifierTypes: string[];
  requiredDriverIdentifierTypes: string[];
  customDriverDocumentTypes: string[];
  requiredDriverDocumentSlugs: string[];
  requiredVehicleDocumentSlugs: string[];
  /** When true, drivers are charged ₦5,000 (or currency-equivalent) for their own KYC check. */
  driverPaysKyc: boolean;
  /**
   * When true, guarantors are required as part of driver onboarding. Defaults false.
   * Enabling this after drivers are already verified does not break existing drivers —
   * they receive a non-blocking task to add their guarantor instead.
   */
  requireGuarantor: boolean;
  /**
   * When true AND requireGuarantor is true, a missing or unverified guarantor blocks
   * the driver from reaching 'ready' status. Defaults false (non-blocking: driver is
   * ready but carries a missing_guarantor risk flag until the guarantor is added).
   */
  guarantorBlocking: boolean;
  /** When true, guarantors must also pass identity verification. Defaults false. */
  requireGuarantorVerification: boolean;
  /**
   * When true (default), org admins can set a per-driver override that marks the
   * driver as eligible for assignment even when standard readiness checks are
   * incomplete. The override is still blocked if active fraud flags are present.
   */
  allowAdminAssignmentOverride: boolean;
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

function getCountryIdentifierDefaults(countryCode?: string | null): {
  enabledDriverIdentifierTypes: string[];
  requiredDriverIdentifierTypes: string[];
} {
  if (!countryCode || !isCountrySupported(countryCode)) {
    return {
      enabledDriverIdentifierTypes: ['NATIONAL_ID'],
      requiredDriverIdentifierTypes: ['NATIONAL_ID'],
    };
  }

  const supportedIdentifiers = getCountryConfig(countryCode).supportedIdentifierTypes.filter(
    (identifier) => identifier.type !== 'PHONE' && identifier.type !== 'EMAIL',
  );
  const requiredTypes = supportedIdentifiers
    .filter((identifier) => identifier.required)
    .map((identifier) => identifier.type);

  return {
    enabledDriverIdentifierTypes: requiredTypes,
    requiredDriverIdentifierTypes: requiredTypes,
  };
}

function getCountryDocumentDefaults(countryCode?: string | null): {
  requiredDriverDocumentSlugs: string[];
  requiredVehicleDocumentSlugs: string[];
} {
  if (!countryCode || !isCountrySupported(countryCode)) {
    return {
      requiredDriverDocumentSlugs: ['national-id'],
      requiredVehicleDocumentSlugs: ['vehicle-license', 'insurance'],
    };
  }

  const country = getCountryConfig(countryCode as string);
  return {
    requiredDriverDocumentSlugs: country.requiredDriverDocumentSlugs?.length
      ? country.requiredDriverDocumentSlugs
      : ['national-id'],
    requiredVehicleDocumentSlugs: country.requiredVehicleDocumentSlugs,
  };
}

function normalizeDocumentSlugList(
  value: unknown,
  allowedSlugs: Set<string>,
  fallback: string[],
  options: {
    allowCustom?: boolean;
    preserveEmpty?: boolean;
  } = {},
): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0 && (allowedSlugs.has(item) || Boolean(options.allowCustom)));

  if (normalized.length > 0) {
    return Array.from(new Set(normalized));
  }

  return options.preserveEmpty ? [] : fallback;
}

function normalizeIdentifierTypeList(
  value: unknown,
  allowedTypes: Set<string>,
  fallback: string[],
): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().toUpperCase())
    .filter((item) => item.length > 0 && allowedTypes.has(item));

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
  const identifierDefaults = getCountryIdentifierDefaults(countryCode);
  const allowedIdentifierTypes = new Set(
    isCountrySupported(countryCode ?? '')
      ? getCountryConfig(countryCode ?? '')
          .supportedIdentifierTypes.filter(
            (identifier) => identifier.type !== 'PHONE' && identifier.type !== 'EMAIL',
          )
          .map((identifier) => identifier.type)
      : identifierDefaults.enabledDriverIdentifierTypes,
  );
  const enabledDriverIdentifierTypes = normalizeIdentifierTypeList(
    operations.enabledDriverIdentifierTypes,
    allowedIdentifierTypes,
    identifierDefaults.enabledDriverIdentifierTypes,
  );
  const requiredDriverIdentifierTypes = normalizeIdentifierTypeList(
    operations.requiredDriverIdentifierTypes,
    new Set(enabledDriverIdentifierTypes),
    identifierDefaults.requiredDriverIdentifierTypes.filter((type) =>
      enabledDriverIdentifierTypes.includes(type),
    ),
  );
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
      enabledDriverIdentifierTypes,
      requiredDriverIdentifierTypes,
      customDriverDocumentTypes: normalizeDocumentSlugList(
        operations.customDriverDocumentTypes,
        DRIVER_DOCUMENT_SLUGS,
        [],
        { allowCustom: true, preserveEmpty: true },
      ).filter((slug) => !DRIVER_DOCUMENT_SLUGS.has(slug)),
      requiredDriverDocumentSlugs: normalizeDocumentSlugList(
        operations.requiredDriverDocumentSlugs,
        DRIVER_DOCUMENT_SLUGS,
        documentDefaults.requiredDriverDocumentSlugs,
        { allowCustom: true, preserveEmpty: true },
      ),
      requiredVehicleDocumentSlugs: normalizeDocumentSlugList(
        operations.requiredVehicleDocumentSlugs,
        VEHICLE_DOCUMENT_SLUGS,
        documentDefaults.requiredVehicleDocumentSlugs,
      ),
      driverPaysKyc:
        typeof operations.driverPaysKyc === 'boolean' ? operations.driverPaysKyc : true,
      requireGuarantor:
        typeof operations.requireGuarantor === 'boolean' ? operations.requireGuarantor : false,
      guarantorBlocking:
        typeof operations.guarantorBlocking === 'boolean' ? operations.guarantorBlocking : false,
      requireGuarantorVerification:
        typeof operations.requireGuarantorVerification === 'boolean'
          ? operations.requireGuarantorVerification
          : false,
      allowAdminAssignmentOverride:
        typeof operations.allowAdminAssignmentOverride === 'boolean'
          ? operations.allowAdminAssignmentOverride
          : true,
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
    enabledDriverIdentifierTypes: string[];
    requiredDriverIdentifierTypes: string[];
    customDriverDocumentTypes: string[];
    requiredDriverDocumentSlugs: string[];
    requiredVehicleDocumentSlugs: string[];
    driverPaysKyc: boolean;
    requireGuarantor: boolean;
    guarantorBlocking: boolean;
    requireGuarantorVerification: boolean;
    allowAdminAssignmentOverride: boolean;
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
    enabledDriverIdentifierTypes:
      input.enabledDriverIdentifierTypes ?? settings.operations.enabledDriverIdentifierTypes,
    requiredDriverIdentifierTypes:
      input.requiredDriverIdentifierTypes ?? settings.operations.requiredDriverIdentifierTypes,
    customDriverDocumentTypes:
      input.customDriverDocumentTypes ?? settings.operations.customDriverDocumentTypes,
    requiredDriverDocumentSlugs:
      input.requiredDriverDocumentSlugs ?? settings.operations.requiredDriverDocumentSlugs,
    requiredVehicleDocumentSlugs:
      input.requiredVehicleDocumentSlugs ?? settings.operations.requiredVehicleDocumentSlugs,
    driverPaysKyc: input.driverPaysKyc ?? settings.operations.driverPaysKyc,
    requireGuarantor: input.requireGuarantor ?? settings.operations.requireGuarantor,
    guarantorBlocking: input.guarantorBlocking ?? settings.operations.guarantorBlocking,
    requireGuarantorVerification:
      input.requireGuarantorVerification ?? settings.operations.requireGuarantorVerification,
    allowAdminAssignmentOverride:
      input.allowAdminAssignmentOverride ?? settings.operations.allowAdminAssignmentOverride,
  };

  return current;
}
