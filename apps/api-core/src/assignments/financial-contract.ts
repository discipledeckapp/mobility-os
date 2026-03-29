import {
  normalizeRemittanceFrequency,
  toIsoDate,
  type RemittanceFrequency,
} from '@mobility-os/domain-config';
import { BadRequestException } from '@nestjs/common';

const SUCCESSFUL_REMITTANCE_STATUSES = new Set(['completed', 'partially_settled']);
const NON_CANCELLED_REMITTANCE_STATUSES = new Set(['pending', 'completed', 'partially_settled', 'disputed']);

export type AssignmentContractType = 'regular_hire' | 'hire_purchase';
export type AssignmentPaymentModel =
  | 'remittance'
  | 'salary'
  | 'commission'
  | 'hire_purchase';

export interface AssignmentContractSchedule {
  frequency: RemittanceFrequency;
  startDate: string;
  collectionDay?: number | null;
}

export interface AssignmentContractInstallmentPlan {
  periodCount?: number | null;
  contractEndDate?: string | null;
  baseInstallmentAmountMinorUnits: number;
  finalInstallmentAmountMinorUnits: number;
  generatedFromTarget: boolean;
}

export interface AssignmentFinancialContractSnapshot {
  version: string;
  contractType: AssignmentContractType;
  paymentModel: AssignmentPaymentModel;
  currency: string;
  schedule: AssignmentContractSchedule;
  display: {
    summaryLabel: string;
    expectedRemittanceTerms: string;
  };
  regularHire?: {
    expectedPerPeriodAmountMinorUnits: number;
  };
  hirePurchase?: {
    principalAmountMinorUnits?: number | null;
    totalTargetAmountMinorUnits: number;
    depositAmountMinorUnits?: number | null;
    installmentPlan: AssignmentContractInstallmentPlan;
  };
  obligations: string[];
  generatedAt: string;
}

export interface AssignmentFinancialContractSummary {
  contractType: AssignmentContractType;
  scheduleLabel: string;
  expectedPerPeriodAmountMinorUnits: number;
  actualForCurrentPeriodMinorUnits: number;
  currentPeriodVarianceMinorUnits: number;
  currentPeriodStatus: 'complete' | 'partial' | 'late' | 'pending';
  currentPeriodDueDate?: string | null;
  nextDueDate?: string | null;
  nextDueAmountMinorUnits?: number | null;
  cumulativeRecordedAmountMinorUnits: number;
  cumulativePaidAmountMinorUnits: number;
  cumulativeExpectedAmountMinorUnits: number;
  outstandingBalanceMinorUnits?: number | null;
  contractCompletionPercentage?: number | null;
  overduePeriods: number;
  missedPeriods: number;
  partialPeriods: number;
  contractStatus: 'active' | 'overdue' | 'completed' | 'terminated';
  ownershipTransferEligible: boolean;
  riskSignals: string[];
}

export interface AssignmentFinancialContractView {
  version: string;
  contractType: AssignmentContractType;
  currency: string;
  schedule: AssignmentContractSchedule;
  display: AssignmentFinancialContractSnapshot['display'];
  regularHire?: AssignmentFinancialContractSnapshot['regularHire'];
  hirePurchase?: AssignmentFinancialContractSnapshot['hirePurchase'];
  obligations: string[];
  summary: AssignmentFinancialContractSummary;
}

type RemittanceLike = {
  dueDate: string;
  amountMinorUnits: number;
  status: string;
};

interface FinancialContractInput {
  paymentModel?: string | null;
  contractType?: string | null;
  remittanceModel?: string | null;
  remittanceFrequency?: string | null;
  remittanceAmountMinorUnits?: number | null;
  remittanceCurrency?: string | null;
  remittanceStartDate?: string | null;
  remittanceCollectionDay?: number | null;
  totalTargetAmountMinorUnits?: number | null;
  principalAmountMinorUnits?: number | null;
  depositAmountMinorUnits?: number | null;
  contractDurationPeriods?: number | null;
  contractEndDate?: string | null;
}

interface FinancialContractNormalizationResult {
  paymentModel: AssignmentPaymentModel;
  topLevelPlan: {
    remittanceModel: 'fixed' | 'hire_purchase' | null;
    remittanceFrequency: RemittanceFrequency | null;
    remittanceAmountMinorUnits: number | null;
    remittanceCurrency: string | null;
    remittanceStartDate: string | null;
    remittanceCollectionDay: number | null;
  };
  snapshot: AssignmentFinancialContractSnapshot | null;
}

