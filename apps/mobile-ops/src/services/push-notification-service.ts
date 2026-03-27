import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { registerPushDevice } from '../api';
import { STORAGE_KEYS } from '../constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerCurrentPushDevice(): Promise<void> {
  if (!Device.isDevice) {
    return;
  }

  const permissions = await Notifications.getPermissionsAsync();
  let finalStatus = permissions.status;
  if (finalStatus !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  const existingToken = await SecureStore.getItemAsync(STORAGE_KEYS.pushDeviceToken);
  const expoProjectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const response = await Notifications.getExpoPushTokenAsync(
    expoProjectId ? { projectId: expoProjectId } : undefined,
  );

  if (!response.data || response.data === existingToken) {
    return;
  }

  const platform =
    Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';

  await registerPushDevice({
    deviceToken: response.data,
    platform,
  });
  await SecureStore.setItemAsync(STORAGE_KEYS.pushDeviceToken, response.data);
}
