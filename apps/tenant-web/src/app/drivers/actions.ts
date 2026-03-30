'use server';

import { getCountryConfig, isCountrySupported } from '@mobility-os/domain-config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  type CreateDriverInput,
  type DriverIdentityResolutionResult,
  type DriverLivenessSessionRecord,
  type DriverSelfServiceDeliveryRecord,
  archiveDriver,
  createDriver,
  createDriverLivenessSession,
  createDriverSelfServiceLivenessSession,
  createGuarantorSelfServiceLivenessSession,
  createOrUpdateDriverGuarantor,
  disableDriverMobileAccessDevice,
  getTenantBillingSummary,
  getTenantMe,
  importDriversCsv,
  linkDriverMobileAccessUser,
  removeDriverGuarantor,
  resolveDriverIdentity,
  resolveDriverSelfServiceIdentity,
  resolveGuarantorSelfServiceIdentity,
  retryDriverIdentityVerification,
  reviewDriverDocument,
  sendDriverSelfServiceLink,
  sendGuarantorSelfServiceLink,
  unlinkDriverMobileAccessUser,
  updateDriverMobileAccessStatus,
  updateDriverStatus,
  uploadDriverDocument,
  uploadDriverSelfServiceDocument,
} from '../../lib/api-core';
import { readBulkImportFileAsCsv } from '../../lib/bulk-import-spreadsheet';

const MAX_DRIVER_DOCUMENT_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_DRIVER_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export interface CreateDriverActionState {
  error?: string;
  success?: string;
}

export interface StartDriverVerificationActionState {
  error?: string;
  errorCode?: 'liveness_unavailable';
  session?: DriverLivenessSessionRecord;
}

export interface ResolveDriverVerificationActionState {
  error?: string;
  result?: DriverIdentityResolutionResult;
  success?: string;
}

export interface SendDriverSelfServiceLinkActionState {
  error?: string;
  success?: string;
  delivery?: DriverSelfServiceDeliveryRecord;
}

export interface UpdateDriverStatusActionState {
  error?: string;
  success?: string;
}

export interface RemoveDriverActionState {
  error?: string;
  success?: string;
}

export interface UploadDriverDocumentActionState {
  error?: string;
  success?: string;
}

export interface ReviewDriverDocumentActionState {
  error?: string;
  success?: string;
}

export interface DriverGuarantorActionState {
  error?: string;
  success?: string;
}

export interface DriverMobileAccessActionState {
  error?: string;
  success?: string;
}

export interface DriverBulkImportActionState {
  error?: string;
  success?: string;
}

function sanitizeSelfServiceErrorMessage(message: string): string {
  const normalized = message.toLowerCase();
  if (
    normalized.includes('provider') ||
    normalized.includes('fallback') ||
    normalized.includes('internal_free_service')
  ) {
    return 'Live verification is unavailable right now. Please try again.';
  }
  if (
    normalized.includes('intelligence service') ||
    normalized.includes('temporarily unavailable') ||
    normalized.includes('status 500')
  ) {
    return 'Identity verification is temporarily unavailable. Please try again.';
  }
  return message;
}

