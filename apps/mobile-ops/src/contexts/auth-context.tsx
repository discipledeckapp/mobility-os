import * as SecureStore from 'expo-secure-store';
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
  isUnauthorizedError,
  login,
  refreshAuthToken,
} from '../api';
import { DEFAULT_REFRESH_LEAD_TIME_MS, STORAGE_KEYS } from '../constants';
import { getRefreshDelayMs } from '../lib/jwt';
import { configureMobileLogContext } from '../services/mobile-log-service';

interface AuthContextValue {
  token: string | null;
  session: SessionRecord | null;
  isLoading: boolean;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
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
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshInFlightRef = useRef<Promise<boolean> | null>(null);
  const tryRefreshTokenRef = useRef<() => Promise<boolean>>(async () => false);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const logout = useCallback(async () => {
    clearRefreshTimer();
    setToken(null);
    setRefreshToken(null);
    setSession(null);
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
      SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
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
        setToken(nextTokens.accessToken);
        setRefreshToken(nextTokens.refreshToken);
        scheduleTokenRefresh(nextTokens.accessToken);
        const nextSession = await getSession();
        setSession(nextSession);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = run;
    return run;
  }, [refreshToken, scheduleTokenRefresh]);

  useEffect(() => {
    tryRefreshTokenRef.current = tryRefreshToken;
  }, [tryRefreshToken]);

  const refreshSession = useCallback(async () => {
    try {
      const nextSession = await getSession();
      setSession(nextSession);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          await logout();
        }
        return;
      }
      throw error;
    }
  }, [logout, tryRefreshToken]);

  const loginWithPassword = useCallback(
    async (identifier: string, password: string) => {
      const result = await login({ identifier, password });
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.accessToken, result.accessToken),
        SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, result.refreshToken),
      ]);
      setToken(result.accessToken);
      setRefreshToken(result.refreshToken);
      scheduleTokenRefresh(result.accessToken);
      const nextSession = await getSession();
      setSession(nextSession);
    },
    [scheduleTokenRefresh],
  );

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
      const [storedToken, storedRefreshToken] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
        SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
      ]);

      if (!storedToken || !storedRefreshToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      scheduleTokenRefresh(storedToken);

      try {
        const nextSession = await getSession();
        setSession(nextSession);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          const refreshed = await tryRefreshToken();
          if (!refreshed) {
            await logout();
          }
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
  }, [clearRefreshTimer, logout, scheduleTokenRefresh, tryRefreshToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      session,
      isLoading,
      loginWithPassword,
      logout,
      refreshSession,
      tryRefreshToken,
    }),
    [isLoading, loginWithPassword, logout, refreshSession, session, token, tryRefreshToken],
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
