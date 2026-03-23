'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCountryConfig, isCountrySupported } from '@mobility-os/domain-config';
import {
  createOrUpdateDriverGuarantor,
  sendGuarantorSelfServiceLink,
  createDriver,
  createDriverLivenessSession,
  createDriverSelfServiceLivenessSession,
  createGuarantorSelfServiceLivenessSession,
  linkDriverMobileAccessUser,
  removeDriverGuarantor,
  reviewDriverDocument,
  uploadDriverDocument,
  uploadDriverSelfServiceDocument,
  resolveDriverIdentity,
  resolveDriverSelfServiceIdentity,
  resolveGuarantorSelfServiceIdentity,
  sendDriverSelfServiceLink,
  unlinkDriverMobileAccessUser,
  updateDriverStatus,
  type CreateDriverInput,
  type DriverIdentityResolutionResult,
  type DriverSelfServiceDeliveryRecord,
  type DriverLivenessSessionRecord,
} from '../../lib/api-core';

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

function getTrimmedValue(formData: FormData, key: keyof CreateDriverInput): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function createDriverAction(
  _prevState: CreateDriverActionState,
  formData: FormData,
): Promise<CreateDriverActionState> {
  const payload: CreateDriverInput = {
    fleetId: getTrimmedValue(formData, 'fleetId'),
    firstName: getTrimmedValue(formData, 'firstName'),
    lastName: getTrimmedValue(formData, 'lastName'),
    phone: getTrimmedValue(formData, 'phone'),
  };

  const email = getTrimmedValue(formData, 'email');
  const dateOfBirth = getTrimmedValue(formData, 'dateOfBirth');
  const nationality = getTrimmedValue(formData, 'nationality').toUpperCase();

  if (!payload.fleetId || !payload.firstName || !payload.lastName || !payload.phone) {
    return {
      error: 'Fleet, first name, last name, and phone are required.',
    };
  }

  if (email) {
    payload.email = email;
  }
  if (dateOfBirth) {
    payload.dateOfBirth = dateOfBirth;
  }
  if (nationality) {
    payload.nationality = nationality;
  }

  let driverId: string;
  try {
    const driver = await createDriver(payload);
    driverId = driver.id;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to create driver at this time.',
    };
  }

  revalidatePath('/drivers');
  redirect(`/drivers/${driverId}?tab=verification`);
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

function isSupportedIdentifierTypeForCountry(
  identifierType: string,
  countryCode: string,
): boolean {
  if (!isCountrySupported(countryCode)) return true; // unknown country — let the server validate
  const supported = getCountryConfig(countryCode).supportedIdentifierTypes.map((t) => t.type);
  return supported.includes(identifierType);
}

function getOptionalBooleanValue(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on';
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
      error: message,
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
  const enteredIdentifiers = getIdentifierValues(formData);
  const verificationMode = getOptionalTrimmedValue(formData, 'verificationMode');

  if (!driverId) {
    return {
      error: 'Driver is required.',
    };
  }

  if (verificationMode !== 'manual' && !sessionId) {
    return {
      error: 'Start live verification before submitting this identity check.',
    };
  }

  if (enteredIdentifiers.length === 0) {
    return {
      error: 'Enter at least one identity identifier for this country before submitting verification.',
    };
  }

  for (const identifier of enteredIdentifiers) {
    if (!isSupportedIdentifierTypeForCountry(identifier.type, countryCode)) {
      const supported = isCountrySupported(countryCode)
        ? getCountryConfig(countryCode).supportedIdentifierTypes.map((t) => t.label).join(', ')
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
      identifiers: enteredIdentifiers.map((identifier) => ({
        type: identifier.type,
        value: identifier.value,
        ...(countryCode ? { countryCode } : {}),
      })),
      ...(verificationMode !== 'manual'
        ? {
            livenessCheck: {
              ...(providerName ? { provider: providerName } : {}),
              sessionId,
            },
          }
        : {}),
    });

    revalidatePath('/drivers');
    revalidatePath(`/drivers/${driverId}`);
    revalidatePath(`/drivers/${driverId}/review`);
    return {
      result,
      success: 'Identity verification submitted successfully.',
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to resolve identity at this time.',
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
  const enteredIdentifiers = getIdentifierValues(formData);
  const verificationMode = getOptionalTrimmedValue(formData, 'verificationMode');

  if (!token) {
    return {
      error: 'The self-service verification link is missing or expired.',
    };
  }

  if (verificationMode !== 'manual' && !sessionId) {
    return {
      error: 'Start live verification before submitting this identity check.',
    };
  }

  if (enteredIdentifiers.length === 0) {
    return {
      error: 'Enter at least one identity identifier for this country before submitting verification.',
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
      identifiers: enteredIdentifiers.map((identifier) => ({
        type: identifier.type,
        value: identifier.value,
        ...(countryCode ? { countryCode } : {}),
      })),
      ...(verificationMode !== 'manual'
        ? {
            livenessCheck: {
              ...(providerName ? { provider: providerName } : {}),
              sessionId,
            },
          }
        : {}),
    });

    return {
      result,
      success: 'Identity verification submitted successfully.',
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to resolve identity at this time.',
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
      error: message,
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
  const enteredIdentifiers = getIdentifierValues(formData);
  const verificationMode = getOptionalTrimmedValue(formData, 'verificationMode');

  if (!token) {
    return { error: 'The guarantor verification link is missing or expired.' };
  }

  if (verificationMode !== 'manual' && !sessionId) {
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
      identifiers: enteredIdentifiers.map((identifier) => ({
        type: identifier.type,
        value: identifier.value,
        ...(countryCode ? { countryCode } : {}),
      })),
      ...(verificationMode !== 'manual'
        ? {
            livenessCheck: {
              ...(providerName ? { provider: providerName } : {}),
              sessionId,
            },
          }
        : {}),
    });

    return {
      result,
      success: 'Guarantor identity verification submitted successfully.',
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to resolve guarantor identity at this time.',
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
        error instanceof Error
          ? error.message
          : 'Unable to send the guarantor verification link.',
    };
  }
}

export async function sendDriverSelfServiceLinkAction(
  _prevState: SendDriverSelfServiceLinkActionState,
  formData: FormData,
): Promise<SendDriverSelfServiceLinkActionState> {
  const driverId = getOptionalTrimmedValue(formData, 'driverId');

  if (!driverId) {
    return { error: 'Driver is required before sending a self-service link.' };
  }

  try {
    const delivery = await sendDriverSelfServiceLink(driverId);
    return {
      delivery,
      success: `A self-service verification link was sent to ${delivery.destination}.`,
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
        error instanceof Error
          ? error.message
          : 'Unable to update driver status at this time.',
    };
  }

  revalidatePath('/drivers');
  revalidatePath(`/drivers/${driverId}`);
  return {
    success: `Driver status updated to ${status}.`,
  };
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
      error:
        error instanceof Error
          ? error.message
          : 'Unable to save the guarantor at this time.',
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
        error instanceof Error
          ? error.message
          : 'Unable to remove the guarantor at this time.',
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
        error instanceof Error
          ? error.message
          : 'Unable to connect mobile access for this driver.',
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
      error:
        error instanceof Error
          ? error.message
          : 'Unable to upload the driver document.',
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
      error:
        error instanceof Error
          ? error.message
          : 'Unable to upload the driver document.',
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
        error instanceof Error
          ? error.message
          : 'Unable to update the driver document review.',
    };
  }

  revalidatePath(`/drivers/${driverId}`);
  revalidatePath('/drivers');

  return {
    success:
      status === 'approved'
        ? 'Document approved successfully.'
        : 'Document rejected successfully.',
  };
}
