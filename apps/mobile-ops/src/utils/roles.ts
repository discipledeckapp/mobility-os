import type { SessionRecord } from '../api';

export function isDriverMobileSession(session: SessionRecord | null) {
  if (!session) {
    return false;
  }

  return session.accessMode === 'driver_mobile' || session.mobileRole === 'driver';
}
