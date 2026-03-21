import { getFormattingLocale as getFormattingLocaleFromConfig } from '@mobility-os/domain-config';

export function getFormattingLocale(countryCode?: string | null): string {
  return getFormattingLocaleFromConfig(countryCode);
}
