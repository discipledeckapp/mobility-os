import type { CountryConfig } from './index';

export const KE: CountryConfig = {
  code: 'KE',
  name: 'Kenya',
  formattingLocale: 'en-KE',
  currency: 'KES',
  currencyMinorUnit: 100,
  phonePrefix: '+254',
  localPhoneTrunkPrefix: '0',
  localPhoneSubscriberLength: 9,
  defaultTimezone: 'Africa/Nairobi',
  supportedIdentifierTypes: [
    { type: 'NATIONAL_ID', label: 'National ID' },
    { type: 'PHONE', label: 'Phone Number' },
  ],
  requiredDriverDocumentSlugs: ['national-id', 'drivers-license'],
  requiredVehicleDocumentSlugs: ['vehicle-license', 'insurance'],
};
