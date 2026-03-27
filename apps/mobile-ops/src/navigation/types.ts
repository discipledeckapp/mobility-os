import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  SignupOtp: {
    orgName: string;
    adminEmail: string;
    adminPassword: string;
  };
  ForgotPassword: undefined;
  ResetPassword: { email?: string } | undefined;
  SelfServiceOtp: undefined;
  SelfServiceResume: { token?: string } | undefined;
  SelfServiceVerification: undefined;
  SelfServiceReadiness: undefined;
  GuarantorSelfServiceOtp: undefined;
  GuarantorSelfService: { token?: string } | undefined;
  DriverAccountSetup: undefined;
  DriverGuarantor: undefined;
  Home: undefined;
  AssignmentDetail: { assignmentId: string };
  Remittance: { assignmentId?: string };
  RemittanceHistory: undefined;
  Profile: undefined;
  OperatorDashboard: undefined;
  OperatorDrivers: undefined;
  OperatorDriverDetail: { driverId: string };
  OperatorAssignments: undefined;
  OperatorAssignmentCreate: undefined;
  OperatorRemittance: undefined;
  OperatorRemittanceDetail: { remittanceId: string };
  OperatorVehicles: undefined;
  OperatorVehicleCreate: undefined;
  OperatorVehicleDetail: { vehicleId: string };
  OperatorBusinessEntities: undefined;
  OperatorBusinessEntityDetail: { businessEntityId?: string } | undefined;
  OperatorOperatingUnits: { businessEntityId?: string } | undefined;
  OperatorOperatingUnitDetail:
    | { operatingUnitId?: string; businessEntityId?: string }
    | undefined;
  OperatorFleets: { operatingUnitId?: string } | undefined;
  OperatorFleetDetail: { fleetId?: string; operatingUnitId?: string } | undefined;
  OperatorReports: undefined;
  OperatorWallet: undefined;
  OperatorSettings: undefined;
  OperatorMore: undefined;
};

export type ScreenProps<RouteName extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  RouteName
>;
