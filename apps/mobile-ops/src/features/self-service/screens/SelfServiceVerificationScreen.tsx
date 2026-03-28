'use client';

import {
  type SupportedIdentifierType,
  getCountryConfig,
  getRequiredDocuments,
  getSupportedCountryCodes,
  isCountrySupported,
} from '@mobility-os/domain-config';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  type DriverIdentityResolutionResult,
  type DriverLivenessSessionRecord,
  createDriverSelfServiceLivenessSession,
  initiateDriverKycCheckout,
  recordDriverSelfServiceVerificationConsent,
  removeDriverSelfServiceDocument,
  resolveDriverSelfServiceIdentity,
  updateDriverSelfServiceContact,
  updateDriverSelfServiceProfile,
  uploadDriverSelfServiceDocument,
} from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import {
  FullScreenBlockingLoader,
  InlineProcessingCard,
} from '../../../components/processing-state';
import { Screen } from '../../../components/screen';
import { STORAGE_KEYS } from '../../../constants';
import { useAuth } from '../../../contexts/auth-context';
import { useSelfService } from '../../../contexts/self-service-context';
import { useToast } from '../../../contexts/toast-context';
import { buildSelfServiceVerificationDeepLink } from '../../../navigation/linking';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type WizardStep = 'overview' | 'payment' | 'identity' | 'profile' | 'documents';
type VerificationLifecycleState = 'not_started' | 'in_progress' | 'failed' | 'completed';

function maskIdentifier(value: string): string {
  if (!value) return '';
  if (value.length <= 4) return '•'.repeat(value.length);
  return '•'.repeat(value.length - 4) + value.slice(-4);
}

interface VerificationDraft {
  token: string;
  countryCode: string;
  identifierValues: Record<string, string>;
  selectedDocumentType: string;
}

function splitVerifiedName(fullName?: string) {
  const cleaned = (fullName ?? '').trim();
  if (!cleaned) {
    return { firstName: '', lastName: '' };
  }
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0] ?? '', lastName: '' };
  }
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

async function captureSelfieAsset(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (Platform.OS === 'web') {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0] ?? null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    base64: true,
    cameraType: ImagePicker.CameraType.front,
    mediaTypes: ['images'],
    quality: 0.85,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0] ?? null;
}

const STEP_ORDER: WizardStep[] = ['overview', 'payment', 'identity', 'profile', 'documents'];

function getStepIndex(step: WizardStep, includePayment: boolean): number {
  if (!includePayment) {
    const filtered: WizardStep[] = ['overview', 'identity', 'profile', 'documents'];
    return filtered.indexOf(step);
  }
  return STEP_ORDER.indexOf(step);
}

function getTotalSteps(includePayment: boolean): number {
  return includePayment ? 5 : 4;
}

