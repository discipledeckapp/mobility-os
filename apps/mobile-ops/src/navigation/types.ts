import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  SelfServiceOtp: undefined;
  SelfServiceResume: { token?: string } | undefined;
  SelfServiceVerification: undefined;
  SelfServiceReadiness: undefined;
  Home: undefined;
  AssignmentDetail: { assignmentId: string };
  Remittance: { assignmentId?: string };
  RemittanceHistory: undefined;
  Profile: undefined;
};

export type ScreenProps<RouteName extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  RouteName
>;
