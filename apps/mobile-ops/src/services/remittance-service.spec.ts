import { describe, expect, it, vi } from 'vitest';

vi.mock('../api', () => ({
  recordRemittance: vi.fn(),
}));

describe('remittance service helpers', async () => {
  const service = await import('./remittance-service');

  it('defaults to a 2-decimal currency multiplier when the minor unit is invalid', () => {
    expect(service.getCurrencyMultiplier(undefined)).toBe(100);
    expect(service.getCurrencyMultiplier(-1)).toBe(100);
  });

  it('converts major-unit remittance input into minor units', () => {
    expect(service.convertMajorToMinorUnits('1250.50', 2)).toBe(125050);
    expect(service.convertMajorToMinorUnits('1250', 0)).toBe(1250);
  });

  it('rejects zero, negative, and non-numeric remittance input', () => {
    expect(service.convertMajorToMinorUnits('0', 2)).toBeNull();
    expect(service.convertMajorToMinorUnits('-20', 2)).toBeNull();
    expect(service.convertMajorToMinorUnits('abc', 2)).toBeNull();
  });
});
