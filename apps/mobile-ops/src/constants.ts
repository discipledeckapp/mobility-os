export const STORAGE_KEYS = {
  accessToken: 'mobility_os.mobile_ops.jwt',
  refreshToken: 'mobility_os.mobile_ops.refresh_jwt',
  actionQueue: 'mobility_os.mobile_ops.action_queue',
  selfServiceToken: 'mobility_os.mobile_ops.self_service_token',
  selfServiceVerificationDraft: 'mobility_os.mobile_ops.self_service_verification_draft',
  pendingTenantPayment: 'mobility_os.mobile_ops.pending_tenant_payment',
} as const;

export const OFFLINE_ACTION_TYPE = {
  assignmentStart: 'assignment_start',
  assignmentComplete: 'assignment_complete',
  assignmentCancel: 'assignment_cancel',
  remittanceRecord: 'remittance_record',
} as const;

export const ROLES = {
  driver: 'driver',
  fieldOfficer: 'field_officer',
} as const;

export const ASSIGNMENT_STATUS = {
  created: 'created',
  assigned: 'assigned',
  active: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

export const DRIVER_IDENTITY_STATUS = {
  unverified: 'unverified',
  pendingVerification: 'pending_verification',
  verified: 'verified',
  reviewNeeded: 'review_needed',
  failed: 'failed',
} as const;

export const API_PATHS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  session: '/auth/session',
  signupRegister: '/signup/register',
  signupVerifyOtp: '/signup/verify-otp',
  passwordResetRequest: '/auth/password-reset/request',
  passwordResetConfirm: '/auth/password-reset/confirm',
  selfServiceExchangeOtp: '/driver-self-service/exchange-otp',
  selfServiceContext: '/driver-self-service/context',
  selfServiceDocuments: '/driver-self-service/documents/list',
  mobileAssignments: '/mobile-ops/assignments',
  mobileProfile: '/mobile-ops/profile',
  mobileRemittance: '/mobile-ops/remittance',
  mobileRemittanceHistory: '/mobile-ops/remittance',
  drivers: '/drivers',
  assignments: '/assignments',
  remittance: '/remittance',
  vehicles: '/vehicles',
  fleets: '/fleets',
  businessEntities: '/business-entities',
  operatingUnits: '/operating-units',
  team: '/team',
  tenantBilling: '/tenant-billing',
  reportsOverview: '/reports/overview',
  reportsOperationalReadiness: '/reports/operational-readiness',
  reportsLicenceExpiry: '/reports/licence-expiry',
  operationalWallets: '/operational-wallets',
  mobileLogs: '/mobile/log',
} as const;

export const RETRYABLE_STATUS_CODES = [500, 502, 503, 504] as const;
export const DEFAULT_RETRY_ATTEMPTS = 3;
export const DEFAULT_REFRESH_LEAD_TIME_MS = 60_000;
