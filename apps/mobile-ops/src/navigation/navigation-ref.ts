import {
  CommonActions,
  createNavigationContainerRef,
  type StackActions,
} from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const rootNavigationRef = createNavigationContainerRef<RootStackParamList>();

export function resetToRoleSelection() {
  if (!rootNavigationRef.isReady()) {
    return;
  }

  rootNavigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'RoleSelection' }],
    }),
  );
}

export function resetToLogin() {
  if (!rootNavigationRef.isReady()) {
    return;
  }

  rootNavigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    }),
  );
}
