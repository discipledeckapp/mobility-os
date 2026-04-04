import { describe, expect, it } from 'vitest';
import {
  buildCreateDriverPayload,
  getVerificationSubmissionFeedback,
  sanitizeSelfServiceErrorMessage,
} from './action-helpers';

describe('driver action helpers', () => {
  it('requires fleet and email for driver creation', () => {
    const formData = new FormData();
    formData.set('fleetId', '');
    formData.set('email', '');

    expect(buildCreateDriverPayload(formData)).toEqual({
      error: 'Fleet and email are required.',
    });
  });

  it('builds a normalized driver creation payload from form data', () => {
    const formData = new FormData();
    formData.set('fleetId', ' fleet_123 ');
    formData.set('email', ' driver@example.com ');
    formData.set('firstName', ' Kelechi ');
    formData.set('lastName', ' Nwafor ');
    formData.set('phone', ' 08030000000 ');
    formData.set('dateOfBirth', '1992-10-12');
    formData.set('nationality', ' ng ');

    expect(buildCreateDriverPayload(formData)).toEqual({
      payload: {
        fleetId: 'fleet_123',
        email: 'driver@example.com',
        firstName: 'Kelechi',
        lastName: 'Nwafor',
        phone: '08030000000',
        dateOfBirth: '1992-10-12',
        nationality: 'NG',
      },
    });
  });

  it('maps no-match verification outcomes to a driver-safe message', () => {
    expect(
      getVerificationSubmissionFeedback({
        decision: 'failed',
        providerLookupStatus: 'no_match',
      } as never),
    ).toEqual({
      error: 'The ID details did not match this driver. Check the ID number and try again.',
    });
  });

  it('maps successful verification outcomes to a success message', () => {
    expect(
      getVerificationSubmissionFeedback({
        decision: 'verified',
        isVerifiedMatch: true,
      } as never),
    ).toEqual({
      success: 'Identity verification completed successfully.',
    });
  });

  it('sanitizes infrastructure failures into a retryable user message', () => {
    expect(
      sanitizeSelfServiceErrorMessage('Intelligence service fetch failed with status 500'),
    ).toBe(
      'We could not complete this verification request right now. Your submission was not finalized. Please try again shortly.',
    );
  });
});
