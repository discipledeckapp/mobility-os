'use server';

import { revalidatePath } from 'next/cache';
import {
  acceptAssignmentTerms,
  cancelAssignment,
  completeAssignment,
  createAssignment,
  declineAssignment,
  importAssignmentsCsv,
  startAssignment,
  type CreateAssignmentInput,
  type UpdateAssignmentRemittancePlanInput,
  updateAssignmentRemittancePlan,
} from '../../lib/api-core';

export interface CreateAssignmentActionState {
  error?: string;
  success?: string;
  assignmentId?: string;
  assignmentStatus?: string;
}

export interface AssignmentResolutionActionState {
  error?: string;
  success?: string;
}

export interface AssignmentRemittancePlanActionState {
  error?: string;
  success?: string;
}

export interface AssignmentBulkImportActionState {
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

async function getCsvFileContents(formData: FormData): Promise<string> {
  const file = formData.get('csvFile');
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Choose a CSV file to import.');
  }

  const content = await file.text();
  if (!content.trim()) {
    throw new Error('The uploaded CSV file is empty.');
  }

  return content;
}

export async function importAssignmentsCsvAction(
  _prevState: AssignmentBulkImportActionState,
  formData: FormData,
): Promise<AssignmentBulkImportActionState> {
  try {
    const csvContent = await getCsvFileContents(formData);
    const result = await importAssignmentsCsv(csvContent);
    revalidatePath('/assignments');
    revalidatePath('/remittance');
    revalidatePath('/operations');
    return {
      success: `Imported ${result.createdCount} assignments. ${result.failedCount} rows failed.`,
      ...(result.errors.length > 0 ? { error: result.errors.slice(0, 5).join(' ') } : {}),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to import assignment CSV.',
    };
  }
}