function getVerificationSubmissionFeedback(
  result: DriverIdentityResolutionResult,
): Pick<ResolveDriverVerificationActionState, 'error' | 'success'> {
  if (result.providerPending) {
    return {
      success:
        'Identity verification was submitted successfully. The provider result is still being recovered.',
    };
  }

  if (result.decision === 'failed' || result.providerLookupStatus === 'no_match') {
    return {
      error:
        'Identity verification failed. Confirm the identifier and live selfie, then try again.',
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

function getTrimmedValue(formData: FormData, key: keyof CreateDriverInput): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function createDriverAction(
  _prevState: CreateDriverActionState,
  formData: FormData,
): Promise<CreateDriverActionState> {
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

  let driverId: string;
  let inviteStatus: 'sent' | 'skipped' | 'failed' | null = null;
  try {
    const driver = await createDriver(payload);
    driverId = driver.id;
    inviteStatus = driver.selfServiceInviteStatus ?? null;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to create driver at this time.',
    };
  }

  revalidatePath('/drivers');

  // Check wallet balance if org pays for verification
  let walletWarning = false;
  try {
    const [settings, billing] = await Promise.all([getTenantMe(), getTenantBillingSummary()]);
    const orgPaysForVerification =
      (settings.requireIdentityVerificationForActivation ?? true) &&
      !(settings.driverPaysKyc ?? false);
    const requiredAmountMinorUnits = settings.verificationTierPriceMinorUnits ?? 0;
    if (orgPaysForVerification) {
      const availableSpendMinorUnits = billing.verificationSpend.availableSpendMinorUnits;
      if (
        requiredAmountMinorUnits > 0 &&
        availableSpendMinorUnits < requiredAmountMinorUnits
      ) {
        walletWarning = true;
      }
    }
  } catch {
    // Non-blocking — don't fail driver creation over a balance check
  }

  redirect(
    `/drivers/${driverId}?tab=verification&created=1${inviteStatus ? `&invite=${inviteStatus}` : ''}${walletWarning ? '&walletWarning=1' : ''}`,
  );
}

function getOptionalTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getIdentifierValues(formData: FormData): Array<{
  type: string;
  value: string;
}> {
  const identifiers: Array<{ type: string; value: string }> = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('identifier_') || typeof value !== 'string') {
      continue;
    }

    const type = key.replace('identifier_', '').trim();
    const normalizedValue = value.trim();
    if (!type || !normalizedValue) {
      continue;
    }

    identifiers.push({ type, value: normalizedValue });
  }

  return identifiers;
}

function isSupportedIdentifierTypeForCountry(identifierType: string, countryCode: string): boolean {
  if (!isCountrySupported(countryCode)) return true; // unknown country — let the server validate
  const supported = getCountryConfig(countryCode).supportedIdentifierTypes.map((t) => t.type);
  return supported.includes(identifierType);
}

function getOptionalBooleanValue(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on';
}

async function getCsvFileContents(formData: FormData): Promise<string> {
  const file = formData.get('csvFile');
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Choose a CSV or Excel file to import.');
  }

  const content = await readBulkImportFileAsCsv(file);
  if (!content.trim()) {
    throw new Error('The uploaded import file is empty.');
  }

  return content;
}

export async function importDriversCsvAction(
  _prevState: DriverBulkImportActionState,
  formData: FormData,
): Promise<DriverBulkImportActionState> {
  try {
    const csvContent = await getCsvFileContents(formData);
    const autoSendSelfServiceLink = formData.get('autoSendSelfServiceLink') === 'on';
    const result = await importDriversCsv(csvContent, autoSendSelfServiceLink);
    revalidatePath('/drivers');
    revalidatePath('/reports/readiness');
    return {
      success: `Imported ${result.createdCount} drivers. ${result.failedCount} rows failed.`,
      ...(result.errors.length > 0 ? { error: result.errors.slice(0, 5).join(' ') } : {}),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to import driver CSV.',
    };
  }
}

async function getOptionalImageBase64(
  formData: FormData,
  key: string,
): Promise<string | undefined> {
  const directValue = formData.get(`${key}Base64`);
  if (typeof directValue === 'string' && directValue.trim().length > 0) {
    return directValue.trim();
  }

  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) {
    return undefined;
  }

  const bytes = Buffer.from(await value.arrayBuffer());
  return bytes.toString('base64');
}

export async function startDriverVerificationAction(
  _prevState: StartDriverVerificationActionState,
  formData: FormData,
): Promise<StartDriverVerificationActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const countryCode = getOptionalTrimmedValue(formData, 'countryCode').toUpperCase();

  if (!driverId) {
    return { error: 'Driver is required to start verification.' };
  }

  try {
    const session = await createDriverLivenessSession(driverId, {
      ...(countryCode ? { countryCode } : {}),
    });

    return { session };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to start identity verification at this time.';

    return {
      error: message,
      ...(message.toLowerCase().includes('live verification is unavailable')
        ? { errorCode: 'liveness_unavailable' as const }
        : {}),
    };
  }
}

