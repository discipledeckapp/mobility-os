export type RemittanceFrequency = 'daily' | 'weekly' | 'monthly';

export interface AssignmentRemittanceTerms {
  remittanceFrequency?: string | null;
  remittanceAmountMinorUnits?: number | null;
  remittanceCurrency?: string | null;
  remittanceStartDate?: string | null;
  remittanceCollectionDay?: number | null;
}

function parseIsoDate(dateString?: string | null): Date | null {
  if (!dateString) {
    return null;
  }

  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const value = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(value.getTime()) ? null : value;
}

export function toIsoDate(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeRemittanceFrequency(
  frequency?: string | null,
): RemittanceFrequency | null {
  if (frequency === 'daily' || frequency === 'weekly' || frequency === 'monthly') {
    return frequency;
  }

  return null;
}

export function computeNextRemittanceDueDate(
  terms: AssignmentRemittanceTerms,
  fromDate = new Date(),
): string | null {
  const frequency = normalizeRemittanceFrequency(terms.remittanceFrequency);
  if (!frequency || !terms.remittanceAmountMinorUnits || !terms.remittanceCurrency) {
    return null;
  }

  const startDate = parseIsoDate(terms.remittanceStartDate) ?? new Date(fromDate);
  startDate.setUTCHours(0, 0, 0, 0);

  const cursor = new Date(fromDate);
  cursor.setUTCHours(0, 0, 0, 0);

  if (frequency === 'daily') {
    return toIsoDate(cursor > startDate ? cursor : startDate);
  }

  if (frequency === 'monthly') {
    const effectiveBase = cursor > startDate ? cursor : startDate;
    const anchorDay = startDate.getUTCDate();
    const next = new Date(Date.UTC(effectiveBase.getUTCFullYear(), effectiveBase.getUTCMonth(), 1));
    const lastDayOfCurrentMonth = new Date(
      Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
    ).getUTCDate();
    const currentMonthDay = Math.min(anchorDay, lastDayOfCurrentMonth);
    next.setUTCDate(currentMonthDay);

    if (next < effectiveBase) {
      const futureMonth = new Date(
        Date.UTC(effectiveBase.getUTCFullYear(), effectiveBase.getUTCMonth() + 1, 1),
      );
      const lastDayOfFutureMonth = new Date(
        Date.UTC(futureMonth.getUTCFullYear(), futureMonth.getUTCMonth() + 1, 0),
      ).getUTCDate();
      futureMonth.setUTCDate(Math.min(anchorDay, lastDayOfFutureMonth));
      return toIsoDate(futureMonth);
    }

    return toIsoDate(next);
  }

  const targetDay = terms.remittanceCollectionDay;
  if (!targetDay || targetDay < 1 || targetDay > 7) {
    return null;
  }

  const effectiveBase = cursor > startDate ? cursor : startDate;
  const jsWeekday = effectiveBase.getUTCDay() === 0 ? 7 : effectiveBase.getUTCDay();
  const diff = (targetDay - jsWeekday + 7) % 7;
  const next = new Date(effectiveBase);
  next.setUTCDate(effectiveBase.getUTCDate() + diff);
  return toIsoDate(next);
}

export function describeRemittanceSchedule(terms: AssignmentRemittanceTerms): string {
  const frequency = normalizeRemittanceFrequency(terms.remittanceFrequency);
  if (!frequency) {
    return 'No remittance schedule configured';
  }

  if (frequency === 'daily') {
    return 'Daily remittance';
  }

  if (frequency === 'monthly') {
    const anchorDate = parseIsoDate(terms.remittanceStartDate);
    const dayOfMonth = anchorDate?.getUTCDate();
    return dayOfMonth ? `Monthly remittance on day ${dayOfMonth}` : 'Monthly remittance';
  }

  const day = terms.remittanceCollectionDay;
  const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (day && day >= 1 && day <= 7) {
    return `Weekly remittance every ${labels[day - 1]}`;
  }

  return 'Weekly remittance';
}