export async function createAssignmentAction(
  _prevState: CreateAssignmentActionState,
  formData: FormData,
): Promise<CreateAssignmentActionState> {
  const paymentModel = getTrimmedValue(
    formData,
    'paymentModel' as keyof CreateAssignmentInput,
  );
  const usesRemittance =
    paymentModel === 'hire_purchase' ||
    paymentModel === 'remittance' ||
    paymentModel === '';
  const remittanceAmount = getTrimmedValue(
    formData,
    'remittanceAmountMinorUnits' as keyof CreateAssignmentInput,
  );
  const parsedAmount = Number(remittanceAmount);
  if (usesRemittance && (!Number.isFinite(parsedAmount) || parsedAmount < 1)) {
    return {
      error: 'Expected remittance amount must be greater than 0.',
    };
  }

  const payload: CreateAssignmentInput = {
    fleetId: getTrimmedValue(formData, 'fleetId'),
    driverId: getTrimmedValue(formData, 'driverId'),
    vehicleId: getTrimmedValue(formData, 'vehicleId'),
    ...(paymentModel
      ? {
          paymentModel:
            paymentModel === 'salary'
              ? 'salary'
              : paymentModel === 'commission'
                ? 'commission'
                : paymentModel === 'hire_purchase'
                  ? 'hire_purchase'
                  : 'remittance',
        }
      : {}),
    ...(usesRemittance ? { remittanceAmountMinorUnits: Math.round(parsedAmount) } : {}),
  };

  const notes = getTrimmedValue(formData, 'notes');
  const remittanceFrequency = getTrimmedValue(
    formData,
    'remittanceFrequency' as keyof CreateAssignmentInput,
  );
  const remittanceCurrency = getTrimmedValue(
    formData,
    'remittanceCurrency' as keyof CreateAssignmentInput,
  );
  const remittanceModel = getTrimmedValue(
    formData,
    'remittanceModel' as keyof CreateAssignmentInput,
  );
  const remittanceStartDate = getTrimmedValue(
    formData,
    'remittanceStartDate' as keyof CreateAssignmentInput,
  );
  const remittanceCollectionDay = getTrimmedValue(
    formData,
    'remittanceCollectionDay' as keyof CreateAssignmentInput,
  );
  const contractType = getTrimmedValue(
    formData,
    'contractType' as keyof CreateAssignmentInput,
  );
  const principalAmount = getTrimmedValue(
    formData,
    'principalAmountMinorUnits' as keyof CreateAssignmentInput,
  );
  const totalTargetAmount = getTrimmedValue(
    formData,
    'totalTargetAmountMinorUnits' as keyof CreateAssignmentInput,
  );
  const depositAmount = getTrimmedValue(
    formData,
    'depositAmountMinorUnits' as keyof CreateAssignmentInput,
  );
  const contractDurationPeriods = getTrimmedValue(
    formData,
    'contractDurationPeriods' as keyof CreateAssignmentInput,
  );
  const finalInstallmentAmount = getTrimmedValue(
    formData,
    'finalInstallmentAmountMinorUnits' as keyof CreateAssignmentInput,
  );
  const contractEndDate = getTrimmedValue(
    formData,
    'contractEndDate' as keyof CreateAssignmentInput,
  );

  if (!payload.fleetId || !payload.driverId || !payload.vehicleId) {
    return {
      error: 'Fleet, driver, and vehicle are required.',
    };
  }

  if (usesRemittance) {
    payload.contractType =
      contractType === 'hire_purchase' ? 'hire_purchase' : 'regular_hire';
    payload.remittanceFrequency =
      remittanceFrequency === 'weekly'
        ? 'weekly'
        : remittanceFrequency === 'monthly'
          ? 'monthly'
          : 'daily';
    payload.remittanceModel =
      remittanceModel === 'hire_purchase' || payload.contractType === 'hire_purchase'
        ? 'hire_purchase'
        : 'fixed';
    if (remittanceCurrency) {
      payload.remittanceCurrency = remittanceCurrency.toUpperCase();
    }
    if (remittanceStartDate) {
      payload.remittanceStartDate = remittanceStartDate;
    }
    if (remittanceCollectionDay) {
      payload.remittanceCollectionDay = Number(remittanceCollectionDay);
    }
    if (principalAmount && Number(principalAmount) > 0) {
      payload.principalAmountMinorUnits = Number(principalAmount);
    }
    if (totalTargetAmount) {
      payload.totalTargetAmountMinorUnits = Number(totalTargetAmount);
    }
    if (depositAmount) {
      payload.depositAmountMinorUnits = Number(depositAmount);
    }
    if (finalInstallmentAmount && Number(finalInstallmentAmount) > 0) {
      payload.finalInstallmentAmountMinorUnits = Number(finalInstallmentAmount);
    }
    if (contractDurationPeriods) {
      payload.contractDurationPeriods = Number(contractDurationPeriods);
    }
    if (contractEndDate) {
      payload.contractEndDate = contractEndDate;
    }
  }

  if (notes) {
    payload.notes = notes;
  }

  try {
    const assignment = await createAssignment(payload);
    revalidatePath('/assignments');
    revalidatePath(`/assignments/${assignment.id}`);
    revalidatePath('/');
    return {
      success: 'Assignment created and sent to the driver for action.',
      assignmentId: assignment.id,
      assignmentStatus: assignment.status,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to create assignment at this time.',
    };
  }
}

