import type { SessionRecord } from '../api';

export function isDriverMobileSession(session: SessionRecord | null) {
  if (!session) {
    return false;
  }

  const normalizedRole = session.role?.toUpperCase();
  const isOperatorRole = ['ADMIN', 'MANAGER', 'OWNER'].includes(normalizedRole);

  if (isOperatorRole) {
    return false;
  }

  return (
    session.mobileRole === 'driver' ||
    session.mobileRole === 'field_officer' ||
    session.role === 'FIELD_OFFICER' ||
    Boolean(session.linkedDriverId)
  );
}
