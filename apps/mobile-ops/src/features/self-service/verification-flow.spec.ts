import { describe, expect, it } from 'vitest';
import {
  buildDriverOnboardingSteps,
  isDriverOnboardingComplete,
  resolveNextDriverAction,
} from './verification-flow';

describe('mobile self-service verification flow', () => {
  it('keeps full-trust onboarding incomplete while guarantor is still missing', () => {
    const driver = {
      hasMobileAccess: true,
      verificationTierComponents: ['identity', 'guarantor', 'drivers_license'],
      identityStatus: 'verified',
      hasGuarantor: false,
      hasApprovedLicence: true,
    };

    const steps = buildDriverOnboardingSteps(driver as never);

    expect(steps.find((step) => step.key === 'guarantor')).toMatchObject({
      required: true,
      status: 'pending',
    });
    expect(isDriverOnboardingComplete(driver as never)).toBe(false);
  });

  it('routes the next action to guarantor capture when guarantor is the remaining blocker', () => {
    const driver = {
      hasMobileAccess: true,
      verificationTierComponents: ['identity', 'guarantor'],
      identityStatus: 'verified',
      hasGuarantor: false,
      hasApprovedLicence: false,
      verificationPaymentStatus: 'ready',
      verificationTierLabel: 'Full Trust',
      driverPaysKyc: true,
    };

    expect(resolveNextDriverAction(driver as never, 0)).toMatchObject({
      target: 'DriverGuarantor',
      cta: 'Add guarantor',
    });
  });

  it('routes payment-gated verification back into the self-service verification flow', () => {
    const driver = {
      hasMobileAccess: true,
      verificationTierComponents: ['identity'],
      identityStatus: 'unverified',
      hasGuarantor: false,
      hasApprovedLicence: false,
      verificationPaymentStatus: 'driver_payment_required',
      verificationTierLabel: 'Verified identity',
      driverPaysKyc: true,
    };

    expect(resolveNextDriverAction(driver as never, 0)).toMatchObject({
      target: 'SelfServiceVerification',
      cta: 'Continue verification',
    });
  });
});
