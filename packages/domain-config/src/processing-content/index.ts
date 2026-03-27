export type ProcessingVariant =
  | 'verification'
  | 'payment'
  | 'upload'
  | 'reporting'
  | 'assignment'
  | 'remittance'
  | 'onboarding'
  | 'generic_action';

export interface ProcessingContentDefinition {
  title: string;
  message: string;
  steps: string[];
  tips: string[];
}

export const PROCESSING_CONTENT: Record<ProcessingVariant, ProcessingContentDefinition> = {
  verification: {
    title: 'Verifying your identity',
    message: 'We are processing the live capture, validating identity evidence, and reviewing risk signals.',
    steps: [
      'Capturing live selfie',
      'Validating face data',
      'Checking identity records',
      'Assessing risk signals',
      'Finalising verification',
    ],
    tips: [
      'Verified drivers move through onboarding with fewer avoidable delays.',
      'Clear identity evidence reduces manual review time.',
      'Keeping profile details accurate improves matching and risk checks.',
    ],
  },
  payment: {
    title: 'Confirming your payment',
    message: 'We are verifying the transaction, recording it securely, and updating access to the next onboarding step.',
    steps: [
      'Confirming transaction status',
      'Recording payment',
      'Updating onboarding access',
    ],
    tips: [
      'A confirmed payment is remembered, so you should not be asked to pay twice for the same step.',
      'Secure payment recording helps keep onboarding and wallet records consistent.',
    ],
  },
  upload: {
    title: 'Uploading your document',
    message: 'We are preparing the file, uploading it securely, and attaching it to the right operational record.',
    steps: [
      'Preparing file',
      'Uploading securely',
      'Validating file',
      'Attaching to record',
    ],
    tips: [
      'Up-to-date documents reduce activation and assignment delays.',
      'Clear files are easier to review and less likely to be rejected.',
    ],
  },
  reporting: {
    title: 'Preparing your dashboard',
    message: 'We are summarising operational data and shaping the latest insights for review.',
    steps: [
      'Loading dashboard context',
      'Summarising transactions',
      'Preparing insights',
    ],
    tips: [
      'Clear remittance trails improve dispute resolution and audit readiness.',
      'Operational reporting works best when driver and vehicle records stay current.',
    ],
  },
  assignment: {
    title: 'Updating assignment status',
    message: 'We are applying the assignment action and refreshing the operational record.',
    steps: [
      'Applying assignment action',
      'Refreshing assignment state',
      'Updating driver visibility',
    ],
    tips: [
      'Accurate assignment history reduces dispatch confusion and follow-up work.',
      'Readiness checks help prevent drivers from entering the wrong workflow too early.',
    ],
  },
  remittance: {
    title: 'Recording remittance',
    message: 'We are securing the remittance record and refreshing collections data.',
    steps: [
      'Validating remittance',
      'Recording collection',
      'Refreshing balances',
    ],
    tips: [
      'Consistent remittance logging reduces reconciliation gaps.',
      'Fresh wallet and remittance records improve collections visibility.',
    ],
  },
  onboarding: {
    title: 'Continuing onboarding',
    message: 'We are restoring your progress, loading the latest requirements, and preparing the next guided step.',
    steps: [
      'Restoring progress',
      'Loading current requirements',
      'Preparing next step',
    ],
    tips: [
      'Creating your account early lets you continue later without relying on the original invite link.',
      'Saving each onboarding step reduces rework if you need to pause and come back.',
    ],
  },
  generic_action: {
    title: 'Completing your action',
    message: 'We are saving your changes and refreshing the latest state.',
    steps: [
      'Saving changes',
      'Updating status',
      'Refreshing latest state',
    ],
    tips: [
      'Current records keep downstream workflows predictable and easier to audit.',
    ],
  },
};

export function getProcessingContent(
  variant: ProcessingVariant,
): ProcessingContentDefinition {
  return PROCESSING_CONTENT[variant];
}
