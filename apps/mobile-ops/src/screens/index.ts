import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AssignmentDetailScreen } from '../features/assignments/screens/AssignmentDetailScreen';
import { AssignmentsScreen as HomeScreen } from '../features/assignments/screens/AssignmentsScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { ProfileScreen } from './profile-screen';
import { RemittanceScreen } from './remittance-screen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  AssignmentDetail: { assignmentId: string };
  Remittance: { assignmentId?: string };
  Profile: undefined;
};

export type ScreenProps<RouteName extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  RouteName
>;

export const Screens = {
  Login: LoginScreen,
  Home: HomeScreen,
  AssignmentDetail: AssignmentDetailScreen,
  Remittance: RemittanceScreen,
  Profile: ProfileScreen,
};
