import {
  type AssignmentRecord,
  type DriverRecord,
  type LoginResponse,
  type RemittanceRecord,
  getAssignment,
  getDriverProfile,
  listAssignments,
  login,
  recordRemittance,
} from '../api';

export type { AssignmentRecord, DriverRecord, LoginResponse, RemittanceRecord };

export function loginWithPassword(identifier: string, password: string): Promise<LoginResponse> {
  return login({ identifier, password });
}

export function getMyAssignments(): Promise<AssignmentRecord[]> {
  return listAssignments();
}

export { getAssignment };

export function submitRemittance(
  assignmentId: string,
  amountMinorUnits: number,
  dueDate: string,
  currency = 'NGN',
): Promise<RemittanceRecord> {
  return recordRemittance({
    assignmentId,
    amountMinorUnits,
    currency,
    dueDate,
  });
}

export function getMyDriverProfile(): Promise<DriverRecord> {
  return getDriverProfile();
}