export async function startDriverSelfServiceVerificationAction(
  _prevState: StartDriverVerificationActionState,
  formData: FormData,
): Promise<StartDriverVerificationActionState> {
  const token = getOptionalTrimmedValue(formData, 'token');
  const countryCode = getOptionalTrimmedValue(formData, 'countryCode').toUpperCase();

  if (!token) {
    return { error: 'The self-service verification link is missing or invalid.' };
  }

  try {
    const session = await createDriverSelfServiceLivenessSession(token, {
      ...(countryCode ? { countryCode } : {}),
    });

    return { session };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to start self-service verification at this time.';

    return {
      error: sanitizeSelfServiceErrorMessage(message),
      ...(message.toLowerCase().includes('live verification is unavailable')
        ? { errorCode: 'liveness_unavailable' as const }
        : {}),
    };
  }
}

export async function resolveDriverVerificationAction(
  _prevState: ResolveDriverVerificationActionState,
  formData: FormData,
): Promise<ResolveDriverVerificationActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const countryCode = getOptionalTrimmedValue(formData, 'countryCode').toUpperCase();
  const sessionId = getOptionalTrimmedValue(formData, 'sessionId');
  const providerName = getOptionalTrimmedValue(formData, 'providerName');
  const subjectConsent = getOptionalBooleanValue(formData, 'subjectConsent');
  const selfieImageBase64 = await getOptionalImageBase64(formData, 'selfieImage');
  const selfieImageUrl = getOptionalTrimmedValue(formData, 'selfieImageUrl');
  const enteredIdentifiers = getIdentifierValues(formData);
  const hasCapturedLivenessEvidence = Boolean(selfieImageBase64 || selfieImageUrl);

  if (!driverId) {
    return {
      error: 'Driver is required.',
    };
  }

  if (!sessionId) {
    return {
      error: 'Start live verification before submitting this identity check.',
    };
  }

  if (enteredIdentifiers.length === 0) {
    return {
      error:
        'Enter at least one identity identifier for this country before submitting verification.',
    };
  }

  for (const identifier of enteredIdentifiers) {
    if (!isSupportedIdentifierTypeForCountry(identifier.type, countryCode)) {
      const supported = isCountrySupported(countryCode)
        ? getCountryConfig(countryCode)
            .supportedIdentifierTypes.map((t) => t.label)
            .join(', ')
        : identifier.type;
      return {
        error: `Identifier type '${identifier.type}' is not supported for country '${countryCode}'. Supported: ${supported}.`,
      };
    }
  }

  if (!subjectConsent) {
    return {
      error: 'Subject consent must be confirmed before submitting verification.',
    };
  }

  try {
    const result = await resolveDriverIdentity(driverId, {
      ...(countryCode ? { countryCode } : {}),
      subjectConsent,
      ...(selfieImageBase64 ? { selfieImageBase64 } : {}),
      ...(selfieImageUrl ? { selfieImageUrl } : {}),
      identifiers: enteredIdentifiers.map((identifier) => ({
        type: identifier.type,
        value: identifier.value,
        ...(countryCode ? { countryCode } : {}),
      })),
      livenessCheck: {
        ...(providerName ? { provider: providerName } : {}),
        sessionId,
        ...(hasCapturedLivenessEvidence ? { passed: true } : {}),
      },
    });

    revalidatePath('/drivers');
    revalidatePath(`/drivers/${driverId}`);
    revalidatePath(`/drivers/${driverId}/review`);
    const feedback = getVerificationSubmissionFeedback(result);
    return {
      result,
      ...feedback,
    };
  } catch (error) {
    return {
      error: sanitizeSelfServiceErrorMessage(
        error instanceof Error ? error.message : 'Unable to resolve identity at this time.',
      ),
    };
  }
}

