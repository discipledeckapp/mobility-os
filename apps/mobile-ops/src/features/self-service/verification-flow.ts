import type { DriverRecord } from '../../api';

export interface VerificationStepSummary {
  key: 'account' | 'identity' | 'guarantor' | 'drivers_license';
  label: string;
  required: boolean;
  status: 'completed' | 'pending' | 'not_required';
  message: string;
}

export function buildDriverOnboardingSteps(driver: DriverRecord): VerificationStepSummary[] {
  const steps: VerificationStepSummary[] = [
    {
      key: 'account',
      label: 'Sign-in account',
      required: true,
      status: driver.hasMobileAccess ? 'completed' : 'pending',
      message: driver.hasMobileAccess
        ? 'Your sign-in details are already linked.'
        : 'Create your sign-in details so you can resume onboarding anytime.',
    },
  ];

  const verificationComponents =
    driver.verificationComponents?.map((component) => ({
      key: component.key,
      label: component.label,
      required: component.required,
      status: component.status,
      message: component.message,
    })) ?? [];

  if (verificationComponents.length > 0) {
    return [...steps, ...verificationComponents];
  }

  const tierComponents = new Set(driver.verificationTierComponents ?? ['identity']);

  steps.push({
    key: 'identity',
    label: 'Identity',
    required: true,
    status:
      driver.identityStatus === 'verified' || driver.identityStatus === 'review_needed'
        ? 'completed'
        : 'pending',
    message:
      driver.identityStatus === 'verified'
        ? 'Your identity check has been completed.'
        : 'Confirm your ID number and live selfie to continue.',
  });

  steps.push({
    key: 'guarantor',
    label: 'Guarantor',
    required: tierComponents.has('guarantor'),
    status: tierComponents.has('guarantor')
      ? driver.hasGuarantor
        ? 'completed'
        : 'pending'
      : 'not_required',
    message: tierComponents.has('guarantor')
      ? driver.hasGuarantor
        ? 'Your guarantor details have been added.'
        : 'Add the guarantor requested by your organisation.'
      : 'Your organisation does not require a guarantor for this tier.',
  });

  steps.push({
    key: 'drivers_license',
    label: 'Driver licence',
    required: tierComponents.has('drivers_license'),
    status: tierComponents.has('drivers_license')
      ? driver.hasApprovedLicence
        ? 'completed'
        : 'pending'
      : 'not_required',
    message: tierComponents.has('drivers_license')
      ? driver.hasApprovedLicence
        ? 'Your licence has been approved.'
        : 'Upload and verify your driver licence.'
      : 'A licence review is not required for this tier.',
  });

  return steps;
}

export function resolveNextDriverAction(driver: DriverRecord, uploadedDocuments: number) {
  const steps = buildDriverOnboardingSteps(driver);
  const pendingRequiredStep = steps.find(
    (step) => step.required && step.status === 'pending' && step.key !== 'account',
  );

  if (!driver.hasMobileAccess) {
    return {
      title: 'Create your sign-in account',
      description: 'Set your email and password so you can save progress and return anytime.',
      cta: 'Create account',
      target: 'DriverAccountSetup' as const,
    };
  }

  if (
    driver.verificationPaymentStatus === 'driver_payment_required' ||
    driver.verificationPaymentStatus === 'wallet_missing' ||
    driver.verificationPaymentStatus === 'insufficient_balance' ||
    pendingRequiredStep?.key === 'identity'
  ) {
    return {
      title: `Complete ${driver.verificationTierLabel ?? 'verification'}`,
      description: driver.driverPaysKyc
        ? 'Finish payment if needed, then complete your identity check and live selfie.'
        : 'Continue the identity step for your organisation’s selected verification level.',
      cta: 'Continue verification',
      target: 'SelfServiceVerification' as const,
    };
  }

  if (pendingRequiredStep?.key === 'guarantor') {
    return {
      title: 'Add your guarantor',
      description: 'Your current verification level includes a guarantor step before readiness can be completed.',
      cta: 'Add guarantor',
      target: 'DriverGuarantor' as const,
    };
  }

  if (pendingRequiredStep?.key === 'drivers_license') {
    return {
      title: 'Upload your licence',
      description: 'Your organisation requires a verified licence for this onboarding flow.',
      cta: 'Open verification tasks',
      target: 'SelfServiceVerification' as const,
    };
  }

  return {
    title: uploadedDocuments > 0 ? 'Check readiness' : 'Upload required documents',
    description:
      uploadedDocuments > 0
        ? 'Your main onboarding steps are saved. Review the final readiness checklist before sign-in.'
        : 'Finish any remaining document uploads and review your readiness checklist.',
    cta: uploadedDocuments > 0 ? 'Open checklist' : 'Continue onboarding',
    target: uploadedDocuments > 0 ? ('SelfServiceReadiness' as const) : ('SelfServiceVerification' as const),
  };
}

export function isDriverOnboardingComplete(driver: DriverRecord): boolean {
  const requiredSteps = buildDriverOnboardingSteps(driver).filter((step) => step.required);
  return requiredSteps.every((step) => step.status === 'completed');
}