interface ScheduledPeriod {
  dueDate: string;
  expectedAmountMinorUnits: number;
  paidAmountMinorUnits: number;
  recordedAmountMinorUnits: number;
  status: 'complete' | 'partial' | 'late' | 'pending';
}

function parseIsoDate(value?: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const parts = value.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  const next = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(next.getTime()) ? null : next;
}

function formatFrequencyLabel(
  frequency: RemittanceFrequency,
  startDate: string,
  collectionDay?: number | null,
): string {
  if (frequency === 'daily') {
    return 'Daily';
  }

  if (frequency === 'weekly') {
    const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (collectionDay && collectionDay >= 1 && collectionDay <= 7) {
      return `Weekly every ${labels[collectionDay - 1]}`;
    }
    return 'Weekly';
  }

  const anchorDate = parseIsoDate(startDate);
  const dayOfMonth = anchorDate?.getUTCDate() ?? 1;
  return `Monthly on day ${dayOfMonth}`;
}

function addSchedulePeriods(
  startDate: string,
  frequency: RemittanceFrequency,
  periods: number,
  collectionDay?: number | null,
): string[] {
  const start = parseIsoDate(startDate);
  if (!start || periods < 1) {
    return [];
  }

  const dates: string[] = [];
  let cursor = new Date(start);

  if (frequency === 'weekly' && collectionDay && collectionDay >= 1 && collectionDay <= 7) {
    const jsWeekday = cursor.getUTCDay() === 0 ? 7 : cursor.getUTCDay();
    const diff = (collectionDay - jsWeekday + 7) % 7;
    cursor.setUTCDate(cursor.getUTCDate() + diff);
  }

  for (let index = 0; index < periods; index += 1) {
    dates.push(toIsoDate(cursor));
    if (frequency === 'daily') {
      cursor = new Date(cursor);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      continue;
    }
    if (frequency === 'weekly') {
      cursor = new Date(cursor);
      cursor.setUTCDate(cursor.getUTCDate() + 7);
      continue;
    }

    const anchorDay = start.getUTCDate();
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + 1;
    const nextMonth = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth() + 1, 0));
    const nextDay = Math.min(anchorDay, lastDay.getUTCDate());
    cursor = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), nextDay));
  }

  return dates;
}

function calculatePeriodCountFromEndDate(
  startDate: string,
  endDate: string,
  frequency: RemittanceFrequency,
  collectionDay?: number | null,
): number | null {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end || end < start) {
    return null;
  }

  for (let periods = 1; periods <= 400; periods += 1) {
    const dueDates = addSchedulePeriods(startDate, frequency, periods, collectionDay);
    const lastDueDate = dueDates[dueDates.length - 1];
    if (!lastDueDate) {
      return null;
    }
    if (lastDueDate >= endDate) {
      return periods;
    }
  }

  return null;
}

function buildInstallmentPlan(input: {
  totalTargetAmountMinorUnits: number;
  startDate: string;
  frequency: RemittanceFrequency;
  collectionDay?: number | null;
  contractDurationPeriods?: number | null;
  contractEndDate?: string | null;
}): AssignmentContractInstallmentPlan {
  const periodCount =
    input.contractDurationPeriods && input.contractDurationPeriods > 0
      ? input.contractDurationPeriods
      : input.contractEndDate
        ? calculatePeriodCountFromEndDate(
            input.startDate,
            input.contractEndDate,
            input.frequency,
            input.collectionDay,
          )
        : null;

  if (!periodCount || periodCount < 1) {
    throw new BadRequestException(
      'Hire purchase contracts require either contractDurationPeriods or contractEndDate.',
    );
  }

  const baseInstallmentAmountMinorUnits = Math.floor(
    input.totalTargetAmountMinorUnits / periodCount,
  );
  const finalInstallmentAmountMinorUnits =
    input.totalTargetAmountMinorUnits -
    baseInstallmentAmountMinorUnits * Math.max(periodCount - 1, 0);
  const dueDates = addSchedulePeriods(
    input.startDate,
    input.frequency,
    periodCount,
    input.collectionDay,
  );

  return {
    periodCount,
    contractEndDate: dueDates[dueDates.length - 1] ?? input.contractEndDate ?? input.startDate,
    baseInstallmentAmountMinorUnits,
    finalInstallmentAmountMinorUnits,
    generatedFromTarget: true,
  };
}

