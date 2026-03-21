import type { CountryConfig } from './index';

export const ZA: CountryConfig = {
  code: 'ZA',
  name: 'South Africa',
  formattingLocale: 'en-ZA',
  currency: 'ZAR',
  currencyMinorUnit: 100,
  phonePrefix: '+27',
  localPhoneTrunkPrefix: '0',
  localPhoneSubscriberLength: 9,
  defaultTimezone: 'Africa/Johannesburg',
  supportedIdentifierTypes: [
    { type: 'NATIONAL_ID', label: 'National ID' },
    { type: 'PHONE', label: 'Phone Number' },
  ],
  requiredDriverDocumentSlugs: ['national-id', 'drivers-license'],
  requiredVehicleDocumentSlugs: ['vehicle-license', 'road-worthiness', 'insurance'],
};
