import type { SessionRecord } from '../api';

export function isDriverMobileSession(session: SessionRecord | null) {
  if (!session) {
    return false;
  }

  return (
    session.mobileRole === 'driver' ||
    session.mobileRole === 'field_officer' ||
    session.role === 'FIELD_OFFICER' ||
    Boolean(session.linkedDriverId)
  );
}
