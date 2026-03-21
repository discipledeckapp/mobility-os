import {
  type AssignmentRecord,
  cancelAssignment,
  completeAssignment,
  getAssignment,
  listAssignments,
  startAssignment,
} from '../api';
import { ASSIGNMENT_STATUS } from '../constants';

export type AssignmentStatus = (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

export type AssignmentFilter = AssignmentStatus | 'all';

export async function fetchAssignments() {
  return listAssignments();
}

export async function fetchAssignmentDetail(assignmentId: string) {
  return getAssignment(assignmentId);
}

export async function startDriverAssignment(assignmentId: string) {
  return startAssignment(assignmentId);
}

export async function completeDriverAssignment(assignmentId: string, notes?: string) {
  return completeAssignment(assignmentId, notes);
}

export async function cancelDriverAssignment(assignmentId: string, notes?: string) {
  return cancelAssignment(assignmentId, notes);
}

export function filterAssignments(
  assignments: AssignmentRecord[],
  filter: AssignmentFilter,
  searchQuery: string,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return assignments.filter((assignment) => {
    const matchesFilter = filter === 'all' ? true : assignment.status === filter;
    if (!matchesFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchFields = [
      assignment.id,
      assignment.vehicle?.make,
      assignment.vehicle?.model,
      assignment.vehicle?.plate,
      assignment.vehicle?.tenantVehicleCode,
      assignment.vehicle?.systemVehicleCode,
      assignment.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchFields.includes(normalizedQuery);
  });
}

export function groupAssignments(assignments: AssignmentRecord[]) {
  const statusOrder: AssignmentStatus[] = [
    ASSIGNMENT_STATUS.active,
    ASSIGNMENT_STATUS.assigned,
    ASSIGNMENT_STATUS.created,
    ASSIGNMENT_STATUS.completed,
    ASSIGNMENT_STATUS.cancelled,
  ];

  return statusOrder
    .map((status) => ({
      status,
      records: assignments.filter((assignment) => assignment.status === status),
    }))
    .filter((group) => group.records.length > 0);
}