export async function resolveDriverSelfServiceVerificationAction(
  _prevState: ResolveDriverVerificationActionState,
  formData: FormData,
): Promise<ResolveDriverVerificationActionState> {
  const token = getOptionalTrimmedValue(formData, 'token');
  const countryCode = getOptionalTrimmedValue(formData, 'countryCode').toUpperCase();
  const sessionId = getOptionalTrimmedValue(formData, 'sessionId');
  const providerName = getOptionalTrimmedValue(formData, 'providerName');
  const subjectConsent = getOptionalBooleanValue(formData, 'subjectConsent');
  const selfieImageBase64 = await getOptionalImageBase64(formData, 'selfieImage');
  const selfieImageUrl = getOptionalTrimmedValue(formData, 'selfieImageUrl');
  const enteredIdentifiers = getIdentifierValues(formData);
  const hasCapturedLivenessEvidence = Boolean(selfieImageBase64 || selfieImageUrl);
  if (!token) {
    return {
      error: 'The self-service verification link is missing or expired.',
    };
  }

  // Biometric liveness is always required in the self-service flow. The 'manual'
  // mode is reserved for operator-initiated manual override only, not self-service.
  if (!sessionId) {
    return {
      error: 'Complete the live selfie check before submitting your identity verification.',
    };
  }

  if (enteredIdentifiers.length === 0) {
    return {
      error:
        'Enter at least one identity identifier for this country before submitting verification.',
    };
  }

  if (!subjectConsent) {
    return {
      error: 'Consent must be confirmed before submitting verification.',
    };
  }

  try {
    const result = await resolveDriverSelfServiceIdentity(token, {
      ...(countryCode ? { countryCode } : {}),
      subjectConsent,
      ...(selfieImageBase64 ? { selfieImageBase64 } : {}),
      ...(selfieImageUrl ? { selfieImageUrl } : {}),
      identifiers: enteredIdentifiers.map((identifier) => ({
        type: identifier.type,
        value: identifier.value,
        ...(countryCode ? { countryCode } : {}),
      })),
      livenessCheck: {
        ...(providerName ? { provider: providerName } : {}),
        sessionId,
        // Submit the observed SDK outcome alongside the backend-issued session id.
        // Intelligence still prefers provider-side evaluation, but if the provider
        // lookup is temporarily behind (for example YouVerify session sync lag),
        // LivenessService can safely fall back to this same-session evidence instead
        // of failing the verification submission outright.
        ...(hasCapturedLivenessEvidence ? { passed: true } : {}),
      },
    });

    const feedback = getVerificationSubmissionFeedback(result);
    return {
      result,
      ...feedback,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to resolve identity at this time.',
    };
  }
}

export async function startGuarantorSelfServiceVerificationAction(
  _prevState: StartDriverVerificationActionState,
  formData: FormData,
): Promise<StartDriverVerificationActionState> {
  const token = getOptionalTrimmedValue(formData, 'token');
  const countryCode = getOptionalTrimmedValue(formData, 'countryCode').toUpperCase();

  if (!token) {
    return { error: 'The guarantor verification link is missing or invalid.' };
  }

  try {
    const session = await createGuarantorSelfServiceLivenessSession(token, {
      ...(countryCode ? { countryCode } : {}),
    });

    return { session };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to start guarantor verification at this time.';

    return {
      error: sanitizeSelfServiceErrorMessage(message),
      ...(message.toLowerCase().includes('live verification is unavailable')
        ? { errorCode: 'liveness_unavailable' as const }
        : {}),
    };
  }
}

export async function resolveGuarantorSelfServiceVerificationAction(
  _prevState: ResolveDriverVerificationActionState,
  formData: FormData,
): Promise<ResolveDriverVerificationActionState> {
  const token = getOptionalTrimmedValue(formData, 'token');
  const countryCode = getOptionalTrimmedValue(formData, 'countryCode').toUpperCase();
  const sessionId = getOptionalTrimmedValue(formData, 'sessionId');
  const providerName = getOptionalTrimmedValue(formData, 'providerName');
  const subjectConsent = getOptionalBooleanValue(formData, 'subjectConsent');
  const selfieImageBase64 = await getOptionalImageBase64(formData, 'selfieImage');
  const selfieImageUrl = getOptionalTrimmedValue(formData, 'selfieImageUrl');
  const enteredIdentifiers = getIdentifierValues(formData);
  const hasCapturedLivenessEvidence = Boolean(selfieImageBase64 || selfieImageUrl);

  if (!token) {
    return { error: 'The guarantor verification link is missing or expired.' };
  }

  if (!sessionId) {
    return { error: 'Start live verification before submitting this identity check.' };
  }

  if (enteredIdentifiers.length === 0) {
    return { error: 'Enter at least one identity identifier before submitting verification.' };
  }

  if (!subjectConsent) {
    return { error: 'Consent must be confirmed before submitting verification.' };
  }

  try {
    const result = await resolveGuarantorSelfServiceIdentity(token, {
      ...(countryCode ? { countryCode } : {}),
      subjectConsent,
      ...(selfieImageBase64 ? { selfieImageBase64 } : {}),
      ...(selfieImageUrl ? { selfieImageUrl } : {}),
      identifiers: enteredIdentifiers.map((identifier) => ({
        type: identifier.type,
        value: identifier.value,
        ...(countryCode ? { countryCode } : {}),
      })),
      livenessCheck: {
        ...(providerName ? { provider: providerName } : {}),
        sessionId,
        ...(hasCapturedLivenessEvidence ? { passed: true } : {}),
      },
    });

    const feedback = getVerificationSubmissionFeedback(result);
    return {
      result,
      ...feedback,
    };
  } catch (error) {
    return {
      error: sanitizeSelfServiceErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to resolve guarantor identity at this time.',
      ),
    };
  }
}

