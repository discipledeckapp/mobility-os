import { describe, expect, it } from 'vitest';
import {
  getFriendlyRemittanceErrorMessage,
  summarizeRemittanceAttention,
  supportsRemittance,
} from './view-helpers';

describe('remittance view helpers', () => {
  it('masks migration-style backend failures with a user-safe message', () => {
    expect(
      getFriendlyRemittanceErrorMessage('Prisma error: required database table missing'),
    ).toBe('We could not load remittance records right now. Please try again shortly.');
  });

  it('keeps ordinary remittance errors intact', () => {
    expect(getFriendlyRemittanceErrorMessage('Network timeout')).toBe('Network timeout');
  });

  it('treats remittance and hire-purchase assignments as supported', () => {
    expect(supportsRemittance('remittance')).toBe(true);
    expect(supportsRemittance('hire_purchase')).toBe(true);
    expect(supportsRemittance('salary')).toBe(false);
  });

  it('summarizes overdue, partial, and outstanding remittances', () => {
    const summary = summarizeRemittanceAttention(
      [
        {
          id: 'r1',
          status: 'pending',
          dueDate: '2026-04-01',
          amountMinorUnits: 1000,
          currency: 'NGN',
          assignmentId: 'assignment_1',
          createdAt: '2026-04-02T00:00:00.000Z',
          reconciliation: { outstandingBalanceMinorUnits: 500 },
        },
        {
          id: 'r2',
          status: 'partially_settled',
          dueDate: '2026-04-04',
          amountMinorUnits: 2000,
          currency: 'NGN',
          assignmentId: 'assignment_2',
          createdAt: '2026-04-03T00:00:00.000Z',
          reconciliation: { outstandingBalanceMinorUnits: 250 },
        },
      ] as never,
      '2026-04-04',
    );

    expect(summary).toEqual({
      overdueCount: 1,
      partiallySettledCount: 1,
      outstandingMinorUnits: 750,
    });
  });
});
