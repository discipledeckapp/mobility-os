import type { RemittanceRecord } from '../../lib/api-core';

export function getFriendlyRemittanceErrorMessage(message: string | null): string | null {
  if (!message) {
    return null;
  }

  const normalized = message.toLowerCase();
  if (
    normalized.includes('required database table') ||
    normalized.includes('migration') ||
    normalized.includes('prisma')
  ) {
    return 'We could not load remittance records right now. Please try again shortly.';
  }

  return message;
}

export function supportsRemittance(paymentModel?: string | null): boolean {
  return !paymentModel || paymentModel === 'remittance' || paymentModel === 'hire_purchase';
}

export function summarizeRemittanceAttention(
  remittances: RemittanceRecord[],
  todayIso: string,
): {
  overdueCount: number;
  partiallySettledCount: number;
  outstandingMinorUnits: number;
} {
  return {
    overdueCount: remittances.filter(
      (remittance) =>
        ['pending', 'disputed'].includes(remittance.status) && remittance.dueDate < todayIso,
    ).length,
    partiallySettledCount: remittances.filter(
      (remittance) => remittance.status === 'partially_settled',
    ).length,
    outstandingMinorUnits: remittances.reduce(
      (sum, remittance) => sum + (remittance.reconciliation?.outstandingBalanceMinorUnits ?? 0),
      0,
    ),
  };
}
