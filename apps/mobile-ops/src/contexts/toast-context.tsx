import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';

type ToastTone = 'success' | 'error' | 'info';

type ToastValue = {
  message: string;
  tone: ToastTone;
} | null;

const ToastContext = createContext<{
  showToast: (message: string, tone?: ToastTone) => void;
  clearToast: () => void;
} | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastValue>(null);

  const clearToast = useCallback(() => setToast(null), []);
  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    setToast({ message, tone });
  }, []);

  const value = useMemo(() => ({ showToast, clearToast }), [clearToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,
            toast.tone === 'success'
              ? styles.success
              : toast.tone === 'error'
                ? styles.error
                : styles.info,
          ]}
        >
          <Text style={styles.text}>{toast.message}</Text>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return value;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: tokens.spacing.md,
    right: tokens.spacing.md,
    bottom: tokens.spacing.lg,
    borderRadius: tokens.radius.card,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderWidth: 1,
  },
  success: {
    backgroundColor: '#ECFDF3',
    borderColor: '#ABEFC6',
  },
  error: {
    backgroundColor: '#FEF3F2',
    borderColor: '#FECDCA',
  },
  info: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  text: {
    color: tokens.colors.ink,
    fontWeight: '600',
  },
});
