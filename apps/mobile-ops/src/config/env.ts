import Constants from 'expo-constants';

type ExpoExtra = {
  apiUrl?: string;
  tenantWebUrl?: string;
  enableOfflineQueue?: boolean;
  enableCrashReporting?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const configuredApiUrl =
  env?.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? extra.apiUrl?.replace(/\/$/, '');
const configuredTenantWebUrl =
  env?.EXPO_PUBLIC_TENANT_WEB_URL?.replace(/\/$/, '') ??
  extra.tenantWebUrl?.replace(/\/$/, '') ??
  (configuredApiUrl?.replace(/\/api\/v1$/, '').replace('://api.', '://app.') ?? undefined);
const isDevelopment =
  typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

if (!configuredApiUrl && !isDevelopment) {
  throw new Error('EXPO_PUBLIC_API_URL is required for mobile-ops production builds.');
}

if (!configuredTenantWebUrl && !isDevelopment) {
  throw new Error('EXPO_PUBLIC_TENANT_WEB_URL is required for mobile-ops production builds.');
}

export const mobileEnv = {
  apiUrl: configuredApiUrl ?? 'http://localhost:3001/api/v1',
  tenantWebUrl: configuredTenantWebUrl ?? 'http://localhost:3000',
  enableOfflineQueue:
    env?.EXPO_PUBLIC_ENABLE_OFFLINE_QUEUE === 'false' ? false : extra.enableOfflineQueue !== false,
  enableCrashReporting:
    env?.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true' || extra.enableCrashReporting === true,
};
