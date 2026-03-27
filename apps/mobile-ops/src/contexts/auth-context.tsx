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
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { getRefreshDelayMs, parseJwtExpiry } from '../lib/jwt';
import { configureMobileLogContext } from '../services/mobile-log-service';
import { flushOfflineQueue, subscribeToNetworkReconnect } from '../services/offline-queue-service';
import {
  cacheOfflineSession,
  clearOfflineSessionArtifacts,
  getCachedOfflineSession,
  getCachedSessionForIdentifier,
  isBiometricLoginEnabled as readBiometricLoginEnabled,
  setBiometricLoginEnabled as writeBiometricLoginEnabled,
} from '../services/offline-session-service';
import { registerCurrentPushDevice } from '../services/push-notification-service';

interface AuthContextValue {
  token: string | null;
  session: SessionRecord | null;
  isLoading: boolean;
  isOfflineSession: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  sessionExpiresAt: number | null;
  showExpiryWarning: boolean;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  tryRefreshToken: () => Promise<boolean>;
  dismissExpiryWarning: () => void;
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
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryWarningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshInFlightRef = useRef<Promise<boolean> | null>(null);
  const tryRefreshTokenRef = useRef<() => Promise<boolean>>(async () => false);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (expiryWarningTimerRef.current) {
      clearTimeout(expiryWarningTimerRef.current);
      expiryWarningTimerRef.current = null;
    }
  }, []);

  const dismissExpiryWarning = useCallback(() => {
    setShowExpiryWarning(false);
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
        setSessionExpiresAt(null);
        setShowExpiryWarning(false);
        return;
      }

      const expiryMs = parseJwtExpiry(nextToken);
      setSessionExpiresAt(expiryMs);
      setShowExpiryWarning(false);

      const delayMs = getRefreshDelayMs(nextToken, DEFAULT_REFRESH_LEAD_TIME_MS);
      if (delayMs === null) {
        return;
      }

      refreshTimerRef.current = setTimeout(() => {
        void tryRefreshTokenRef.current();
      }, delayMs);

      // Show expiry warning 2 minutes before the token expires
      const WARNING_LEAD_MS = 2 * 60 * 1000;
      const warningDelayMs = getRefreshDelayMs(nextToken, WARNING_LEAD_MS);
      if (warningDelayMs !== null && warningDelayMs > 0) {
        expiryWarningTimerRef.current = setTimeout(() => {
          setShowExpiryWarning(true);
        }, warningDelayMs);
      }
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
        setShowExpiryWarning(false);
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

  useEffect(() => {
    const unsubscribe = subscribeToNetworkReconnect(async () => {
      try {
        await flushOfflineQueue();
      } catch {
        // Best-effort background recovery only.
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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

    // Tokens may be absent if the keychain was cleared independently of the
    // cached session (e.g. OS upgrade, full data wipe). Allow offline mode
    // entry so the user sees their last known session; the next online action
    // will trigger a re-auth via the unauthorised handler.
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
    if (!session || isOfflineSession) {
      return;
    }

    registerCurrentPushDevice().catch(() => {
      // Non-blocking. Push registration should never block access.
    });
  }, [isOfflineSession, session]);

  useEffect(() => {
    const restore = async () => {
      const [storedToken, storedRefreshToken, cachedSession] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
        SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
        getCachedOfflineSession(),
      ]);

      if (!storedToken || !storedRefreshToken) {
        if (cachedSession) {
          primeApiAuthReaders(storedToken, storedRefreshToken);
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
        }
        // Unknown errors (5xx, parse failures, etc.) — do NOT logout. The user
        // is still authenticated; they just can't reach the server right now.
        // The next foreground action will retry and the unauthorised handler
        // will fire if the token is genuinely invalid.
      } finally {
        setIsLoading(false);
      }
    };

    restore().catch(() => {
      // Catastrophic startup failure (e.g. SecureStore unavailable). Do not
      // logout — that would wipe tokens unnecessarily. Just unblock the UI.
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
      sessionExpiresAt,
      showExpiryWarning,
      loginWithPassword,
      loginWithBiometric,
      setBiometricEnabled,
      logout,
      refreshSession,
      tryRefreshToken,
      dismissExpiryWarning,
    }),
    [
      biometricAvailable,
      biometricEnabled,
      dismissExpiryWarning,
      isLoading,
      isOfflineSession,
      loginWithBiometric,
      loginWithPassword,
      logout,
      refreshSession,
      session,
      sessionExpiresAt,
      setBiometricEnabled,
      showExpiryWarning,
      token,
      tryRefreshToken,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiryWarning
        visible={showExpiryWarning}
        expiresAt={sessionExpiresAt}
        onRefresh={async () => {
          const ok = await tryRefreshToken();
          if (!ok) await logout();
        }}
        onDismiss={dismissExpiryWarning}
      />
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Session expiry warning modal
// ---------------------------------------------------------------------------

interface SessionExpiryWarningProps {
  visible: boolean;
  expiresAt: number | null;
  onRefresh: () => Promise<void>;
  onDismiss: () => void;
}

function SessionExpiryWarning({ visible, expiresAt, onRefresh, onDismiss }: SessionExpiryWarningProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!visible || !expiresAt) {
      setSecondsLeft(null);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [visible, expiresAt]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onDismiss}>
      <View style={expiryStyles.overlay}>
        <View style={expiryStyles.card}>
          <Text style={expiryStyles.title}>Session expiring soon</Text>
          <Text style={expiryStyles.body}>
            Your session will expire{' '}
            {secondsLeft !== null ? (
              <Text style={expiryStyles.countdown}>{formatTime(secondsLeft)}</Text>
            ) : null}
            . Tap below to stay signed in.
          </Text>
          <TouchableOpacity
            style={[expiryStyles.btn, expiryStyles.btnPrimary]}
            onPress={handleRefresh}
            disabled={refreshing}
            activeOpacity={0.8}
          >
            <Text style={expiryStyles.btnPrimaryText}>
              {refreshing ? 'Refreshing…' : 'Stay signed in'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[expiryStyles.btn, expiryStyles.btnGhost]}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={expiryStyles.btnGhostText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const expiryStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  body: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  countdown: {
    fontWeight: '700',
    color: '#EF4444',
    fontVariant: ['tabular-nums'],
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#2563EB',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnGhostText: {
    color: '#64748B',
    fontSize: 14,
  },
});

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
