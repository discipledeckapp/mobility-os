'use server';

import { revalidatePath } from 'next/cache';
import {
  confirmRemittance,
  disputeRemittance,
  recordRemittance,
  type RecordRemittanceInput,
  waiveRemittance,
} from '../../lib/api-core';

export interface RecordRemittanceActionState {
  error?: string;
  success?: string;
}

export interface RemittanceResolutionActionState {
  error?: string;
  success?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function recordRemittanceAction(
  _prevState: RecordRemittanceActionState,
  formData: FormData,
): Promise<RecordRemittanceActionState> {
  const amountValue = getTrimmedValue(formData, 'amount');
  const amountMinorUnits = Math.round(Number(amountValue) * 100);

  const payload: RecordRemittanceInput = {
    fleetId: getTrimmedValue(formData, 'fleetId'),
    assignmentId: getTrimmedValue(formData, 'assignmentId'),
    amountMinorUnits,
    currency: getTrimmedValue(formData, 'currency').toUpperCase(),
    dueDate: getTrimmedValue(formData, 'dueDate'),
  };

  const notes = getTrimmedValue(formData, 'notes');

  if (
    !payload.fleetId ||
    !payload.assignmentId ||
    !amountValue ||
    Number.isNaN(amountMinorUnits) ||
    amountMinorUnits < 1 ||
    !payload.currency ||
    !payload.dueDate
  ) {
    return {
      error:
        'Fleet, assignment, amount, currency, and due date are required to record remittance.',
    };
  }

  if (notes) {
    payload.notes = notes;
  }

  try {
    await recordRemittance(payload);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to record remittance at this time.',
    };
  }

  revalidatePath('/remittance');
  return {
    success: 'Remittance recorded successfully.',
  };
}

export async function confirmRemittanceAction(
  _prevState: RemittanceResolutionActionState,
  formData: FormData,
): Promise<RemittanceResolutionActionState> {
  const remittanceId = getTrimmedValue(formData, 'remittanceId');
  const paidDate = getTrimmedValue(formData, 'paidDate');

  if (!remittanceId || !paidDate) {
    return {
      error: 'Remittance ID and paid date are required.',
    };
  }

  try {
    await confirmRemittance(remittanceId, paidDate);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to confirm remittance at this time.',
    };
  }

  revalidatePath('/remittance');
  revalidatePath('/');
  return {
    success: 'Remittance confirmed.',
  };
}

export async function disputeRemittanceAction(
  _prevState: RemittanceResolutionActionState,
  formData: FormData,
): Promise<RemittanceResolutionActionState> {
  const remittanceId = getTrimmedValue(formData, 'remittanceId');
  const notes = getTrimmedValue(formData, 'notes');

  if (!remittanceId || !notes) {
    return {
      error: 'Remittance ID and dispute notes are required.',
    };
  }

  try {
    await disputeRemittance(remittanceId, notes);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to dispute remittance at this time.',
    };
  }

  revalidatePath('/remittance');
  revalidatePath('/');
  return {
    success: 'Remittance disputed.',
  };
}

export async function waiveRemittanceAction(
  _prevState: RemittanceResolutionActionState,
  formData: FormData,
): Promise<RemittanceResolutionActionState> {
  const remittanceId = getTrimmedValue(formData, 'remittanceId');
  const notes = getTrimmedValue(formData, 'notes');

  if (!remittanceId || !notes) {
    return {
      error: 'Remittance ID and waiver notes are required.',
    };
  }

  try {
    await waiveRemittance(remittanceId, notes);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to waive remittance at this time.',
    };
  }

  revalidatePath('/remittance');
  revalidatePath('/');
  return {
    success: 'Remittance waived.',
  };
}
