import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type SessionRecord,
  configureApiRefreshHandler,
  configureApiRefreshTokenGetter,
  configureApiTokenGetter,
  configureApiUnauthorizedHandler,
  getSession,
  isNetworkError,
  isUnauthorizedError,
  login,
  refreshAuthToken,
} from '../api';
import { DEFAULT_REFRESH_LEAD_TIME_MS, STORAGE_KEYS } from '../constants';
import { getRefreshDelayMs } from '../lib/jwt';
import { configureMobileLogContext } from '../services/mobile-log-service';
import {
  cacheOfflineSession,
  clearOfflineSessionArtifacts,
  getCachedOfflineSession,
  getCachedSessionForIdentifier,
  isBiometricLoginEnabled as readBiometricLoginEnabled,
  setBiometricLoginEnabled as writeBiometricLoginEnabled,
} from '../services/offline-session-service';

interface AuthContextValue {
  token: string | null;
  session: SessionRecord | null;
  isLoading: boolean;
  isOfflineSession: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  tryRefreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineSession, setIsOfflineSession] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshInFlightRef = useRef<Promise<boolean> | null>(null);
  const tryRefreshTokenRef = useRef<() => Promise<boolean>>(async () => false);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const primeApiAuthReaders = useCallback((nextAccessToken: string | null, nextRefreshToken: string | null) => {
    configureApiTokenGetter(async () => nextAccessToken);
    configureApiRefreshTokenGetter(async () => nextRefreshToken);
  }, []);

  const logout = useCallback(async () => {
    clearRefreshTimer();
    setToken(null);
    setRefreshToken(null);
    setSession(null);
    setIsOfflineSession(false);
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
      SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
      clearOfflineSessionArtifacts(),
    ]);
  }, [clearRefreshTimer]);

  const scheduleTokenRefresh = useCallback(
    (nextToken: string | null) => {
      clearRefreshTimer();
      if (!nextToken) {
        return;
      }

      const delayMs = getRefreshDelayMs(nextToken, DEFAULT_REFRESH_LEAD_TIME_MS);
      if (delayMs === null) {
        return;
      }

      refreshTimerRef.current = setTimeout(() => {
        void tryRefreshTokenRef.current();
      }, delayMs);
    },
    [clearRefreshTimer],
  );

  const tryRefreshToken = useCallback(async (): Promise<boolean> => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const run = (async () => {
      const storedRefreshToken =
        refreshToken ?? (await SecureStore.getItemAsync(STORAGE_KEYS.refreshToken));

      if (!storedRefreshToken) {
        return false;
      }

      try {
        const nextTokens = await refreshAuthToken(storedRefreshToken);
        await Promise.all([
          SecureStore.setItemAsync(STORAGE_KEYS.accessToken, nextTokens.accessToken),
          SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, nextTokens.refreshToken),
        ]);
        primeApiAuthReaders(nextTokens.accessToken, nextTokens.refreshToken);
        setToken(nextTokens.accessToken);
        setRefreshToken(nextTokens.refreshToken);
        scheduleTokenRefresh(nextTokens.accessToken);
        const nextSession = await getSession();
        setSession(nextSession);
        setIsOfflineSession(false);
        const cached = await getCachedOfflineSession();
        if (cached) {
          await cacheOfflineSession(cached.identifier, nextSession);
        }
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = run;
    return run;
  }, [primeApiAuthReaders, refreshToken, scheduleTokenRefresh]);

  useEffect(() => {
    tryRefreshTokenRef.current = tryRefreshToken;
  }, [tryRefreshToken]);

  const refreshSession = useCallback(async () => {
    try {
      const nextSession = await getSession();
      setSession(nextSession);
      setIsOfflineSession(false);
      const cached = await getCachedOfflineSession();
      if (cached) {
        await cacheOfflineSession(cached.identifier, nextSession);
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          await logout();
        }
        return;
      }
      if (isNetworkError(error)) {
        const cached = await getCachedOfflineSession();
        if (cached) {
          setSession(cached.session);
          setIsOfflineSession(true);
          return;
        }
      }
      throw error;
    }
  }, [logout, tryRefreshToken]);

  const loginWithPassword = useCallback(
    async (identifier: string, password: string) => {
      try {
        const result = await login({ identifier, password });
        await Promise.all([
          SecureStore.setItemAsync(STORAGE_KEYS.accessToken, result.accessToken),
          SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, result.refreshToken),
        ]);
        primeApiAuthReaders(result.accessToken, result.refreshToken);
        setToken(result.accessToken);
        setRefreshToken(result.refreshToken);
        scheduleTokenRefresh(result.accessToken);
        const nextSession = await getSession();
        setSession(nextSession);
        setIsOfflineSession(false);
        await cacheOfflineSession(identifier, nextSession);
      } catch (error) {
        if (!isNetworkError(error)) {
          throw error;
        }

        const cachedSession = await getCachedSessionForIdentifier(identifier);
        if (!cachedSession) {
          throw error;
        }

        const [storedToken, storedRefreshToken] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
          SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
        ]);
        primeApiAuthReaders(storedToken, storedRefreshToken);
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setSession(cachedSession);
        setIsOfflineSession(true);
      }
    },
    [primeApiAuthReaders, scheduleTokenRefresh],
  );

  const loginWithBiometric = useCallback(async () => {
    const [hasHardware, isEnrolled, enabled, cached] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      readBiometricLoginEnabled(),
      getCachedOfflineSession(),
    ]);

    if (!hasHardware || !isEnrolled || !enabled || !cached) {
      throw new Error('Biometric sign-in is not available on this device yet.');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Mobiris',
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use device passcode',
    });

    if (!result.success) {
      throw new Error('Biometric authentication was not completed.');
    }

    const [storedToken, storedRefreshToken] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
      SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
    ]);

    primeApiAuthReaders(storedToken, storedRefreshToken);
    setToken(storedToken);
    setRefreshToken(storedRefreshToken);
    setSession(cached.session);
    setIsOfflineSession(true);
  }, [primeApiAuthReaders]);

  const setBiometricEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      if (!hasHardware || !isEnrolled) {
        throw new Error('Biometric authentication is not configured on this device.');
      }
    }

    await writeBiometricLoginEnabled(enabled);
    setBiometricEnabledState(enabled);
  }, []);

  useEffect(() => {
    configureApiTokenGetter(async () => {
      if (token) {
        return token;
      }
      return SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
    });
    configureApiRefreshTokenGetter(async () => {
      if (refreshToken) {
        return refreshToken;
      }
      return SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
    });
  }, [refreshToken, token]);

  useEffect(() => {
    configureApiRefreshHandler(async () => tryRefreshToken());
    configureApiUnauthorizedHandler(async () => {
      const refreshed = await tryRefreshToken();
      if (!refreshed) {
        await logout();
      }
    });

    return () => {
      configureApiRefreshHandler(null);
      configureApiUnauthorizedHandler(null);
    };
  }, [logout, tryRefreshToken]);

  useEffect(() => {
    const loadBiometricState = async () => {
      const [hasHardware, enabled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        readBiometricLoginEnabled(),
      ]);
      setBiometricAvailable(hasHardware);
      setBiometricEnabledState(enabled);
    };

    loadBiometricState().catch(() => {
      setBiometricAvailable(false);
      setBiometricEnabledState(false);
    });
  }, []);

  useEffect(() => {
    configureMobileLogContext(() => ({
      userId: session?.userId ?? null,
      tenantId: session?.tenantId ?? null,
    }));

    return () => {
      configureMobileLogContext(null);
    };
  }, [session?.tenantId, session?.userId]);

  useEffect(() => {
    const restore = async () => {
      const [storedToken, storedRefreshToken, cachedSession] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
        SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
        getCachedOfflineSession(),
      ]);

      if (!storedToken || !storedRefreshToken) {
        if (cachedSession) {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setSession(cachedSession.session);
          setIsOfflineSession(true);
        }
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      primeApiAuthReaders(storedToken, storedRefreshToken);
      scheduleTokenRefresh(storedToken);

      try {
        const nextSession = await getSession();
        setSession(nextSession);
        setIsOfflineSession(false);
        if (cachedSession) {
          await cacheOfflineSession(cachedSession.identifier, nextSession);
        }
      } catch (error) {
        if (isUnauthorizedError(error)) {
          const refreshed = await tryRefreshToken();
          if (!refreshed) {
            await logout();
          }
        } else if (isNetworkError(error) && cachedSession) {
          setSession(cachedSession.session);
          setIsOfflineSession(true);
        } else {
          throw error;
        }
      } finally {
        setIsLoading(false);
      }
    };

    restore().catch(async () => {
      await logout();
      setIsLoading(false);
    });

    return () => {
      clearRefreshTimer();
    };
  }, [clearRefreshTimer, logout, primeApiAuthReaders, scheduleTokenRefresh, tryRefreshToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      session,
      isLoading,
      isOfflineSession,
      biometricAvailable,
      biometricEnabled,
      loginWithPassword,
      loginWithBiometric,
      setBiometricEnabled,
      logout,
      refreshSession,
      tryRefreshToken,
    }),
    [
      biometricAvailable,
      biometricEnabled,
      isLoading,
      isOfflineSession,
      loginWithBiometric,
      loginWithPassword,
      logout,
      refreshSession,
      session,
      setBiometricEnabled,
      token,
      tryRefreshToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