function buildExpectedTermsLabel(snapshot: AssignmentFinancialContractSnapshot): string {
  const scheduleLabel = formatFrequencyLabel(
    snapshot.schedule.frequency,
    snapshot.schedule.startDate,
    snapshot.schedule.collectionDay,
  );
  if (snapshot.contractType === 'hire_purchase' && snapshot.hirePurchase) {
    return `${snapshot.hirePurchase.installmentPlan.baseInstallmentAmountMinorUnits} ${snapshot.currency} ${scheduleLabel.toLowerCase()} toward ${snapshot.hirePurchase.totalTargetAmountMinorUnits} starting ${snapshot.schedule.startDate}`;
  }
  return `${snapshot.regularHire?.expectedPerPeriodAmountMinorUnits ?? 0} ${snapshot.currency} ${scheduleLabel.toLowerCase()} starting ${snapshot.schedule.startDate}`;
}

function getContractType(input: FinancialContractInput): AssignmentContractType {
  if (input.contractType?.trim().toLowerCase() === 'hire_purchase') {
    return 'hire_purchase';
  }
  if (input.remittanceModel?.trim().toLowerCase() === 'hire_purchase') {
    return 'hire_purchase';
  }
  return 'regular_hire';
}

export function resolveAssignmentPaymentModel(input: {
  paymentModel?: string | null;
  contractType?: string | null;
  remittanceModel?: string | null;
}): AssignmentPaymentModel {
  const normalizedPaymentModel = input.paymentModel?.trim().toLowerCase() ?? null;
  if (normalizedPaymentModel === 'salary') {
    return 'salary';
  }
  if (normalizedPaymentModel === 'commission') {
    return 'commission';
  }
  if (normalizedPaymentModel === 'hire_purchase') {
    return 'hire_purchase';
  }
  if (normalizedPaymentModel === 'remittance') {
    return 'remittance';
  }

  if (input.contractType?.trim().toLowerCase() === 'hire_purchase') {
    return 'hire_purchase';
  }
  if (input.remittanceModel?.trim().toLowerCase() === 'hire_purchase') {
    return 'hire_purchase';
  }
  return 'remittance';
}

export function assignmentSupportsRemittance(input: {
  paymentModel?: string | null;
  contractType?: string | null;
  remittanceModel?: string | null;
}): boolean {
  const paymentModel = resolveAssignmentPaymentModel(input);
  return paymentModel === 'remittance' || paymentModel === 'hire_purchase';
}

