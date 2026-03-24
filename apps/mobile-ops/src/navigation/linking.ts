import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const MOBILE_LINK_PREFIXES = ['mobiris-mobile-ops://', 'mobiris://'] as const;

export const mobileLinking: LinkingOptions<RootStackParamList> = {
  prefixes: [...MOBILE_LINK_PREFIXES],
  config: {
    screens: {
      Login: 'login',
      SelfServiceOtp: 'self-service/otp',
      SelfServiceVerification: 'self-service/verify',
      SelfServiceReadiness: 'self-service/readiness',
      SelfServiceResume: 'self-service/:token?',
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
