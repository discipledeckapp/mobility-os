import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as SystemUI from 'expo-system-ui';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Animated } from 'react-native';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LaunchSplashScreen, createSplashFadeAnimation } from './src/components/launch-splash-screen';
import { AppEntryProvider, useAppEntry } from './src/contexts/app-entry-context';
import { ErrorBoundary } from './src/components/error-boundary';
import { registerPushDevice } from './src/api';
import { AuthProvider, useAuth } from './src/contexts/auth-context';
import { SelfServiceProvider, useSelfService } from './src/contexts/self-service-context';
import { ToastProvider, useToast } from './src/contexts/toast-context';
import { mobileQueryClient, mobileQueryPersister } from './src/lib/query-client';
import { RootNavigator } from './src/navigation/root-navigator';
import { resetToRoleSelection } from './src/navigation/navigation-ref';
import {
  flushOfflineQueue,
  subscribeToNetworkReconnect,
} from './src/services/offline-queue-service';
import { tokens } from './src/theme/tokens';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerPushNotificationsForCurrentDevice() {
  const permission = await Notifications.getPermissionsAsync();
  let finalStatus = permission.status;

  if (finalStatus !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    finalStatus = request.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.easConfig?.projectId ??
    (typeof Constants.expoConfig?.extra?.eas === 'object' &&
    Constants.expoConfig?.extra?.eas &&
    'projectId' in Constants.expoConfig.extra.eas
      ? String(Constants.expoConfig.extra.eas.projectId)
      : undefined);

  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return token.data;
}

function AppShell() {
  const { session } = useAuth();
  const { selectedRole, setSelectedRole } = useAppEntry();
  const { showToast } = useToast();
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      createSplashFadeAnimation(splashOpacity).start(() => {
        setShowSplash(false);
      });
    }, 380);

    return () => {
      clearTimeout(timer);
    };
  }, [splashOpacity]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const nextRole =
      session.selfServiceSubjectType === 'guarantor'
        ? 'guarantor'
        : session.accessMode === 'driver_mobile' || session.mobileRole === 'driver'
          ? 'driver'
          : 'operator';

    if (selectedRole !== nextRole) {
      void setSelectedRole(nextRole);
    }
  }, [
    selectedRole,
    session,
    session?.accessMode,
    session?.mobileRole,
    session?.selfServiceSubjectType,
    setSelectedRole,
  ]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const unsubscribe = subscribeToNetworkReconnect(async () => {
      let attempt = 0;
      let delayMs = 400;

      while (attempt < 3) {
        const result = await flushOfflineQueue();
        if (result.processed > 0) {
          showToast(
            `${result.processed} offline action${result.processed === 1 ? '' : 's'} synced successfully.`,
            'success',
          );
        }

        if (result.remaining === 0) {
          return;
        }

        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
      }

      showToast(
        'Some queued actions could not be synced yet. They will retry when the network changes again.',
        'info',
      );
    });

    return unsubscribe;
  }, [session, showToast]);

  useEffect(() => {
    if (!session) {
      return;
    }

    registerPushNotificationsForCurrentDevice()
      .then((deviceToken) => {
        if (!deviceToken) {
          return;
        }
        return registerPushDevice({
          deviceToken,
          platform:
            Constants.platform?.ios
              ? 'ios'
              : Constants.platform?.android
                ? 'android'
                : 'web',
        });
      })
      .catch(() => {
        // Ignore notification registration failures and keep the app usable.
      });
  }, [session]);

  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
      {showSplash ? <LaunchSplashScreen opacity={splashOpacity} /> : null}
    </>
  );
}

function RecoverableAppBoundary({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const { clearSelfService } = useSelfService();
  const { clearSelectedRole } = useAppEntry();

  return (
    <ErrorBoundary
      onStartOver={async () => {
        await Promise.allSettled([clearSelfService(), logout(), clearSelectedRole()]);
        resetToRoleSelection();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default function App() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(tokens.colors.background).catch(() => {
      // Ignore native no-op failures during unsupported previews/tests.
    });
  }, []);

  return (
    <PersistQueryClientProvider
      client={mobileQueryClient}
      persistOptions={{
        persister: mobileQueryPersister,
        maxAge: 1000 * 60 * 60 * 24,
      }}
    >
      <AuthProvider>
        <AppEntryProvider>
          <SelfServiceProvider>
            <ToastProvider>
              <RecoverableAppBoundary>
                <AppShell />
              </RecoverableAppBoundary>
            </ToastProvider>
          </SelfServiceProvider>
        </AppEntryProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}
