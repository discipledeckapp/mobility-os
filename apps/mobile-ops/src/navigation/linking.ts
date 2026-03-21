import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '../screens';

export const MOBILE_LINK_PREFIXES = ['mobiris-mobile-ops://', 'mobiris://'] as const;

export const mobileLinking: LinkingOptions<RootStackParamList> = {
  prefixes: [...MOBILE_LINK_PREFIXES],
  config: {
    screens: {
      Login: 'login',
      Home: '',
      AssignmentDetail: 'assignment/:assignmentId',
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

export function buildProfileDeepLink() {
  return 'mobiris://profile';
}