export async function sendGuarantorSelfServiceLinkAction(
  _prevState: SendDriverSelfServiceLinkActionState,
  formData: FormData,
): Promise<SendDriverSelfServiceLinkActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');

  if (!driverId) {
    return { error: 'Driver is required before sending a guarantor verification link.' };
  }

  try {
    const delivery = await sendGuarantorSelfServiceLink(driverId);
    return {
      delivery,
      success: `A guarantor verification link was sent to ${delivery.destination}.`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to send the guarantor verification link.',
    };
  }
}

export async function sendDriverSelfServiceLinkAction(
  _prevState: SendDriverSelfServiceLinkActionState,
  formData: FormData,
): Promise<SendDriverSelfServiceLinkActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const verificationTierOverride = getOptionalTrimmedValue(formData, 'verificationTierOverride');
  const forceReverificationRaw = formData.get('forceReverification');
  const forceReverification =
    forceReverificationRaw === 'true'
      ? true
      : forceReverificationRaw === 'false'
        ? false
        : undefined;
  const driverPaysKycOverrideRaw = formData.get('driverPaysKycOverride');
  const driverPaysKycOverride =
    driverPaysKycOverrideRaw === 'true'
      ? true
      : driverPaysKycOverrideRaw === 'false'
        ? false
        : undefined;

  if (!driverId) {
    return { error: 'Driver is required before sending a self-service link.' };
  }

  try {
    const delivery = await sendDriverSelfServiceLink(driverId, {
      ...(driverPaysKycOverride !== undefined ? { driverPaysKycOverride } : {}),
      ...(verificationTierOverride === 'BASIC_IDENTITY' ||
      verificationTierOverride === 'VERIFIED_IDENTITY' ||
      verificationTierOverride === 'FULL_TRUST_VERIFICATION'
        ? { verificationTierOverride }
        : {}),
      ...(forceReverification !== undefined ? { forceReverification } : {}),
    });
    return {
      delivery,
      success:
        forceReverification === true
          ? `A re-verification link was sent to ${delivery.destination}. Fresh verified details will replace the current identity record when the driver completes the new check.`
          : `A self-service verification link was sent to ${delivery.destination}.`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to send the self-service verification link.',
    };
  }
}

export async function updateDriverStatusAction(
  _prevState: UpdateDriverStatusActionState,
  formData: FormData,
): Promise<UpdateDriverStatusActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const status = getOptionalTrimmedValue(formData, 'status');

  if (!driverId || !status) {
    return { error: 'Driver and status are required.' };
  }

  try {
    await updateDriverStatus(driverId, status);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to update driver status at this time.',
    };
  }

  revalidatePath('/drivers');
  revalidatePath(`/drivers/${driverId}`);
  return {
    success: `Driver status updated to ${status}.`,
  };
}

export async function removeDriverAction(
  _prevState: RemoveDriverActionState,
  formData: FormData,
): Promise<RemoveDriverActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const reason = getOptionalTrimmedValue(formData, 'reason');

  if (!driverId) {
    return { error: 'Driver record is missing.' };
  }

  try {
    const result = await archiveDriver(driverId, reason || undefined);
    revalidatePath('/drivers');
    revalidatePath(`/drivers/${driverId}`);
    return { success: result.message };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to remove this driver right now.',
    };
  }
}

