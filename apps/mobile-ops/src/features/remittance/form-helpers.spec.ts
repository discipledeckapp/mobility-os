import { describe, expect, it } from 'vitest';
import { describeVariance } from './form-helpers';

describe('describeVariance', () => {
  it('returns null when no variance can be computed', () => {
    expect(describeVariance(null)).toBeNull();
  });

  it('distinguishes exact, over, and under remittance amounts', () => {
    expect(describeVariance(0)).toEqual({
      direction: 'exact',
      absoluteMinorUnits: 0,
    });
    expect(describeVariance(350)).toEqual({
      direction: 'over',
      absoluteMinorUnits: 350,
    });
    expect(describeVariance(-125)).toEqual({
      direction: 'under',
      absoluteMinorUnits: 125,
    });
  });
});
