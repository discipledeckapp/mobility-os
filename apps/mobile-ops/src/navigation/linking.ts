import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const MOBILE_LINK_PREFIXES = ['mobiris-mobile-ops://', 'mobiris://'] as const;

export const mobileLinking: LinkingOptions<RootStackParamList> = {
  prefixes: [...MOBILE_LINK_PREFIXES],
  config: {
    screens: {
      Login: 'login',
      Signup: 'signup',
      SignupOtp: 'signup/verify',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password',
      SelfServiceOtp: 'self-service/otp',
      SelfServiceVerification: 'self-service/verify',
      SelfServiceReadiness: 'self-service/readiness',
      SelfServiceResume: 'self-service/:token?',
      OperatorDashboard: 'operator/dashboard',
      OperatorDrivers: 'operator/drivers',
      OperatorDriverDetail: 'operator/drivers/:driverId',
      OperatorAssignments: 'operator/assignments',
      OperatorAssignmentCreate: 'operator/assignments/new',
      OperatorRemittance: 'operator/remittance',
      OperatorRemittanceDetail: 'operator/remittance/:remittanceId',
      OperatorVehicles: 'operator/vehicles',
      OperatorVehicleCreate: 'operator/vehicles/new',
      OperatorVehicleDetail: 'operator/vehicles/:vehicleId',
      OperatorBusinessEntities: 'operator/business-entities',
      OperatorBusinessEntityDetail: 'operator/business-entities/:businessEntityId?',
      OperatorOperatingUnits: 'operator/operating-units/:businessEntityId?',
      OperatorOperatingUnitDetail: 'operator/operating-units/detail/:operatingUnitId?',
      OperatorFleets: 'operator/fleets/:operatingUnitId?',
      OperatorFleetDetail: 'operator/fleets/detail/:fleetId?',
      OperatorReports: 'operator/reports',
      OperatorWallet: 'operator/wallet',
      OperatorSettings: 'operator/settings',
      OperatorMore: 'operator/more',
      Home: '',
      AssignmentDetail: 'assignment/:assignmentId',
      RemittanceHistory: 'remittance/history',
      Remittance: 'remittance/:assignmentId?',
      Profile: 'profile',
    },
  },
};

export function buildAssignmentDeepLink(assignmentId: string) {
  return `mobiris://assignment/${encodeURIComponent(assignmentId)}`;
}

export function buildRemittanceDeepLink(assignmentId?: string) {
  return assignmentId
    ? `mobiris://remittance/${encodeURIComponent(assignmentId)}`
    : 'mobiris://remittance';
}

export function buildRemittanceHistoryDeepLink() {
  return 'mobiris://remittance/history';
}

export function buildProfileDeepLink() {
  return 'mobiris://profile';
}

export function buildSelfServiceOtpDeepLink() {
  return 'mobiris://self-service/otp';
}

export function buildSelfServiceResumeDeepLink(token?: string) {
  return token
    ? `mobiris://self-service/${encodeURIComponent(token)}`
    : 'mobiris://self-service';
}

export function buildSelfServiceVerificationDeepLink() {
  return 'mobiris://self-service/verify';
}

export function buildSelfServiceReadinessDeepLink() {
  return 'mobiris://self-service/readiness';
}

export function buildOperatorDashboardDeepLink() {
  return 'mobiris://operator/dashboard';
}
