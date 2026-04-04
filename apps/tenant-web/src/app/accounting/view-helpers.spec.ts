import { describe, expect, it } from 'vitest';
import { getEntryTone, getNetProfitAccent } from './view-helpers';

describe('accounting view helpers', () => {
  it('maps ledger entry types to UI tones', () => {
    expect(getEntryTone('credit')).toBe('success');
    expect(getEntryTone('debit')).toBe('warning');
    expect(getEntryTone('reversal')).toBe('neutral');
  });

  it('highlights negative net profit as danger', () => {
    expect(getNetProfitAccent(100)).toBe('success');
    expect(getNetProfitAccent(-1)).toBe('danger');
  });
});
