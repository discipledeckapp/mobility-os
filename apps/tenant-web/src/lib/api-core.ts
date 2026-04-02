import {
  TENANT_AUTH_COOKIE_NAME,
  TENANT_FORWARDED_AUTH_HEADER,
  TENANT_FORWARDED_REFRESH_HEADER,
  TENANT_REFRESH_COOKIE_NAME,
  isTenantJwtUsable,
  parseTenantJwtPayload,
} from './auth';

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

if (process.env.NODE_ENV === 'production' && !configuredApiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required in production.');
}

const apiBaseUrl = configuredApiBaseUrl ?? 'http://localhost:3001/api/v1';

export interface ApiCoreRequestOptions extends RequestInit {
  token?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TenantApiContext {
  tenantId?: string | undefined;
  userId?: string | undefined;
  businessEntityId?: string | undefined;
  role?: string | undefined;
  operatingUnitId?: string | undefined;
  assignedFleetIds?: string[] | undefined;
  customPermissions?: string[] | undefined;
}

async function fetchBrowserTenantToken(): Promise<string> {
  const response = await fetch('/api/auth/token', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = 'No tenant auth token is available. Log in to continue.';
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Keep default message when the response is not JSON.
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as { accessToken?: string };
  if (!payload.accessToken) {
    throw new Error('No tenant auth token is available. Log in to continue.');
  }

  return payload.accessToken;
}

export interface TenantRecord {
  id: string;
  slug: string;
  name: string;
  country: string;
  status: string;
  metadata?: Record<string, unknown> | null;
  displayName?: string | null;
  logoUrl?: string | null;
  defaultLanguage?: 'en' | 'fr';
  guarantorMaxActiveDrivers?: number;
  autoSendDriverSelfServiceLinkOnCreate?: boolean;
  requireIdentityVerificationForActivation?: boolean;
  requireBiometricVerification?: boolean;
  requireGovernmentVerificationLookup?: boolean;
  customDriverDocumentTypes?: string[];
  requiredDriverDocumentSlugs?: string[];
  requiredVehicleDocumentSlugs?: string[];
  driverPaysKyc?: boolean;
  verificationTier?: 'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION';
  verificationTierRolloutScope?: 'new_only' | 'existing_and_new';
  verificationTierRolloutChangedAt?: string | null;
  verificationTierLabel?: string;
  verificationTierDescription?: string;
  verificationTierPriceMinorUnits?: number;
  verificationTierPriceCurrency?: string;
  verificationTierPricing?: Array<{
    tier: 'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION';
    amountMinorUnits: number;
    currency: string;
  }>;
  guarantorVerificationPriceMinorUnits?: number;
  guarantorVerificationPriceCurrency?: string;
  driversLicenseVerificationPriceMinorUnits?: number;
  driversLicenseVerificationPriceCurrency?: string;
  requireGuarantor?: boolean;
  guarantorBlocking?: boolean;
  requireGuarantorVerification?: boolean;
  allowAdminAssignmentOverride?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantLoginInput {
  identifier: string;
  password: string;
}

export interface UpdateTenantProfileInput {
  name: string;
  phone?: string;
  preferredLanguage?: 'en' | 'fr';
}

export interface UpdateTenantSettingsInput {
  displayName?: string;
  logoUrl?: string;
  defaultLanguage?: 'en' | 'fr';
  verificationTier?: 'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION';
  verificationTierRolloutScope?: 'new_only' | 'existing_and_new';
  guarantorMaxActiveDrivers?: number;
  autoSendDriverSelfServiceLinkOnCreate?: boolean;
  requireIdentityVerificationForActivation?: boolean;
  requireBiometricVerification?: boolean;
  requireGovernmentVerificationLookup?: boolean;
  customDriverDocumentTypes?: string[];
  requiredDriverDocumentSlugs?: string[];
  requiredVehicleDocumentSlugs?: string[];
  driverPaysKyc?: boolean;
  requireGuarantor?: boolean;
  guarantorBlocking?: boolean;
  requireGuarantorVerification?: boolean;
  allowAdminAssignmentOverride?: boolean;
}

export interface NotificationChannelPreferenceRecord {
  email: boolean;
  inApp: boolean;
  push: boolean;
}

export interface NotificationPreferencesRecord {
  verification_payment_receipt: NotificationChannelPreferenceRecord;
  driver_verification_status: NotificationChannelPreferenceRecord;
  driver_licence_review_pending: NotificationChannelPreferenceRecord;
  driver_licence_review_resolved: NotificationChannelPreferenceRecord;
  guarantor_status: NotificationChannelPreferenceRecord;
  assignment_issued: NotificationChannelPreferenceRecord;
  assignment_accepted: NotificationChannelPreferenceRecord;
  assignment_changed: NotificationChannelPreferenceRecord;
  assignment_ended: NotificationChannelPreferenceRecord;
  remittance_due: NotificationChannelPreferenceRecord;
  remittance_overdue: NotificationChannelPreferenceRecord;
  remittance_reconciled: NotificationChannelPreferenceRecord;
  late_remittance_risk: NotificationChannelPreferenceRecord;
  compliance_risk: NotificationChannelPreferenceRecord;
  maintenance_due: NotificationChannelPreferenceRecord;
  maintenance_overdue: NotificationChannelPreferenceRecord;
  vehicle_incident_reported: NotificationChannelPreferenceRecord;
  self_service_invite: NotificationChannelPreferenceRecord;
  billing_updates: NotificationChannelPreferenceRecord;
  trial_guidance: NotificationChannelPreferenceRecord;
  product_updates: NotificationChannelPreferenceRecord;
  marketing_updates: NotificationChannelPreferenceRecord;
}

export interface UserNotificationRecord {
  id: string;
  topic: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}

export interface PushDeviceRecord {
  id: string;
  platform: 'ios' | 'android' | 'web';
  tokenPreview: string;
  lastSeenAt: string;
  registeredAt: string;
  disabledAt?: string | null;
}

export interface DataSubjectRequestRecord {
  id: string;
  subjectType: string;
  subjectId?: string | null;
  requestType: 'access' | 'correction' | 'deletion' | 'restriction';
  status: string;
  contactEmail?: string | null;
  details?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrivacySupportRecord {
  supportEmail: string;
  supportPhonePrimary?: string | null;
  supportPhoneSecondary?: string | null;
  privacyPolicyVersion: string;
  termsVersion: string;
}

export interface ChangeTenantPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface DriverRecord {
  id: string;
  tenantId: string;
  fleetId: string;
  businessEntityId: string;
  operatingUnitId: string;
  status: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email?: string | null;
  organisationName?: string | null;
  photoUrl?: string | null;
  selfieImageUrl?: string | null;
  providerImageUrl?: string | null;
  identitySignatureImageUrl?: string | null;
  selfServiceInviteStatus?: 'sent' | 'skipped' | 'failed' | null;
  selfServiceInviteReason?: string | null;
  identityProfile?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    gender?: string;
    ninIdNumber?: string;
    selfieImageUrl?: string;
    providerImageUrl?: string;
    signatureImageUrl?: string;
  } | null;
  operationalProfile?: {
    phoneNumber?: string;
    address?: string;
    town?: string;
    localGovernmentArea?: string;
    state?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
    nextOfKinRelationship?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
  } | null;
  identityVerificationMetadata?: {
    validity?: 'valid' | 'invalid' | 'unknown';
    issueDate?: string;
    expiryDate?: string;
    portraitAvailable?: boolean;
    matchScore?: number;
    riskScore?: number;
  } | null;
  identityProviderRawData?: Record<string, unknown> | null;
  driverLicenceVerification?: {
    id: string;
    status: string;
    licenceNumber: string;
    maskedLicenceNumber: string;
    validity: 'valid' | 'invalid' | 'unknown' | null;
    issueDate: string | null;
    expiryDate: string | null;
    expiresSoon: boolean;
    isExpired: boolean;
    providerName: string | null;
    providerReference: string | null;
    holderFirstName: string | null;
    holderMiddleName: string | null;
    holderLastName: string | null;
    holderFullName: string | null;
    holderDateOfBirth: string | null;
    holderGender: string | null;
    stateOfIssuance: string | null;
    licenceClass: string | null;
    portraitUrl: string | null;
    linkageStatus: 'matched' | 'mismatch' | 'pending' | 'insufficient_data';
    demographicMatchScore: number | null;
    biometricMatchScore: number | null;
    linkageConfidence: number | null;
    overallLinkageScore: number | null;
    linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
    linkageReasons: string[];
    discrepancyFlags: string[];
    identityComparison: {
      firstNameMatch: boolean | null;
      middleNameMatch: boolean | null;
      lastNameMatch: boolean | null;
      dateOfBirthMatch: boolean | null;
      genderMatch: boolean | null;
      biometricMatch: boolean | null;
      biometricConfidence: number | null;
      matchedFieldCount: number;
      comparedFieldCount: number;
    };
    reviewCaseId: string | null;
    manualReviewRequired: boolean;
    reviewDecision: 'approved' | 'rejected' | 'request_reverification' | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewNotes: string | null;
    riskImpact: 'low' | 'medium' | 'high' | 'critical';
    riskSummary: string;
    failureReason: string | null;
    verifiedAt: string | null;
  } | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  hasResolvedIdentity: boolean;
  identityStatus: string;
  identityReviewCaseId?: string | null;
  identityReviewStatus?: string | null;
  identityLastDecision?: string | null;
  identityVerificationConfidence?: number | null;
  identityLastVerifiedAt?: string | null;
  identityLivenessPassed?: boolean | null;
  identityLivenessProvider?: string | null;
  identityLivenessConfidence?: number | null;
  identityLivenessReason?: string | null;
  verificationProvider?: string | null;
  verificationStatus?: string | null;
  verificationCountryCode?: string | null;
  globalRiskScore?: number | null;
  riskBand?: string | null;
  isWatchlisted?: boolean | null;
  duplicateIdentityFlag?: boolean | null;
  reverificationRequired?: boolean | null;
  reverificationReason?: string | null;
  hasGuarantor: boolean;
  guarantorStatus?: string | null;
  guarantorDisconnectedAt?: string | null;
  guarantorPersonId?: string | null;
  guarantorRiskBand?: string | null;
  guarantorIsWatchlisted?: boolean | null;
  guarantorIsAlsoDriver?: boolean;
  hasApprovedLicence: boolean;
  hasMobileAccess: boolean;
  mobileAccessStatus?: string | null;
  enabledDriverIdentifierTypes?: string[];
  requiredDriverIdentifierTypes?: string[];
  requiredDriverDocumentSlugs?: string[];
  driverPaysKyc?: boolean;
  verificationTier?: 'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION';
  verificationTierLabel?: string;
  verificationTierDescription?: string;
  verificationTierComponents?: Array<'identity' | 'guarantor' | 'drivers_license'>;
  guarantorVerificationPaymentStatus?: 'not_required' | 'ready' | 'driver_payment_required';
  guarantorVerificationPaymentMessage?: string | null;
  guarantorVerificationAmountMinorUnits?: number;
  guarantorVerificationCurrency?: string | null;
  driversLicenseVerificationPaymentStatus?: 'not_required' | 'ready' | 'driver_payment_required';
  driversLicenseVerificationPaymentMessage?: string | null;
  driversLicenseVerificationAmountMinorUnits?: number;
  driversLicenseVerificationCurrency?: string | null;
  verificationComponents?: Array<{
    key: 'identity' | 'guarantor' | 'drivers_license';
    label: string;
    required: boolean;
    status: 'completed' | 'pending' | 'not_required';
    message: string;
  }>;
  kycPaymentVerified?: boolean;
  verificationPaymentState?: 'not_required' | 'required' | 'pending' | 'paid' | 'reconciled';
  verificationEntitlementState?:
    | 'none'
    | 'paid'
    | 'reserved'
    | 'consumed'
    | 'expired'
    | 'refunded'
    | 'cancelled';
  verificationState?: 'not_started' | 'in_progress' | 'provider_called' | 'success' | 'failed';
  verificationEntitlementCode?: string | null;
  verificationPaymentReference?: string | null;
  verificationConsumedAt?: string | null;
  verificationAttemptCount?: number;
  verificationBlockedReason?: string | null;
  requireIdentityVerificationForActivation?: boolean;
  requireBiometricVerification?: boolean;
  requireGovernmentVerificationLookup?: boolean;
  verificationPayer?: 'driver' | 'organisation';
  verificationAmountMinorUnits?: number;
  verificationCurrency?: string | null;
  verificationWalletBalanceMinorUnits?: number;
  verificationAvailableSpendMinorUnits?: number;
  verificationCreditLimitMinorUnits?: number;
  verificationCreditUsedMinorUnits?: number;
  verificationStarterCreditActive?: boolean;
  verificationCardCreditActive?: boolean;
  verificationSavedCard?: {
    provider: string;
    last4: string;
    brand: string;
    status: string;
    active: boolean;
    createdAt: string;
    initialReference?: string | null;
  } | null;
  verificationPaymentStatus?:
    | 'not_required'
    | 'ready'
    | 'driver_payment_required'
    | 'wallet_missing'
    | 'insufficient_balance';
  verificationPaymentMessage?: string | null;
  localRiskFlags?: string[];
  canonicalInsights?: {
    driverIdentity: {
      personId: string | null;
      tenantCount: number | null;
      hasMultiTenantPresence: boolean;
      hasMultiRolePresence: boolean;
      linkedRoles: string[];
    };
    guarantorIdentity: {
      personId: string | null;
      tenantCount: number | null;
      hasMultiTenantPresence: boolean;
      hasMultiRolePresence: boolean;
      linkedRoles: string[];
      reuseCount: number | null;
    } | null;
    fraudIndicators: string[];
  } | null;
  pendingDocumentCount: number;
  rejectedDocumentCount: number;
  expiredDocumentCount: number;
  activationReadiness: string;
  activationReadinessReasons: string[];
  assignmentReadiness: string;
  assignmentReadinessReasons: string[];
  remittanceReadiness?: string;
  remittanceReadinessReasons?: string[];
  enforcementStatus?: string;
  enforcementActions?: Array<{
    id: string;
    actionType: string;
    reason: string;
    status: string;
    triggeredAt: string;
    policyRuleId?: string | null;
  }>;
  adminAssignmentOverride?: boolean;
  createdAt: string;
  updatedAt: string;
  locked?: boolean;
}

export interface DriverMobileAccessUserRecord {
  id: string;
  email: string;
  phone?: string | null;
  name: string;
  role: string;
  accessMode?: 'tenant_user' | 'driver_mobile' | null;
  isActive: boolean;
  mobileAccessRevoked?: boolean | null;
  activePushDeviceCount?: number;
  lastPushDeviceSeenAt?: string | null;
  pushDevices?: PushDeviceRecord[];
  driverId?: string | null;
  matchReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriverMobileAccessRecord {
  linkedUser?: DriverMobileAccessUserRecord | null;
  suggestedUsers: DriverMobileAccessUserRecord[];
}

export interface DriverLivenessSessionRecord {
  providerName: string;
  sessionId: string;
  expiresAt?: string;
  /** Provider-issued client auth token. Required by Azure Face and Smile Identity browser SDKs. */
  clientAuthToken?: string;
  fallbackChain: string[];
}

export interface DriverSelfServiceDeliveryRecord {
  delivery: 'email';
  verificationUrl: string;
  destination: string;
  otpCode?: string;
}

export interface DriverDocumentRecord {
  id: string;
  tenantId: string;
  driverId: string;
  documentType: string;
  fileName: string;
  contentType: string;
  storageKey?: string | null;
  storageUrl?: string | null;
  previewUrl?: string | null;
  uploadedBy: string;
  status: string;
  expiresAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriverDocumentReviewQueueRecord extends DriverDocumentRecord {
  driverName: string;
  driverPhone: string;
  driverStatus: string;
  fleetId: string;
}

export interface DriverLicenceReviewQueueRecord {
  id: string;
  tenantId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverStatus: string;
  fleetId: string;
  status: string;
  validity: 'valid' | 'invalid' | 'unknown' | null;
  expiryDate: string | null;
  linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
  overallLinkageScore: number | null;
  riskImpact: 'low' | 'medium' | 'high' | 'critical';
  reviewCaseId: string | null;
  createdAt: string;
  verifiedAt?: string | null;
}

export interface DriverGuarantorRecord {
  id: string;
  tenantId: string;
  driverId: string;
  personId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  countryCode?: string | null;
  relationship?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  selfieImageUrl?: string | null;
  providerImageUrl?: string | null;
  status: string;
  inviteStatus?: string | null;
  lastInviteSentAt?: string | null;
  inviteExpiresAt?: string | null;
  guarantorReminderCount?: number | null;
  lastGuarantorReminderSentAt?: string | null;
  guarantorReminderSuppressed?: boolean | null;
  disconnectedAt?: string | null;
  disconnectedReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriverGuarantorInvitationResult {
  status:
    | 'sent'
    | 'already_verified'
    | 'missing_email'
    | 'operator_action_required'
    | 'queued_until_driver_verified'
    | 'failed'
    | 'not_ready';
  message: string;
  destination?: string;
}

export interface DriverGuarantorCapacityAssessment {
  matched: boolean;
  matchedBy: Array<'phone' | 'email'>;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorEmail: string | null;
  activeDriverCount: number;
  organisationLimit: number;
  eligible: boolean;
  linkedToCurrentDriver: boolean;
  message: string;
}

export interface DriverGuarantorSubmissionResult {
  guarantor: DriverGuarantorRecord;
  capacity: DriverGuarantorCapacityAssessment;
  payment: {
    required: boolean;
    paymentStatus: 'not_required' | 'ready' | 'driver_payment_required';
    paymentMessage: string;
    amountMinorUnits: number;
    currency: string;
    payer: 'driver' | 'organisation';
  };
  invitation: DriverGuarantorInvitationResult;
}

export interface DriverIdentityResolutionInput {
  countryCode?: string;
  livenessPassed?: boolean;
  identifiers: Array<{
    type: string;
    value: string;
    countryCode?: string;
  }>;
  selfieImageBase64?: string;
  selfieImageUrl?: string;
  subjectConsent?: boolean;
  livenessCheck?: {
    provider?: string;
    sessionId?: string;
    passed?: boolean;
    confidenceScore?: number;
  };
}

export interface DriverIdentityResolutionResult {
  decision: string;
  personId?: string;
  globalPersonCode?: string;
  reviewCaseId?: string;
  providerLookupStatus?: string;
  providerVerificationStatus?: string;
  providerName?: string;
  matchedIdentifierType?: string;
  isVerifiedMatch?: boolean;
  verifiedProfile?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    fullAddress?: string;
    addressLine?: string;
    town?: string;
    localGovernmentArea?: string;
    state?: string;
    mobileNumber?: string;
    emailAddress?: string;
    birthState?: string;
    birthLga?: string;
    nextOfKinState?: string;
    religion?: string;
    ninIdNumber?: string;
    gender?: string;
    photoUrl?: string;
    signatureUrl?: string;
    providerImageUrl?: string;
    selfieImageUrl?: string;
    signatureImageUrl?: string;
  };
  verificationMetadata?: {
    validity?: 'valid' | 'invalid' | 'unknown';
    issueDate?: string;
    expiryDate?: string;
    portraitAvailable?: boolean;
    matchScore?: number;
    riskScore?: number;
  };
  providerAudit?: Record<string, unknown>;
  providerPending?: boolean;
  globalRiskScore?: number;
  riskBand?: string;
  isWatchlisted?: boolean;
  hasDuplicateIdentityFlag?: boolean;
  fraudIndicatorCount?: number;
  verificationConfidence?: number;
  livenessPassed?: boolean;
  livenessProviderName?: string;
  livenessConfidenceScore?: number;
  livenessReason?: string;
}

export interface DriverKycCheckoutRecord {
  checkoutUrl: string;
  amountMinorUnits: number;
  currency: string;
}

export interface DriverReadinessReportRecord {
  id: string;
  fullName: string;
  fleetId: string;
  activationReadiness: string;
  activationReadinessReasons: string[];
  assignmentReadiness: string;
  approvedLicenceExpiresAt?: string | null;
  lastAssignmentDate?: string | null;
  riskBand?: string | null;
  expectedRemittanceAmountMinorUnits?: number | null;
  remittanceCurrency?: string | null;
  nextRemittanceDueDate?: string | null;
  remittanceRiskStatus?: string | null;
  remittanceRiskReason?: string | null;
}

export interface VehicleReadinessReportRecord {
  id: string;
  primaryLabel: string;
  fleetId: string;
  status: string;
  currentValuationMinorUnits?: number | null;
  currentValuationCurrency?: string | null;
  maintenanceSummary: string;
  lifecycleStage: string;
  remittanceRiskStatus?: string | null;
  remittanceRiskReason?: string | null;
}

export interface OperationalReadinessReportRecord {
  drivers: DriverReadinessReportRecord[];
  vehicles: VehicleReadinessReportRecord[];
}

export interface ReportsOverviewWalletRecord {
  currency: string;
  totalBalanceMinorUnits: number;
  totalInflowMinorUnits: number;
  totalOutflowMinorUnits: number;
}

export interface ReportsOverviewTrendPointRecord {
  label: string;
  amountMinorUnits: number;
}

export interface ReportsOverviewRecord {
  wallet: ReportsOverviewWalletRecord;
  dailyRemittanceTrend: ReportsOverviewTrendPointRecord[];
  weeklyRemittanceTrend: ReportsOverviewTrendPointRecord[];
  driverActivity: {
    active: number;
    inactive: number;
    activeVerified: number;
    activeUnverified: number;
    onboardingPool: number;
  };
  remittanceProjection: {
    currency: string;
    activeAssignmentsWithPlans: number;
    expectedTodayMinorUnits: number;
    expectedThisWeekMinorUnits: number;
    atRiskMinorUnits: number;
    atRiskAssignmentCount: number;
  };
  ownershipProgress: {
    currency: string;
    activeHirePurchaseUnits: number;
    targetValueMinorUnits: number;
    remittedValueMinorUnits: number;
    outstandingValueMinorUnits: number;
    completionRatio: number;
  };
  fleetPerformance: Array<{
    fleetId: string;
    fleetName: string;
    vehicleCount: number;
    activeAssignmentCount: number;
    confirmedRevenueMinorUnits: number;
    trackedExpenseMinorUnits: number;
    profitMinorUnits: number;
    atRiskAssignmentCount: number;
    overdueMaintenanceCount: number;
  }>;
  managerPerformance: Array<{
    userId: string;
    name: string;
    fleetCount: number;
    vehicleCount: number;
    confirmedRevenueMinorUnits: number;
    trackedExpenseMinorUnits: number;
    profitMinorUnits: number;
    atRiskAssignmentCount: number;
    overdueMaintenanceCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    kind: string;
    title: string;
    description: string;
    href: string;
    timestamp: string;
    status: string;
  }>;
}

export interface LicenceExpiryReportRecord {
  driverId: string;
  fullName: string;
  fleetId: string;
  expiresAt: string;
  daysUntilExpiry: number;
}

export interface FleetRecord {
  id: string;
  tenantId: string;
  operatingUnitId: string;
  name: string;
  businessModel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFleetInput {
  operatingUnitId: string;
  name: string;
  businessModel: string;
}

export interface UpdateFleetInput {
  operatingUnitId: string;
  name: string;
  businessModel: string;
}

export interface BusinessEntityRecord {
  id: string;
  tenantId: string;
  name: string;
  country: string;
  businessModel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessEntityInput {
  name: string;
  country: string;
  businessModel: string;
}

export interface UpdateBusinessEntityInput {
  name: string;
  country: string;
  businessModel: string;
}

export interface OperatingUnitRecord {
  id: string;
  tenantId: string;
  businessEntityId: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOperatingUnitInput {
  businessEntityId: string;
  name: string;
}

export interface UpdateOperatingUnitInput {
  businessEntityId: string;
  name: string;
}

export interface CreateDriverInput {
  fleetId: string;
  /** Required — used to send the self-service onboarding link immediately after creation. */
  email: string;
  /** Optional at creation — driver completes name during self-service onboarding. */
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface VehicleRecord {
  id: string;
  tenantId: string;
  fleetId: string;
  systemVehicleCode: string;
  tenantVehicleCode: string;
  businessEntityId: string;
  operatingUnitId: string;
  status: string;
  vehicleType: string;
  make: string;
  model: string;
  trim?: string | null;
  year: number;
  plate?: string | null;
  color?: string | null;
  vin?: string | null;
  odometerKm?: number | null;
  createdAt: string;
  updatedAt: string;
  locked?: boolean;
}

export interface CreateVehicleInput {
  fleetId: string;
  tenantVehicleCode?: string;
  vehicleType: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  plate?: string;
  color?: string;
  vin?: string;
  odometerKm?: number;
  acquisitionCostMinorUnits?: number;
  acquisitionDate?: string;
  currentEstimatedValueMinorUnits?: number;
  valuationSource?: string;
}

export interface UpdateVehicleInput {
  tenantVehicleCode?: string;
  plate?: string;
  vin?: string;
  color?: string;
  year?: number;
  acquisitionCostMinorUnits?: number;
  acquisitionDate?: string;
  currentEstimatedValueMinorUnits?: number;
  valuationSource?: string;
  odometerKm?: number;
}

export interface VehicleInspectionRecord {
  id: string;
  vehicleId: string;
  inspectionType: string;
  status: string;
  inspectionDate: string;
  odometerKm?: number | null;
  issuesFoundCount: number;
  reportSource: string;
  summary: string;
  reportUrl?: string | null;
  nextInspectionDueAt?: string | null;
  createdAt: string;
}

export interface TenantInspectionRecord {
  id: string;
  vehicleId: string;
  templateId: string;
  inspectionType: string;
  status: string;
  summary?: string | null;
  odometerKm?: number | null;
  startedAt: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  results: Array<{
    id: string;
    checklistItemId: string;
    result: string;
    notes?: string | null;
  }>;
  latestScore?: {
    score: number;
    riskLevel: string;
  } | null;
}

export interface VehicleMaintenanceScheduleRecord {
  id: string;
  vehicleId: string;
  isActive: boolean;
  scheduleType: string;
  intervalDays?: number | null;
  intervalKm?: number | null;
  nextDueAt?: string | null;
  nextDueOdometerKm?: number | null;
  source: string;
  notes?: string | null;
  createdAt: string;
}

export interface VehicleMaintenanceEventRecord {
  id: string;
  vehicleId: string;
  category: string;
  title: string;
  description?: string | null;
  status: string;
  scheduledFor?: string | null;
  completedAt?: string | null;
  odometerKm?: number | null;
  costMinorUnits?: number | null;
  currency?: string | null;
  vendor?: string | null;
  createdAt: string;
}

export interface WorkOrderRecord {
  id: string;
  vehicleId: string;
  issueDescription: string;
  priority: string;
  status: string;
  vendorId?: string | null;
  totalCostMinorUnits?: number | null;
  currency?: string | null;
  createdAt: string;
}

export interface CreateWorkOrderInput {
  vehicleId: string;
  maintenanceRecordId?: string;
  inspectionId?: string;
  triggerType?: string;
  severity?: string;
  recordType?: string;
  issueDescription: string;
  priority: string;
  vendorId?: string;
  vendorName?: string;
  partsCostMinorUnits?: number;
  labourCostMinorUnits?: number;
  currency?: string;
  notes?: string;
}

export interface UpdateWorkOrderInput extends Partial<CreateWorkOrderInput> {
  status?: string;
}

export interface VehicleIncidentRecord {
  id: string;
  vehicleId: string;
  driverId?: string | null;
  category: string;
  severity: string;
  title: string;
  description?: string | null;
  occurredAt: string;
  status: string;
  estimatedCostMinorUnits?: number | null;
  currency?: string | null;
  createdAt: string;
}

export interface VehicleValuationRecord {
  id: string;
  tenantId: string;
  vehicleId: string;
  valuationKind: string;
  amountMinorUnits: number;
  currency?: string | null;
  valuationDate: string;
  source?: string | null;
  notes?: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleCodeSuggestionRecord {
  suggestedTenantVehicleCode: string;
  prefix: string;
}

export interface VehicleDetailRecord extends VehicleRecord {
  fleetName: string;
  operatingUnitName: string;
  businessEntityName: string;
  valuations: VehicleValuationRecord[];
  assignmentSummary: {
    totalAssignments: number;
    activeAssignments: number;
    latestAssignmentId?: string | null;
    latestAssignmentStatus?: string | null;
    latestAssignmentStartedAt?: string | null;
    assignedDriverId?: string | null;
    assignedDriverName?: string | null;
  };
  remittanceSummary: {
    latestRecordedAt?: string | null;
    latestAmountMinorUnits?: number | null;
    nextDueAt?: string | null;
    nextDueAmountMinorUnits?: number | null;
    currency?: string | null;
  };
  maintenanceSummary: string;
  maintenanceDue: {
    dueCount: number;
    overdueCount: number;
    nextDueAt?: string | null;
    nextDueOdometerKm?: number | null;
  };
  economics: {
    acquisitionValueMinorUnits?: number | null;
    currentEstimatedValueMinorUnits?: number | null;
    valuationCurrency?: string | null;
    confirmedRevenueMinorUnits: number;
    trackedExpenseMinorUnits: number;
    profitMinorUnits: number;
    recommendation: string;
  };
  inspections: VehicleInspectionRecord[];
  maintenanceSchedules: VehicleMaintenanceScheduleRecord[];
  maintenanceEvents: VehicleMaintenanceEventRecord[];
  incidents: VehicleIncidentRecord[];
  latestVinDecode?: {
    id: string;
    decodedMake?: string | null;
    decodedModel?: string | null;
    decodedModelYear?: number | null;
    vehicleType?: string | null;
    bodyClass?: string | null;
    createdAt: string;
  } | null;
}

export interface AssignmentRecord {
  id: string;
  tenantId: string;
  fleetId: string;
  businessEntityId: string;
  operatingUnitId: string;
  driverId: string;
  vehicleId: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  notes?: string | null;
  paymentModel?: 'remittance' | 'salary' | 'commission' | 'hire_purchase' | null;
  remittanceModel?: string | null;
  remittanceFrequency?: string | null;
  remittanceAmountMinorUnits?: number | null;
  remittanceCurrency?: string | null;
  remittanceStartDate?: string | null;
  remittanceCollectionDay?: number | null;
  contractVersion?: string | null;
  contractSnapshot?: {
    paymentStructure?: string | null;
    expectedRemittanceTerms?: string | null;
    obligations?: string[];
  } | null;
  financialContract?: {
    version: string;
    contractType: 'regular_hire' | 'hire_purchase';
    currency: string;
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      startDate: string;
      collectionDay?: number | null;
    };
    display: {
      summaryLabel: string;
      expectedRemittanceTerms: string;
    };
    regularHire?: {
      expectedPerPeriodAmountMinorUnits: number;
    } | null;
    hirePurchase?: {
      principalAmountMinorUnits?: number | null;
      totalTargetAmountMinorUnits: number;
      depositAmountMinorUnits?: number | null;
      installmentPlan: {
        periodCount?: number | null;
        contractEndDate?: string | null;
        baseInstallmentAmountMinorUnits: number;
        finalInstallmentAmountMinorUnits: number;
        generatedFromTarget: boolean;
      };
    } | null;
    summary: {
      contractType: 'regular_hire' | 'hire_purchase';
      scheduleLabel: string;
      expectedPerPeriodAmountMinorUnits: number;
      actualForCurrentPeriodMinorUnits: number;
      currentPeriodVarianceMinorUnits: number;
      currentPeriodStatus: 'complete' | 'partial' | 'late' | 'pending';
      currentPeriodDueDate?: string | null;
      nextDueDate?: string | null;
      nextDueAmountMinorUnits?: number | null;
      cumulativeRecordedAmountMinorUnits: number;
      cumulativePaidAmountMinorUnits: number;
      cumulativeExpectedAmountMinorUnits: number;
      outstandingBalanceMinorUnits?: number | null;
      contractCompletionPercentage?: number | null;
      overduePeriods: number;
      missedPeriods: number;
      partialPeriods: number;
      contractStatus: 'active' | 'overdue' | 'completed' | 'terminated';
      ownershipTransferEligible: boolean;
      riskSignals: string[];
    };
  } | null;
  contractStatus?: string;
  driverAcceptedTermsAt?: string | null;
  driverAcceptanceEvidence?: {
    acceptedFrom?: string;
    acceptedAt?: string;
    note?: string;
  } | null;
  driverConfirmedAt?: string | null;
  driverConfirmationMethod?: string | null;
  driverConfirmationEvidence?: Record<string, unknown> | null;
  acceptanceSnapshotHash?: string | null;
  returnedAt?: string | null;
  returnedBy?: string | null;
  returnEvidence?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriverSelfServiceAssignmentRecord {
  id: string;
  status: string;
  driverId: string;
  vehicleId: string;
  fleetId: string;
  paymentModel?: 'remittance' | 'salary' | 'commission' | 'hire_purchase' | null;
  remittanceAmountMinorUnits?: number | null;
  remittanceCurrency?: string | null;
  remittanceFrequency?: string | null;
  remittanceStartDate?: string | null;
  contractStatus?: string | null;
  driverConfirmedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  financialContract?: AssignmentRecord['financialContract'] | null;
  vehicle: {
    id: string;
    make?: string | null;
    model?: string | null;
    plate?: string | null;
    tenantVehicleCode?: string | null;
    systemVehicleCode?: string | null;
    status: string;
  };
}

export interface AuditLogRecord {
  id: string;
  tenantId: string;
  actorId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreateAssignmentInput {
  fleetId?: string;
  driverId: string;
  vehicleId: string;
  notes?: string;
  paymentModel?: 'remittance' | 'salary' | 'commission' | 'hire_purchase';
  contractType?: 'regular_hire' | 'hire_purchase';
  remittanceModel?: 'fixed' | 'hire_purchase';
  remittanceAmountMinorUnits?: number;
  remittanceFrequency?: 'daily' | 'weekly' | 'monthly';
  remittanceCurrency?: string;
  remittanceStartDate?: string;
  remittanceCollectionDay?: number;
  principalAmountMinorUnits?: number;
  totalTargetAmountMinorUnits?: number;
  depositAmountMinorUnits?: number;
  contractDurationPeriods?: number;
  contractEndDate?: string;
}

export interface UpdateAssignmentRemittancePlanInput {
  contractType?: 'regular_hire' | 'hire_purchase';
  remittanceAmountMinorUnits?: number;
  remittanceFrequency?: 'daily' | 'weekly' | 'monthly';
  remittanceCurrency?: string;
  remittanceStartDate?: string;
  remittanceCollectionDay?: number;
  principalAmountMinorUnits?: number;
  totalTargetAmountMinorUnits?: number;
  depositAmountMinorUnits?: number;
  contractDurationPeriods?: number;
  contractEndDate?: string;
}

export interface RemittanceRecord {
  id: string;
  tenantId: string;
  assignmentId: string;
  driverId: string;
  vehicleId: string;
  fleetId: string;
  businessEntityId: string;
  operatingUnitId: string;
  status: string;
  amountMinorUnits: number;
  currency: string;
  dueDate: string;
  paidDate?: string | null;
  notes?: string | null;
  clientReferenceId?: string | null;
  submissionSource?: string;
  syncStatus?: string;
  originalCapturedAt?: string | null;
  syncedAt?: string | null;
  evidence?: {
    note?: string;
    localEvidenceUri?: string;
    capturedOffline?: boolean;
  } | null;
  shiftCode?: string | null;
  checkpointLabel?: string | null;
  shortfallAmountMinorUnits?: number;
  reconciliation?: {
    contractType: 'regular_hire' | 'hire_purchase';
    expectedAmountMinorUnits: number;
    varianceMinorUnits: number;
    periodStatus: 'complete' | 'partial';
    cumulativePaidAmountMinorUnits: number;
    outstandingBalanceMinorUnits?: number | null;
    contractCompletionPercentage?: number | null;
    contractStatus: 'active' | 'overdue' | 'completed' | 'terminated';
    nextDueDate?: string | null;
    nextDueAmountMinorUnits?: number | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordDocumentRecord {
  id: string;
  tenantId: string;
  documentNumber: string;
  documentType: string;
  status: string;
  issuerType: string;
  issuerId?: string | null;
  recipientType?: string | null;
  recipientId?: string | null;
  relatedEntityType: string;
  relatedEntityId: string;
  fingerprint: string;
  signatureVersion: string;
  signedAt: string;
  signedBySystem: string;
  verificationReference: string;
  fileName: string;
  contentType: string;
  storageKey: string;
  fileUrl: string;
  fileHash: string;
  canonicalPayload: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordDisputeEvidenceRecord {
  id: string;
  disputeId: string;
  tenantId: string;
  uploadedByType: string;
  uploadedById?: string | null;
  evidenceType: string;
  description?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  storageKey?: string | null;
  fileUrl: string;
  fileHash: string;
  integrityHash: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface RecordDisputeTimelineRecord {
  id: string;
  disputeId: string;
  tenantId: string;
  actorType: string;
  actorId?: string | null;
  actionType: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface RecordDisputeRecord {
  id: string;
  disputeCode: string;
  tenantId: string;
  driverId?: string | null;
  disputeType: string;
  relatedEntityType: string;
  relatedEntityId: string;
  claimantType: string;
  claimantId: string;
  respondentType: string;
  respondentId?: string | null;
  title: string;
  reasonCode: string;
  narrative: string;
  status: string;
  priority: string;
  assignedTo?: string | null;
  resolvedAt?: string | null;
  resolvedByType?: string | null;
  resolvedById?: string | null;
  resolutionSummary?: Record<string, unknown> | null;
  finalAmountMinorUnits?: number | null;
  currency?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  timeline: RecordDisputeTimelineRecord[];
  evidence: RecordDisputeEvidenceRecord[];
}

export interface RecordRemittanceInput {
  fleetId?: string;
  assignmentId: string;
  amountMinorUnits?: number;
  currency?: string;
  dueDate?: string;
  notes?: string;
  clientReferenceId?: string;
  submissionSource?: 'online' | 'offline_queue';
  syncStatus?: 'offline_submitted' | 'synced';
  originalCapturedAt?: string;
  evidence?: {
    note?: string;
    localEvidenceUri?: string;
    capturedOffline?: boolean;
  };
  shiftCode?: string;
  checkpointLabel?: string;
}

export interface WalletBalanceRecord {
  walletId: string;
  businessEntityId: string;
  currency: string;
  balanceMinorUnits: number;
  updatedAt: string;
}

export interface WalletEntryRecord {
  id: string;
  walletId: string;
  type: string;
  amountMinorUnits: number;
  currency: string;
  referenceId?: string | null;
  referenceType?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface TenantAuthSessionRecord {
  userId: string;
  tenantId: string;
  email: string;
  phone?: string | null;
  name: string;
  role: string;
  businessEntityId?: string | null;
  operatingUnitId?: string | null;
  tenantName?: string | null;
  tenantCountry?: string | null;
  defaultCurrency?: string | null;
  currencyMinorUnit?: number | null;
  formattingLocale?: string | null;
  organisationDisplayName?: string | null;
  organisationLogoUrl?: string | null;
  defaultLanguage?: 'en' | 'fr';
  preferredLanguage?: 'en' | 'fr';
  guarantorMaxActiveDrivers?: number;
  autoSendDriverSelfServiceLinkOnCreate?: boolean;
  requireIdentityVerificationForActivation?: boolean;
  requireBiometricVerification?: boolean;
  requireGovernmentVerificationLookup?: boolean;
  requiredDriverDocumentSlugs?: string[];
  requiredVehicleDocumentSlugs?: string[];
  notificationPreferences?: NotificationPreferencesRecord;
  permissions: string[];
  assignedFleetIds?: string[];
  assignedVehicleIds?: string[];
  customPermissions?: string[];
  linkedDriverId?: string | null;
  accessMode?: 'tenant_user' | 'driver_mobile';
  mobileRole?: 'driver' | 'field_officer' | null;
  mobileAccessRevoked?: boolean | null;
  selfServiceSubjectType?: 'driver' | 'guarantor' | null;
  selfServiceDriverId?: string | null;
}

export interface TenantBillingSubscriptionRecord {
  id: string;
  planId: string;
  planName: string;
  planTier: string;
  billingInterval: string;
  basePriceMinorUnits: number;
  currency: string;
  features: Record<string, unknown>;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string | null;
  enforcement?: {
    stage: 'active' | 'grace' | 'expired';
    gracePeriodDays: number;
    graceEndsAt: string | null;
    graceDaysRemaining: number;
    degradedMode: boolean;
    blockedFeatures: string[];
  };
}

export interface TenantBillingPlanRecord {
  id: string;
  name: string;
  tier: string;
  billingInterval: string;
  basePriceMinorUnits: number;
  currency: string;
  isActive: boolean;
  isPreferredCurrency: boolean;
  features: Record<string, unknown>;
  customTerms?: Record<string, unknown> | null;
}

export interface TenantBillingInvoiceRecord {
  id: string;
  subscriptionId: string;
  status: string;
  amountDueMinorUnits: number;
  amountPaidMinorUnits: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  dueAt?: string | null;
  paidAt?: string | null;
}

export interface TenantVerificationWalletEntryRecord {
  id: string;
  type: string;
  amountMinorUnits: number;
  currency: string;
  referenceId?: string | null;
  referenceType?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface TenantVerificationWalletRecord {
  walletId: string;
  currency: string;
  balanceMinorUnits: number;
  entries: TenantVerificationWalletEntryRecord[];
}

export interface TenantBillingUsageRecord {
  driverCount: number;
  vehicleCount: number;
  operatorSeatCount: number;
  assignmentCount: number;
  driverCap?: number | null;
  vehicleCap?: number | null;
  assignmentCap?: number | null;
  seatCap?: number | null;
  openInvoiceCount: number;
  verificationLedgerEntryCount: number;
}

export interface TenantBillingSummaryRecord {
  subscription: TenantBillingSubscriptionRecord;
  invoices: TenantBillingInvoiceRecord[];
  outstandingInvoice?: TenantBillingInvoiceRecord | null;
  verificationWallet: TenantVerificationWalletRecord;
  usage: TenantBillingUsageRecord;
  verificationSpend: {
    currency: string;
    walletBalanceMinorUnits: number;
    creditLimitMinorUnits: number;
    creditUsedMinorUnits: number;
    availableSpendMinorUnits: number;
    starterCreditActive: boolean;
    starterCreditEligible: boolean;
    cardCreditActive: boolean;
    unlockedTiers: string[];
    savedCard?: {
      provider: string;
      last4: string;
      brand: string;
      status: string;
      active: boolean;
      createdAt: string;
      initialReference?: string | null;
    } | null;
  };
  billingPaymentMethod?: {
    provider: string;
    last4: string;
    brand: string;
    status: string;
    active: boolean;
    autopayEnabled: boolean;
    createdAt: string;
    initialReference?: string | null;
  } | null;
  customerEmail: string;
  customerName: string;
}

export interface TenantPaymentCheckoutRecord {
  provider: string;
  reference: string;
  checkoutUrl: string;
  accessCode?: string;
  purpose: string;
}

export interface VerifyAndApplyTenantPaymentInput {
  provider: string;
  purpose: string;
  reference: string;
  invoiceId?: string;
}

export interface VehicleMakerRecord {
  id: string;
  name: string;
  status: string;
  externalSource?: string | null;
  externalId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleModelCatalogRecord {
  id: string;
  makerId: string;
  makerName: string;
  name: string;
  status: string;
  vehicleCategory?: string | null;
  sourceTypeLabel?: string | null;
  externalSource?: string | null;
  externalId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DecodeVehicleVinInput {
  vin: string;
  modelYear?: number;
}

export interface VehicleVinDecodeRecord {
  id: string;
  vin: string;
  normalizedVin: string;
  decodeKey: string;
  requestedModelYear?: number | null;
  status: string;
  source: string;
  sourceVersion?: string | null;
  errorCode?: string | null;
  errorText?: string | null;
  decodedMake?: string | null;
  decodedModel?: string | null;
  decodedModelYear?: number | null;
  vehicleType?: string | null;
  bodyClass?: string | null;
  manufacturerName?: string | null;
  makerId?: string | null;
  makerName?: string | null;
  modelId?: string | null;
  modelName?: string | null;
  rawPayload: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleMakerInput {
  name: string;
}

export interface CreateVehicleModelInput {
  makerId: string;
  name: string;
  vehicleType?: string;
}

export async function getTenantApiToken(explicitToken?: string): Promise<string> {
  if (explicitToken) {
    return explicitToken;
  }

  if (typeof window !== 'undefined') {
    return fetchBrowserTenantToken();
  }

  const { cookies } = await import('next/headers');
  const { headers } = await import('next/headers');
  const headerStore = await headers();
  const forwardedAccessToken = headerStore.get(TENANT_FORWARDED_AUTH_HEADER) ?? undefined;
  if (isTenantJwtUsable(forwardedAccessToken)) {
    return forwardedAccessToken as string;
  }

  const forwardedRefreshToken = headerStore.get(TENANT_FORWARDED_REFRESH_HEADER) ?? undefined;
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(TENANT_AUTH_COOKIE_NAME)?.value;
  if (isTenantJwtUsable(cookieToken)) {
    return cookieToken as string;
  }

  const refreshToken = forwardedRefreshToken ?? cookieStore.get(TENANT_REFRESH_COOKIE_NAME)?.value;
  if (refreshToken) {
    throw new Error(
      'The tenant session needs to be refreshed before this request can continue. Reload the page and try again.',
    );
  }

  throw new Error('No tenant auth token is available. Log in to continue.');
}

export async function getTenantApiContext(explicitToken?: string): Promise<TenantApiContext> {
  const token = await getTenantApiToken(explicitToken);
  const payload = parseTenantJwtPayload(token);

  if (!payload) {
    throw new Error('Unable to read tenant session context from JWT.');
  }

  return {
    tenantId: payload.tenantId,
    userId: payload.sub,
    businessEntityId: payload.businessEntityId,
    role: payload.role,
    operatingUnitId: payload.operatingUnitId,
  };
}

export async function apiCoreFetch<T>(
  path: string,
  options: ApiCoreRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set('content-type', 'application/json');
  }
  if (options.token) {
    headers.set('authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `api-core returned status ${response.status}`;
    try {
      const payload = (await response.json()) as {
        message?: string | string[];
        error?: string;
      };
      if (Array.isArray(payload.message)) {
        message = payload.message.join(', ');
      } else if (payload.message) {
        message = payload.message;
      } else if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Keep default message when the response is not JSON.
    }

    throw new Error(message);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

// ── Self-signup types ─────────────────────────────────────────────────────────

export interface RegisterOrganisationInput {
  orgName: string;
  slug: string;
  country: string;
  businessModel: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword: string;
}

export interface RegisterOrganisationResult {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  message: string;
}

export async function registerOrganisation(
  input: RegisterOrganisationInput,
): Promise<RegisterOrganisationResult> {
  return apiCoreFetch<RegisterOrganisationResult>('/signup/register', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
  });
}

export async function verifyOrgSignupOtp(
  email: string,
  code: string,
): Promise<{ verified: boolean; tenantSlug: string }> {
  return apiCoreFetch<{ verified: boolean; tenantSlug: string }>('/signup/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
    cache: 'no-store',
  });
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ identifier: email }),
    cache: 'no-store',
  });
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    cache: 'no-store',
  });
}

export async function loginTenantUser(
  input: TenantLoginInput,
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await apiCoreFetch<{
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    jwt?: string;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
  });

  const accessToken = response.accessToken ?? response.token ?? response.jwt;
  if (!accessToken) {
    throw new Error('api-core login response did not include a JWT');
  }

  if (!response.refreshToken) {
    throw new Error('api-core login response did not include a refresh token');
  }

  return { accessToken, refreshToken: response.refreshToken };
}

export async function listFleets(token?: string): Promise<FleetRecord[]> {
  return apiCoreFetch<FleetRecord[]>('/fleets', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getFleet(fleetId: string, token?: string): Promise<FleetRecord> {
  return apiCoreFetch<FleetRecord>(`/fleets/${fleetId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createFleet(input: CreateFleetInput, token?: string): Promise<FleetRecord> {
  return apiCoreFetch<FleetRecord>('/fleets', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateFleet(
  fleetId: string,
  input: UpdateFleetInput,
  token?: string,
): Promise<FleetRecord> {
  return apiCoreFetch<FleetRecord>(`/fleets/${fleetId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listBusinessEntities(token?: string): Promise<BusinessEntityRecord[]> {
  return apiCoreFetch<BusinessEntityRecord[]>('/business-entities', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getBusinessEntity(
  businessEntityId: string,
  token?: string,
): Promise<BusinessEntityRecord> {
  return apiCoreFetch<BusinessEntityRecord>(`/business-entities/${businessEntityId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createBusinessEntity(
  input: CreateBusinessEntityInput,
  token?: string,
): Promise<BusinessEntityRecord> {
  return apiCoreFetch<BusinessEntityRecord>('/business-entities', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateBusinessEntity(
  businessEntityId: string,
  input: UpdateBusinessEntityInput,
  token?: string,
): Promise<BusinessEntityRecord> {
  return apiCoreFetch<BusinessEntityRecord>(`/business-entities/${businessEntityId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listOperatingUnits(
  input: { businessEntityId?: string } = {},
  token?: string,
): Promise<OperatingUnitRecord[]> {
  const params = new URLSearchParams();
  if (input.businessEntityId) {
    params.set('businessEntityId', input.businessEntityId);
  }
  const query = params.toString();

  return apiCoreFetch<OperatingUnitRecord[]>(`/operating-units${query ? `?${query}` : ''}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getOperatingUnit(
  operatingUnitId: string,
  token?: string,
): Promise<OperatingUnitRecord> {
  return apiCoreFetch<OperatingUnitRecord>(`/operating-units/${operatingUnitId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createOperatingUnit(
  input: CreateOperatingUnitInput,
  token?: string,
): Promise<OperatingUnitRecord> {
  return apiCoreFetch<OperatingUnitRecord>('/operating-units', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateOperatingUnit(
  operatingUnitId: string,
  input: UpdateOperatingUnitInput,
  token?: string,
): Promise<OperatingUnitRecord> {
  return apiCoreFetch<OperatingUnitRecord>(`/operating-units/${operatingUnitId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getTenantMe(token?: string): Promise<TenantRecord> {
  return apiCoreFetch<TenantRecord>('/tenants/me', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getTenantSession(token?: string): Promise<TenantAuthSessionRecord> {
  return apiCoreFetch<TenantAuthSessionRecord>('/auth/session', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateTenantProfile(
  input: UpdateTenantProfileInput,
  token?: string,
): Promise<TenantAuthSessionRecord> {
  return apiCoreFetch<TenantAuthSessionRecord>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateTenantSettings(
  input: UpdateTenantSettingsInput,
  token?: string,
): Promise<TenantRecord> {
  return apiCoreFetch<TenantRecord>('/tenants/me/settings', {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listUserNotifications(token?: string): Promise<UserNotificationRecord[]> {
  return apiCoreFetch<UserNotificationRecord[]>('/notifications', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listDataSubjectRequests(token?: string): Promise<DataSubjectRequestRecord[]> {
  return apiCoreFetch<DataSubjectRequestRecord[]>('/privacy/data-requests', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createDataSubjectRequest(
  input: Pick<DataSubjectRequestRecord, 'requestType'> & { details?: string },
  token?: string,
): Promise<DataSubjectRequestRecord> {
  return apiCoreFetch<DataSubjectRequestRecord>('/privacy/data-requests', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getPrivacySupport(token?: string): Promise<PrivacySupportRecord> {
  return apiCoreFetch<PrivacySupportRecord>('/privacy/support', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function markUserNotificationRead(
  notificationId: string,
  token?: string,
): Promise<UserNotificationRecord> {
  return apiCoreFetch<UserNotificationRecord>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getNotificationPreferences(
  token?: string,
): Promise<NotificationPreferencesRecord> {
  return apiCoreFetch<NotificationPreferencesRecord>('/notifications/preferences', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateNotificationPreferences(
  input: Partial<NotificationPreferencesRecord>,
  token?: string,
): Promise<NotificationPreferencesRecord> {
  return apiCoreFetch<NotificationPreferencesRecord>('/notifications/preferences', {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listPushDevices(token?: string): Promise<PushDeviceRecord[]> {
  return apiCoreFetch<PushDeviceRecord[]>('/notifications/push-devices', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function disablePushDevice(
  deviceId: string,
  token?: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>(`/notifications/push-devices/${deviceId}`, {
    method: 'DELETE',
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function syncMaintenanceReminders(token?: string): Promise<{ created: number }> {
  return apiCoreFetch<{ created: number }>('/notifications/maintenance-reminders/sync', {
    method: 'POST',
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function syncRemittanceReminders(token?: string): Promise<{ created: number }> {
  return apiCoreFetch<{ created: number }>('/notifications/remittance-reminders/sync', {
    method: 'POST',
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function changeTenantPassword(
  input: ChangeTenantPasswordInput,
  token?: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/auth/password-change', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getTenantBillingSummary(token?: string): Promise<TenantBillingSummaryRecord> {
  return apiCoreFetch<TenantBillingSummaryRecord>('/tenant-billing/summary', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listTenantBillingPlans(token?: string): Promise<TenantBillingPlanRecord[]> {
  return apiCoreFetch<TenantBillingPlanRecord[]>('/tenant-billing/plans', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function changeTenantBillingPlan(
  planId: string,
  token?: string,
): Promise<TenantBillingSummaryRecord> {
  return apiCoreFetch<TenantBillingSummaryRecord>(
    `/tenant-billing/subscription/change-plan/${encodeURIComponent(planId)}`,
    {
      method: 'POST',
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function initializeTenantWalletTopUpCheckout(
  input: { provider: string; amountMinorUnits: number },
  token?: string,
): Promise<TenantPaymentCheckoutRecord> {
  return apiCoreFetch<TenantPaymentCheckoutRecord>('/tenant-billing/wallet-top-ups/checkout', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function initializeTenantCardSetupCheckout(
  input: { provider?: string; amountMinorUnits?: number },
  token?: string,
): Promise<TenantPaymentCheckoutRecord> {
  return apiCoreFetch<TenantPaymentCheckoutRecord>('/tenant-billing/card-setup/checkout', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function initializeTenantInvoiceCheckout(
  input: { provider: string; invoiceId: string },
  token?: string,
): Promise<TenantPaymentCheckoutRecord> {
  return apiCoreFetch<TenantPaymentCheckoutRecord>('/tenant-billing/invoice-checkouts', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function initializeTenantSubscriptionBillingSetupCheckout(
  input: { provider?: string; amountMinorUnits?: number },
  token?: string,
): Promise<TenantPaymentCheckoutRecord> {
  return apiCoreFetch<TenantPaymentCheckoutRecord>(
    '/tenant-billing/subscription/payment-method/checkout',
    {
      method: 'POST',
      body: JSON.stringify(input),
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function verifyAndApplyTenantPayment(
  input: VerifyAndApplyTenantPaymentInput,
  token?: string,
): Promise<{
  provider: string;
  reference: string;
  purpose: string;
  status: string;
  amountMinorUnits: number;
  currency: string;
  invoiceId?: string;
  tenantId?: string;
  receiptDocumentId?: string;
  receiptDocumentNumber?: string;
  receiptEmailSentTo?: string[];
  paymentMethod?: {
    authorizationCode?: string | null;
    customerCode?: string | null;
    last4?: string | null;
    brand?: string | null;
  };
}> {
  return apiCoreFetch('/tenant-billing/payments/verify-and-apply', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listDrivers(
  input: PaginationParams & {
    fleetId?: string;
    q?: string;
    status?: string;
    identityStatus?: string;
  } = {},
  token?: string,
): Promise<PaginatedApiResponse<DriverRecord>> {
  const params = new URLSearchParams();
  if (input.q) {
    params.set('q', input.q);
  }
  if (input.fleetId) {
    params.set('fleetId', input.fleetId);
  }
  if (input.status) {
    params.set('status', input.status);
  }
  if (input.identityStatus) {
    params.set('identityStatus', input.identityStatus);
  }
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return apiCoreFetch<PaginatedApiResponse<DriverRecord>>(`/drivers${query ? `?${query}` : ''}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getDriver(driverId: string, token?: string): Promise<DriverRecord> {
  return apiCoreFetch<DriverRecord>(`/drivers/${driverId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function setDriverAdminOverride(
  driverId: string,
  override: boolean,
  token?: string,
): Promise<{ adminAssignmentOverride: boolean }> {
  return apiCoreFetch<{ adminAssignmentOverride: boolean }>(`/drivers/${driverId}/admin-override`, {
    method: 'PATCH',
    body: JSON.stringify({ override }),
    token: await getTenantApiToken(token),
  });
}

export async function requestDriverAdminOverride(
  driverId: string,
  input: { reason: string; evidenceImageDataUrl?: string },
  token?: string,
): Promise<{ destination: string; expiresAt: string }> {
  return apiCoreFetch<{ destination: string; expiresAt: string }>(
    `/drivers/${driverId}/admin-override/request`,
    {
      method: 'POST',
      body: JSON.stringify({
        reason: input.reason,
        ...(input.evidenceImageDataUrl ? { evidenceImageDataUrl: input.evidenceImageDataUrl } : {}),
      }),
      token: await getTenantApiToken(token),
    },
  );
}

export async function confirmDriverAdminOverride(
  driverId: string,
  otpCode: string,
  token?: string,
): Promise<{ adminAssignmentOverride: boolean }> {
  return apiCoreFetch<{ adminAssignmentOverride: boolean }>(
    `/drivers/${driverId}/admin-override/confirm`,
    {
      method: 'POST',
      body: JSON.stringify({ otpCode }),
      token: await getTenantApiToken(token),
    },
  );
}

export async function getDriverMobileAccess(
  driverId: string,
  token?: string,
): Promise<DriverMobileAccessRecord> {
  return apiCoreFetch<DriverMobileAccessRecord>(`/drivers/${driverId}/mobile-access`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function linkDriverMobileAccessUser(
  driverId: string,
  userId: string,
  token?: string,
): Promise<DriverMobileAccessUserRecord> {
  return apiCoreFetch<DriverMobileAccessUserRecord>(`/drivers/${driverId}/mobile-access/link`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function unlinkDriverMobileAccessUser(
  driverId: string,
  userId: string,
  token?: string,
): Promise<{ success: true }> {
  return apiCoreFetch<{ success: true }>(`/drivers/${driverId}/mobile-access/${userId}`, {
    method: 'DELETE',
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateDriverMobileAccessStatus(
  driverId: string,
  userId: string,
  revoked: boolean,
  token?: string,
): Promise<{ success: true }> {
  return apiCoreFetch<{ success: true }>(
    `/drivers/${driverId}/mobile-access/${encodeURIComponent(userId)}/status`,
    {
      method: 'POST',
      body: JSON.stringify({ revoked }),
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function disableDriverMobileAccessDevice(
  driverId: string,
  userId: string,
  deviceId: string,
  token?: string,
): Promise<{ success: true }> {
  return apiCoreFetch<{ success: true }>(
    `/drivers/${driverId}/mobile-access/${encodeURIComponent(userId)}/push-devices/${encodeURIComponent(deviceId)}`,
    {
      method: 'DELETE',
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function createDriver(
  input: CreateDriverInput,
  token?: string,
): Promise<DriverRecord> {
  return apiCoreFetch<DriverRecord>('/drivers', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function importDriversCsv(
  csvContent: string,
  autoSendSelfServiceLink?: boolean,
  token?: string,
): Promise<{ createdCount: number; failedCount: number; errors: string[] }> {
  return apiCoreFetch('/drivers/import', {
    method: 'POST',
    body: JSON.stringify({
      csvContent,
      ...(typeof autoSendSelfServiceLink === 'boolean' ? { autoSendSelfServiceLink } : {}),
    }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listDriverDocumentReviewQueue(
  input: PaginationParams & { status?: 'pending' | 'rejected' | 'expired'; q?: string } = {},
  token?: string,
): Promise<PaginatedApiResponse<DriverDocumentReviewQueueRecord>> {
  const params = new URLSearchParams();
  if (input.status) params.set('status', input.status);
  if (input.q) params.set('q', input.q);
  if (typeof input.page === 'number') params.set('page', String(input.page));
  if (typeof input.limit === 'number') params.set('limit', String(input.limit));
  return apiCoreFetch(
    `/drivers/documents/review-queue${params.toString() ? `?${params.toString()}` : ''}`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function listDriverLicenceReviewQueue(
  input: PaginationParams & { q?: string } = {},
  token?: string,
): Promise<PaginatedApiResponse<DriverLicenceReviewQueueRecord>> {
  const params = new URLSearchParams();
  if (input.q) params.set('q', input.q);
  if (typeof input.page === 'number') params.set('page', String(input.page));
  if (typeof input.limit === 'number') params.set('limit', String(input.limit));
  return apiCoreFetch(
    `/drivers/licence-verifications/review-queue${params.toString() ? `?${params.toString()}` : ''}`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function updateDriverStatus(
  driverId: string,
  status: string,
  token?: string,
): Promise<DriverRecord> {
  return apiCoreFetch<DriverRecord>(`/drivers/${driverId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function archiveDriver(
  driverId: string,
  reason?: string,
  token?: string,
): Promise<{ message: string; mode: 'archived' }> {
  return apiCoreFetch<{ message: string; mode: 'archived' }>(`/drivers/${driverId}/archive`, {
    method: 'POST',
    body: JSON.stringify({ ...(reason?.trim() ? { reason: reason.trim() } : {}) }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createDriverLivenessSession(
  driverId: string,
  input: { countryCode?: string } = {},
  token?: string,
): Promise<DriverLivenessSessionRecord> {
  return apiCoreFetch<DriverLivenessSessionRecord>(
    `/drivers/${driverId}/identity/liveness-sessions`,
    {
      method: 'POST',
      body: JSON.stringify(input),
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function sendDriverSelfServiceLink(
  driverId: string,
  options?: {
    driverPaysKycOverride?: boolean;
    verificationTierOverride?: 'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION';
    forceReverification?: boolean;
    token?: string;
  },
): Promise<DriverSelfServiceDeliveryRecord> {
  const payload = {
    ...(options?.driverPaysKycOverride !== undefined
      ? { driverPaysKycOverride: options.driverPaysKycOverride }
      : {}),
    ...(options?.verificationTierOverride
      ? { verificationTierOverride: options.verificationTierOverride }
      : {}),
    ...(options?.forceReverification !== undefined
      ? { forceReverification: options.forceReverification }
      : {}),
  };
  const body = Object.keys(payload).length > 0 ? JSON.stringify(payload) : undefined;
  return apiCoreFetch<DriverSelfServiceDeliveryRecord>(`/drivers/${driverId}/self-service-links`, {
    method: 'POST',
    cache: 'no-store',
    token: await getTenantApiToken(options?.token),
    ...(body ? { body, headers: { 'Content-Type': 'application/json' } } : {}),
  });
}

export async function getDriverGuarantor(
  driverId: string,
  token?: string,
): Promise<DriverGuarantorRecord> {
  return apiCoreFetch<DriverGuarantorRecord>(`/drivers/${driverId}/guarantor`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function sendGuarantorSelfServiceLink(
  driverId: string,
  token?: string,
): Promise<DriverSelfServiceDeliveryRecord> {
  return apiCoreFetch<DriverSelfServiceDeliveryRecord>(
    `/drivers/${driverId}/guarantor/self-service-links`,
    {
      method: 'POST',
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function updateGuarantorReminderControls(
  driverId: string,
  input: { suppressed: boolean },
  token?: string,
): Promise<DriverGuarantorRecord> {
  return apiCoreFetch<DriverGuarantorRecord>(`/drivers/${driverId}/guarantor/reminder-controls`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createOrUpdateDriverGuarantor(
  driverId: string,
  input: {
    name: string;
    phone: string;
    email?: string;
    countryCode?: string;
    relationship?: string;
  },
  token?: string,
): Promise<DriverGuarantorRecord> {
  return apiCoreFetch<DriverGuarantorRecord>(`/drivers/${driverId}/guarantor`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function removeDriverGuarantor(
  driverId: string,
  reason?: string,
  token?: string,
): Promise<{ success: true }> {
  return apiCoreFetch<{ success: true }>(`/drivers/${driverId}/guarantor`, {
    method: 'DELETE',
    ...(reason ? { body: JSON.stringify({ reason }) } : {}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listDriverDocuments(
  driverId: string,
  token?: string,
): Promise<DriverDocumentRecord[]> {
  return apiCoreFetch<DriverDocumentRecord[]>(`/drivers/${driverId}/documents`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function uploadDriverDocument(
  driverId: string,
  input: {
    documentType: string;
    fileName: string;
    contentType: string;
    fileBase64: string;
    uploadedBy: 'operator' | 'driver_self_service';
  },
  token?: string,
): Promise<DriverDocumentRecord> {
  return apiCoreFetch<DriverDocumentRecord>(`/drivers/${driverId}/documents`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function reviewDriverDocument(
  driverId: string,
  documentId: string,
  input: {
    status: 'approved' | 'rejected';
    expiresAt?: string;
  },
  token?: string,
): Promise<DriverDocumentRecord> {
  return apiCoreFetch<DriverDocumentRecord>(`/drivers/${driverId}/documents/${documentId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function downloadDriversCsv(token?: string): Promise<string> {
  return apiCoreFetch('/drivers/export.csv', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  }).then((value) => String(value));
}

export async function resolveDriverIdentity(
  driverId: string,
  input: DriverIdentityResolutionInput,
  token?: string,
): Promise<DriverIdentityResolutionResult> {
  return apiCoreFetch<DriverIdentityResolutionResult>(`/drivers/${driverId}/identity-resolution`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function retryDriverIdentityVerification(
  driverId: string,
  token?: string,
): Promise<{ queued: boolean; reason?: string }> {
  return apiCoreFetch<{ queued: boolean; reason?: string }>(
    `/drivers/${driverId}/identity-resolution/retry`,
    {
      method: 'POST',
      body: JSON.stringify({}),
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function listVehicles(
  input: PaginationParams & { fleetId?: string } = {},
  token?: string,
): Promise<PaginatedApiResponse<VehicleRecord>> {
  const params = new URLSearchParams();
  if (input.fleetId) {
    params.set('fleetId', input.fleetId);
  }
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return apiCoreFetch<PaginatedApiResponse<VehicleRecord>>(`/vehicles${query ? `?${query}` : ''}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getOperationalReadinessReport(
  token?: string,
): Promise<OperationalReadinessReportRecord> {
  return apiCoreFetch<OperationalReadinessReportRecord>('/reports/operational-readiness', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listTenantInspections(
  input: PaginationParams = {},
  token?: string,
): Promise<PaginatedApiResponse<TenantInspectionRecord>> {
  const params = new URLSearchParams();
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return apiCoreFetch<PaginatedApiResponse<TenantInspectionRecord>>(
    `/inspections${query ? `?${query}` : ''}`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function listTenantWorkOrders(
  input: PaginationParams = {},
  token?: string,
): Promise<PaginatedApiResponse<WorkOrderRecord>> {
  const params = new URLSearchParams();
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return apiCoreFetch<PaginatedApiResponse<WorkOrderRecord>>(
    `/maintenance/work-orders${query ? `?${query}` : ''}`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function createWorkOrder(
  input: CreateWorkOrderInput,
  token?: string,
): Promise<WorkOrderRecord> {
  return apiCoreFetch<WorkOrderRecord>('/maintenance/work-orders', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateWorkOrder(
  workOrderId: string,
  input: UpdateWorkOrderInput,
  token?: string,
): Promise<WorkOrderRecord> {
  return apiCoreFetch<WorkOrderRecord>(`/maintenance/work-orders/${workOrderId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getReportsOverview(
  input: { dateFrom?: string; dateTo?: string } = {},
  token?: string,
): Promise<ReportsOverviewRecord> {
  const params = new URLSearchParams();
  if (input.dateFrom) params.set('dateFrom', input.dateFrom);
  if (input.dateTo) params.set('dateTo', input.dateTo);
  return apiCoreFetch<ReportsOverviewRecord>(
    `/reports/overview${params.toString() ? `?${params.toString()}` : ''}`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function listAuditLog(
  input: PaginationParams & {
    entityType?: string;
    entityId?: string;
    action?: string;
    actorId?: string;
    relatedDriverId?: string;
    relatedVehicleId?: string;
    relatedAssignmentId?: string;
  } = {},
  token?: string,
): Promise<PaginatedApiResponse<AuditLogRecord>> {
  const params = new URLSearchParams();
  if (input.entityType) {
    params.set('entityType', input.entityType);
  }
  if (input.entityId) {
    params.set('entityId', input.entityId);
  }
  if (input.action) {
    params.set('action', input.action);
  }
  if (input.actorId) {
    params.set('actorId', input.actorId);
  }
  if (input.relatedDriverId) {
    params.set('relatedDriverId', input.relatedDriverId);
  }
  if (input.relatedVehicleId) {
    params.set('relatedVehicleId', input.relatedVehicleId);
  }
  if (input.relatedAssignmentId) {
    params.set('relatedAssignmentId', input.relatedAssignmentId);
  }
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }

  return apiCoreFetch<PaginatedApiResponse<AuditLogRecord>>(
    `/audit${params.toString() ? `?${params.toString()}` : ''}`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function getLicenceExpiryReport(token?: string): Promise<LicenceExpiryReportRecord[]> {
  return apiCoreFetch<LicenceExpiryReportRecord[]>('/reports/licence-expiry', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getDriverSelfServiceContext(selfServiceToken: string): Promise<DriverRecord> {
  return apiCoreFetch<DriverRecord>('/driver-self-service/context', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken }),
    cache: 'no-store',
  });
}

export async function createDriverSelfServiceLivenessSession(
  selfServiceToken: string,
  input: { countryCode?: string } = {},
): Promise<DriverLivenessSessionRecord> {
  return apiCoreFetch<DriverLivenessSessionRecord>('/driver-self-service/liveness-sessions', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken, ...input }),
    cache: 'no-store',
  });
}

export async function resolveDriverSelfServiceIdentity(
  selfServiceToken: string,
  input: DriverIdentityResolutionInput,
): Promise<DriverIdentityResolutionResult> {
  return apiCoreFetch<DriverIdentityResolutionResult>('/driver-self-service/identity-resolution', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken, ...input }),
    cache: 'no-store',
  });
}

export async function recordDriverSelfServiceVerificationConsent(
  selfServiceToken: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/driver-self-service/verification-consent', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken }),
    cache: 'no-store',
  });
}

export async function listDriverSelfServiceDocuments(
  selfServiceToken: string,
): Promise<DriverDocumentRecord[]> {
  return apiCoreFetch<DriverDocumentRecord[]>('/driver-self-service/documents/list', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken }),
    cache: 'no-store',
  });
}

export async function listDriverSelfServiceNotifications(
  selfServiceToken: string,
): Promise<UserNotificationRecord[]> {
  return apiCoreFetch<UserNotificationRecord[]>('/driver-self-service/notifications', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken }),
    cache: 'no-store',
  });
}

export async function markDriverSelfServiceNotificationRead(
  selfServiceToken: string,
  notificationId: string,
): Promise<UserNotificationRecord> {
  return apiCoreFetch<UserNotificationRecord>(
    `/driver-self-service/notifications/${notificationId}/read`,
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken }),
      cache: 'no-store',
    },
  );
}

export async function uploadDriverSelfServiceDocument(
  selfServiceToken: string,
  input: {
    documentType: string;
    fileName: string;
    contentType: string;
    fileBase64: string;
    uploadedBy: 'operator' | 'driver_self_service';
  },
): Promise<DriverDocumentRecord> {
  return apiCoreFetch<DriverDocumentRecord>('/driver-self-service/documents', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken, ...input }),
    cache: 'no-store',
  });
}

export async function removeDriverSelfServiceDocument(
  selfServiceToken: string,
  documentId: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>(`/driver-self-service/documents/${documentId}/remove`, {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken }),
    cache: 'no-store',
  });
}

export async function createDriverSelfServiceAccount(
  token: string,
  input: { email: string; password: string },
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/driver-self-service/create-account', {
    method: 'POST',
    body: JSON.stringify({ token, ...input }),
    cache: 'no-store',
  });
}

export async function issueDriverSelfServiceContinuationToken(
  token?: string,
): Promise<{ token: string }> {
  return apiCoreFetch<{ token: string }>('/driver-self-service/authenticated-token', {
    method: 'POST',
    body: JSON.stringify({}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateDriverSelfServiceContact(
  token: string,
  input: { email?: string; phone?: string },
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/driver-self-service/update-contact', {
    method: 'POST',
    body: JSON.stringify({ token, ...input }),
    cache: 'no-store',
  });
}

export async function initiateDriverKycCheckout(
  token: string,
  provider: 'paystack' | 'flutterwave' = 'paystack',
  returnUrl?: string,
): Promise<DriverKycCheckoutRecord> {
  return apiCoreFetch<DriverKycCheckoutRecord>('/driver-self-service/kyc-checkout', {
    method: 'POST',
    body: JSON.stringify({ token, provider, ...(returnUrl ? { returnUrl } : {}) }),
    cache: 'no-store',
  });
}

export async function initiateDriverVerificationAddonCheckout(
  token: string,
  chargeKey: 'guarantor_verification' | 'drivers_license_verification',
  provider: 'paystack' | 'flutterwave' = 'paystack',
  returnUrl?: string,
): Promise<DriverKycCheckoutRecord> {
  return apiCoreFetch<DriverKycCheckoutRecord>('/driver-self-service/verification-addon-checkout', {
    method: 'POST',
    body: JSON.stringify({ token, chargeKey, provider, ...(returnUrl ? { returnUrl } : {}) }),
    cache: 'no-store',
  });
}

export async function verifyDriverVerificationAddonPayment(
  token: string,
  chargeKey: 'guarantor_verification' | 'drivers_license_verification',
  provider: string,
  reference: string,
): Promise<{ status: string }> {
  return apiCoreFetch<{ status: string }>('/driver-self-service/verify-verification-addon-payment', {
    method: 'POST',
    body: JSON.stringify({ token, chargeKey, provider, reference }),
    cache: 'no-store',
  });
}

export async function notifyDriverSelfServiceOrganisation(
  token: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/driver-self-service/notify-organisation', {
    method: 'POST',
    body: JSON.stringify({ token }),
    cache: 'no-store',
  });
}

export async function listDriverSelfServiceAssignments(
  token: string,
): Promise<DriverSelfServiceAssignmentRecord[]> {
  return apiCoreFetch<DriverSelfServiceAssignmentRecord[]>('/driver-self-service/assignments', {
    method: 'POST',
    body: JSON.stringify({ token }),
    cache: 'no-store',
  });
}

export async function acceptDriverSelfServiceAssignment(
  token: string,
  assignmentId: string,
  note?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(
    `/driver-self-service/assignments/${assignmentId}/accept`,
    {
      method: 'POST',
      body: JSON.stringify({ token, ...(note ? { note } : {}) }),
      cache: 'no-store',
    },
  );
}

export async function declineDriverSelfServiceAssignment(
  token: string,
  assignmentId: string,
  note?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(
    `/driver-self-service/assignments/${assignmentId}/decline`,
    {
      method: 'POST',
      body: JSON.stringify({ token, ...(note ? { note } : {}) }),
      cache: 'no-store',
    },
  );
}

export async function listDriverSelfServiceRemittance(
  token: string,
): Promise<RemittanceRecord[]> {
  return apiCoreFetch<RemittanceRecord[]>('/driver-self-service/remittance/list', {
    method: 'POST',
    body: JSON.stringify({ token }),
    cache: 'no-store',
  });
}

export async function recordDriverSelfServiceRemittance(
  token: string,
  input: RecordRemittanceInput,
): Promise<RemittanceRecord> {
  return apiCoreFetch<RemittanceRecord>('/driver-self-service/remittance', {
    method: 'POST',
    body: JSON.stringify({ token, ...input }),
    cache: 'no-store',
  });
}

export async function updateDriverSelfServiceProfile(
  token: string,
  profile: {
    phoneNumber?: string;
    address?: string;
    town?: string;
    localGovernmentArea?: string;
    state?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
    nextOfKinRelationship?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
  },
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/driver-self-service/update-profile', {
    method: 'POST',
    body: JSON.stringify({ token, ...profile }),
    cache: 'no-store',
  });
}

export async function submitDriverSelfServiceGuarantor(
  token: string,
  input: {
    name: string;
    phone: string;
    email?: string;
    countryCode?: string;
    relationship?: string;
  },
): Promise<DriverGuarantorSubmissionResult> {
  return apiCoreFetch<DriverGuarantorSubmissionResult>('/driver-self-service/guarantor', {
    method: 'POST',
    body: JSON.stringify({ token, ...input }),
    cache: 'no-store',
  });
}

export async function assessDriverSelfServiceGuarantorCapacity(
  token: string,
  input: {
    phone?: string;
    email?: string;
    countryCode?: string;
  },
): Promise<DriverGuarantorCapacityAssessment> {
  return apiCoreFetch<DriverGuarantorCapacityAssessment>('/driver-self-service/guarantor-capacity', {
    method: 'POST',
    body: JSON.stringify({ token, ...input }),
    cache: 'no-store',
  });
}

export async function resendDriverSelfServiceGuarantorInvite(
  token: string,
): Promise<DriverGuarantorInvitationResult> {
  return apiCoreFetch<DriverGuarantorInvitationResult>('/driver-self-service/guarantor/resend-invite', {
    method: 'POST',
    body: JSON.stringify({ token }),
    cache: 'no-store',
  });
}

export async function exchangeDriverSelfServiceOtp(otpCode: string): Promise<{ token: string }> {
  return apiCoreFetch<{ token: string }>('/driver-self-service/exchange-otp', {
    method: 'POST',
    body: JSON.stringify({ otpCode }),
    cache: 'no-store',
  });
}

// Returning driver: exchange email/phone + password for a self-service token.
export async function loginDriverSelfServiceWithPassword(
  identifier: string,
  password: string,
): Promise<{ token: string }> {
  return apiCoreFetch<{ token: string }>('/driver-self-service/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
    cache: 'no-store',
  });
}

export type OnboardingStepRecord = {
  step:
    | 'account'
    | 'profile'
    | 'consent'
    | 'payment'
    | 'identity_verification'
    | 'document_verification'
    | 'guarantor'
    | 'manual_review'
    | 'complete';
  reason: string;
  verificationTier: 'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION';
  verificationTierLabel: string;
  verificationTierDescription: string;
  verificationTierComponents: Array<'identity' | 'guarantor' | 'drivers_license'>;
  paymentStatus?: string;
  paymentMessage?: string | null;
  verificationPaymentStatus?: string;
  identityStatus?: string;
  verificationState?: 'not_started' | 'in_progress' | 'provider_called' | 'success' | 'failed';
  hasConsentOnFile?: boolean;
  missingOperationalFields?: string[];
  requiredDocumentTypes?: string[];
  verifiedDocumentTypes?: string[];
  documentVerificationStatus?: string;
  documentFailureReason?: string | null;
  requiresGuarantor?: boolean;
  guarantorBlocking?: boolean;
  guarantorVerified?: boolean;
  guarantorName?: string | null;
  guarantorPhone?: string | null;
  guarantorEmail?: string | null;
  guarantorCountryCode?: string | null;
  guarantorRelationship?: string | null;
  guarantorStatus?: string | null;
};

export async function getDriverOnboardingStep(
  selfServiceToken: string,
): Promise<OnboardingStepRecord> {
  return apiCoreFetch<OnboardingStepRecord>('/driver-self-service/onboarding-step', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken }),
    cache: 'no-store',
  });
}

export type DocumentVerificationRecord = {
  id: string;
  documentType: string;
  idNumber: string;
  countryCode: string;
  status: string;
  providerMatch: boolean | null;
  providerValidity: 'valid' | 'invalid' | 'unknown' | null;
  providerFirstName: string | null;
  providerMiddleName: string | null;
  providerLastName: string | null;
  providerDateOfBirth: string | null;
  providerIssueDate: string | null;
  providerExpiryDate: string | null;
  providerGender: string | null;
  providerStateOfIssuance: string | null;
  providerLicenceClass: string | null;
  portraitAvailable: boolean | null;
  portraitUrl: string | null;
  demographicMatchScore: number | null;
  biometricMatchScore: number | null;
  linkageConfidence: number | null;
  overallLinkageScore: number | null;
  linkageStatus: 'matched' | 'mismatch' | 'pending' | 'insufficient_data';
  linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
  linkageReasons: string[];
  discrepancyFlags: string[];
  identityComparison: {
    firstNameMatch: boolean | null;
    middleNameMatch: boolean | null;
    lastNameMatch: boolean | null;
    dateOfBirthMatch: boolean | null;
    genderMatch: boolean | null;
    biometricMatch: boolean | null;
    biometricConfidence: number | null;
    matchedFieldCount: number;
    comparedFieldCount: number;
  };
  reviewCaseId: string | null;
  manualReviewRequired: boolean;
  reviewDecision: 'approved' | 'rejected' | 'request_reverification' | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  riskImpact: 'low' | 'medium' | 'high' | 'critical';
  riskSummary: string;
  matchScore: number | null;
  riskScore: number | null;
  providerReference: string | null;
  failureReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
};

export async function verifyDriverDocumentId(
  selfServiceToken: string,
  input: {
    documentType: string;
    idNumber: string;
    countryCode: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
  },
): Promise<DocumentVerificationRecord> {
  return apiCoreFetch<DocumentVerificationRecord>('/driver-self-service/verify-document-id', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken, ...input }),
    cache: 'no-store',
  });
}

export async function listDriverDocumentVerifications(
  selfServiceToken: string,
): Promise<DocumentVerificationRecord[]> {
  return apiCoreFetch<DocumentVerificationRecord[]>(
    '/driver-self-service/document-verifications/list',
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken }),
      cache: 'no-store',
    },
  );
}

export async function getGuarantorSelfServiceContext(selfServiceToken: string): Promise<{
  guarantorName: string;
  guarantorPhone: string;
  guarantorEmail: string | null;
  guarantorCountryCode: string | null;
  guarantorRelationship: string | null;
  guarantorDateOfBirth: string | null;
  guarantorGender: string | null;
  guarantorPersonId: string | null;
  guarantorStatus: string;
  guarantorResponsibilityAcceptedAt: string | null;
  guarantorSelfieImageUrl: string | null;
  guarantorProviderImageUrl: string | null;
  driverName: string;
  driverId: string;
  tenantId: string;
  organisationName: string | null;
  hasSelfServiceAccess: boolean;
}> {
  return apiCoreFetch('/guarantor-self-service/context', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken }),
    cache: 'no-store',
  });
}

export async function exchangeGuarantorSelfServiceOtp(otpCode: string): Promise<{ token: string }> {
  return apiCoreFetch<{ token: string }>('/guarantor-self-service/exchange-otp', {
    method: 'POST',
    body: JSON.stringify({ otpCode }),
    cache: 'no-store',
  });
}

export async function createGuarantorSelfServiceAccount(
  token: string,
  input: { email: string; password: string },
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/guarantor-self-service/create-account', {
    method: 'POST',
    body: JSON.stringify({ token, ...input }),
    cache: 'no-store',
  });
}

export async function updateGuarantorSelfServiceProfile(
  token: string,
  input: {
    name?: string;
    phone?: string;
    email?: string;
    countryCode?: string;
    relationship?: string;
  },
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/guarantor-self-service/update-profile', {
    method: 'POST',
    body: JSON.stringify({ token, ...input }),
    cache: 'no-store',
  });
}

export async function recordGuarantorSelfServiceVerificationConsent(
  token: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>('/guarantor-self-service/verification-consent', {
    method: 'POST',
    body: JSON.stringify({ token }),
    cache: 'no-store',
  });
}

export async function issueGuarantorSelfServiceContinuationToken(
  token?: string,
): Promise<{ token: string }> {
  return apiCoreFetch<{ token: string }>('/guarantor-self-service/authenticated-token', {
    method: 'POST',
    body: JSON.stringify({}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createGuarantorSelfServiceLivenessSession(
  selfServiceToken: string,
  input: { countryCode?: string } = {},
): Promise<DriverLivenessSessionRecord> {
  return apiCoreFetch<DriverLivenessSessionRecord>('/guarantor-self-service/liveness-sessions', {
    method: 'POST',
    body: JSON.stringify({ token: selfServiceToken, ...input }),
    cache: 'no-store',
  });
}

export async function resolveGuarantorSelfServiceIdentity(
  selfServiceToken: string,
  input: DriverIdentityResolutionInput,
): Promise<DriverIdentityResolutionResult> {
  return apiCoreFetch<DriverIdentityResolutionResult>(
    '/guarantor-self-service/identity-resolution',
    {
      method: 'POST',
      body: JSON.stringify({ token: selfServiceToken, ...input }),
      cache: 'no-store',
    },
  );
}

export async function getVehicle(vehicleId: string, token?: string): Promise<VehicleDetailRecord> {
  return apiCoreFetch<VehicleDetailRecord>(`/vehicles/${vehicleId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function getVehicleCodeSuggestion(
  fleetId: string,
  token?: string,
): Promise<VehicleCodeSuggestionRecord> {
  return apiCoreFetch<VehicleCodeSuggestionRecord>(
    `/vehicles/code-suggestion?fleetId=${encodeURIComponent(fleetId)}`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function createVehicle(
  input: CreateVehicleInput,
  token?: string,
): Promise<VehicleRecord> {
  return apiCoreFetch<VehicleRecord>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function importVehiclesCsv(
  csvContent: string,
  token?: string,
): Promise<{ createdCount: number; failedCount: number; errors: string[] }> {
  return apiCoreFetch('/vehicles/import', {
    method: 'POST',
    body: JSON.stringify({ csvContent }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function downloadVehiclesCsv(token?: string): Promise<string> {
  return apiCoreFetch('/vehicles/export.csv', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  }).then((value) => String(value));
}

export async function updateVehicle(
  vehicleId: string,
  input: UpdateVehicleInput,
  token?: string,
): Promise<VehicleRecord> {
  return apiCoreFetch<VehicleRecord>(`/vehicles/${vehicleId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listVehicleInspections(
  vehicleId: string,
  token?: string,
): Promise<VehicleInspectionRecord[]> {
  return apiCoreFetch<VehicleInspectionRecord[]>(`/vehicles/${vehicleId}/inspections`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createVehicleInspection(
  vehicleId: string,
  input: {
    inspectionType: string;
    status?: string;
    inspectionDate?: string;
    odometerKm?: number;
    issuesFoundCount?: number;
    reportSource?: string;
    summary: string;
    reportUrl?: string;
    nextInspectionDueAt?: string;
  },
  token?: string,
): Promise<VehicleInspectionRecord> {
  return apiCoreFetch<VehicleInspectionRecord>(`/vehicles/${vehicleId}/inspections`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listVehicleMaintenanceSchedules(
  vehicleId: string,
  token?: string,
): Promise<VehicleMaintenanceScheduleRecord[]> {
  return apiCoreFetch<VehicleMaintenanceScheduleRecord[]>(
    `/vehicles/${vehicleId}/maintenance-schedules`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function upsertVehicleMaintenanceSchedule(
  vehicleId: string,
  input: {
    scheduleType: string;
    intervalDays?: number;
    intervalKm?: number;
    nextDueAt?: string;
    nextDueOdometerKm?: number;
    source?: string;
    notes?: string;
    isActive?: boolean;
  },
  token?: string,
): Promise<VehicleMaintenanceScheduleRecord> {
  return apiCoreFetch<VehicleMaintenanceScheduleRecord>(
    `/vehicles/${vehicleId}/maintenance-schedules`,
    {
      method: 'POST',
      body: JSON.stringify(input),
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function listVehicleMaintenanceEvents(
  vehicleId: string,
  token?: string,
): Promise<VehicleMaintenanceEventRecord[]> {
  return apiCoreFetch<VehicleMaintenanceEventRecord[]>(
    `/vehicles/${vehicleId}/maintenance-events`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function createVehicleMaintenanceEvent(
  vehicleId: string,
  input: {
    category: string;
    title: string;
    description?: string;
    status?: string;
    scheduledFor?: string;
    completedAt?: string;
    odometerKm?: number;
    costMinorUnits?: number;
    currency?: string;
    vendor?: string;
  },
  token?: string,
): Promise<VehicleMaintenanceEventRecord> {
  return apiCoreFetch<VehicleMaintenanceEventRecord>(`/vehicles/${vehicleId}/maintenance-events`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listVehicleIncidents(
  vehicleId: string,
  token?: string,
): Promise<VehicleIncidentRecord[]> {
  return apiCoreFetch<VehicleIncidentRecord[]>(`/vehicles/${vehicleId}/incidents`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createVehicleIncident(
  vehicleId: string,
  input: {
    driverId?: string;
    occurredAt: string;
    category: string;
    severity: string;
    title: string;
    description?: string;
    estimatedCostMinorUnits?: number;
    currency?: string;
  },
  token?: string,
): Promise<VehicleIncidentRecord> {
  return apiCoreFetch<VehicleIncidentRecord>(`/vehicles/${vehicleId}/incidents`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listVehicleMakers(token?: string, q?: string): Promise<VehicleMakerRecord[]> {
  const search = q ? `?q=${encodeURIComponent(q)}` : '';
  return apiCoreFetch<VehicleMakerRecord[]>(`/vehicle-catalog/makers${search}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createVehicleMaker(
  input: CreateVehicleMakerInput,
  token?: string,
): Promise<VehicleMakerRecord> {
  return apiCoreFetch<VehicleMakerRecord>('/vehicle-catalog/makers', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listVehicleModels(
  input: {
    makerId?: string;
    q?: string;
    vehicleType?: string;
  } = {},
  token?: string,
): Promise<VehicleModelCatalogRecord[]> {
  const params = new URLSearchParams();
  if (input.makerId) {
    params.set('makerId', input.makerId);
  }
  if (input.q) {
    params.set('q', input.q);
  }
  if (input.vehicleType) {
    params.set('vehicleType', input.vehicleType);
  }

  const query = params.toString();
  return apiCoreFetch<VehicleModelCatalogRecord[]>(
    `/vehicle-catalog/models${query ? `?${query}` : ''}`,
    {
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function createVehicleModel(
  input: CreateVehicleModelInput,
  token?: string,
): Promise<VehicleModelCatalogRecord> {
  return apiCoreFetch<VehicleModelCatalogRecord>('/vehicle-catalog/models', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function decodeVehicleVin(
  input: DecodeVehicleVinInput,
  token?: string,
): Promise<VehicleVinDecodeRecord> {
  return apiCoreFetch<VehicleVinDecodeRecord>('/vehicle-catalog/decode-vin', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateVehicleStatus(
  vehicleId: string,
  status: string,
  token?: string,
): Promise<VehicleRecord> {
  return apiCoreFetch<VehicleRecord>(`/vehicles/${vehicleId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export function listAssignments(
  input: PaginationParams & {
    driverId?: string;
    vehicleId?: string;
    fleetId?: string;
  } = {},
  token?: string,
): Promise<PaginatedApiResponse<AssignmentRecord>> {
  const params = new URLSearchParams();
  if (input.driverId) {
    params.set('driverId', input.driverId);
  }
  if (input.vehicleId) {
    params.set('vehicleId', input.vehicleId);
  }
  if (input.fleetId) {
    params.set('fleetId', input.fleetId);
  }
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return getTenantApiToken(token).then((resolvedToken) =>
    apiCoreFetch<PaginatedApiResponse<AssignmentRecord>>(
      `/assignments${query ? `?${query}` : ''}`,
      {
        cache: 'no-store',
        token: resolvedToken,
      },
    ),
  );
}

export async function getAssignment(
  assignmentId: string,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function createAssignment(
  input: CreateAssignmentInput,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>('/assignments', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function importAssignmentsCsv(
  csvContent: string,
  token?: string,
): Promise<{ createdCount: number; failedCount: number; errors: string[] }> {
  return apiCoreFetch('/assignments/import', {
    method: 'POST',
    body: JSON.stringify({ csvContent }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateAssignmentRemittancePlan(
  assignmentId: string,
  input: UpdateAssignmentRemittancePlanInput,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}/remittance-plan`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function startAssignment(
  assignmentId: string,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}/start`, {
    method: 'POST',
    body: JSON.stringify({}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function acceptAssignmentTerms(
  assignmentId: string,
  input: { acceptedFrom?: string; note?: string } = {},
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}/accept-terms`, {
    method: 'POST',
    body: JSON.stringify({
      acceptedFrom: input.acceptedFrom ?? 'operator_console',
      ...(input.note ? { note: input.note } : {}),
    }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function declineAssignment(
  assignmentId: string,
  notes?: string,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}/decline`, {
    method: 'POST',
    body: JSON.stringify(notes ? { notes } : {}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function completeAssignment(
  assignmentId: string,
  notes?: string,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}/complete`, {
    method: 'POST',
    body: JSON.stringify(notes ? { notes } : {}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function cancelAssignment(
  assignmentId: string,
  notes?: string,
  token?: string,
): Promise<AssignmentRecord> {
  return apiCoreFetch<AssignmentRecord>(`/assignments/${assignmentId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(notes ? { notes } : {}),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export function listRemittances(
  input: PaginationParams & {
    assignmentId?: string;
    driverId?: string;
    status?: string;
  } = {},
  token?: string,
): Promise<PaginatedApiResponse<RemittanceRecord>> {
  const params = new URLSearchParams();
  if (input.assignmentId) {
    params.set('assignmentId', input.assignmentId);
  }
  if (input.driverId) {
    params.set('driverId', input.driverId);
  }
  if (input.status) {
    params.set('status', input.status);
  }
  if (typeof input.page === 'number') {
    params.set('page', String(input.page));
  }
  if (typeof input.limit === 'number') {
    params.set('limit', String(input.limit));
  }
  const query = params.toString();

  return getTenantApiToken(token).then((resolvedToken) =>
    apiCoreFetch<PaginatedApiResponse<RemittanceRecord>>(`/remittance${query ? `?${query}` : ''}`, {
      cache: 'no-store',
      token: resolvedToken,
    }),
  );
}

export async function downloadRemittancesCsv(token?: string): Promise<string> {
  return apiCoreFetch('/remittance/export.csv', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  }).then((value) => String(value));
}

export async function recordRemittance(
  input: RecordRemittanceInput,
  token?: string,
): Promise<RemittanceRecord> {
  return apiCoreFetch<RemittanceRecord>('/remittance', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function confirmRemittance(
  remittanceId: string,
  paidDate: string,
  token?: string,
): Promise<RemittanceRecord> {
  return apiCoreFetch<RemittanceRecord>(`/remittance/${remittanceId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ paidDate }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function confirmManyRemittances(
  ids: string[],
  paidDate: string,
  token?: string,
): Promise<RemittanceRecord[]> {
  return apiCoreFetch<RemittanceRecord[]>('/remittance/actions/bulk-confirm', {
    method: 'POST',
    body: JSON.stringify({ ids, paidDate }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function disputeRemittance(
  remittanceId: string,
  notes: string,
  token?: string,
): Promise<RemittanceRecord> {
  return apiCoreFetch<RemittanceRecord>(`/remittance/${remittanceId}/dispute`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function waiveRemittance(
  remittanceId: string,
  notes: string,
  token?: string,
): Promise<RemittanceRecord> {
  return apiCoreFetch<RemittanceRecord>(`/remittance/${remittanceId}/waive`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function resolveManyRemittanceDisputes(
  ids: string[],
  paidDate: string,
  token?: string,
): Promise<RemittanceRecord[]> {
  return apiCoreFetch<RemittanceRecord[]>('/remittance/actions/bulk-resolve-disputes', {
    method: 'POST',
    body: JSON.stringify({ ids, paidDate }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export function listOperationalDocuments(
  input: {
    relatedEntityType?: string;
    relatedEntityId?: string;
    documentType?: string;
  } = {},
  token?: string,
): Promise<RecordDocumentRecord[]> {
  const params = new URLSearchParams();
  if (input.relatedEntityType) {
    params.set('relatedEntityType', input.relatedEntityType);
  }
  if (input.relatedEntityId) {
    params.set('relatedEntityId', input.relatedEntityId);
  }
  if (input.documentType) {
    params.set('documentType', input.documentType);
  }
  const query = params.toString();

  return getTenantApiToken(token).then((resolvedToken) =>
    apiCoreFetch<RecordDocumentRecord[]>(`/records/documents${query ? `?${query}` : ''}`, {
      cache: 'no-store',
      token: resolvedToken,
    }),
  );
}

export function listOperationalDisputes(
  input: {
    status?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  } = {},
  token?: string,
): Promise<RecordDisputeRecord[]> {
  const params = new URLSearchParams();
  if (input.status) {
    params.set('status', input.status);
  }
  if (input.relatedEntityType) {
    params.set('relatedEntityType', input.relatedEntityType);
  }
  if (input.relatedEntityId) {
    params.set('relatedEntityId', input.relatedEntityId);
  }
  const query = params.toString();

  return getTenantApiToken(token).then((resolvedToken) =>
    apiCoreFetch<RecordDisputeRecord[]>(`/records/disputes${query ? `?${query}` : ''}`, {
      cache: 'no-store',
      token: resolvedToken,
    }),
  );
}

export async function getOperationalWalletBalance(
  businessEntityId: string,
  token?: string,
): Promise<WalletBalanceRecord> {
  return apiCoreFetch<WalletBalanceRecord>(`/operational-wallets/${businessEntityId}/balance`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function listOperationalWalletEntries(
  businessEntityId: string,
  token?: string,
): Promise<WalletEntryRecord[]> {
  return apiCoreFetch<WalletEntryRecord[]>(`/operational-wallets/${businessEntityId}/entries`, {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

// ── Team management ────────────────────────────────────────────────────────────

export interface TeamMemberRecord {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  assignedFleetIds: string[];
  assignedVehicleIds: string[];
  customPermissions: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  mobileAccessRevoked: boolean;
  activePushDeviceCount: number;
  lastPushDeviceSeenAt?: string | null;
  pushDevices: PushDeviceRecord[];
  createdAt: string;
}

export interface InviteTeamMemberInput {
  name: string;
  email: string;
  role: string;
  phone?: string;
  assignedFleetIds?: string[];
  assignedVehicleIds?: string[];
  customPermissions?: string[];
}

export interface UpdateTeamMemberAccessInput {
  assignedFleetIds?: string[];
  assignedVehicleIds?: string[];
  customPermissions?: string[];
}

export async function listTeamMembers(token?: string): Promise<TeamMemberRecord[]> {
  return apiCoreFetch<TeamMemberRecord[]>('/team', {
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function inviteTeamMember(
  input: InviteTeamMemberInput,
  token?: string,
): Promise<TeamMemberRecord> {
  return apiCoreFetch<TeamMemberRecord>('/team/invite', {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateTeamMemberAccess(
  userId: string,
  input: UpdateTeamMemberAccessInput,
  token?: string,
): Promise<TeamMemberRecord> {
  return apiCoreFetch<TeamMemberRecord>(`/team/${encodeURIComponent(userId)}/access`, {
    method: 'POST',
    body: JSON.stringify(input),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function updateTeamMemberMobileAccess(
  userId: string,
  revoked: boolean,
  token?: string,
): Promise<TeamMemberRecord> {
  return apiCoreFetch<TeamMemberRecord>(`/team/${encodeURIComponent(userId)}/mobile-access`, {
    method: 'POST',
    body: JSON.stringify({ revoked }),
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function disableTeamMemberPushDevice(
  userId: string,
  deviceId: string,
  token?: string,
): Promise<TeamMemberRecord> {
  return apiCoreFetch<TeamMemberRecord>(
    `/team/${encodeURIComponent(userId)}/push-devices/${encodeURIComponent(deviceId)}`,
    {
      method: 'DELETE',
      cache: 'no-store',
      token: await getTenantApiToken(token),
    },
  );
}

export async function deactivateTeamMember(
  userId: string,
  token?: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>(`/team/${userId}`, {
    method: 'DELETE',
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}

export async function resendTeamInvite(
  userId: string,
  token?: string,
): Promise<{ message: string }> {
  return apiCoreFetch<{ message: string }>(`/team/${userId}/resend-invite`, {
    method: 'POST',
    cache: 'no-store',
    token: await getTenantApiToken(token),
  });
}