export function normalizeFinancialContract(
  tenantCurrency: string,
  input: FinancialContractInput,
): FinancialContractNormalizationResult {
  const paymentModel = resolveAssignmentPaymentModel(input);
  if (paymentModel === 'salary' || paymentModel === 'commission') {
    return {
      paymentModel,
      topLevelPlan: {
        remittanceModel: null,
        remittanceFrequency: null,
        remittanceAmountMinorUnits: null,
        remittanceCurrency: null,
        remittanceStartDate: null,
        remittanceCollectionDay: null,
      },
      snapshot: null,
    };
  }

  const contractType = getContractType(input);
  const frequency = normalizeRemittanceFrequency(input.remittanceFrequency ?? 'daily');
  if (!frequency) {
    throw new BadRequestException('remittanceFrequency must be daily, weekly, or monthly.');
  }

  const remittanceCurrency = (input.remittanceCurrency ?? tenantCurrency).trim().toUpperCase();
  if (remittanceCurrency !== tenantCurrency.toUpperCase()) {
    throw new BadRequestException(
      `Assignment remittance currency must be '${tenantCurrency}' for this organisation.`,
    );
  }

  const startDate = input.remittanceStartDate ?? toIsoDate(new Date());
  if (!parseIsoDate(startDate)) {
    throw new BadRequestException('remittanceStartDate must be YYYY-MM-DD.');
  }

  const collectionDay =
    frequency === 'weekly' ? (input.remittanceCollectionDay ?? null) : null;
  if (
    frequency === 'weekly' &&
    (!collectionDay || collectionDay < 1 || collectionDay > 7)
  ) {
    throw new BadRequestException(
      'Weekly remittance plans require remittanceCollectionDay between 1 and 7.',
    );
  }

  if (contractType === 'hire_purchase') {
    const totalTargetAmountMinorUnits = input.totalTargetAmountMinorUnits ?? null;
    if (!totalTargetAmountMinorUnits || totalTargetAmountMinorUnits < 1) {
      throw new BadRequestException(
        'Hire purchase contracts require totalTargetAmountMinorUnits to be greater than 0.',
      );
    }
    const depositAmountMinorUnits = input.depositAmountMinorUnits ?? null;
    if (depositAmountMinorUnits !== null && depositAmountMinorUnits < 0) {
      throw new BadRequestException('depositAmountMinorUnits cannot be negative.');
    }
    const principalAmountMinorUnits = input.principalAmountMinorUnits ?? null;
    if (principalAmountMinorUnits !== null && principalAmountMinorUnits < 1) {
      throw new BadRequestException('principalAmountMinorUnits must be greater than 0 when provided.');
    }

    const installmentPlan = buildInstallmentPlan({
      totalTargetAmountMinorUnits,
      startDate,
      frequency,
      collectionDay,
      contractDurationPeriods: input.contractDurationPeriods ?? null,
      contractEndDate: input.contractEndDate ?? null,
    });

    const snapshot: AssignmentFinancialContractSnapshot = {
      version: '2026-03-29',
      contractType,
      paymentModel,
      currency: remittanceCurrency,
      schedule: {
        frequency,
        startDate,
        ...(collectionDay ? { collectionDay } : {}),
      },
      display: {
        summaryLabel: 'Hire purchase contract',
        expectedRemittanceTerms: '',
      },
      hirePurchase: {
        ...(principalAmountMinorUnits ? { principalAmountMinorUnits } : {}),
        totalTargetAmountMinorUnits,
        ...(depositAmountMinorUnits ? { depositAmountMinorUnits } : {}),
        installmentPlan,
      },
      obligations: [
        'Submit each installment according to the repayment schedule.',
        'Keep remittance records accurate so progress and balance remain transparent.',
        'Outstanding balances continue until the total target amount is fully cleared.',
      ],
      generatedAt: new Date().toISOString(),
    };
    snapshot.display.expectedRemittanceTerms = buildExpectedTermsLabel(snapshot);

    return {
      paymentModel,
      topLevelPlan: {
        remittanceModel: 'hire_purchase',
        remittanceFrequency: frequency,
        remittanceAmountMinorUnits: installmentPlan.baseInstallmentAmountMinorUnits,
        remittanceCurrency,
        remittanceStartDate: startDate,
        remittanceCollectionDay: collectionDay,
      },
      snapshot,
    };
  }

  if (!input.remittanceAmountMinorUnits || input.remittanceAmountMinorUnits < 1) {
    throw new BadRequestException('remittanceAmountMinorUnits must be greater than 0.');
  }

  const snapshot: AssignmentFinancialContractSnapshot = {
    version: '2026-03-29',
    contractType,
    paymentModel,
    currency: remittanceCurrency,
    schedule: {
      frequency,
      startDate,
      ...(collectionDay ? { collectionDay } : {}),
    },
    display: {
      summaryLabel: 'Regular hire remittance plan',
      expectedRemittanceTerms: '',
    },
    regularHire: {
      expectedPerPeriodAmountMinorUnits: input.remittanceAmountMinorUnits,
    },
    obligations: [
      'Submit remittance using the agreed schedule or record an exception with evidence.',
      'Report incidents, partial-day returns, and disputes with transparent notes.',
      'Keep assignment and remittance records aligned to the collection period.',
    ],
    generatedAt: new Date().toISOString(),
  };
  snapshot.display.expectedRemittanceTerms = buildExpectedTermsLabel(snapshot);

  return {
    paymentModel,
    topLevelPlan: {
      remittanceModel: 'fixed',
      remittanceFrequency: frequency,
      remittanceAmountMinorUnits: input.remittanceAmountMinorUnits,
      remittanceCurrency,
      remittanceStartDate: startDate,
      remittanceCollectionDay: collectionDay,
    },
    snapshot,
  };
}

