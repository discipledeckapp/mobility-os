import type { RemittanceRecord } from '../../api';

export function summarizeRemittanceHistory(history: RemittanceRecord[]) {
  return {
    totalMinorUnits: history.reduce((sum, record) => sum + record.amountMinorUnits, 0),
    pendingMinorUnits: history
      .filter((record) => record.status === 'pending')
      .reduce((sum, record) => sum + record.amountMinorUnits, 0),
    settledMinorUnits: history
      .filter((record) => record.status === 'completed' || record.status === 'partially_settled')
      .reduce((sum, record) => sum + record.amountMinorUnits, 0),
    outstandingMinorUnits: history.reduce(
      (sum, record) => sum + (record.reconciliation?.outstandingBalanceMinorUnits ?? 0),
      0,
    ),
  };
}

export function historyTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'completed' || status === 'partially_settled') {
    return 'success';
  }
  if (status === 'disputed' || status === 'cancelled_due_to_assignment_end') {
    return 'danger';
  }
  if (status === 'pending') {
    return 'warning';
  }
  return 'neutral';
}
