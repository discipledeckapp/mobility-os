export function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function sanitizeMinorUnit(minorUnit?: number | null) {
  if (typeof minorUnit !== 'number' || !Number.isFinite(minorUnit) || !Number.isInteger(minorUnit)) {
    return 2;
  }

  return Math.min(20, Math.max(0, minorUnit));
}

function sanitizeLocale(locale?: string | null) {
  const normalized = locale?.trim();
  return normalized ? normalized : undefined;
}

function sanitizeCurrency(currency?: string | null) {
  const normalized = currency?.trim().toUpperCase();
  return normalized && /^[A-Z]{3}$/.test(normalized) ? normalized : 'NGN';
}

function sanitizeNumber(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function formatDateTime(value?: string | null, locale?: string | null) {
  if (!value) {
    return 'Not recorded';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale ?? undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDateOnly(value: string, locale?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale ?? undefined, {
    dateStyle: 'medium',
  }).format(date);
}

export function formatMajorAmount(
  amountMinorUnits: number | null | undefined,
  minorUnit = 2,
  locale?: string | null,
) {
  const normalizedAmount = sanitizeNumber(amountMinorUnits);
  if (normalizedAmount === null) {
    return '0.00';
  }

  const safeMinorUnit = sanitizeMinorUnit(minorUnit);
  const divisor = 10 ** safeMinorUnit;
  const value = normalizedAmount / divisor;

  try {
    return new Intl.NumberFormat(sanitizeLocale(locale), {
      minimumFractionDigits: safeMinorUnit,
      maximumFractionDigits: safeMinorUnit,
    }).format(value);
  } catch {
    return value.toFixed(safeMinorUnit);
  }
}

export function formatCurrencyFromMinorUnits(
  amountMinorUnits: number | null | undefined,
  currency?: string | null,
  minorUnit?: number | null,
  locale?: string | null,
) {
  const normalizedAmount = sanitizeNumber(amountMinorUnits);
  if (normalizedAmount === null) {
    return 'Not recorded';
  }

  const safeMinorUnit = sanitizeMinorUnit(minorUnit);
  const safeCurrency = sanitizeCurrency(currency);
  const value = normalizedAmount / 10 ** safeMinorUnit;

  try {
    return new Intl.NumberFormat(sanitizeLocale(locale) ?? (safeCurrency === 'NGN' ? 'en-NG' : 'en-US'), {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: safeMinorUnit,
      maximumFractionDigits: safeMinorUnit,
    }).format(value);
  } catch {
    return `${safeCurrency} ${value.toFixed(safeMinorUnit)}`;
  }
}

export function formatDecimalNumber(
  value: number | null | undefined,
  locale?: string | null,
  options?: {
    minimumFractionDigits?: number | null;
    maximumFractionDigits?: number | null;
  },
) {
  const normalizedValue = sanitizeNumber(value);
  if (normalizedValue === null) {
    return '0';
  }

  const minimumFractionDigits = sanitizeMinorUnit(options?.minimumFractionDigits ?? 0);
  const maximumFractionDigits = Math.max(
    minimumFractionDigits,
    sanitizeMinorUnit(options?.maximumFractionDigits ?? minimumFractionDigits),
  );

  try {
    return new Intl.NumberFormat(sanitizeLocale(locale), {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(normalizedValue);
  } catch {
    return normalizedValue.toFixed(maximumFractionDigits);
  }
}
