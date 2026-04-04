import { describe, expect, it } from 'vitest';
import { buildIntelligencePersonsQuery, buildReviewCasesQuery } from './api-intelligence';

describe('api-intelligence query builders', () => {
  it('builds a compact persons query string from populated filters only', () => {
    expect(
      buildIntelligencePersonsQuery({
        q: 'ada',
        riskBand: 'high',
        reviewState: 'open',
        reverificationRequired: 'true',
      }),
    ).toBe('?q=ada&riskBand=high&reviewState=open&reverificationRequired=true');
  });

  it('returns an empty persons query when filters are blank', () => {
    expect(buildIntelligencePersonsQuery({ q: '', riskBand: '' })).toBe('');
  });

  it('builds a review-case query without malformed separators', () => {
    expect(buildReviewCasesQuery({ status: 'open', personId: 'person_1' })).toBe(
      '?status=open&personId=person_1',
    );
  });
});
