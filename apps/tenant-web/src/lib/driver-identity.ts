import type { DriverIdentityResolutionResult, DriverRecord } from './api-core';

export type DriverIdentityTone = 'success' | 'warning' | 'danger' | 'neutral';

export function getDriverIdentityStatus(
  driver: Pick<DriverRecord, 'identityStatus' | 'hasResolvedIdentity'>,
  result?: Pick<DriverIdentityResolutionResult, 'decision' | 'personId' | 'isVerifiedMatch'>,
): string {
  if (driver.identityStatus === 'verified') {
    return 'verified';
  }

  if (result?.decision === 'review_required') {
    return 'review_needed';
  }

  if ('isVerifiedMatch' in (result ?? {}) && result?.isVerifiedMatch === true) {
    return 'verified';
  }

  if (result?.decision === 'rejected') {
    return 'failed';
  }

  return driver.identityStatus || 'unverified';
}

export function getDriverIdentityTone(status: string): DriverIdentityTone {
  if (status === 'verified') return 'success';
  if (status === 'review_needed' || status === 'pending_verification') return 'warning';
  if (status === 'failed') return 'danger';
  return 'neutral';
}

export function getDriverIdentityLabel(status: string): string {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'pending_verification':
      return 'Pending verification';
    case 'review_needed':
      return 'Review needed';
    case 'failed':
      return 'Failed';
    default:
      return 'Unverified';
  }
}
