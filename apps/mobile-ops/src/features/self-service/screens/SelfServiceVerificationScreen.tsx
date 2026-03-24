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
        // Ignore malformed draft state and let the screen continue with a clean draft.
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

    persistDraft().catch(() => {
      // Draft persistence is best-effort.
    });
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

  const canSubmitIdentity = useMemo(
    () =>
      Boolean(
        token &&
          identifierTypes.every((identifier) => {
            const value = (identifierValues[identifier.type] ?? '').trim();
            if (!identifier.required && !value) {
              return true;
            }
            if (!value) {
              return false;
            }
            if (identifier.numericOnly && !/^\d+$/.test(value)) {
              return false;
            }
            if (identifier.exactLength && value.length !== identifier.exactLength) {
              return false;
            }
            return true;
          }) &&
          (!biometricVerificationRequired || selfieBase64),
      ),
    [biometricVerificationRequired, identifierTypes, identifierValues, selfieBase64, token],
  );

  const identifiersReady = useMemo(
    () =>
      identifierTypes.every((identifier) => {
        const value = (identifierValues[identifier.type] ?? '').trim();
        if (!identifier.required && !value) {
          return true;
        }
        if (!value) {
          return false;
        }
        if (identifier.numericOnly && !/^\d+$/.test(value)) {
          return false;
        }
        if (identifier.exactLength && value.length !== identifier.exactLength) {
          return false;
        }
        return true;
      }),
    [identifierTypes, identifierValues],
  );

  const identitySubmitted = useMemo(
    () =>
      !identityVerificationRequired ||
      Boolean(identityResult) ||
      ['pending_verification', 'verified', 'review_needed', 'failed'].includes(
        driver?.identityStatus ?? '',
      ),
    [driver?.identityStatus, identityResult, identityVerificationRequired],
  );

  const documentChecklist = useMemo(
    () =>
      requiredDocuments.map((document) => {
        const matchingDocuments = documents.filter(
          (uploadedDocument) => uploadedDocument.documentType === document.slug,
        );
        const latestDocument = matchingDocuments[0] ?? null;
        return {
          ...document,
          uploaded: matchingDocuments.length > 0,
          latestDocument,
        };
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
    [countryCode, documentChecklist, identifiersReady, identitySubmitted, selfieBase64],
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
    if (!token) {
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access', 'Camera permission is required to capture a verification selfie.');
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
        allowsEditing: false,
        base64: true,
        cameraType: ImagePicker.CameraType.front,
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

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
    if (!token) {
      return;
    }

    if (!canSubmitIdentity) {
      Alert.alert(
        'Driver verification',
        biometricVerificationRequired
          ? 'Complete the required identifiers and capture a live selfie before submitting.'
          : 'Complete the required identifiers before submitting.',
      );
      return;
    }

    if (!identityVerificationRequired || !governmentLookupRequired) {
      setIdentityResult({
        decision: 'manual_review',
        providerLookupStatus: 'skipped_by_organisation_policy',
      });
      showToast('Identity details saved for organisation review.', 'success');
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
    if (!token) {
      return;
    }
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

      if (result.canceled) {
        return;
      }

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
          Submit your identity details, capture a profile photo when required, and upload your onboarding documents from this device.
        </Text>
      </Card>

      {draftRestored ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Saved progress restored</Text>
          <Text style={styles.copy}>
            Your last country, identifier inputs, and document selection were restored on this
            device. Selfie capture is not stored and must be completed again.
          </Text>
          <Button label="Clear saved draft" variant="secondary" onPress={() => void onClearDraft()} />
        </Card>
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <Text style={styles.copy}>
          {completedStepCount} of {stepCompletion.length} onboarding tasks completed.
        </Text>
        <View style={styles.badgeRow}>
          <Badge label={`Identity: ${formatIdentityLabel(driver.identityStatus)}`} tone={identityTone(driver.identityStatus)} />
          <Badge
            label={`Documents: ${uploadedRequiredDocumentCount}/${documentChecklist.length || 0}`}
            tone={
              documentChecklist.length > 0 &&
              uploadedRequiredDocumentCount === documentChecklist.length
                ? 'success'
                : 'warning'
            }
          />
        </View>
        {stepCompletion.map((step) => (
          <View key={step.label} style={styles.checklistRow}>
            <Badge label={step.complete ? 'Done' : 'Pending'} tone={step.complete ? 'success' : 'warning'} />
            <Text style={styles.checklistLabel}>{step.label}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>1. Country</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {countryOptions.map((option: { code: string; label: string }) => (
            <Pressable key={option.code} onPress={() => setCountryCode(option.code)}>
              <View
                style={[
                  styles.chip,
                  countryCode === option.code ? styles.chipActive : null,
                ]}
              >
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

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>2. Identification numbers</Text>
        {identifierTypes.map((identifier) => (
          <Input
            key={identifier.type}
            keyboardType={identifier.numericOnly ? 'number-pad' : 'default'}
            label={identifier.label}
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
            value={identifierValues[identifier.type] ?? ''}
            helperText={identifier.required ? 'Required' : 'Optional'}
          />
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>
          3. {biometricVerificationRequired ? 'Live selfie' : 'Profile photo'}
        </Text>
        <Text style={styles.copy}>
          {biometricVerificationRequired
            ? 'Capture a live selfie to support liveness and identity matching.'
            : 'Capture a clear face photo for your organisation record.'}
        </Text>
        {selfiePreviewUri ? (
          <View style={styles.previewCard}>
            <Text style={styles.meta}>Selfie captured and ready for submission.</Text>
            <Text style={styles.meta}>{selfiePreviewUri}</Text>
          </View>
        ) : null}
        {biometricVerificationRequired && livenessSession ? (
          <View style={styles.previewCard}>
            <Text style={styles.meta}>Live verification session prepared.</Text>
          </View>
        ) : null}
        <Button
          label={selfiePreviewUri ? 'Retake photo' : biometricVerificationRequired ? 'Capture selfie' : 'Capture photo'}
          onPress={() => void onCaptureSelfie()}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>4. Submit verification</Text>
        <Text style={styles.copy}>
          {identityVerificationRequired
            ? 'Submit once your required identifiers are complete and your capture step is done.'
            : 'Your organisation does not require identity verification before activation. You can continue after document upload.'}
        </Text>
        {identityVerificationRequired ? (
          <Button
            label={
              governmentLookupRequired
                ? 'Submit identity verification'
                : 'Save identity details for review'
            }
            disabled={!canSubmitIdentity}
            loading={submittingIdentity}
            onPress={() => void onSubmitIdentity()}
          />
        ) : (
          <Text style={styles.meta}>
            Identity verification is optional for this organisation. Upload the required
            documents and open the readiness checklist when you are done.
          </Text>
        )}
        {identityResult ? (
          <View style={styles.previewCard}>
            <Badge label={identityResult.decision} tone={identityResult.decision === 'verified' ? 'success' : 'warning'} />
            <Text style={styles.meta}>
              {identityResult.providerLookupStatus === 'skipped_by_organisation_policy'
                ? 'Your organisation will complete any remaining checks internally.'
                : 'Identity details submitted successfully.'}
            </Text>
          </View>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>5. Documents</Text>
        <Text style={styles.copy}>
          Required documents depend on your selected country profile. Upload each item once from
          this device.
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
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
          onPress={() => void onUploadDocument()}
        />
        {documentChecklist.map((document) => (
          <View key={document.slug} style={styles.documentRow}>
            <View style={styles.documentCopy}>
              <Text style={styles.documentTitle}>{document.name}</Text>
              <Text style={styles.meta}>
                {document.latestDocument
                  ? `Current status: ${formatDocumentStatus(document.latestDocument.status)}`
                  : 'No file uploaded yet'}
              </Text>
            </View>
            <Badge
              label={
                document.latestDocument
                  ? formatDocumentStatus(document.latestDocument.status)
                  : 'Missing'
              }
              tone={documentStatusTone(document.latestDocument?.status)}
            />
          </View>
        ))}
        {documents.map((document) => (
          <View key={document.id} style={styles.previewCard}>
            <Text style={styles.meta}>{getDocumentType(document.documentType).name}</Text>
            <Text style={styles.meta}>Status: {document.status}</Text>
            {document.reviewedAt ? <Text style={styles.meta}>Reviewed: {document.reviewedAt}</Text> : null}
          </View>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>6. Review readiness</Text>
        <Text style={styles.copy}>
          Refresh your checklist after submitting identity or documents to confirm whether you are ready for activation and assignments.
        </Text>
        <Button label="Open readiness checklist" onPress={() => navigation.navigate('SelfServiceReadiness')} />
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

function identityTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'verified') {
    return 'success';
  }
  if (status === 'failed') {
    return 'danger';
  }
  if (status === 'review_needed' || status === 'pending_verification') {
    return 'warning';
  }
  return 'neutral';
}

function formatDocumentStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function documentStatusTone(
  status?: string,
): 'neutral' | 'success' | 'warning' | 'danger' {
  if (!status) {
    return 'warning';
  }
  if (status === 'approved') {
    return 'success';
  }
  if (status === 'rejected' || status === 'expired') {
    return 'danger';
  }
  if (status === 'pending' || status === 'submitted' || status === 'uploaded') {
    return 'warning';
  }
  return 'neutral';
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
  },
  section: {
    gap: tokens.spacing.sm,
  },
  kicker: {
    color: tokens.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 28,
    fontWeight: '800',
  },
  copy: {
    color: tokens.colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  checklistLabel: {
    color: tokens.colors.ink,
    fontSize: 14,
    flex: 1,
  },
  chipRow: {
    gap: tokens.spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: tokens.colors.primaryTint,
    borderColor: tokens.colors.primary,
  },
  chipLabel: {
    color: tokens.colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: tokens.colors.primaryDark,
  },
  previewCard: {
    gap: tokens.spacing.xs,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    backgroundColor: '#FFFFFF',
    padding: tokens.spacing.sm,
  },
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
  documentCopy: {
    flex: 1,
    gap: 4,
  },
  documentTitle: {
    color: tokens.colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    color: tokens.colors.ink,
    fontSize: 13,
  },
});

export default SelfServiceVerificationScreen;
