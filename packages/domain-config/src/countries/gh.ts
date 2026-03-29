import type { CountryConfig } from './index';

export const GH: CountryConfig = {
  code: 'GH',
  name: 'Ghana',
  formattingLocale: 'en-GH',
  currency: 'GHS',
  currencyMinorUnit: 100,
  phonePrefix: '+233',
  localPhoneTrunkPrefix: '0',
  localPhoneSubscriberLength: 9,
  defaultTimezone: 'Africa/Accra',
  supportedIdentifierTypes: [
    { type: 'NATIONAL_ID', label: 'Ghana Card' },
    { type: 'PHONE', label: 'Phone Number' },
  ],
  requiredDriverDocumentSlugs: [],
  requiredVehicleDocumentSlugs: ['vehicle-license', 'road-worthiness', 'insurance'],
};
