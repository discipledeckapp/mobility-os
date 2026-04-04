import type {
  CreateDriverInput,
  DriverIdentityResolutionResult,
} from '../../lib/api-core';

export interface ResolveDriverVerificationFeedback {
  error?: string;
  success?: string;
}

function getTrimmedValue(formData: FormData, key: keyof CreateDriverInput): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export function sanitizeSelfServiceErrorMessage(message: string): string {
  const normalized = message.toLowerCase();
  if (
    normalized.includes('no_match') ||
    normalized.includes('did not match') ||
    normalized.includes('validation_mismatch')
  ) {
    return 'The ID details did not match this driver. Check the ID number and try again.';
  }
  if (
    normalized.includes('live_selfie_required') ||
    normalized.includes('liveness') ||
    normalized.includes('live selfie')
  ) {
    return 'We could not confirm the live selfie for this submission. Retake the selfie and try again.';
  }
  if (
    normalized.includes('intelligence service') ||
    normalized.includes('fetch failed') ||
    normalized.includes('networkerror') ||
    normalized.includes('econnrefused') ||
    normalized.includes('temporarily unavailable') ||
    normalized.includes('status 500')
  ) {
    return 'We could not complete this verification request right now. Your submission was not finalized. Please try again shortly.';
  }
  return message;
}

export function getVerificationSubmissionFeedback(
  result: DriverIdentityResolutionResult,
): ResolveDriverVerificationFeedback {
  if (result.livenessPassed === false) {
    return {
      error:
        result.livenessReason?.trim() ||
        'We could not confirm the live selfie for this submission. Retake the selfie and try again.',
    };
  }

  if (
    (result.providerVerificationStatus === 'live_selfie_required' &&
      result.livenessPassed !== true) ||
    result.providerVerificationStatus === 'validation_mismatch'
  ) {
    return {
      error:
        result.providerVerificationStatus === 'live_selfie_required'
          ? 'We could not confirm the live selfie for this submission. Retake the selfie and try again.'
          : 'The ID details did not match this driver. Check the ID number and try again.',
    };
  }

  if (result.providerPending) {
    return {
      success:
        'Identity verification was submitted successfully. The provider result is still being recovered.',
    };
  }

  if (result.decision === 'failed' || result.providerLookupStatus === 'no_match') {
    return {
      error:
        result.providerLookupStatus === 'no_match'
          ? 'The ID details did not match this driver. Check the ID number and try again.'
          : 'Identity verification failed. Confirm the identifier and live selfie, then try again.',
    };
  }

  if (
    result.decision === 'review_needed' ||
    result.decision === 'review_required' ||
    result.providerLookupStatus === 'manual_review'
  ) {
    return {
      success: 'Identity verification was submitted and is now awaiting review.',
    };
  }

  if (result.isVerifiedMatch === true || result.decision === 'verified') {
    return {
      success: 'Identity verification completed successfully.',
    };
  }

  return {
    success: 'Identity verification was submitted and is still being processed.',
  };
}

export function buildCreateDriverPayload(
  formData: FormData,
): { payload?: CreateDriverInput; error?: string } {
  const fleetId = getTrimmedValue(formData, 'fleetId');
  const email = getTrimmedValue(formData, 'email');

  if (!fleetId || !email) {
    return { error: 'Fleet and email are required.' };
  }

  const payload: CreateDriverInput = { fleetId, email };

  const firstName = getTrimmedValue(formData, 'firstName');
  const lastName = getTrimmedValue(formData, 'lastName');
  const phone = getTrimmedValue(formData, 'phone');
  const dateOfBirth = getTrimmedValue(formData, 'dateOfBirth');
  const nationality = getTrimmedValue(formData, 'nationality').toUpperCase();

  if (firstName) payload.firstName = firstName;
  if (lastName) payload.lastName = lastName;
  if (phone) payload.phone = phone;
  if (dateOfBirth) payload.dateOfBirth = dateOfBirth;
  if (nationality) payload.nationality = nationality;

  return { payload };
}