export async function saveDriverGuarantorAction(
  _prevState: DriverGuarantorActionState,
  formData: FormData,
): Promise<DriverGuarantorActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const name = getOptionalTrimmedValue(formData, 'name');
  const phone = getOptionalTrimmedValue(formData, 'phone');
  const countryCode = getOptionalTrimmedValue(formData, 'countryCode').toUpperCase();
  const relationship = getOptionalTrimmedValue(formData, 'relationship');
  const email = getOptionalTrimmedValue(formData, 'email');

  if (!driverId || !name || !phone) {
    return { error: 'Name and phone are required before saving a guarantor.' };
  }

  try {
    await createOrUpdateDriverGuarantor(driverId, {
      name,
      phone,
      ...(email ? { email } : {}),
      ...(countryCode ? { countryCode } : {}),
      ...(relationship ? { relationship } : {}),
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to save the guarantor at this time.',
    };
  }

  revalidatePath('/drivers');
  revalidatePath(`/drivers/${driverId}`);
  return {
    success: 'Guarantor details saved successfully.',
  };
}

export async function removeDriverGuarantorAction(
  _prevState: DriverGuarantorActionState,
  formData: FormData,
): Promise<DriverGuarantorActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const reason = getOptionalTrimmedValue(formData, 'reason');

  if (!driverId) {
    return { error: 'Driver is required before removing a guarantor.' };
  }

  try {
    await removeDriverGuarantor(driverId, reason || undefined);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to remove the guarantor at this time.',
    };
  }

  revalidatePath('/drivers');
  revalidatePath(`/drivers/${driverId}`);
  return {
    success: 'Guarantor removed successfully.',
  };
}

export async function linkDriverMobileAccessAction(
  _prevState: DriverMobileAccessActionState,
  formData: FormData,
): Promise<DriverMobileAccessActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const userId = getOptionalTrimmedValue(formData, 'userId');

  if (!driverId || !userId) {
    return { error: 'Select an organisation user to connect mobile access.' };
  }

  try {
    await linkDriverMobileAccessUser(driverId, userId);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to connect mobile access for this driver.',
    };
  }

  revalidatePath('/drivers');
  revalidatePath(`/drivers/${driverId}`);
  return {
    success: 'Mobile access linked successfully.',
  };
}

export async function unlinkDriverMobileAccessAction(
  _prevState: DriverMobileAccessActionState,
  formData: FormData,
): Promise<DriverMobileAccessActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const userId = getOptionalTrimmedValue(formData, 'userId');

  if (!driverId || !userId) {
    return { error: 'No linked organisation user was selected.' };
  }

  try {
    await unlinkDriverMobileAccessUser(driverId, userId);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to disconnect mobile access for this driver.',
    };
  }

  revalidatePath('/drivers');
  revalidatePath(`/drivers/${driverId}`);
  return {
    success: 'Mobile access disconnected successfully.',
  };
}

export async function updateDriverMobileAccessStatusAction(
  _prevState: DriverMobileAccessActionState,
  formData: FormData,
): Promise<DriverMobileAccessActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const userId = getOptionalTrimmedValue(formData, 'userId');
  const revoked = getOptionalTrimmedValue(formData, 'revoked') === 'true';

  if (!driverId || !userId) {
    return { error: 'No linked organisation user was selected.' };
  }

  try {
    await updateDriverMobileAccessStatus(driverId, userId, revoked);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to update mobile access status.',
    };
  }

  revalidatePath('/drivers');
  revalidatePath(`/drivers/${driverId}`);
  return {
    success: revoked ? 'Mobile access paused successfully.' : 'Mobile access restored successfully.',
  };
}

export async function disableDriverMobileAccessDeviceAction(
  _prevState: DriverMobileAccessActionState,
  formData: FormData,
): Promise<DriverMobileAccessActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const userId = getOptionalTrimmedValue(formData, 'userId');
  const deviceId = getOptionalTrimmedValue(formData, 'deviceId');

  if (!driverId || !userId || !deviceId) {
    return { error: 'Driver, user, and device are required.' };
  }

  try {
    await disableDriverMobileAccessDevice(driverId, userId, deviceId);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to turn off this device.',
    };
  }

  revalidatePath('/drivers');
  revalidatePath(`/drivers/${driverId}`);
  return {
    success: 'Device notifications turned off successfully.',
  };
}

