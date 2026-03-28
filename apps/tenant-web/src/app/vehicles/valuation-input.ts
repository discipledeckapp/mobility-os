type NormalizedMinorAmount = {
  raw: string;
  filled: boolean;
  minorUnits?: number;
  error?: string;
};

type NormalizedIsoDate = {
  raw: string;
  filled: boolean;
  value?: string;
  error?: string;
};

export type NormalizedVehicleValuationInput = {
  acquisitionCost: NormalizedMinorAmount;
  acquisitionDate: NormalizedIsoDate;
  currentEstimatedValue: NormalizedMinorAmount;
  validationErrors: string[];
};

function normalizeMinorAmount(rawValue: string, label: string): NormalizedMinorAmount {
  const raw = rawValue.trim();
  if (!raw) {
    return { raw, filled: false };
  }

  const normalized = raw.replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return {
      raw,
      filled: true,
      error: `${label} must be a valid amount.`,
    };
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    return {
      raw,
      filled: true,
      error: `${label} must be a valid amount.`,
    };
  }

  return {
    raw,
    filled: true,
    minorUnits: Math.round(amount * 100),
  };
}

function normalizeIsoDate(rawValue: string, label: string): NormalizedIsoDate {
  const raw = rawValue.trim();
  if (!raw) {
    return { raw, filled: false };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return {
      raw,
      filled: true,
      error: `${label} must use YYYY-MM-DD format.`,
    };
  }

  const parsed = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== raw) {
    return {
      raw,
      filled: true,
      error: `${label} must be a real calendar date.`,
    };
  }

  return {
    raw,
    filled: true,
    value: raw,
  };
}

export function normalizeVehicleValuationInput(input: {
  acquisitionCost: string;
  acquisitionDate: string;
  currentEstimatedValue: string;
}): NormalizedVehicleValuationInput {
  const acquisitionCost = normalizeMinorAmount(input.acquisitionCost, 'Acquisition cost');
  const acquisitionDate = normalizeIsoDate(input.acquisitionDate, 'Acquisition date');
  const currentEstimatedValue = normalizeMinorAmount(
    input.currentEstimatedValue,
    'Current estimated value',
  );

  const validationErrors = [
    acquisitionCost.error,
    acquisitionDate.error,
    currentEstimatedValue.error,
    acquisitionCost.filled !== acquisitionDate.filled
      ? 'Acquisition cost and acquisition date must be entered together.'
      : undefined,
  ].filter((value): value is string => Boolean(value));

  return {
    acquisitionCost,
    acquisitionDate,
    currentEstimatedValue,
    validationErrors,
  };
}
