'use client';

import {
  getCountryConfig,
  getDocumentType,
  getRequiredDocuments,
  getSupportedCountryCodes,
  isCountrySupported,
  type SupportedIdentifierType,
} from '@mobility-os/domain-config';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  createDriverSelfServiceLivenessSession,
  resolveDriverSelfServiceIdentity,
  uploadDriverSelfServiceDocument,
  type DriverIdentityResolutionResult,
  type DriverLivenessSessionRecord,
} from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { STORAGE_KEYS } from '../../../constants';
import { useSelfService } from '../../../contexts/self-service-context';
import { useToast } from '../../../contexts/toast-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

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

export function SelfServiceVerificationScreen({
  navigation,
}: ScreenProps<'SelfServiceVerification'>) {
  const { showToast } = useToast();
  const {
    token,
    driver,
    documents,
    isRefreshing,
    refreshSelfService,
  } = useSelfService();
  const [countryCode, setCountryCode] = useState(driver?.nationality ?? 'NG');
  const [identifierValues, setIdentifierValues] = useState<Record<string, string>>({});
  const [selfieBase64, setSelfieBase64] = useState('');
  const [selfiePreviewUri, setSelfiePreviewUri] = useState<string | null>(null);
  const [livenessSession, setLivenessSession] = useState<DriverLivenessSessionRecord | null>(null);
  const [identityResult, setIdentityResult] = useState<DriverIdentityResolutionResult | null>(null);
  const [submittingIdentity, setSubmittingIdentity] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const previousCountryCodeRef = useRef(countryCode);

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
        ? getRequiredDocuments(
            driver?.requiredDriverDocumentSlugs?.length
              ? driver.requiredDriverDocumentSlugs
              : getCountryConfig(countryCode).requiredDriverDocumentSlugs,
          )
        : [],
    [countryCode, driver?.requiredDriverDocumentSlugs],
  );

  const identityVerificationRequired =
    driver?.requireIdentityVerificationForActivation ?? true;
  const biometricVerificationRequired = driver?.requireBiometricVerification ?? true;
  const governmentLookupRequired = driver?.requireGovernmentVerificationLookup ?? true;

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
        : requiredDocuments[0]?.slug ?? '',
    );
  }, [requiredDocuments]);

  const identitySubmitted = useMemo(
    () =>
      !identityVerificationRequired ||
      Boolean(identityResult) ||
      ['pending_verification', 'verified', 'review_needed', 'failed'].includes(
        driver?.identityStatus ?? '',
      ),
    [driver?.identityStatus, identityResult, identityVerificationRequired],
  );

  const canSubmitIdentity = useMemo(
    () =>
      !identitySubmitted &&
      Boolean(
        token &&
          identifierTypes.every((identifier) => {
            const value = (identifierValues[identifier.type] ?? '').trim();
            if (!identifier.required && !value) return true;
            if (!value) return false;
            if (identifier.numericOnly && !/^\d+$/.test(value)) return false;
            if (identifier.exactLength && value.length !== identifier.exactLength) return false;
            return true;
          }) &&
          (!biometricVerificationRequired || selfieBase64),
      ),
    [biometricVerificationRequired, identitySubmitted, identifierTypes, identifierValues, selfieBase64, token],
  );

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

  const stepCompletion = useMemo(
    () => [
      { label: 'Select country', complete: Boolean(countryCode) },
      { label: 'Enter required identifiers', complete: identifiersReady },
      {
        label: biometricVerificationRequired ? 'Capture live selfie' : 'Capture profile photo',
        complete: biometricVerificationRequired ? Boolean(selfieBase64) : true,
      },
      { label: 'Submit identity', complete: identitySubmitted },
      {
        label: 'Upload required documents',
        complete:
          documentChecklist.length > 0 &&
          documentChecklist.every((document) => document.uploaded),
      },
    ],
    [countryCode, documentChecklist, identifiersReady, identitySubmitted, biometricVerificationRequired, selfieBase64],
  );

  const completedStepCount = useMemo(
    () => stepCompletion.filter((step) => step.complete).length,
    [stepCompletion],
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

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access', 'Allow camera access to capture a verification selfie.');
      return;
    }

    try {
      if (biometricVerificationRequired) {
        const session = await createDriverSelfServiceLivenessSession(token, { countryCode });
        setLivenessSession(session);
      } else {
        setLivenessSession(null);
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
        cameraType: ImagePicker.CameraType.front,
        mediaTypes: ['images'],
        quality: 0.85,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        throw new Error('The selfie image could not be encoded for verification.');
      }

      setSelfieBase64(asset.base64);
      setSelfiePreviewUri(asset.uri ?? null);
      showToast('Selfie captured.', 'success');
    } catch (error) {
      Alert.alert(
        'Live verification',
        error instanceof Error ? error.message : 'Unable to capture a verification selfie.',
      );
    }
  };

  const onSubmitIdentity = async () => {
    if (!token) return;

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
      if (!driver?.hasMobileAccess) {
        navigation.navigate('DriverAccountSetup');
      }
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
        livenessPassed: true,
        livenessCheck: livenessSession
          ? {
              provider: livenessSession.providerName,
              sessionId: livenessSession.sessionId,
              passed: true,
            }
          : undefined,
      });

      setIdentityResult(result);
      await refreshSelfService();
      await SecureStore.deleteItemAsync(STORAGE_KEYS.selfServiceVerificationDraft);
      setDraftRestored(false);
      showToast('Identity verification submitted.', 'success');

      // Auto-navigate: go to account setup if no mobile access yet, else readiness
      if (!driver?.hasMobileAccess) {
        navigation.navigate('DriverAccountSetup');
      } else {
        navigation.navigate('SelfServiceReadiness');
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

  if (!token || !driver) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <Card style={styles.section}>
          <Text style={styles.title}>Verification session missing</Text>
          <Text style={styles.copy}>
            Start from the verification access screen before attempting identity capture.
          </Text>
          <Button label="Enter verification code" onPress={() => navigation.replace('SelfServiceOtp')} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      <Card style={styles.section}>
        <Text style={styles.kicker}>Driver verification</Text>
        <Text style={styles.title}>Complete identity setup</Text>
        <Text style={styles.copy}>
          Submit your identity details, take a selfie, and upload onboarding documents to get started.
        </Text>
        <View style={styles.badgeRow}>
          <Badge label={`Identity: ${formatIdentityLabel(driver.identityStatus)}`} tone={identityTone(driver.identityStatus)} />
          <Badge
            label={`Docs: ${uploadedRequiredDocumentCount}/${documentChecklist.length}`}
            tone={
              documentChecklist.length > 0 && uploadedRequiredDocumentCount === documentChecklist.length
                ? 'success'
                : 'warning'
            }
          />
          <Badge
            label={`${completedStepCount}/${stepCompletion.length} steps done`}
            tone={completedStepCount === stepCompletion.length ? 'success' : 'neutral'}
          />
        </View>
      </Card>

      {draftRestored ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Saved progress restored</Text>
          <Text style={styles.copy}>
            Your last inputs were restored. Selfie capture is not saved and must be done again.
          </Text>
          <Button label="Clear saved draft" variant="secondary" onPress={() => void onClearDraft()} />
        </Card>
      ) : null}

      {/* Step 1: Country */}
      <Card style={styles.section}>
        <Text style={styles.stepLabel}>Step 1 of 5</Text>
        <Text style={styles.sectionTitle}>Country</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {countryOptions.map((option: { code: string; label: string }) => (
            <Pressable
              key={option.code}
              disabled={identitySubmitted}
              onPress={() => setCountryCode(option.code)}
            >
              <View style={[styles.chip, countryCode === option.code ? styles.chipActive : null]}>
                <Text style={[styles.chipLabel, countryCode === option.code ? styles.chipLabelActive : null]}>
                  {option.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </Card>

      {/* Step 2: Identification numbers */}
      <Card style={styles.section}>
        <Text style={styles.stepLabel}>Step 2 of 5</Text>
        <Text style={styles.sectionTitle}>Identification numbers</Text>
        <Text style={styles.copy}>
          Enter your government-issued ID numbers exactly as they appear on the document.
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
                : identifierValues[identifier.type] ?? ''
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

      {/* Step 3: Selfie capture */}
      <Card style={styles.section}>
        <Text style={styles.stepLabel}>Step 3 of 5</Text>
        <Text style={styles.sectionTitle}>
          {biometricVerificationRequired ? 'Live selfie' : 'Profile photo'}
        </Text>
        <Text style={styles.copy}>
          {biometricVerificationRequired
            ? 'Look directly at the front camera in good lighting. Keep your face centred in the frame.'
            : 'Take a clear face photo for your operator record.'}
        </Text>

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
            label={selfiePreviewUri ? 'Retake selfie' : biometricVerificationRequired ? 'Open camera for selfie' : 'Take profile photo'}
            variant={selfiePreviewUri ? 'secondary' : 'default'}
            onPress={() => void onCaptureSelfie()}
          />
        ) : null}
      </Card>

      {/* Step 4: Submit identity */}
      <Card style={styles.section}>
        <Text style={styles.stepLabel}>Step 4 of 5</Text>
        <Text style={styles.sectionTitle}>Submit verification</Text>

        {identitySubmitted && identityResult ? (
          <View style={[styles.resultCard, identityResult.decision === 'verified' ? styles.resultCardSuccess : styles.resultCardPending]}>
            <View style={styles.badgeRow}>
              <Badge
                label={formatDecisionLabel(identityResult.decision)}
                tone={identityResult.decision === 'verified' ? 'success' : identityResult.decision === 'failed' ? 'danger' : 'warning'}
              />
              {identityResult.livenessPassed != null ? (
                <Badge
                  label={identityResult.livenessPassed ? 'Liveness passed' : 'Liveness failed'}
                  tone={identityResult.livenessPassed ? 'success' : 'danger'}
                />
              ) : null}
            </View>

            {/* Smile Identity record fields */}
            {identityResult.verifiedProfile ? (
              <View style={styles.profileGrid}>
                <Text style={styles.profileLabel}>Name on record</Text>
                <Text style={styles.profileValue}>{identityResult.verifiedProfile.fullName ?? '—'}</Text>
                {identityResult.verifiedProfile.dateOfBirth ? (
                  <>
                    <Text style={styles.profileLabel}>Date of birth</Text>
                    <Text style={styles.profileValue}>{identityResult.verifiedProfile.dateOfBirth}</Text>
                  </>
                ) : null}
                {identityResult.verifiedProfile.gender ? (
                  <>
                    <Text style={styles.profileLabel}>Gender</Text>
                    <Text style={styles.profileValue}>{identityResult.verifiedProfile.gender}</Text>
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
              <Text style={styles.meta}>
                Matched via: {identityResult.matchedIdentifierType}
              </Text>
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
          </View>
        ) : identitySubmitted ? (
          <View style={styles.resultCard}>
            <Badge label={formatIdentityLabel(driver.identityStatus)} tone={identityTone(driver.identityStatus)} />
            <Text style={styles.copy}>
              Identity already submitted. Check the readiness checklist for your current status.
            </Text>
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
                label={governmentLookupRequired ? 'Submit identity verification' : 'Save for organisation review'}
                disabled={!canSubmitIdentity}
                loading={submittingIdentity}
                onPress={() => void onSubmitIdentity()}
              />
            ) : (
              <Text style={styles.meta}>
                Upload required documents below and open the readiness checklist when done.
              </Text>
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

      {/* Step 5: Documents */}
      <Card style={styles.section}>
        <Text style={styles.stepLabel}>Step 5 of 5</Text>
        <Text style={styles.sectionTitle}>Upload documents</Text>
        <Text style={styles.copy}>
          Upload each required document from this device. Files must be under 10 MB (PDF, JPG, PNG).
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {requiredDocuments.map((document: { slug: string; name: string }) => (
            <Pressable key={document.slug} onPress={() => setSelectedDocumentType(document.slug)}>
              <View style={[styles.chip, selectedDocumentType === document.slug ? styles.chipActive : null]}>
                <Text style={[styles.chipLabel, selectedDocumentType === document.slug ? styles.chipLabelActive : null]}>
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
          onPress={() => void onUploadDocument()}
        />

        {documentChecklist.map((document) => (
          <View key={document.slug} style={styles.documentRow}>
            <View style={styles.documentCopy}>
              <Text style={styles.documentTitle}>{document.name}</Text>
              <Text style={styles.meta}>
                {document.latestDocument
                  ? `Status: ${formatDocumentStatus(document.latestDocument.status)}`
                  : 'Not uploaded yet'}
              </Text>
            </View>
            <Badge
              label={document.latestDocument ? formatDocumentStatus(document.latestDocument.status) : 'Missing'}
              tone={documentStatusTone(document.latestDocument?.status)}
            />
          </View>
        ))}
      </Card>

      {/* Continue CTA */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Next step</Text>
        <Text style={styles.copy}>
          {!driver.hasMobileAccess
            ? 'Set up your sign-in email and password so you can log into the app once approved.'
            : 'Check your readiness status to see what's still needed for activation.'}
        </Text>
        {!driver.hasMobileAccess ? (
          <Button
            label="Set up sign-in account"
            onPress={() => navigation.navigate('DriverAccountSetup')}
          />
        ) : null}
        <Button
          label="Open readiness checklist"
          variant="secondary"
          onPress={() => navigation.navigate('SelfServiceReadiness')}
        />
      </Card>
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
  documentTitle: { color: tokens.colors.ink, fontSize: 14, fontWeight: '700' },
});

export default SelfServiceVerificationScreen;
