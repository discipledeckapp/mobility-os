import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { STORAGE_KEYS } from '../constants';

export type AppEntryRole = 'driver' | 'operator' | 'guarantor';

interface AppEntryContextValue {
  selectedRole: AppEntryRole | null;
  isLoading: boolean;
  setSelectedRole: (role: AppEntryRole) => Promise<void>;
  clearSelectedRole: () => Promise<void>;
}

const AppEntryContext = createContext<AppEntryContextValue | null>(null);

export function AppEntryProvider({ children }: PropsWithChildren) {
  const [selectedRole, setSelectedRoleState] = useState<AppEntryRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.appEntryRole)
      .then((storedRole) => {
        if (
          storedRole === 'driver' ||
          storedRole === 'operator' ||
          storedRole === 'guarantor'
        ) {
          setSelectedRoleState(storedRole);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setSelectedRole = useCallback(async (role: AppEntryRole) => {
    setSelectedRoleState(role);
    await AsyncStorage.setItem(STORAGE_KEYS.appEntryRole, role);
  }, []);

  const clearSelectedRole = useCallback(async () => {
    setSelectedRoleState(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.appEntryRole);
  }, []);

  const value = useMemo<AppEntryContextValue>(
    () => ({
      selectedRole,
      isLoading,
      setSelectedRole,
      clearSelectedRole,
    }),
    [clearSelectedRole, isLoading, selectedRole, setSelectedRole],
  );

  return <AppEntryContext.Provider value={value}>{children}</AppEntryContext.Provider>;
}

export function useAppEntry() {
  const value = useContext(AppEntryContext);
  if (!value) {
    throw new Error('useAppEntry must be used within AppEntryProvider');
  }
  return value;
}