export function SelfServiceVerificationScreen({
  navigation,
}: ScreenProps<'SelfServiceVerification'>) {
  const { showToast } = useToast();
  const { logout } = useAuth();
  const { token, driver, documents, isRefreshing, refreshSelfService, clearSelfService } =
    useSelfService();

  const driverPaysKyc = driver?.driverPaysKyc ?? false;
  const hasUsableVerificationEntitlement =
    driver?.verificationEntitlementState === 'paid' ||
    driver?.verificationEntitlementState === 'reserved';
  const needsVerificationPayment =
    driverPaysKyc && driver?.verificationPaymentStatus === 'driver_payment_required';

  const identityVerificationRequired = driver?.requireIdentityVerificationForActivation ?? true;
  const biometricVerificationRequired = driver?.requireBiometricVerification ?? true;
  const governmentLookupRequired = driver?.requireGovernmentVerificationLookup ?? true;

  const [countryCode, setCountryCode] = useState(driver?.nationality ?? 'NG');
  const [identifierValues, setIdentifierValues] = useState<Record<string, string>>({});
  const [selfieBase64, setSelfieBase64] = useState('');
  const [selfiePreviewUri, setSelfiePreviewUri] = useState<string | null>(null);
  const [livenessSession, setLivenessSession] = useState<DriverLivenessSessionRecord | null>(null);
  const [identityResult, setIdentityResult] = useState<DriverIdentityResolutionResult | null>(null);
  const [submittingIdentity, setSubmittingIdentity] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [removingDocumentId, setRemovingDocumentId] = useState<string | null>(null);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const previousCountryCodeRef = useRef(countryCode);
  const [firstName, setFirstName] = useState(driver?.firstName ?? '');
  const [lastName, setLastName] = useState(driver?.lastName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(driver?.dateOfBirth ?? '');
  const [phone, setPhone] = useState(driver?.phone ?? '');
  const [email, setEmail] = useState(driver?.email ?? '');
  const isProcessing =
    submittingIdentity ||
    uploadingDocument ||
    initiatingPayment ||
    savingProfile ||
    recordingConsent;
  const processingVariant = submittingIdentity
    ? 'verification'
    : uploadingDocument
      ? 'upload'
      : initiatingPayment
        ? 'payment'
        : 'onboarding';
  const processingTitle = submittingIdentity
    ? 'Verifying your identity'
    : uploadingDocument
      ? 'Uploading document'
      : initiatingPayment
        ? 'Starting payment'
        : recordingConsent
          ? 'Recording consent'
          : 'Saving onboarding details';
  const processingMessage = submittingIdentity
    ? 'Checking your live selfie, government records, and profile match.'
    : uploadingDocument
      ? 'Preparing your document, uploading it securely, and attaching it to your onboarding record.'
      : initiatingPayment
        ? 'Preparing your checkout and linking it to the next verification step.'
        : recordingConsent
          ? 'Saving your verification consent, policy version, and onboarding audit trail.'
          : 'Saving your profile details and preserving your onboarding progress.';

  const profileComplete = Boolean(firstName.trim() && lastName.trim() && dateOfBirth.trim());
  const organisationName = driver?.organisationName ?? 'your organisation';

  const verificationLifecycle = useMemo<VerificationLifecycleState>(() => {
    if (!identityVerificationRequired) {
      return 'completed';
    }

    if (
      identityResult?.isVerifiedMatch === true ||
      identityResult?.decision === 'review_needed' ||
      identityResult?.decision === 'review_required' ||
      identityResult?.providerLookupStatus === 'skipped_by_organisation_policy' ||
      driver?.identityStatus === 'verified' ||
      driver?.identityStatus === 'review_needed'
    ) {
      return 'completed';
    }

    if (
      identityResult?.decision === 'failed' ||
      identityResult?.providerLookupStatus === 'no_match' ||
      identityResult?.livenessPassed === false ||
      driver?.identityStatus === 'failed'
    ) {
      return 'failed';
    }

    if (submittingIdentity || driver?.identityStatus === 'pending_verification') {
      return 'in_progress';
    }

    return 'not_started';
  }, [
    driver?.identityStatus,
    identityResult?.decision,
    identityResult?.isVerifiedMatch,
    identityResult?.livenessPassed,
    identityResult?.providerLookupStatus,
    identityVerificationRequired,
    submittingIdentity,
  ]);

  const identitySubmitted = useMemo(
    () => verificationLifecycle === 'completed',
    [verificationLifecycle],
  );

  // Determine initial step
  const computeInitialStep = (): WizardStep => {
    if (needsVerificationPayment) {
      return 'overview';
    }
    if (verificationLifecycle === 'completed') {
      return profileComplete ? 'documents' : 'profile';
    }
    return verificationLifecycle === 'failed' || verificationLifecycle === 'in_progress'
      ? 'identity'
      : 'overview';
  };

  const [currentStep, setCurrentStep] = useState<WizardStep>(computeInitialStep);

  const includePayment = needsVerificationPayment;

  const countryOptions = useMemo(
    () =>
      getSupportedCountryCodes().map((code: string) => ({
        code,
        label: getCountryConfig(code).name,
      })),
    [],
  );

  const identifierTypes = useMemo<SupportedIdentifierType[]>(
    () =>
      isCountrySupported(countryCode)
        ? getCountryConfig(countryCode).supportedIdentifierTypes.filter(
            (identifier: SupportedIdentifierType) =>
              identifier.type !== 'PHONE' && identifier.type !== 'EMAIL',
          )
        : [],
    [countryCode],
  );

  const requiredDocuments = useMemo(
    () =>
      isCountrySupported(countryCode)
        ? getRequiredDocuments(driver?.requiredDriverDocumentSlugs ?? [])
        : [],
    [countryCode, driver?.requiredDriverDocumentSlugs],
  );

  useEffect(() => {
    if (!draftHydrated) {
      previousCountryCodeRef.current = countryCode;
      return;
    }

    if (previousCountryCodeRef.current === countryCode) {
      return;
    }

    previousCountryCodeRef.current = countryCode;
    setIdentifierValues({});
    setSelfieBase64('');
    setSelfiePreviewUri(null);
    setLivenessSession(null);
    setIdentityResult(null);
  }, [countryCode, draftHydrated]);

  useEffect(() => {
    const restoreDraft = async () => {
      if (!token || !driver) {
        setDraftHydrated(true);
        return;
      }

      try {
        const rawDraft = await SecureStore.getItemAsync(STORAGE_KEYS.selfServiceVerificationDraft);
        if (!rawDraft) {
          return;
        }

        const parsed = JSON.parse(rawDraft) as VerificationDraft;
        if (parsed.token !== token) {
          return;
        }

        setCountryCode(parsed.countryCode || driver.nationality || 'NG');
        setIdentifierValues(parsed.identifierValues ?? {});
        setSelectedDocumentType(parsed.selectedDocumentType ?? '');
        setDraftRestored(
          Boolean(
            Object.keys(parsed.identifierValues ?? {}).length > 0 || parsed.selectedDocumentType,
          ),
        );
      } catch {
        // Ignore malformed draft state.
      } finally {
        setDraftHydrated(true);
      }
    };

    restoreDraft().catch(() => {
      setDraftHydrated(true);
    });
  }, [driver, token]);

  useEffect(() => {
    const persistDraft = async () => {
      if (!draftHydrated || !token) {
        return;
      }

      const draft: VerificationDraft = {
        token,
        countryCode,
        identifierValues,
        selectedDocumentType,
      };

      await SecureStore.setItemAsync(
        STORAGE_KEYS.selfServiceVerificationDraft,
        JSON.stringify(draft),
      );
    };

    persistDraft().catch(() => undefined);
  }, [countryCode, draftHydrated, identifierValues, selectedDocumentType, token]);

  useEffect(() => {
    if (!requiredDocuments.length) {
      setSelectedDocumentType('');
      return;
    }

    setSelectedDocumentType((current) =>
      requiredDocuments.some((document) => document.slug === current)
        ? current
        : (requiredDocuments[0]?.slug ?? ''),
    );
  }, [requiredDocuments]);

  useEffect(() => {
    if (!driver) {
      return;
    }
    setFirstName((current) => current || driver.firstName || '');
    setLastName((current) => current || driver.lastName || '');
    setDateOfBirth((current) => current || driver.dateOfBirth || '');
    setPhone((current) => current || driver.phone || '');
    setEmail((current) => current || driver.email || '');
  }, [driver]);

  useEffect(() => {
    if (!driverPaysKyc || needsVerificationPayment) {
      return;
    }

    if (currentStep === 'payment') {
      setCurrentStep(
        verificationLifecycle === 'completed'
          ? profileComplete
            ? 'documents'
            : 'profile'
          : 'identity',
      );
    }
  }, [
    currentStep,
    driverPaysKyc,
    needsVerificationPayment,
    profileComplete,
    verificationLifecycle,
  ]);

  const identifiersReady = useMemo(
    () =>
      identifierTypes.every((identifier) => {
        const value = (identifierValues[identifier.type] ?? '').trim();
        if (!identifier.required && !value) return true;
        if (!value) return false;
        if (identifier.numericOnly && !/^\d+$/.test(value)) return false;
        if (identifier.exactLength && value.length !== identifier.exactLength) return false;
        return true;
      }),
    [identifierTypes, identifierValues],
  );

  const canSubmitIdentity = useMemo(
    () =>
      verificationLifecycle !== 'completed' &&
      Boolean(token && identifiersReady && (!biometricVerificationRequired || selfieBase64)),
    [biometricVerificationRequired, identifiersReady, selfieBase64, token, verificationLifecycle],
  );

  const documentChecklist = useMemo(
    () =>
      requiredDocuments.map((document) => {
        const matchingDocuments = documents.filter(
          (uploadedDocument) => uploadedDocument.documentType === document.slug,
        );
        const latestDocument = matchingDocuments[0] ?? null;
        return { ...document, uploaded: matchingDocuments.length > 0, latestDocument };
      }),
    [documents, requiredDocuments],
  );

  const uploadedRequiredDocumentCount = useMemo(
    () => documentChecklist.filter((document) => document.uploaded).length,
    [documentChecklist],
  );

  const onRefresh = async () => {
    try {
      await refreshSelfService();
      showToast('Verification context refreshed.', 'success');
    } catch (error) {
      Alert.alert(
        'Driver verification',
        error instanceof Error ? error.message : 'Unable to refresh verification context.',
      );
    }
  };

  const onCaptureSelfie = async () => {
    if (!token) return;

    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera access', 'Allow camera access to capture a verification selfie.');
        return;
      }
    }

    try {
      const asset = await captureSelfieAsset();
      if (!asset) return;
      const imageBase64 = await getImageAssetBase64(asset);
      if (!imageBase64) {
        throw new Error('The selfie image could not be encoded for verification.');
      }

      setSelfieBase64(imageBase64);
      setSelfiePreviewUri(asset.uri ?? null);
      showToast(
        Platform.OS === 'web'
          ? identifiersReady
            ? 'Selfie selected. You can submit now.'
            : 'Selfie selected.'
          : identifiersReady
            ? 'Selfie captured. You can submit now.'
            : 'Selfie captured.',
        'success',
      );

      if (biometricVerificationRequired) {
        createDriverSelfServiceLivenessSession(token, { countryCode })
          .then(setLivenessSession)
          .catch(() => setLivenessSession(null));
      } else {
        setLivenessSession(null);
      }
    } catch (error) {
      Alert.alert(
        'Live verification',
        error instanceof Error ? error.message : 'Unable to capture a verification selfie.',
      );
    }
  };

  const onSubmitIdentity = async () => {
    if (!token) return;
    if (submittingIdentity) return;

    if (!canSubmitIdentity) {
      Alert.alert(
        'Driver verification',
        biometricVerificationRequired
          ? 'Complete required identifiers and capture a live selfie before submitting.'
          : 'Complete required identifiers before submitting.',
      );
      return;
    }

    if (!identityVerificationRequired || !governmentLookupRequired) {
      setIdentityResult({
        decision: 'manual_review',
        providerLookupStatus: 'skipped_by_organisation_policy',
      });
      showToast('Identity details saved for organisation review.', 'success');
      setCurrentStep('documents');
      return;
    }

    setSubmittingIdentity(true);
    try {
      const result = await resolveDriverSelfServiceIdentity(token, {
        countryCode,
        identifiers: identifierTypes
          .map((identifier) => ({
            type: identifier.type,
            value: (identifierValues[identifier.type] ?? '').trim(),
            countryCode,
          }))
          .filter((identifier) => identifier.value.length > 0),
        ...(selfieBase64 ? { selfieImageBase64: selfieBase64 } : {}),
        subjectConsent: true,
        livenessCheck: livenessSession
          ? {
              provider: livenessSession.providerName,
              sessionId: livenessSession.sessionId,
            }
          : undefined,
      });

      setIdentityResult(result);
      if (result.verifiedProfile) {
        const verifiedName = splitVerifiedName(result.verifiedProfile.fullName);
        setFirstName(verifiedName.firstName || firstName);
        setLastName(verifiedName.lastName || lastName);
        setDateOfBirth(result.verifiedProfile.dateOfBirth || dateOfBirth);
      }
      await refreshSelfService();
      const verificationCompleted =
        result.isVerifiedMatch === true ||
        result.decision === 'review_needed' ||
        result.decision === 'review_required' ||
        result.providerLookupStatus === 'skipped_by_organisation_policy';
      const verificationFailed =
        result.decision === 'failed' ||
        result.providerLookupStatus === 'no_match' ||
        result.livenessPassed === false;

      if (verificationCompleted) {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.selfServiceVerificationDraft);
        setDraftRestored(false);
        showToast(
          result.verifiedProfile
            ? 'Identity verified. Confirm your details next.'
            : 'Verification completed. Continue with the next step.',
          'success',
        );
        setCurrentStep(result.verifiedProfile ? 'profile' : 'documents');
      } else if (verificationFailed) {
        showToast('Verification failed. Check your details and try again.', 'error');
      } else {
        showToast('Verification is still in progress. Refresh to check the latest status.', 'info');
      }
    } catch (error) {
      Alert.alert(
        'Driver verification',
        error instanceof Error ? error.message : 'Unable to submit verification.',
      );
    } finally {
      setSubmittingIdentity(false);
    }
  };

  const onClearDraft = async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.selfServiceVerificationDraft);
    setIdentifierValues({});
    setSelectedDocumentType(requiredDocuments[0]?.slug ?? '');
    setSelfieBase64('');
    setSelfiePreviewUri(null);
    setLivenessSession(null);
    setIdentityResult(null);
    setDraftRestored(false);
    showToast('Saved verification draft cleared.', 'success');
  };

  const onInitiatePayment = async () => {
    if (!token) return;
    setInitiatingPayment(true);
    try {
      const checkout = await initiateDriverKycCheckout(
        token,
        'paystack',
        buildSelfServiceVerificationDeepLink(),
      );
      if (checkout.status === 'already_paid' || !checkout.checkoutUrl) {
        await refreshSelfService();
        showToast('Your verification payment has already been received.', 'success');
        setCurrentStep('identity');
        return;
      }
      await Linking.openURL(checkout.checkoutUrl);
    } catch (error) {
      Alert.alert(
        'Payment',
        error instanceof Error
          ? error.message
          : 'Unable to start the payment process. Please try again.',
      );
    } finally {
      setInitiatingPayment(false);
    }
  };

  const onSaveProfile = async () => {
    if (!token) return;
    if (!profileComplete) {
      Alert.alert('Profile details', 'First name, last name, and date of birth are required.');
      return;
    }

    setSavingProfile(true);
    try {
      await Promise.all([
        updateDriverSelfServiceProfile(token, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth: dateOfBirth.trim(),
        }),
        updateDriverSelfServiceContact(token, {
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
        }),
      ]);
      await refreshSelfService();
      showToast('Details confirmed.', 'success');
      setCurrentStep('documents');
    } catch (error) {
      Alert.alert(
        'Profile details',
        error instanceof Error ? error.message : 'Unable to save your profile details.',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Auto-refresh when the screen gains focus while payment is pending.
  // This covers the Paystack return path: Paystack redirects to the
  // mobiris://self-service/verify deep link, which focuses this screen.
  // Without this refresh, the driver state stays stale and the user sees
  // the payment step again even after a successful payment.
  useFocusEffect(
    useCallback(() => {
      if (!token || !needsVerificationPayment) return;
      refreshSelfService().catch(() => undefined);
    }, [token, needsVerificationPayment, refreshSelfService]),
  );

  const onConfirmPayment = async () => {
    if (!token) return;
    // Use the checkout initiation endpoint as the primary recovery path — it
    // returns already_paid when payment is confirmed, which is more reliable
    // than relying solely on the driver state refresh timing.
    try {
      const checkout = await initiateDriverKycCheckout(
        token,
        'paystack',
        buildSelfServiceVerificationDeepLink(),
      );
      if (checkout.status === 'already_paid' || !checkout.checkoutUrl) {
        await refreshSelfService();
        showToast('Payment confirmed — continuing to verification.', 'success');
        setCurrentStep('identity');
        return;
      }
      // Payment genuinely not found yet — refresh state and stay on step.
      await refreshSelfService();
      showToast(
        'Payment not confirmed yet. If you completed payment, wait a moment and try again.',
        'info',
      );
    } catch (error) {
      Alert.alert(
        'Payment recovery',
        error instanceof Error
          ? error.message
          : 'Unable to check payment status. Please try again.',
      );
    }
  };

  const onUploadDocument = async () => {
    if (!token) return;
    if (!selectedDocumentType) {
      Alert.alert('Driver documents', 'Select the document type before uploading.');
      return;
    }

    try {
      setUploadingDocument(true);
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if ((asset.size ?? 0) > MAX_UPLOAD_BYTES) {
        throw new Error('Document files must be 10 MB or smaller.');
      }

      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileBase64 = encodeBase64(arrayBuffer);

      await uploadDriverSelfServiceDocument(token, {
        documentType: selectedDocumentType,
        fileName: asset.name ?? 'driver-document',
        contentType: asset.mimeType ?? 'application/octet-stream',
        fileBase64,
        uploadedBy: 'driver_self_service',
      });

      // Brief delay so the server write is visible before we re-fetch.
      await new Promise((resolve) => setTimeout(resolve, 800));
      await refreshSelfService();
      showToast('Document uploaded.', 'success');
    } catch (error) {
      Alert.alert(
        'Driver documents',
        error instanceof Error ? error.message : 'Unable to upload the document.',
      );
    } finally {
      setUploadingDocument(false);
    }
  };

  const onRemoveDocument = async (documentId: string) => {
    if (!token) return;
    try {
      setRemovingDocumentId(documentId);
      await removeDriverSelfServiceDocument(token, documentId);
      await refreshSelfService();
      showToast('Document removed.', 'success');
    } catch (error) {
      Alert.alert(
        'Driver documents',
        error instanceof Error ? error.message : 'Unable to remove the document.',
      );
    } finally {
      setRemovingDocumentId(null);
    }
  };

  const onExitOnboarding = async () => {
    await clearSelfService();
    if (driver?.hasMobileAccess) {
      await logout();
    }
    navigation.reset({
      index: 0,
      routes: [{ name: driver?.hasMobileAccess ? 'Login' : 'SelfServiceOtp' }],
    });
  };

  const proceedFromOverview = async (nextStep: WizardStep) => {
    if (!token) {
      showToast('Verification session is missing. Restart from your invitation link.', 'error');
      return;
    }

    if (!consentAccepted) {
      showToast('Confirm the verification consent before continuing.', 'error');
      return;
    }

    setRecordingConsent(true);
    try {
      await recordDriverSelfServiceVerificationConsent(token);
      setCurrentStep(nextStep);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Unable to record consent right now.',
        'error',
      );
    } finally {
      setRecordingConsent(false);
    }
  };

  if (!token || !driver) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <InlineProcessingCard
          message="Verification access is missing on this device. Restore your onboarding session to continue."
          steps={[
            'Recover verification access',
            'Restore onboarding progress',
            'Resume live verification',
          ]}
          title="Verification session missing"
          variant="onboarding"
        />
        <Button
          label="Enter verification code"
          onPress={() => navigation.replace('SelfServiceOtp')}
        />
      </Screen>
    );
  }

  const totalSteps = getTotalSteps(includePayment);
  const currentStepIndex = getStepIndex(currentStep, includePayment);

  const goBack = () => {
    if (currentStep === 'payment') setCurrentStep('overview');
    else if (currentStep === 'identity') setCurrentStep(includePayment ? 'payment' : 'overview');
    else if (currentStep === 'profile') setCurrentStep('identity');
    else if (currentStep === 'documents') setCurrentStep(profileComplete ? 'profile' : 'identity');
  };

  const renderProgressBar = () => (
    <View style={styles.progressRow}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          // biome-ignore lint/suspicious/noArrayIndexKey: stable fixed-length array
          key={index}
          style={[styles.progressDot, index <= currentStepIndex ? styles.progressDotActive : null]}
        />
      ))}
      <Text style={styles.progressLabel}>
        Step {currentStepIndex + 1} of {totalSteps}
      </Text>
    </View>
  );

  // ─── Step: overview ────────────────────────────────────────────────────────

  if (currentStep === 'overview') {
    return (
      <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        {renderProgressBar()}

        <Card style={styles.section}>
          <Text style={styles.kicker}>Driver verification</Text>
          <Text style={styles.title}>Before you continue</Text>
          <Text style={styles.copy}>
            We will verify you for {organisationName}. This uses your ID number, a live selfie, and
            the official match result from your identity check.
          </Text>
          {driver.verificationBlockedReason ? (
            <Text style={styles.hintText}>{driver.verificationBlockedReason}</Text>
          ) : null}

          {identityVerificationRequired ? (
            <View style={styles.checklistBlock}>
              <Text style={styles.checklistHeading}>We will collect</Text>
              {identifierTypes.map((identifier) => (
                <View key={identifier.type} style={styles.checklistRow}>
                  <Text style={styles.checklistDot}>•</Text>
                  <Text style={styles.checklistText}>{identifier.label}</Text>
                </View>
              ))}
              {biometricVerificationRequired ? (
                <View style={styles.checklistRow}>
                  <Text style={styles.checklistDot}>•</Text>
                  <Text style={styles.checklistText}>Live selfie photo</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {requiredDocuments.length > 0 ? (
            <View style={styles.checklistBlock}>
              <Text style={styles.checklistHeading}>Required documents</Text>
              {requiredDocuments.map((document) => (
                <View key={document.slug} style={styles.checklistRow}>
                  <Text style={styles.checklistDot}>•</Text>
                  <Text style={styles.checklistText}>{document.name}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {driverPaysKyc ? (
            <View style={styles.paymentNotice}>
              <Text style={styles.paymentNoticeTitle}>Verification fee required</Text>
              <Text style={styles.paymentNoticeBody}>
                {organisationName} requires payment before verification starts. If the ID number or
                face does not match, the verification will fail and the fee is not refundable.
              </Text>
            </View>
          ) : (
            <View style={styles.orgCoversNotice}>
              <Text style={styles.orgCoversText}>
                {organisationName} covers the verification cost.
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consentAccepted }}
            onPress={() => setConsentAccepted((current) => !current)}
            style={styles.consentRow}
          >
            <View style={[styles.checkbox, consentAccepted ? styles.checkboxActive : null]} />
            <Text style={styles.consentText}>
              I understand Mobiris will use my ID number, live selfie, and identity match result,
              and that wrong details will fail verification.
            </Text>
          </Pressable>
          <Text style={styles.legalText}>
            By continuing you agree to the Mobiris Terms of Use and Privacy Policy.
          </Text>
          <View style={styles.legalLinkRow}>
            <Pressable onPress={() => navigation.navigate('LegalDocument', { document: 'terms' })}>
              <Text style={styles.legalLink}>View Terms</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('LegalDocument', { document: 'privacy' })}
            >
              <Text style={styles.legalLink}>View Privacy Policy</Text>
            </Pressable>
          </View>

          <View style={styles.badgeRow}>
            <Badge
              label={`Identity: ${formatIdentityLabel(driver.identityStatus)}`}
              tone={identityTone(driver.identityStatus)}
            />
            <Badge
              label={`Docs: ${uploadedRequiredDocumentCount}/${documentChecklist.length}`}
              tone={
                documentChecklist.length > 0 &&
                uploadedRequiredDocumentCount === documentChecklist.length
                  ? 'success'
                  : 'warning'
              }
            />
          </View>
        </Card>

        {draftRestored ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Saved progress restored</Text>
            <Text style={styles.copy}>
              Your last inputs were restored. Selfie capture is not saved and must be done again.
            </Text>
            <Button
              label="Clear saved draft"
              variant="secondary"
              onPress={() => void onClearDraft()}
            />
          </Card>
        ) : null}

        <Card style={styles.section}>
          <Button
            label="Save and exit"
            variant="secondary"
            onPress={() => void onExitOnboarding()}
          />
          {identitySubmitted ? (
            <Button
              label={profileComplete ? 'Continue to documents' : 'Confirm your details'}
              onPress={() => setCurrentStep(profileComplete ? 'documents' : 'profile')}
            />
          ) : needsVerificationPayment ? (
            <Button
              label="Continue to payment"
              disabled={!consentAccepted}
              onPress={() => void proceedFromOverview('payment')}
            />
          ) : (
            <Button
              label="Start verification"
              disabled={!consentAccepted}
              onPress={() => void proceedFromOverview('identity')}
            />
          )}
        </Card>
      </Screen>
    );
  }

  // ─── Step: payment ─────────────────────────────────────────────────────────

  if (currentStep === 'profile') {
    return (
      <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        {renderProgressBar()}

        <Card style={styles.section}>
          <Text style={styles.stepLabel}>Confirm your details</Text>
          <Text style={styles.sectionTitle}>Review the details we found</Text>
          <Text style={styles.copy}>
            We filled these from your verification result so you do not have to type them manually.
            Confirm them before continuing.
          </Text>
          <Input label="First name" onChangeText={setFirstName} value={firstName} />
          <Input label="Last name" onChangeText={setLastName} value={lastName} />
          <Input
            label="Date of birth"
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
            value={dateOfBirth}
          />
          <Input
            editable={false}
            label="Gender"
            value={identityResult?.verifiedProfile?.gender ?? driver.gender ?? 'Not returned'}
          />
          <Input
            keyboardType="phone-pad"
            label="Phone number"
            onChangeText={setPhone}
            placeholder="08012345678"
            value={phone}
          />
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            value={email}
          />
          <Button
            label="Confirm and continue"
            loading={savingProfile}
            loadingLabel="Saving details"
            onPress={() => void onSaveProfile()}
          />
        </Card>

        <Button label="Back" variant="secondary" onPress={goBack} />
        <FullScreenBlockingLoader
          visible={isProcessing}
          activeStep={1}
          message={processingMessage}
          steps={
            submittingIdentity
              ? [
                  'Validating live selfie',
                  'Checking identity records',
                  'Saving verification result',
                ]
              : uploadingDocument
                ? ['Preparing file', 'Uploading securely', 'Refreshing document checklist']
                : initiatingPayment
                  ? ['Preparing checkout', 'Linking payment to onboarding', 'Opening payment flow']
                  : [
                      'Saving your details',
                      'Updating onboarding progress',
                      'Preparing the next step',
                    ]
          }
          title={processingTitle}
          variant={processingVariant}
        />
      </Screen>
    );
  }

  // ─── Step: payment ─────────────────────────────────────────────────────────

  if (currentStep === 'payment') {
    return (
      <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        {renderProgressBar()}

        <Card style={styles.section}>
          <Text style={styles.kicker}>Identity verification fee</Text>
          <Text style={styles.title}>Pay before verification</Text>
          <Text style={styles.copy}>
            {driver?.verificationPaymentMessage ??
              `${organisationName} requires the verification fee before identity checks can begin. This fee is tied to this onboarding flow and will not be charged twice once confirmed.`}
          </Text>

          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Biometric identity verification</Text>
              <Text style={styles.breakdownAmount}>Verification fee</Text>
            </View>
          </View>

          {hasUsableVerificationEntitlement ? (
            <View style={styles.successRow}>
              <Badge label="Payment confirmed" tone="success" />
              <Text style={styles.successText}>
                Your payment has been verified. You can now proceed to verification.
              </Text>
            </View>
          ) : null}

          {!hasUsableVerificationEntitlement ? (
            <>
              <Button
                label="Pay now"
                loading={initiatingPayment}
                loadingLabel="Starting payment"
                onPress={() => void onInitiatePayment()}
              />
              <Button
                label="I've completed payment"
                variant="secondary"
                onPress={() => void onConfirmPayment()}
              />
            </>
          ) : (
            <Button label="Continue to verification" onPress={() => setCurrentStep('identity')} />
          )}
        </Card>

        <Button label="Back" variant="secondary" onPress={goBack} />
        <FullScreenBlockingLoader
          visible={isProcessing}
          activeStep={1}
          message={processingMessage}
          steps={
            submittingIdentity
              ? [
                  'Validating live selfie',
                  'Checking identity records',
                  'Saving verification result',
                ]
              : uploadingDocument
                ? ['Preparing file', 'Uploading securely', 'Refreshing document checklist']
                : initiatingPayment
                  ? ['Preparing checkout', 'Linking payment to onboarding', 'Opening payment flow']
                  : [
                      'Saving your details',
                      'Updating onboarding progress',
                      'Preparing the next step',
                    ]
          }
          title={processingTitle}
          variant={processingVariant}
        />
      </Screen>
    );
  }

  // ─── Step: identity ─────────────────────────────────────────────────────────

  if (currentStep === 'identity') {
    return (
      <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        {renderProgressBar()}

        {/* Country picker */}
        <Card style={styles.section}>
          <Text style={styles.stepLabel}>Verification country</Text>
          <Text style={styles.sectionTitle}>Select your country</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {countryOptions.map((option: { code: string; label: string }) => (
              <Pressable
                key={option.code}
                disabled={identitySubmitted}
                onPress={() => setCountryCode(option.code)}
              >
                <View style={[styles.chip, countryCode === option.code ? styles.chipActive : null]}>
                  <Text
                    style={[
                      styles.chipLabel,
                      countryCode === option.code ? styles.chipLabelActive : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Card>

        {/* Identifier inputs */}
        <Card style={styles.section}>
          <Text style={styles.stepLabel}>Government ID</Text>
          <Text style={styles.sectionTitle}>Enter your ID number</Text>
          <Text style={styles.copy}>
            Use the same ID number linked to your official records. We will use it with your live
            selfie to retrieve and confirm your details automatically.
          </Text>
          {identifierTypes.map((identifier) => (
            <Input
              key={identifier.type}
              keyboardType={identifier.numericOnly ? 'number-pad' : 'default'}
              label={identifier.label}
              editable={!identitySubmitted}
              onChangeText={(value) =>
                setIdentifierValues((current) => ({
                  ...current,
                  [identifier.type]: identifier.numericOnly ? value.replace(/\D/g, '') : value,
                }))
              }
              placeholder={
                identifier.exactLength
                  ? `${identifier.exactLength} ${identifier.numericOnly ? 'digits' : 'characters'}`
                  : identifier.label
              }
              value={
                identitySubmitted
                  ? maskIdentifier(identifierValues[identifier.type] ?? '')
                  : (identifierValues[identifier.type] ?? '')
              }
              helperText={
                identitySubmitted
                  ? 'Submitted — number masked for security'
                  : identifier.required
                    ? 'Required'
                    : 'Optional'
              }
            />
          ))}
          {identifiersReady && !identitySubmitted ? (
            <View style={styles.successRow}>
              <Text style={styles.successText}>All required identifiers look good</Text>
            </View>
          ) : null}
        </Card>

        {/* Selfie capture */}
        <Card style={styles.section}>
          <Text style={styles.stepLabel}>Live capture</Text>
          <Text style={styles.sectionTitle}>
            {biometricVerificationRequired ? 'Take a live selfie' : 'Take a profile photo'}
          </Text>
          <Text style={styles.copy}>
            {biometricVerificationRequired
              ? 'Center your face, move closer if needed, and hold still for a clear capture.'
              : 'Take a clear face photo for your operator record.'}
          </Text>
          {biometricVerificationRequired ? (
            <View style={styles.livenessBrowserNotice}>
              <Text style={styles.livenessBrowserNoticeText}>
                Face liveness verification requires the YouVerify browser SDK and cannot run inside
                this app. Open the verification link sent to you via SMS or email in a browser to
                complete this step. Your selfie here is for your operator record only.
              </Text>
            </View>
          ) : null}

          {selfiePreviewUri ? (
            <View style={styles.selfiePreviewContainer}>
              <Image
                source={{ uri: selfiePreviewUri }}
                style={styles.selfiePreview}
                resizeMode="cover"
              />
              <Text style={styles.selfieCaption}>
                {identitySubmitted ? 'Selfie submitted' : 'Selfie captured — ready to submit'}
              </Text>
            </View>
          ) : null}

          {!identitySubmitted ? (
            <Button
              label={
                selfiePreviewUri
                  ? 'Retake selfie'
                  : biometricVerificationRequired
                    ? 'Open camera for selfie'
                    : 'Take profile photo'
              }
              variant={selfiePreviewUri ? 'secondary' : 'primary'}
              onPress={() => void onCaptureSelfie()}
            />
          ) : null}
        </Card>

        {/* Submit */}
        <Card style={styles.section}>
          <Text style={styles.stepLabel}>Submit</Text>
          <Text style={styles.sectionTitle}>Submit verification</Text>
          <View style={styles.badgeRow}>
            <Badge
              label={formatVerificationLifecycleLabel(verificationLifecycle)}
              tone={verificationLifecycleTone(verificationLifecycle)}
            />
          </View>

          {identitySubmitted && identityResult ? (
            <View
              style={[
                styles.resultCard,
                identityResult.decision === 'verified'
                  ? styles.resultCardSuccess
                  : styles.resultCardPending,
              ]}
            >
              <View style={styles.badgeRow}>
                <Badge
                  label={formatDecisionLabel(identityResult.decision)}
                  tone={
                    identityResult.decision === 'verified'
                      ? 'success'
                      : identityResult.decision === 'failed'
                        ? 'danger'
                        : 'warning'
                  }
                />
                {identityResult.livenessPassed != null ? (
                  <Badge
                    label={identityResult.livenessPassed ? 'Liveness passed' : 'Liveness failed'}
                    tone={identityResult.livenessPassed ? 'success' : 'danger'}
                  />
                ) : null}
              </View>

              {identityResult.verifiedProfile ? (
                <View style={styles.profileGrid}>
                  <Text style={styles.profileLabel}>Name on record</Text>
                  <Text style={styles.profileValue}>
                    {identityResult.verifiedProfile.fullName ?? '—'}
                  </Text>
                  {identityResult.verifiedProfile.dateOfBirth ? (
                    <>
                      <Text style={styles.profileLabel}>Date of birth</Text>
                      <Text style={styles.profileValue}>
                        {identityResult.verifiedProfile.dateOfBirth}
                      </Text>
                    </>
                  ) : null}
                  {identityResult.verifiedProfile.gender ? (
                    <>
                      <Text style={styles.profileLabel}>Gender</Text>
                      <Text style={styles.profileValue}>
                        {identityResult.verifiedProfile.gender}
                      </Text>
                    </>
                  ) : null}
                </View>
              ) : null}

              {identityResult.verificationConfidence != null ? (
                <Text style={styles.meta}>
                  Match confidence: {Math.round(identityResult.verificationConfidence * 100)}%
                </Text>
              ) : null}
              {identityResult.livenessConfidenceScore != null ? (
                <Text style={styles.meta}>
                  Liveness confidence: {Math.round(identityResult.livenessConfidenceScore * 100)}%
                </Text>
              ) : null}
              {identityResult.matchedIdentifierType ? (
                <Text style={styles.meta}>Matched via: {identityResult.matchedIdentifierType}</Text>
              ) : null}
              {identityResult.providerLookupStatus === 'skipped_by_organisation_policy' ? (
                <Text style={styles.copy}>
                  Your organisation will complete remaining checks internally.
                </Text>
              ) : identityResult.decision === 'review_needed' ? (
                <Text style={styles.copy}>
                  Your identity is under manual review. The operator will confirm once complete.
                </Text>
              ) : null}

              <Button
                label={identityResult.verifiedProfile ? 'Confirm details' : 'Continue to documents'}
                onPress={() =>
                  setCurrentStep(identityResult.verifiedProfile ? 'profile' : 'documents')
                }
              />
              <Button
                label="Add guarantor next"
                variant="secondary"
                onPress={() => navigation.navigate('DriverGuarantor')}
              />
            </View>
          ) : identitySubmitted ? (
            <View style={styles.resultCard}>
              <Badge
                label={formatIdentityLabel(driver.identityStatus)}
                tone={identityTone(driver.identityStatus)}
              />
              <Text style={styles.copy}>
                Identity already submitted. Check the readiness checklist for your current status.
              </Text>
              <Button label="Continue to documents" onPress={() => setCurrentStep('documents')} />
            </View>
          ) : (
            <>
              <Text style={styles.copy}>
                {identityVerificationRequired
                  ? 'Submit once your ID numbers and selfie are ready.'
                  : 'Your organisation does not require identity verification. Upload documents and continue.'}
              </Text>
              {identityVerificationRequired ? (
                <Button
                  label={
                    governmentLookupRequired
                      ? 'Submit identity verification'
                      : 'Save for organisation review'
                  }
                  disabled={!canSubmitIdentity}
                  loading={submittingIdentity}
                  loadingLabel="Submitting verification"
                  onPress={() => void onSubmitIdentity()}
                />
              ) : (
                <Button label="Continue to documents" onPress={() => setCurrentStep('documents')} />
              )}
              {!canSubmitIdentity && !identitySubmitted ? (
                <Text style={styles.hintText}>
                  {!identifiersReady
                    ? 'Enter all required ID numbers first.'
                    : biometricVerificationRequired && !selfieBase64
                      ? 'Capture your selfie using the camera above.'
                      : ''}
                </Text>
              ) : null}
            </>
          )}
        </Card>

        <Button label="Back" variant="secondary" onPress={goBack} />
        <FullScreenBlockingLoader
          visible={isProcessing}
          activeStep={1}
          message={processingMessage}
          steps={
            submittingIdentity
              ? [
                  'Validating live selfie',
                  'Checking identity records',
                  'Saving verification result',
                ]
              : uploadingDocument
                ? ['Preparing file', 'Uploading securely', 'Refreshing document checklist']
                : initiatingPayment
                  ? ['Preparing checkout', 'Linking payment to onboarding', 'Opening payment flow']
                  : [
                      'Saving your details',
                      'Updating onboarding progress',
                      'Preparing the next step',
                    ]
          }
          title={processingTitle}
          variant={processingVariant}
        />
      </Screen>
    );
  }

  // ─── Step: documents ────────────────────────────────────────────────────────

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      {renderProgressBar()}

      <Card style={styles.section}>
        <Text style={styles.kicker}>Documents</Text>
        <Text style={styles.title}>Upload documents</Text>
        <Text style={styles.copy}>
          Upload the documents {organisationName} requires. Optional documents can be skipped. Files
          must be under 10 MB (PDF, JPG, PNG, or WEBP).
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {requiredDocuments.map((document: { slug: string; name: string }) => (
            <Pressable key={document.slug} onPress={() => setSelectedDocumentType(document.slug)}>
              <View
                style={[
                  styles.chip,
                  selectedDocumentType === document.slug ? styles.chipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    selectedDocumentType === document.slug ? styles.chipLabelActive : null,
                  ]}
                >
                  {document.name}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <Button
          label="Upload selected document"
          disabled={!selectedDocumentType}
          loading={uploadingDocument}
          loadingLabel="Uploading document"
          onPress={() => void onUploadDocument()}
        />

        {documentChecklist.map((document) => (
          <View key={document.slug} style={styles.documentRow}>
            <View style={styles.documentCopy}>
              <Text style={styles.documentTitle}>{document.name}</Text>
              <Text style={styles.meta}>{document.uploaded ? 'Uploaded' : 'Not uploaded yet'}</Text>
              <Text style={styles.meta}>
                {document.latestDocument
                  ? `Status: ${formatDocumentStatus(document.latestDocument.status)}`
                  : 'Not uploaded yet'}
              </Text>
            </View>
            <View style={styles.documentActionColumn}>
              <Badge
                label={
                  document.latestDocument
                    ? formatDocumentStatus(document.latestDocument.status)
                    : 'Missing'
                }
                tone={documentStatusTone(document.latestDocument?.status)}
              />
              {document.latestDocument?.previewUrl ? (
                <Button
                  label="Open"
                  variant="secondary"
                  onPress={() => void Linking.openURL(document.latestDocument?.previewUrl ?? '')}
                />
              ) : null}
              {document.latestDocument ? (
                <Button
                  label={removingDocumentId === document.latestDocument.id ? 'Removing…' : 'Remove'}
                  variant="secondary"
                  onPress={() => {
                    if (!document.latestDocument?.id) {
                      return;
                    }
                    void onRemoveDocument(document.latestDocument.id);
                  }}
                />
              ) : null}
            </View>
          </View>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Next step</Text>
        <Text style={styles.copy}>
          {!driver.hasMobileAccess
            ? 'Set up your sign-in email and password so you can resume onboarding and log in once approved.'
            : documentChecklist.every((document) => document.uploaded)
              ? 'Your onboarding is complete for now. Check readiness to see any remaining operator review steps.'
              : 'Upload any remaining required documents, or skip optional ones and finish onboarding.'}
        </Text>
        {!driver.hasMobileAccess ? (
          <Button
            label="Continue to account setup"
            onPress={() => navigation.navigate('DriverAccountSetup')}
          />
        ) : null}
        <Button
          label={
            documentChecklist.every((document) => document.uploaded)
              ? 'Finish onboarding'
              : 'Check readiness'
          }
          variant="secondary"
          onPress={() => navigation.navigate('SelfServiceReadiness')}
        />
      </Card>

      <Button label="Back" variant="secondary" onPress={goBack} />
      <FullScreenBlockingLoader
        visible={isProcessing}
        activeStep={1}
        message={processingMessage}
        steps={
          submittingIdentity
            ? ['Validating live selfie', 'Checking identity records', 'Saving verification result']
            : uploadingDocument
              ? ['Preparing file', 'Uploading securely', 'Refreshing document checklist']
              : initiatingPayment
                ? ['Preparing checkout', 'Linking payment to onboarding', 'Opening payment flow']
                : ['Saving your details', 'Updating onboarding progress', 'Preparing the next step']
        }
        title={processingTitle}
        variant={processingVariant}
      />
    </Screen>
  );
}

function encodeBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return globalThis.btoa(binary);
}

async function getImageAssetBase64(asset: { base64?: string | null; uri?: string | null }) {
  if (asset.base64?.trim()) {
    return asset.base64;
  }

  if (!asset.uri) {
    return null;
  }

  try {
    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();
    return encodeBase64(arrayBuffer);
  } catch {
    return null;
  }
}

function formatIdentityLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDecisionLabel(decision: string) {
  if (decision === 'verified') return 'Verified';
  if (decision === 'review_needed') return 'Under review';
  if (decision === 'failed') return 'Not matched';
  if (decision === 'manual_review') return 'Sent for review';
  return decision.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatVerificationLifecycleLabel(state: VerificationLifecycleState) {
  if (state === 'not_started') return 'Not started';
  if (state === 'in_progress') return 'In progress';
  if (state === 'failed') return 'Failed';
  return 'Completed';
}

function verificationLifecycleTone(
  state: VerificationLifecycleState,
): 'neutral' | 'success' | 'warning' | 'danger' {
  if (state === 'completed') return 'success';
  if (state === 'failed') return 'danger';
  if (state === 'in_progress') return 'warning';
  return 'neutral';
}

function identityTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'verified') return 'success';
  if (status === 'failed') return 'danger';
  if (status === 'review_needed' || status === 'pending_verification') return 'warning';
  return 'neutral';
}

function formatDocumentStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function documentStatusTone(status?: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (!status) return 'warning';
  if (status === 'approved') return 'success';
  if (status === 'rejected' || status === 'expired') return 'danger';
  if (['pending', 'submitted', 'uploaded'].includes(status)) return 'warning';
  return 'neutral';
}

const styles = StyleSheet.create({
  centered: { justifyContent: 'center' },
  section: { gap: tokens.spacing.sm },
  kicker: {
    color: tokens.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, fontSize: 15, lineHeight: 22 },
  stepLabel: {
    color: tokens.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xs },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    backgroundColor: '#f0fdf4',
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.sm,
  },
  successText: { color: '#15803d', fontSize: 13, fontWeight: '600' },
  chipRow: { gap: tokens.spacing.xs },
  chip: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: tokens.colors.primaryTint, borderColor: tokens.colors.primary },
  chipLabel: { color: tokens.colors.ink, fontSize: 13, fontWeight: '600' },
  chipLabelActive: { color: tokens.colors.primaryDark },
  livenessBrowserNotice: {
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: tokens.radius.card,
    backgroundColor: '#fffbeb',
    padding: tokens.spacing.sm,
  },
  livenessBrowserNoticeText: {
    color: '#92400e',
    fontSize: 13,
    lineHeight: 18,
  },
  selfiePreviewContainer: {
    gap: tokens.spacing.xs,
    borderRadius: tokens.radius.card,
    overflow: 'hidden',
    backgroundColor: tokens.colors.border,
  },
  selfiePreview: {
    width: '100%',
    height: 260,
    backgroundColor: '#0f172a',
  },
  selfieCaption: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: tokens.spacing.xs,
  },
  resultCard: {
    gap: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    backgroundColor: '#FFFFFF',
    padding: tokens.spacing.sm,
  },
  resultCardSuccess: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  resultCardPending: {
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  profileGrid: { gap: 4 },
  profileLabel: { color: tokens.colors.inkSoft, fontSize: 12, fontWeight: '600' },
  profileValue: { color: tokens.colors.ink, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  hintText: { color: tokens.colors.inkSoft, fontSize: 13, fontStyle: 'italic' },
  meta: { color: tokens.colors.ink, fontSize: 13 },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    backgroundColor: '#FFFFFF',
    padding: tokens.spacing.sm,
  },
  documentCopy: { flex: 1, gap: 4 },
  documentActionColumn: { alignItems: 'flex-end', gap: tokens.spacing.xs },
  documentTitle: { color: tokens.colors.ink, fontSize: 14, fontWeight: '700' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.border,
  },
  progressDotActive: {
    backgroundColor: tokens.colors.primary,
  },
  progressLabel: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  checklistBlock: {
    gap: 6,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.sm,
    backgroundColor: '#f8fafc',
  },
  checklistHeading: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  checklistRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  checklistDot: { color: tokens.colors.primary, fontSize: 16, lineHeight: 20 },
  checklistText: { color: tokens.colors.ink, fontSize: 14, flex: 1, lineHeight: 20 },
  paymentNotice: {
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: tokens.radius.card,
    backgroundColor: '#fffbeb',
    padding: tokens.spacing.sm,
    gap: 4,
  },
  paymentNoticeTitle: { color: '#92400e', fontSize: 14, fontWeight: '700' },
  paymentNoticeBody: { color: '#78350f', fontSize: 13, lineHeight: 18 },
  orgCoversNotice: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: tokens.radius.card,
    backgroundColor: '#f0fdf4',
    padding: tokens.spacing.sm,
  },
  orgCoversText: { color: '#15803d', fontSize: 13, fontWeight: '600' },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    backgroundColor: '#ffffff',
    padding: tokens.spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: tokens.colors.border,
    backgroundColor: '#ffffff',
    marginTop: 2,
  },
  checkboxActive: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primary,
  },
  consentText: {
    color: tokens.colors.ink,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  legalText: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
  },
  legalLinkRow: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  legalLink: {
    color: tokens.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  breakdownCard: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    backgroundColor: '#f8fafc',
    padding: tokens.spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: { color: tokens.colors.ink, fontSize: 14 },
  breakdownAmount: { color: tokens.colors.ink, fontSize: 14, fontWeight: '700' },
});

export default SelfServiceVerificationScreen;
