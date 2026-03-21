import {
  getCountryConfig,
  getFormattingLocale,
  getRequiredDocuments,
  isCountrySupported,
  normalizePhoneNumberForCountry,
} from '@mobility-os/domain-config';

describe('country profile integration', () => {
  it('normalizes local phone numbers by explicit country profile', () => {
    expect(normalizePhoneNumberForCountry('08012345678', 'NG')).toBe('+2348012345678');
    expect(normalizePhoneNumberForCountry('0241234567', 'GH')).toBe('+233241234567');
    expect(normalizePhoneNumberForCountry('0712345678', 'KE')).toBe('+254712345678');
    expect(normalizePhoneNumberForCountry('0821234567', 'ZA')).toBe('+27821234567');
  });

  it('exposes distinct locale and required-document profiles for supported countries', () => {
    expect(getFormattingLocale('NG')).toBe('en-NG');
    expect(getFormattingLocale('GH')).toBe('en-GH');
    expect(getFormattingLocale('KE')).toBe('en-KE');
    expect(getFormattingLocale('ZA')).toBe('en-ZA');

    const kenya = getCountryConfig('KE');
    const nigeria = getCountryConfig('NG');

    expect(
      getRequiredDocuments(kenya.requiredVehicleDocumentSlugs).map((document) => document.slug),
    ).toEqual(['vehicle-license', 'insurance']);
    expect(
      getRequiredDocuments(nigeria.requiredVehicleDocumentSlugs).map((document) => document.slug),
    ).toEqual(['vehicle-license', 'road-worthiness', 'insurance']);
  });

  it('keeps unsupported countries on safe fallback behavior', () => {
    expect(isCountrySupported('UG')).toBe(false);
    expect(getFormattingLocale('UG')).toBe('en-US');
    expect(normalizePhoneNumberForCountry('0700000000', 'UG')).toBe('0700000000');
  });
});
