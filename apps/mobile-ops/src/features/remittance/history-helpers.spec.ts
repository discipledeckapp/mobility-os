import { describe, expect, it } from 'vitest';
import { historyTone, summarizeRemittanceHistory } from './history-helpers';

describe('history helpers', () => {
  it('summarizes remittance totals across statuses', () => {
    const summary = summarizeRemittanceHistory([
      {
        id: 'r1',
        amountMinorUnits: 1000,
        status: 'pending',
        reconciliation: { outstandingBalanceMinorUnits: 1000 },
      },
      {
        id: 'r2',
        amountMinorUnits: 2000,
        status: 'partially_settled',
        reconciliation: { outstandingBalanceMinorUnits: 200 },
      },
      {
        id: 'r3',
        amountMinorUnits: 3000,
        status: 'completed',
        reconciliation: { outstandingBalanceMinorUnits: 0 },
      },
    ] as never);

    expect(summary).toEqual({
      totalMinorUnits: 6000,
      pendingMinorUnits: 1000,
      settledMinorUnits: 5000,
      outstandingMinorUnits: 1200,
    });
  });

  it('maps remittance statuses to badge tones', () => {
    expect(historyTone('completed')).toBe('success');
    expect(historyTone('pending')).toBe('warning');
    expect(historyTone('disputed')).toBe('danger');
    expect(historyTone('draft')).toBe('neutral');
  });
});
