import type { Assignment } from '@prisma/client';

export const ASSIGNMENT_DECISION_PENDING_STATUSES = [
  'created',
  'pending_driver_confirmation',
  'driver_action_required',
] as const;

export const ASSIGNMENT_STARTABLE_STATUSES = [
  ...ASSIGNMENT_DECISION_PENDING_STATUSES,
  'accepted',
] as const;

export type AssignmentStatusValue = Assignment['status'];

export function isAssignmentPendingDecision(status: AssignmentStatusValue): boolean {
  return (ASSIGNMENT_DECISION_PENDING_STATUSES as readonly string[]).includes(status);
}

export function isAssignmentStartable(status: AssignmentStatusValue): boolean {
  return (ASSIGNMENT_STARTABLE_STATUSES as readonly string[]).includes(status);
}

export function isAssignmentActivelyRunning(status: AssignmentStatusValue): boolean {
  return status === 'active';
}

export function canRecordRemittanceAgainstAssignment(input: {
  status: AssignmentStatusValue;
  endedAt?: Date | null;
  returnedAt?: Date | null;
  dueDate?: string | null;
}): boolean {
  if (isAssignmentActivelyRunning(input.status)) {
    return true;
  }

  if (input.status !== 'ended') {
    return false;
  }

  const assignmentEndedOn =
    input.returnedAt?.toISOString().slice(0, 10) ?? input.endedAt?.toISOString().slice(0, 10);

  return Boolean(assignmentEndedOn) && (input.dueDate ? input.dueDate === assignmentEndedOn : true);
}