export async function updateAssignmentRemittancePlanAction(
  _prevState: AssignmentRemittancePlanActionState,
  formData: FormData,
): Promise<AssignmentRemittancePlanActionState> {
  const assignmentId = getTrimmedValue(
    formData,
    'assignmentId' as keyof CreateAssignmentInput,
  );
  const remittanceAmount = getTrimmedValue(
    formData,
    'remittanceAmountMinorUnits' as keyof CreateAssignmentInput,
  );
  const remittanceFrequency = getTrimmedValue(
    formData,
    'remittanceFrequency' as keyof CreateAssignmentInput,
  );
  const remittanceCurrency = getTrimmedValue(
    formData,
    'remittanceCurrency' as keyof CreateAssignmentInput,
  );
  const remittanceStartDate = getTrimmedValue(
    formData,
    'remittanceStartDate' as keyof CreateAssignmentInput,
  );
  const remittanceCollectionDay = getTrimmedValue(
    formData,
    'remittanceCollectionDay' as keyof CreateAssignmentInput,
  );
  const contractType = getTrimmedValue(
    formData,
    'contractType' as keyof CreateAssignmentInput,
  );
  const principalAmount = getTrimmedValue(
    formData,
    'principalAmountMinorUnits' as keyof CreateAssignmentInput,
  );
  const totalTargetAmount = getTrimmedValue(
    formData,
    'totalTargetAmountMinorUnits' as keyof CreateAssignmentInput,
  );
  const depositAmount = getTrimmedValue(
    formData,
    'depositAmountMinorUnits' as keyof CreateAssignmentInput,
  );
  const contractDurationPeriods = getTrimmedValue(
    formData,
    'contractDurationPeriods' as keyof CreateAssignmentInput,
  );
  const finalInstallmentAmount = getTrimmedValue(
    formData,
    'finalInstallmentAmountMinorUnits' as keyof CreateAssignmentInput,
  );
  const contractEndDate = getTrimmedValue(
    formData,
    'contractEndDate' as keyof CreateAssignmentInput,
  );

  if (!assignmentId) {
    return { error: 'Assignment ID is required.' };
  }

  const parsedAmount = Number(remittanceAmount);
  if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
    return { error: 'Expected remittance amount must be greater than 0.' };
  }

  try {
    const payload = {
      remittanceAmountMinorUnits: Math.round(parsedAmount),
      ...(contractType
        ? {
            contractType:
              contractType === 'hire_purchase' ? 'hire_purchase' : 'regular_hire',
          }
        : {}),
      remittanceFrequency:
        remittanceFrequency === 'weekly'
          ? 'weekly'
          : remittanceFrequency === 'monthly'
            ? 'monthly'
            : 'daily',
      ...(remittanceCurrency ? { remittanceCurrency: remittanceCurrency.toUpperCase() } : {}),
      ...(remittanceStartDate ? { remittanceStartDate } : {}),
      ...(remittanceCollectionDay
        ? { remittanceCollectionDay: Number(remittanceCollectionDay) }
        : {}),
      ...(principalAmount && Number(principalAmount) > 0
        ? { principalAmountMinorUnits: Number(principalAmount) }
        : {}),
      ...(totalTargetAmount ? { totalTargetAmountMinorUnits: Number(totalTargetAmount) } : {}),
      ...(depositAmount ? { depositAmountMinorUnits: Number(depositAmount) } : {}),
      ...(finalInstallmentAmount && Number(finalInstallmentAmount) > 0
        ? { finalInstallmentAmountMinorUnits: Number(finalInstallmentAmount) }
        : {}),
      ...(contractDurationPeriods
        ? { contractDurationPeriods: Number(contractDurationPeriods) }
        : {}),
      ...(contractEndDate ? { contractEndDate } : {}),
    } satisfies UpdateAssignmentRemittancePlanInput;
    await updateAssignmentRemittancePlan(assignmentId, payload);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to update assignment remittance terms at this time.',
    };
  }

  revalidatePath('/assignments');
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath('/remittance');
  revalidatePath('/');

  return {
    success: 'Assignment remittance terms updated.',
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
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath('/remittance');
  revalidatePath('/');
  return {
    success: 'Assignment is now active and the driver has been notified.',
  };
}

export async function acceptAssignmentTermsAction(
  _prevState: AssignmentResolutionActionState,
  formData: FormData,
): Promise<AssignmentResolutionActionState> {
  const assignmentId = getTrimmedValue(
    formData,
    'assignmentId' as keyof CreateAssignmentInput,
  );

  if (!assignmentId) {
    return { error: 'Assignment ID is required.' };
  }

  try {
    await acceptAssignmentTerms(assignmentId, { acceptedFrom: 'operator_console' });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to confirm assignment acceptance at this time.',
    };
  }

  revalidatePath('/assignments');
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath('/remittance');
  revalidatePath('/');
  return {
    success: 'Assignment accepted.',
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
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath('/remittance');
  revalidatePath('/');
  return {
    success: 'Assignment ended and remittance stopped.',
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
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath('/remittance');
  revalidatePath('/');
  return {
    success: 'Assignment cancelled.',
  };
}

export async function declineAssignmentAction(
  _prevState: AssignmentResolutionActionState,
  formData: FormData,
): Promise<AssignmentResolutionActionState> {
  const assignmentId = getTrimmedValue(
    formData,
    'assignmentId' as keyof CreateAssignmentInput,
  );

  if (!assignmentId) {
    return { error: 'Assignment ID is required.' };
  }

  try {
    await declineAssignment(assignmentId);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to decline assignment at this time.',
    };
  }

  revalidatePath('/assignments');
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath('/');
  return {
    success: 'Assignment declined.',
  };
}
