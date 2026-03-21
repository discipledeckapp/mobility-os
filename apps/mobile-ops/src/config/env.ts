import Constants from 'expo-constants';

type ExpoExtra = {
  apiUrl?: string;
  enableOfflineQueue?: boolean;
  enableCrashReporting?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;

export const mobileEnv = {
  apiUrl:
    env?.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
    extra.apiUrl?.replace(/\/$/, '') ??
    'http://localhost:3001/api/v1',
  enableOfflineQueue:
    env?.EXPO_PUBLIC_ENABLE_OFFLINE_QUEUE === 'false' ? false : extra.enableOfflineQueue !== false,
  enableCrashReporting:
    env?.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true' || extra.enableCrashReporting === true,
};