export async function uploadDriverDocumentAction(
  _prevState: UploadDriverDocumentActionState,
  formData: FormData,
): Promise<UploadDriverDocumentActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const documentType = getOptionalTrimmedValue(formData, 'documentType');
  const file = formData.get('documentFile');

  if (!driverId || !documentType) {
    return { error: 'Driver and document type are required.' };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Select a document file before uploading.' };
  }

  const normalizedContentType = normalizeDriverDocumentContentType(file.type);
  const validationError = validateDriverDocumentFile(file.size, normalizedContentType);
  if (validationError) {
    return { error: validationError };
  }

  const fileBase64 = Buffer.from(await file.arrayBuffer()).toString('base64');

  try {
    await uploadDriverDocument(driverId, {
      documentType,
      fileName: file.name,
      contentType: normalizedContentType,
      fileBase64,
      uploadedBy: 'operator',
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to upload the driver document.',
    };
  }

  revalidatePath(`/drivers/${driverId}`);
  return { success: 'Driver document uploaded successfully.' };
}

export async function uploadDriverSelfServiceDocumentAction(
  _prevState: UploadDriverDocumentActionState,
  formData: FormData,
): Promise<UploadDriverDocumentActionState> {
  const token = getOptionalTrimmedValue(formData, 'token');
  const documentType = getOptionalTrimmedValue(formData, 'documentType');
  const file = formData.get('documentFile');

  if (!token || !documentType) {
    return { error: 'The self-service verification link is missing or invalid.' };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Select a document file before uploading.' };
  }

  const normalizedContentType = normalizeDriverDocumentContentType(file.type);
  const validationError = validateDriverDocumentFile(file.size, normalizedContentType);
  if (validationError) {
    return { error: validationError };
  }

  const fileBase64 = Buffer.from(await file.arrayBuffer()).toString('base64');

  try {
    await uploadDriverSelfServiceDocument(token, {
      documentType,
      fileName: file.name,
      contentType: normalizedContentType,
      fileBase64,
      uploadedBy: 'driver_self_service',
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to upload the driver document.',
    };
  }

  return { success: 'Driver document uploaded successfully.' };
}

function normalizeDriverDocumentContentType(contentType: string): string {
  return contentType.split(';', 1)[0]?.trim().toLowerCase() ?? 'application/octet-stream';
}

function validateDriverDocumentFile(size: number, contentType: string): string | null {
  if (size > MAX_DRIVER_DOCUMENT_FILE_BYTES) {
    return 'Document files must be 10 MB or smaller.';
  }

  if (!ALLOWED_DRIVER_DOCUMENT_TYPES.has(contentType)) {
    return 'Only PDF, JPEG, PNG, and WEBP document uploads are allowed.';
  }

  return null;
}

export async function reviewDriverDocumentAction(
  _prevState: ReviewDriverDocumentActionState,
  formData: FormData,
): Promise<ReviewDriverDocumentActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');
  const documentId = getOptionalTrimmedValue(formData, 'documentId');
  const status = getOptionalTrimmedValue(formData, 'status');
  const expiresAt = getOptionalTrimmedValue(formData, 'expiresAt');

  if (!driverId || !documentId) {
    return { error: 'Driver and document are required before review.' };
  }

  if (status !== 'approved' && status !== 'rejected') {
    return { error: 'Choose whether to approve or reject this document.' };
  }

  try {
    await reviewDriverDocument(driverId, documentId, {
      status,
      ...(expiresAt ? { expiresAt } : {}),
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to update the driver document review.',
    };
  }

  revalidatePath(`/drivers/${driverId}`);
  revalidatePath('/drivers');

  return {
    success:
      status === 'approved' ? 'Document approved successfully.' : 'Document rejected successfully.',
  };
}

export interface RetryDriverVerificationActionState {
  error?: string;
  success?: string;
  notEligible?: boolean;
  reason?: string;
}

export async function retryDriverVerificationAction(
  driverId: string,
  _prevState: RetryDriverVerificationActionState,
  _formData: FormData,
): Promise<RetryDriverVerificationActionState> {
  try {
    const result = await retryDriverIdentityVerification(driverId);
    if (!result.queued) {
      return {
        notEligible: true,
        reason: result.reason ?? 'Driver is not in a retryable pending state.',
      };
    }
    revalidatePath(`/drivers/${driverId}`);
    return {
      success: 'Verification retry has been queued. Refresh in a few moments to see the result.',
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to queue the verification retry.',
    };
  }
}
