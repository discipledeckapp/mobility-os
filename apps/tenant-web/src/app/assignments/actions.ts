'use server';

import { revalidatePath } from 'next/cache';
import {
  cancelAssignment,
  completeAssignment,
  createAssignment,
  startAssignment,
  type CreateAssignmentInput,
} from '../../lib/api-core';

export interface CreateAssignmentActionState {
  error?: string;
  success?: string;
}

export interface AssignmentResolutionActionState {
  error?: string;
  success?: string;
}

function getTrimmedValue(
  formData: FormData,
  key: keyof CreateAssignmentInput | 'notes' | 'assignmentId',
): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function createAssignmentAction(
  _prevState: CreateAssignmentActionState,
  formData: FormData,
): Promise<CreateAssignmentActionState> {
  const payload: CreateAssignmentInput = {
    fleetId: getTrimmedValue(formData, 'fleetId'),
    driverId: getTrimmedValue(formData, 'driverId'),
    vehicleId: getTrimmedValue(formData, 'vehicleId'),
  };

  const notes = getTrimmedValue(formData, 'notes');

  if (!payload.fleetId || !payload.driverId || !payload.vehicleId) {
    return {
      error: 'Fleet, driver, and vehicle are required.',
    };
  }

  if (notes) {
    payload.notes = notes;
  }

  try {
    await createAssignment(payload);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to create assignment at this time.',
    };
  }

  revalidatePath('/assignments');
  revalidatePath('/');
  return {
    success: 'Assignment reserved successfully. Start it when the trip begins.',
  };
}

export async function startAssignmentAction(
  _prevState: AssignmentResolutionActionState,
  formData: FormData,
): Promise<AssignmentResolutionActionState> {
  const assignmentId = getTrimmedValue(
    formData,
    'assignmentId' as keyof CreateAssignmentInput,
  );

  if (!assignmentId) {
    return {
      error: 'Assignment ID is required.',
    };
  }

  try {
    await startAssignment(assignmentId);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to start assignment at this time.',
    };
  }

  revalidatePath('/assignments');
  revalidatePath('/');
  return {
    success: 'Assignment started.',
  };
}

export async function completeAssignmentAction(
  _prevState: AssignmentResolutionActionState,
  formData: FormData,
): Promise<AssignmentResolutionActionState> {
  const assignmentId = getTrimmedValue(
    formData,
    'assignmentId' as keyof CreateAssignmentInput,
  );

  if (!assignmentId) {
    return {
      error: 'Assignment ID is required.',
    };
  }

  try {
    await completeAssignment(assignmentId);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to complete assignment at this time.',
    };
  }

  revalidatePath('/assignments');
  revalidatePath('/');
  return {
    success: 'Assignment completed.',
  };
}

export async function cancelAssignmentAction(
  _prevState: AssignmentResolutionActionState,
  formData: FormData,
): Promise<AssignmentResolutionActionState> {
  const assignmentId = getTrimmedValue(
    formData,
    'assignmentId' as keyof CreateAssignmentInput,
  );

  if (!assignmentId) {
    return {
      error: 'Assignment ID is required.',
    };
  }

  try {
    await cancelAssignment(assignmentId);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to cancel assignment at this time.',
    };
  }

  revalidatePath('/assignments');
  revalidatePath('/');
  return {
    success: 'Assignment cancelled.',
  };
}