export function parseFinancialContractSnapshot(
  rawSnapshot: unknown,
  fallback: {
    paymentModel?: string | null;
    remittanceModel?: string | null;
    remittanceFrequency?: string | null;
    remittanceAmountMinorUnits?: number | null;
    remittanceCurrency?: string | null;
    remittanceStartDate?: string | null;
    remittanceCollectionDay?: number | null;
  },
): AssignmentFinancialContractSnapshot | null {
  if (
    rawSnapshot &&
    typeof rawSnapshot === 'object' &&
    'contractType' in rawSnapshot &&
    'schedule' in rawSnapshot
  ) {
    return rawSnapshot as AssignmentFinancialContractSnapshot;
  }

  if (!assignmentSupportsRemittance(fallback)) {
    return null;
  }

  const frequency = normalizeRemittanceFrequency(fallback.remittanceFrequency ?? null);
  const remittanceAmountMinorUnits = fallback.remittanceAmountMinorUnits ?? null;
  const remittanceCurrency = fallback.remittanceCurrency ?? null;
  const remittanceStartDate = fallback.remittanceStartDate ?? null;
  if (!frequency || !remittanceAmountMinorUnits || !remittanceCurrency || !remittanceStartDate) {
    return null;
  }

  return normalizeFinancialContract(remittanceCurrency, {
    paymentModel: fallback.paymentModel ?? null,
    remittanceModel: fallback.remittanceModel ?? 'fixed',
    remittanceFrequency: frequency,
    remittanceAmountMinorUnits,
    remittanceCurrency,
    remittanceStartDate,
    remittanceCollectionDay: fallback.remittanceCollectionDay ?? null,
  }).snapshot;
}

