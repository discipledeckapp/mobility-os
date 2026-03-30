import type { SessionRecord } from '../api';

export type MobileSessionExperience =
  | 'guarantor_self_service'
  | 'driver_scoped'
  | 'operator'
  | 'anonymous';

export function isGuarantorSelfServiceSession(session: SessionRecord | null) {
  return session?.selfServiceSubjectType === 'guarantor';
}

export function isDriverMobileSession(session: SessionRecord | null) {
  if (!session) {
    return false;
  }

  return session.accessMode === 'driver_mobile' || session.mobileRole === 'driver';
}

export function isDriverScopedSession(session: SessionRecord | null) {
  if (!session) {
    return false;
  }

  return (
    session.selfServiceSubjectType === 'driver' ||
    isDriverMobileSession(session) ||
    typeof session.linkedDriverId === 'string' ||
    typeof session.selfServiceDriverId === 'string'
  );
}

export function getMobileSessionExperience(session: SessionRecord | null): MobileSessionExperience {
  if (!session) {
    return 'anonymous';
  }

  if (isGuarantorSelfServiceSession(session)) {
    return 'guarantor_self_service';
  }

  if (isDriverScopedSession(session)) {
    return 'driver_scoped';
  }

  return 'operator';
}
