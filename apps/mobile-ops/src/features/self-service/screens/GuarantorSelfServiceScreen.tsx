'use client';

import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  isYouVerifyLivenessAvailable,
  startYouVerifyLiveness,
} from '../../../../modules/youverify-liveness';
import {
  type DriverIdentityResolutionResult,
  type DriverLivenessSessionRecord,
  type GuarantorSelfServiceContextRecord,
  createGuarantorSelfServiceAccount,
  createGuarantorSelfServiceLivenessSession,
  exchangeGuarantorSelfServiceOtp,
  getGuarantorSelfServiceContext,
  issueAuthenticatedGuarantorSelfServiceContinuationToken,
  resolveGuarantorSelfServiceIdentity,
  updateGuarantorSelfServiceProfile,
} from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { FullScreenBlockingLoader } from '../../../components/processing-state';
import { Screen } from '../../../components/screen';
import { mobileEnv } from '../../../config/env';
import { STORAGE_KEYS } from '../../../constants';
import { useAuth } from '../../../contexts/auth-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function GuarantorSelfServiceScreen({
  navigation,
  route,
}: ScreenProps<'GuarantorSelfService'> | ScreenProps<'GuarantorSelfServiceOtp'>) {
  const { session, loginWithPassword } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [context, setContext] = useState<GuarantorSelfServiceContextRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [directToken, setDirectToken] = useState(route.params?.token ?? '');
  const [submittingAccess, setSubmittingAccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [identifierType, setIdentifierType] = useState('NATIONAL_ID');
  const [identifierValue, setIdentifierValue] = useState('');
  const [selfiePreviewUri, setSelfiePreviewUri] = useState<string | null>(null);
  const [selfieBase64, setSelfieBase64] = useState('');
  const [livenessSession, setLivenessSession] = useState<DriverLivenessSessionRecord | null>(null);
  const [livenessFeedback, setLivenessFeedback] = useState<string | null>(null);
  const [nativeLivenessPassed, setNativeLivenessPassed] = useState<boolean | null>(null);
  const [nativeLivenessFaceB64, setNativeLivenessFaceB64] = useState<string | undefined>(undefined);
  const [identityResult, setIdentityResult] = useState<DriverIdentityResolutionResult | null>(null);
  const [submittingIdentity, setSubmittingIdentity] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [capturingSelfie, setCapturingSelfie] = useState(false);
  const isProcessing = submittingAccess || submittingIdentity || savingProfile || capturingSelfie;
  const processingTitle = submittingIdentity
    ? 'Submitting guarantor verification'
    : capturingSelfie
      ? 'Preparing live selfie capture'
      : savingProfile
        ? 'Saving guarantor details'
        : 'Opening guarantor onboarding';
  const processingMessage = submittingIdentity
    ? 'Checking the live selfie, matching identity details, and saving the verification result.'
    : capturingSelfie
      ? 'Preparing camera access and securing the live verification session.'
      : savingProfile
        ? 'Updating the guarantor profile and syncing the latest onboarding details.'
        : 'Checking secure access and restoring the guarantor onboarding flow.';
  const nativeLivenessSupported = isYouVerifyLivenessAvailable();

  const loadContext = useCallback(async (nextToken: string) => {
    const nextContext = await getGuarantorSelfServiceContext(nextToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.guarantorSelfServiceToken, nextToken);
    setToken(nextToken);
    setContext(nextContext);
    setEmail(nextContext.guarantorEmail ?? '');
    setName(nextContext.guarantorName);
    setPhone(nextContext.guarantorPhone);
    setRelationship(nextContext.guarantorRelationship ?? '');
    setCountryCode(nextContext.guarantorCountryCode ?? '');
  }, []);

  useEffect(() => {
    const restore = async () => {
      try {
        const incomingToken = route.params?.token?.trim();
        if (incomingToken) {
          await loadContext(incomingToken);
          return;
        }

        const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.guarantorSelfServiceToken);
        if (storedToken) {
          await loadContext(storedToken);
          return;
        }

        if (session?.selfServiceSubjectType === 'guarantor') {
          const continuation = await issueAuthenticatedGuarantorSelfServiceContinuationToken();
          await loadContext(continuation.token);
          return;
        }
      } catch {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.guarantorSelfServiceToken);
      } finally {
        setLoading(false);
      }
    };

    restore().catch(() => setLoading(false));
  }, [loadContext, route.params?.token, session?.selfServiceSubjectType]);

  const refresh = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      await loadContext(token);
    } finally {
      setRefreshing(false);
    }
  };

  const bootstrapFromOtp = async () => {
    if (!otpCode.trim()) {
      Alert.alert('Guarantor verification', 'Enter the invitation code sent to you.');
      return;
    }
    setSubmittingAccess(true);
    try {
      const result = await exchangeGuarantorSelfServiceOtp(otpCode.trim());
      await loadContext(result.token);
    } catch (error) {
      Alert.alert(
        'Verification access failed',
        error instanceof Error ? error.message : 'Unable to exchange that invitation code.',
      );
    } finally {
      setSubmittingAccess(false);
    }
  };

  const bootstrapFromToken = async () => {
    if (!directToken.trim()) {
      Alert.alert('Guarantor verification', 'Paste the verification token to continue.');
      return;
    }
    setSubmittingAccess(true);
    try {
      await loadContext(directToken.trim());
    } catch (error) {
      Alert.alert(
        'Verification access failed',
        error instanceof Error ? error.message : 'Unable to use that verification token.',
      );
    } finally {
      setSubmittingAccess(false);
    }
  };

  const submitAccount = async () => {
    if (!token || !email.trim() || password.length < 8 || password !== confirmPassword) {
      Alert.alert(
        'Account setup',
        'Enter a valid email and matching password with at least 8 characters.',
      );
      return;
    }

    setSubmittingAccess(true);
    try {
      await createGuarantorSelfServiceAccount(token, {
        email: email.trim().toLowerCase(),
        password,
      });
      await loginWithPassword(email.trim().toLowerCase(), password);
      await refresh();
    } catch (error) {
      Alert.alert(
        'Account setup failed',
        error instanceof Error ? error.message : 'Unable to create your account.',
      );
    } finally {
      setSubmittingAccess(false);
    }
  };

  const saveProfile = async () => {
    if (!token || !name.trim() || !phone.trim()) {
      Alert.alert('Guarantor details', 'Name and phone are required.');
      return;
    }

    try {
      setSavingProfile(true);
      await updateGuarantorSelfServiceProfile(token, {
        name: name.trim(),
        phone: phone.trim(),
        ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
        ...(countryCode.trim() ? { countryCode: countryCode.trim().toUpperCase() } : {}),
        ...(relationship.trim() ? { relationship: relationship.trim() } : {}),
      });
      await refresh();
      Alert.alert('Saved', 'Your guarantor details have been updated.');
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : 'Unable to save guarantor details.',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const captureSelfie = async () => {
    setCapturingSelfie(true);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Camera access', 'Allow camera access to complete live verification.');
          return;
        }
      }

      const result =
        Platform.OS === 'web'
          ? await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              base64: true,
              mediaTypes: ['images'],
              quality: 0.7,
            })
          : await ImagePicker.launchCameraAsync({
              allowsEditing: false,
              base64: true,
              quality: 0.7,
              cameraType: ImagePicker.CameraType.front,
            });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const imageBase64 = await getImageAssetBase64(asset);
      if (!imageBase64) {
        Alert.alert('Live verification', 'Unable to capture the selfie image. Please try again.');
        return;
      }

      setSelfieBase64(imageBase64);
      setSelfiePreviewUri(asset.uri);
      setNativeLivenessPassed(null);
      setNativeLivenessFaceB64(undefined);
      if (token) {
        const sessionRecord = await createGuarantorSelfServiceLivenessSession(
          token,
          countryCode.trim() || undefined,
        );
        setLivenessSession(sessionRecord);
      }
    } finally {
      setCapturingSelfie(false);
    }
  };

  const openBrowserFallback = async () => {
    if (!token) {
      return;
    }

    try {
      await Linking.openURL(
        `${mobileEnv.tenantWebUrl}/guarantor-self-service?token=${encodeURIComponent(token)}`,
      );
      setLivenessFeedback(
        'Continue in your browser to finish guarantor live verification, then return here and submit.',
      );
    } catch (error) {
      Alert.alert(
        'Live verification',
        error instanceof Error ? error.message : 'Unable to open the secure browser fallback.',
      );
    }
  };

  const startNativeLiveness = async () => {
    if (!token) {
      return;
    }

    if (!nativeLivenessSupported) {
      await openBrowserFallback();
      return;
    }

    try {
      const sessionRecord =
        livenessSession ??
        (await createGuarantorSelfServiceLivenessSession(
          token,
          countryCode.trim() || undefined,
        ));
      setLivenessSession(sessionRecord);

      if (!sessionRecord.clientAuthToken) {
        throw new Error('The secure liveness token is unavailable right now. Please try again.');
      }

      const result = await startYouVerifyLiveness({
        sessionId: sessionRecord.sessionId,
        sessionToken: sessionRecord.clientAuthToken,
        sandbox: __DEV__,
      });

      if (result.passed) {
        setNativeLivenessPassed(true);
        setNativeLivenessFaceB64(result.faceImageB64);
        setLivenessFeedback('Live verification passed. You can submit guarantor verification now.');
      } else {
        setNativeLivenessPassed(false);
        setLivenessFeedback(
          result.errorMessage ??
            'Live verification did not pass. Check your lighting and try again.',
        );
      }
    } catch (error) {
      setLivenessFeedback(
        error instanceof Error ? error.message : 'Unable to start live verification right now.',
      );
      Alert.alert(
        'Live verification',
        error instanceof Error ? error.message : 'Unable to start live verification right now.',
      );
    }
  };

  const submitIdentity = async () => {
    if (!token || !(nativeLivenessFaceB64 || selfieBase64) || !livenessSession) {
      Alert.alert(
        'Verification',
        'Capture a live selfie before submitting guarantor verification.',
      );
      return;
    }

    if (!countryCode.trim()) {
      Alert.alert(
        'Verification',
        'Enter the guarantor country code before submitting verification.',
      );
      return;
    }

    if (!identifierValue.trim()) {
      Alert.alert(
        'Verification',
        'Enter a government or identity identifier before submitting guarantor verification.',
      );
      return;
    }

    setSubmittingIdentity(true);
    try {
      const result = await resolveGuarantorSelfServiceIdentity(token, {
        countryCode: countryCode.trim().toUpperCase(),
        identifiers: [
          {
            type: identifierType.trim().toUpperCase(),
            value: identifierValue.trim(),
            countryCode: countryCode.trim().toUpperCase(),
          },
        ],
        selfieImageBase64: nativeLivenessFaceB64 ?? selfieBase64,
        livenessCheck: {
          provider: livenessSession.providerName,
          sessionId: livenessSession.sessionId,
        },
        subjectConsent: true,
      });
      setIdentityResult(result);
      await refresh();
    } catch (error) {
      Alert.alert(
        'Verification failed',
        error instanceof Error ? error.message : 'Unable to submit guarantor verification.',
      );
    } finally {
      setSubmittingIdentity(false);
    }
  };

  if (loading) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <ActivityIndicator color={tokens.colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading guarantor onboarding…</Text>
      </Screen>
    );
  }

  if (!context) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Guarantor onboarding</Text>
          <Text style={styles.title}>Continue your verification</Text>
          <Text style={styles.copy}>
            Enter your invitation code or use the secure token from your onboarding link.
          </Text>
        </View>
        <Card style={styles.card}>
          <Input
            autoCapitalize="characters"
            autoCorrect={false}
            label="Invitation code"
            onChangeText={setOtpCode}
            placeholder="Enter your code"
            value={otpCode}
          />
          <Button
            label="Continue with code"
            loading={submittingAccess}
            onPress={bootstrapFromOtp}
          />
        </Card>
        <Card style={styles.card}>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            label="Verification token"
            onChangeText={setDirectToken}
            placeholder="Paste token"
            value={directToken}
          />
          <Button
            label="Use verification token"
            loading={submittingAccess}
            onPress={bootstrapFromToken}
            variant="secondary"
          />
        </Card>
      </Screen>
    );
  }

  const hasAccount =
    context.hasSelfServiceAccess || session?.selfServiceSubjectType === 'guarantor';
  const verificationComplete = Boolean(context.guarantorPersonId) || Boolean(identityResult);

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
    >
      <Card style={styles.card}>
        <Text style={styles.kicker}>Guarantor onboarding</Text>
        <Text style={styles.title}>{context.guarantorName}</Text>
        <Text style={styles.copy}>
          You are onboarding as guarantor for {context.driverName}. Complete account setup, confirm
          your details, and finish live identity verification.
        </Text>
        <View style={styles.helperCard}>
          <Text style={styles.helperTitle}>Your steps</Text>
          <Text style={styles.copy}>
            Create or confirm your account, save your profile details, then complete live identity
            verification for this invite.
          </Text>
        </View>
      </Card>

      {!hasAccount ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Create your account</Text>
          <Input keyboardType="email-address" label="Email" onChangeText={setEmail} value={email} />
          <Input label="Password" onChangeText={setPassword} secureTextEntry value={password} />
          <Input
            label="Confirm password"
            onChangeText={setConfirmPassword}
            secureTextEntry
            value={confirmPassword}
          />
          <Button
            label="Create guarantor account"
            loading={submittingAccess}
            onPress={submitAccount}
          />
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Profile details</Text>
        <Input label="Full name" onChangeText={setName} value={name} />
        <Input keyboardType="phone-pad" label="Phone" onChangeText={setPhone} value={phone} />
        <Input keyboardType="email-address" label="Email" onChangeText={setEmail} value={email} />
        <Input label="Country code" onChangeText={setCountryCode} value={countryCode} />
        <Input label="Relationship" onChangeText={setRelationship} value={relationship} />
        <Button label="Save details" onPress={saveProfile} variant="secondary" />
      </Card>

      {!verificationComplete ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Live verification</Text>
          <Text style={styles.copy}>
            Enter the guarantor country and identity number, then capture a live selfie to complete
            guarantor verification.
          </Text>
          <Input label="Identifier type" onChangeText={setIdentifierType} value={identifierType} />
          <Input
            label="Identifier value"
            onChangeText={setIdentifierValue}
            placeholder="Optional"
            value={identifierValue}
          />
          {selfiePreviewUri ? (
            <Image source={{ uri: selfiePreviewUri }} style={styles.preview} />
          ) : null}
          <Button
            label="Capture live selfie"
            onPress={() => void captureSelfie()}
            variant="secondary"
          />
          <Button
            label={
              nativeLivenessPassed === true
                ? 'Redo secure liveness'
                : nativeLivenessSupported
                  ? 'Start secure liveness'
                  : 'Continue in browser'
            }
            onPress={() => void startNativeLiveness()}
            variant={nativeLivenessPassed === true ? 'secondary' : 'primary'}
          />
          {livenessFeedback ? <Text style={styles.feedbackText}>{livenessFeedback}</Text> : null}
          <Button
            label="Submit verification"
            loading={submittingIdentity}
            onPress={() => void submitIdentity()}
          />
        </Card>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Verification complete</Text>
          <Text style={styles.copy}>
            Your guarantor verification has been submitted. The organisation can now continue driver
            activation and review your linkage.
          </Text>
          <Button
            label="Back to sign in"
            onPress={() => navigation.navigate('Login')}
            variant="secondary"
          />
        </Card>
      )}
      <FullScreenBlockingLoader
        visible={isProcessing}
        activeStep={1}
        message={processingMessage}
        steps={
          submittingIdentity
            ? [
                'Preparing the live selfie result',
                'Checking guarantor identity records',
                'Saving the verification outcome',
              ]
            : capturingSelfie
              ? [
                  'Preparing camera access',
                  'Creating a secure selfie session',
                  'Opening the next verification step',
                ]
              : savingProfile
                ? ['Saving guarantor details', 'Syncing onboarding context', 'Refreshing the page']
                : [
                    'Checking secure access',
                    'Restoring onboarding context',
                    'Opening your next step',
                  ]
        }
        title={processingTitle}
        variant={submittingIdentity ? 'verification' : 'onboarding'}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
  },
  loadingText: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    justifyContent: 'center',
  },
  hero: {
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.lg,
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
  card: {
    gap: tokens.spacing.md,
  },
  helperCard: {
    gap: tokens.spacing.xs,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    backgroundColor: '#F8FAFC',
    padding: tokens.spacing.sm,
  },
  helperTitle: {
    color: tokens.colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  feedbackText: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  preview: {
    borderRadius: 18,
    height: 220,
    width: '100%',
  },
});

export default GuarantorSelfServiceScreen;

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