function getPeriodCount(snapshot: AssignmentFinancialContractSnapshot, remittances: RemittanceLike[]): number {
  if (snapshot.contractType === 'hire_purchase') {
    return snapshot.hirePurchase?.installmentPlan.periodCount ?? 0;
  }

  const anchorDate = snapshot.schedule.startDate;
  const sortedDueDates = remittances
    .map((remittance) => remittance.dueDate)
    .filter((dueDate) => dueDate >= anchorDate)
    .sort();
  const lastDueDate = sortedDueDates[sortedDueDates.length - 1] ?? toIsoDate(new Date());
  const parsedLast = parseIsoDate(lastDueDate);
  const parsedStart = parseIsoDate(anchorDate);
  if (!parsedStart || !parsedLast) {
    return 1;
  }

  const maxPeriods =
    snapshot.schedule.frequency === 'daily'
      ? Math.min(
          Math.max(
            Math.floor((parsedLast.getTime() - parsedStart.getTime()) / (24 * 60 * 60 * 1000)) + 2,
            1,
          ),
          400,
        )
      : snapshot.schedule.frequency === 'weekly'
        ? Math.min(
            Math.max(
              Math.floor((parsedLast.getTime() - parsedStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 2,
              1,
            ),
            200,
          )
        : 120;

  return maxPeriods;
}

function getExpectedAmountForPeriod(
  snapshot: AssignmentFinancialContractSnapshot,
  periodIndex: number,
): number {
  if (snapshot.contractType === 'hire_purchase' && snapshot.hirePurchase) {
    const periodCount = snapshot.hirePurchase.installmentPlan.periodCount ?? 1;
    if (periodIndex === periodCount - 1) {
      return snapshot.hirePurchase.installmentPlan.finalInstallmentAmountMinorUnits;
    }
    return snapshot.hirePurchase.installmentPlan.baseInstallmentAmountMinorUnits;
  }
  return snapshot.regularHire?.expectedPerPeriodAmountMinorUnits ?? 0;
}

function buildScheduledPeriods(
  snapshot: AssignmentFinancialContractSnapshot,
  remittances: RemittanceLike[],
  today = new Date(),
): ScheduledPeriod[] {
  const periodCount = getPeriodCount(snapshot, remittances);
  const dueDates = addSchedulePeriods(
    snapshot.schedule.startDate,
    snapshot.schedule.frequency,
    periodCount,
    snapshot.schedule.collectionDay ?? null,
  );

  const recordedByDueDate = new Map<string, number>();
  const paidByDueDate = new Map<string, number>();
  for (const remittance of remittances) {
    if (NON_CANCELLED_REMITTANCE_STATUSES.has(remittance.status)) {
      recordedByDueDate.set(
        remittance.dueDate,
        (recordedByDueDate.get(remittance.dueDate) ?? 0) + remittance.amountMinorUnits,
      );
    }
    if (SUCCESSFUL_REMITTANCE_STATUSES.has(remittance.status)) {
      paidByDueDate.set(
        remittance.dueDate,
        (paidByDueDate.get(remittance.dueDate) ?? 0) + remittance.amountMinorUnits,
      );
    }
  }

  const todayIso = toIsoDate(today);

  return dueDates.map((dueDate, periodIndex) => {
    const expectedAmountMinorUnits = getExpectedAmountForPeriod(snapshot, periodIndex);
    const recordedAmountMinorUnits = recordedByDueDate.get(dueDate) ?? 0;
    const paidAmountMinorUnits = paidByDueDate.get(dueDate) ?? 0;
    let status: ScheduledPeriod['status'] = 'pending';
    if (paidAmountMinorUnits >= expectedAmountMinorUnits) {
      status = 'complete';
    } else if (recordedAmountMinorUnits > 0) {
      status = 'partial';
    } else if (dueDate < todayIso) {
      status = 'late';
    }
    return {
      dueDate,
      expectedAmountMinorUnits,
      recordedAmountMinorUnits,
      paidAmountMinorUnits,
      status,
    };
  });
}

export function summarizeFinancialContract(input: {
  assignmentStatus: string;
  snapshot: AssignmentFinancialContractSnapshot | null;
  remittances: RemittanceLike[];
  today?: Date;
}): AssignmentFinancialContractView | null {
  const snapshot = input.snapshot;
  if (!snapshot) {
    return null;
  }

  const scheduledPeriods = buildScheduledPeriods(snapshot, input.remittances, input.today);
  const currentPeriod =
    scheduledPeriods.find((period) => period.status !== 'complete') ??
    scheduledPeriods[scheduledPeriods.length - 1] ??
    null;
  const nextPeriod =
    scheduledPeriods.find((period) => period.status !== 'complete' && period.dueDate >= toIsoDate(input.today ?? new Date())) ??
    null;
  const cumulativeRecordedAmountMinorUnits =
    (snapshot.hirePurchase?.depositAmountMinorUnits ?? 0) +
    input.remittances
      .filter((remittance) => NON_CANCELLED_REMITTANCE_STATUSES.has(remittance.status))
      .reduce((sum, remittance) => sum + remittance.amountMinorUnits, 0);
  const cumulativePaidAmountMinorUnits =
    (snapshot.hirePurchase?.depositAmountMinorUnits ?? 0) +
    input.remittances
      .filter((remittance) => SUCCESSFUL_REMITTANCE_STATUSES.has(remittance.status))
      .reduce((sum, remittance) => sum + remittance.amountMinorUnits, 0);
  const cumulativeExpectedAmountMinorUnits = scheduledPeriods
    .filter((period) => period.dueDate <= toIsoDate(input.today ?? new Date()))
    .reduce((sum, period) => sum + period.expectedAmountMinorUnits, 0);
  const overduePeriods = scheduledPeriods.filter((period) => period.status === 'late').length;
  const partialPeriods = scheduledPeriods.filter((period) => period.status === 'partial').length;
  const missedPeriods = overduePeriods;
  const totalTargetAmountMinorUnits = snapshot.hirePurchase?.totalTargetAmountMinorUnits ?? null;
  const outstandingBalanceMinorUnits =
    totalTargetAmountMinorUnits !== null
      ? Math.max(totalTargetAmountMinorUnits - cumulativePaidAmountMinorUnits, 0)
      : null;
  const contractCompletionPercentage =
    totalTargetAmountMinorUnits && totalTargetAmountMinorUnits > 0
      ? Number(
          Math.min(
            100,
            Math.round((cumulativePaidAmountMinorUnits / totalTargetAmountMinorUnits) * 10000) / 100,
          ),
        )
      : null;
  const riskSignals: string[] = [];
  if (missedPeriods >= 2) {
    riskSignals.push('Repeated missed installments');
  }
  if (partialPeriods >= 2) {
    riskSignals.push('Repeated partial remittances');
  }
  if (outstandingBalanceMinorUnits !== null && overduePeriods > 0) {
    riskSignals.push('Outstanding contract balance is overdue');
  }
  if (
    outstandingBalanceMinorUnits !== null &&
    currentPeriod &&
    outstandingBalanceMinorUnits <= currentPeriod.expectedAmountMinorUnits
  ) {
    riskSignals.push('Contract is nearing completion');
  }
  if (outstandingBalanceMinorUnits === 0 && totalTargetAmountMinorUnits !== null) {
    riskSignals.push('Contract payoff completed');
  }

  let contractStatus: AssignmentFinancialContractSummary['contractStatus'] = 'active';
  if (['ended', 'cancelled', 'declined'].includes(input.assignmentStatus)) {
    contractStatus =
      totalTargetAmountMinorUnits !== null && outstandingBalanceMinorUnits === 0
        ? 'completed'
        : 'terminated';
  } else if (totalTargetAmountMinorUnits !== null && outstandingBalanceMinorUnits === 0) {
    contractStatus = 'completed';
  } else if (overduePeriods > 0) {
    contractStatus = 'overdue';
  }

  return {
    version: snapshot.version,
    contractType: snapshot.contractType,
    currency: snapshot.currency,
    schedule: snapshot.schedule,
    display: snapshot.display,
    ...(snapshot.regularHire ? { regularHire: snapshot.regularHire } : {}),
    ...(snapshot.hirePurchase ? { hirePurchase: snapshot.hirePurchase } : {}),
    obligations: snapshot.obligations,
    summary: {
      contractType: snapshot.contractType,
      scheduleLabel: formatFrequencyLabel(
        snapshot.schedule.frequency,
        snapshot.schedule.startDate,
        snapshot.schedule.collectionDay ?? null,
      ),
      expectedPerPeriodAmountMinorUnits:
        currentPeriod?.expectedAmountMinorUnits ??
        snapshot.regularHire?.expectedPerPeriodAmountMinorUnits ??
        snapshot.hirePurchase?.installmentPlan.baseInstallmentAmountMinorUnits ??
        0,
      actualForCurrentPeriodMinorUnits: currentPeriod?.paidAmountMinorUnits ?? 0,
      currentPeriodVarianceMinorUnits:
        (currentPeriod?.paidAmountMinorUnits ?? 0) - (currentPeriod?.expectedAmountMinorUnits ?? 0),
      currentPeriodStatus: currentPeriod?.status ?? 'pending',
      currentPeriodDueDate: currentPeriod?.dueDate ?? null,
      nextDueDate: nextPeriod?.dueDate ?? null,
      nextDueAmountMinorUnits: nextPeriod?.expectedAmountMinorUnits ?? null,
      cumulativeRecordedAmountMinorUnits,
      cumulativePaidAmountMinorUnits,
      cumulativeExpectedAmountMinorUnits,
      outstandingBalanceMinorUnits,
      contractCompletionPercentage,
      overduePeriods,
      missedPeriods,
      partialPeriods,
      contractStatus,
      ownershipTransferEligible:
        snapshot.contractType === 'hire_purchase' && outstandingBalanceMinorUnits === 0,
      riskSignals,
    },
  };
}

export function buildRemittanceReconciliation(input: {
  remittance: RemittanceLike;
  snapshot: AssignmentFinancialContractSnapshot | null;
  remittances: RemittanceLike[];
  assignmentStatus: string;
  today?: Date;
}) {
  const contract = summarizeFinancialContract({
    assignmentStatus: input.assignmentStatus,
    snapshot: input.snapshot,
    remittances: input.remittances,
    ...(input.today ? { today: input.today } : {}),
  });
  if (!contract) {
    return null;
  }

  const snapshot = input.snapshot;
  if (!snapshot) {
    return null;
  }

  const scheduledPeriods = buildScheduledPeriods(snapshot, input.remittances, input.today);
  const matchingPeriod = scheduledPeriods.find((period) => period.dueDate === input.remittance.dueDate);
  const expectedAmountMinorUnits = matchingPeriod?.expectedAmountMinorUnits ?? contract.summary.expectedPerPeriodAmountMinorUnits;
  const varianceMinorUnits = input.remittance.amountMinorUnits - expectedAmountMinorUnits;

  return {
    contractType: contract.contractType,
    expectedAmountMinorUnits,
    varianceMinorUnits,
    periodStatus:
      input.remittance.amountMinorUnits >= expectedAmountMinorUnits ? 'complete' : 'partial',
    cumulativePaidAmountMinorUnits: contract.summary.cumulativePaidAmountMinorUnits,
    outstandingBalanceMinorUnits: contract.summary.outstandingBalanceMinorUnits,
    contractCompletionPercentage: contract.summary.contractCompletionPercentage,
    contractStatus: contract.summary.contractStatus,
    nextDueDate: contract.summary.nextDueDate,
    nextDueAmountMinorUnits: contract.summary.nextDueAmountMinorUnits,
  };
}
