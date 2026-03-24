export function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDateTime(value: string, locale?: string | null) {
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
  amountMinorUnits: number,
  minorUnit = 2,
  locale?: string | null,
) {
  const divisor = 10 ** minorUnit;
  const value = amountMinorUnits / divisor;
  return new Intl.NumberFormat(locale ?? undefined, {
    minimumFractionDigits: minorUnit,
    maximumFractionDigits: minorUnit,
  }).format(value);
}
