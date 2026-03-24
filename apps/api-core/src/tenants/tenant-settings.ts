export type SupportedLanguage = 'en' | 'fr';

export interface OrganisationBrandingSettings {
  displayName?: string | null;
  logoUrl?: string | null;
}

export interface OrganisationOperationsSettings {
  defaultLanguage: SupportedLanguage;
  guarantorMaxActiveDrivers: number;
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
  };

  return current;
}
