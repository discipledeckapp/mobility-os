import type { CreateAssignmentInput } from '../../lib/api-core';

function getTrimmedValue(
  formData: FormData,
  key: keyof CreateAssignmentInput | 'notes' | 'assignmentId',
): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export function buildCreateAssignmentPayload(formData: FormData):
  | { payload: CreateAssignmentInput; error?: undefined }
  | { payload?: undefined; error: string } {
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

  return { payload };
}
