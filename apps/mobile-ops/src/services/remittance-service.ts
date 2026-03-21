import { type RecordRemittanceInput, recordRemittance } from '../api';

export function getCurrencyMultiplier(minorUnit?: number | null) {
  const safeMinorUnit =
    typeof minorUnit === 'number' && Number.isInteger(minorUnit) && minorUnit >= 0 ? minorUnit : 2;
  return 10 ** safeMinorUnit;
}

export function convertMajorToMinorUnits(amount: string, minorUnit?: number | null): number | null {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * getCurrencyMultiplier(minorUnit));
}

export async function submitRemittance(input: RecordRemittanceInput) {
  return recordRemittance(input);
}
