import * as SecureStore from 'expo-secure-store';
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  exchangeDriverSelfServiceOtp,
  getDriverSelfServiceContext,
  listDriverSelfServiceDocuments,
  type DriverRecord,
  type DriverSelfServiceDocumentRecord,
} from '../api';
import { STORAGE_KEYS } from '../constants';

interface SelfServiceContextValue {
  token: string | null;
  driver: DriverRecord | null;
  documents: DriverSelfServiceDocumentRecord[];
  isLoading: boolean;
  isRefreshing: boolean;
  bootstrapToken: (token: string) => Promise<void>;
  exchangeOtpCode: (otpCode: string) => Promise<void>;
  refreshSelfService: () => Promise<void>;
  clearSelfService: () => Promise<void>;
}

const SelfServiceContext = createContext<SelfServiceContextValue | null>(null);

export function SelfServiceProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [documents, setDocuments] = useState<DriverSelfServiceDocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const clearSelfService = useCallback(async () => {
    setToken(null);
    setDriver(null);
    setDocuments([]);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.selfServiceToken);
  }, []);

  const loadContext = useCallback(
    async (nextToken: string, persistToken = true) => {
      if (persistToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.selfServiceToken, nextToken);
      }

      setToken(nextToken);

      try {
        const [nextDriver, nextDocuments] = await Promise.all([
          getDriverSelfServiceContext(nextToken),
          listDriverSelfServiceDocuments(nextToken).catch(() => []),
        ]);

        setDriver(nextDriver);
        setDocuments(nextDocuments);
      } catch (error) {
        await clearSelfService();
        throw error;
      }
    },
    [clearSelfService],
  );

  const bootstrapToken = useCallback(
    async (nextToken: string) => {
      const normalized = nextToken.trim();
      if (!normalized) {
        throw new Error('A verification token is required.');
      }
      await loadContext(normalized);
    },
    [loadContext],
  );

  const exchangeOtpCode = useCallback(
    async (otpCode: string) => {
      const normalized = otpCode.trim();
      if (!normalized) {
        throw new Error('Enter the OTP code from your verification link.');
      }

      const result = await exchangeDriverSelfServiceOtp(normalized);
      await loadContext(result.token);
    },
    [loadContext],
  );

  const refreshSelfService = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsRefreshing(true);
    try {
      await loadContext(token, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadContext, token]);

  useEffect(() => {
    const restore = async () => {
      const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.selfServiceToken);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        await loadContext(storedToken, false);
      } catch {
        await clearSelfService();
      } finally {
        setIsLoading(false);
      }
    };

    restore().catch(async () => {
      await clearSelfService();
      setIsLoading(false);
    });
  }, [clearSelfService, loadContext]);

  const value = useMemo<SelfServiceContextValue>(
    () => ({
      token,
      driver,
      documents,
      isLoading,
      isRefreshing,
      bootstrapToken,
      exchangeOtpCode,
      refreshSelfService,
      clearSelfService,
    }),
    [
      token,
      driver,
      documents,
      isLoading,
      isRefreshing,
      bootstrapToken,
      exchangeOtpCode,
      refreshSelfService,
      clearSelfService,
    ],
  );

  return <SelfServiceContext.Provider value={value}>{children}</SelfServiceContext.Provider>;
}

export function useSelfService() {
  const value = useContext(SelfServiceContext);
  if (!value) {
    throw new Error('useSelfService must be used inside SelfServiceProvider');
  }
  return value;
}
