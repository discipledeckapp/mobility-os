'use client';

import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  createGuarantorSelfServiceAccount,
  createGuarantorSelfServiceLivenessSession,
  exchangeGuarantorSelfServiceOtp,
  getGuarantorSelfServiceContext,
  issueAuthenticatedGuarantorSelfServiceContinuationToken,
  resolveGuarantorSelfServiceIdentity,
  updateGuarantorSelfServiceProfile,
  type DriverIdentityResolutionResult,
  type DriverLivenessSessionRecord,
  type GuarantorSelfServiceContextRecord,
} from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { STORAGE_KEYS } from '../../../constants';
import { useAuth } from '../../../contexts/auth-context';
import { tokens } from '../../../theme/tokens';
import type { ScreenProps } from '../../../navigation/types';

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
  const [identityResult, setIdentityResult] = useState<DriverIdentityResolutionResult | null>(null);
  const [submittingIdentity, setSubmittingIdentity] = useState(false);

  const loadContext = async (nextToken: string) => {
    const nextContext = await getGuarantorSelfServiceContext(nextToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.guarantorSelfServiceToken, nextToken);
    setToken(nextToken);
    setContext(nextContext);
    setEmail(nextContext.guarantorEmail ?? '');
    setName(nextContext.guarantorName);
    setPhone(nextContext.guarantorPhone);
    setRelationship(nextContext.guarantorRelationship ?? '');
    setCountryCode(nextContext.guarantorCountryCode ?? '');
  };

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
  }, [route.params?.token, session?.selfServiceSubjectType]);

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
    }
  };

  const captureSelfie = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access', 'Allow camera access to complete live verification.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      base64: true,
      quality: 0.7,
      cameraType: ImagePicker.CameraType.front,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Live verification', 'Unable to capture the selfie image. Please try again.');
      return;
    }

    setSelfieBase64(asset.base64);
    setSelfiePreviewUri(asset.uri);
    if (token) {
      const sessionRecord = await createGuarantorSelfServiceLivenessSession(
        token,
        countryCode.trim() || undefined,
      );
      setLivenessSession(sessionRecord);
    }
  };

  const submitIdentity = async () => {
    if (!token || !selfieBase64 || !livenessSession) {
      Alert.alert(
        'Verification',
        'Capture a live selfie before submitting guarantor verification.',
      );
      return;
    }

    setSubmittingIdentity(true);
    try {
      const result = await resolveGuarantorSelfServiceIdentity(token, {
        ...(identifierValue.trim()
          ? {
              identifierType,
              identifierValue: identifierValue.trim(),
              ...(countryCode.trim() ? { countryCode: countryCode.trim().toUpperCase() } : {}),
            }
          : {}),
        selfieImageBase64: selfieBase64,
        livenessSessionId: livenessSession.sessionId,
        consentAccepted: true,
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
          <Button label="Continue with code" loading={submittingAccess} onPress={bootstrapFromOtp} />
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

  const hasAccount = context.hasSelfServiceAccess || session?.selfServiceSubjectType === 'guarantor';
  const verificationComplete = Boolean(context.guarantorPersonId) || Boolean(identityResult);

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}>
      <Card style={styles.card}>
        <Text style={styles.kicker}>Guarantor onboarding</Text>
        <Text style={styles.title}>{context.guarantorName}</Text>
        <Text style={styles.copy}>
          You are onboarding as guarantor for {context.driverName}. Complete account setup, confirm your details, and finish live identity verification.
        </Text>
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
          <Button label="Create guarantor account" loading={submittingAccess} onPress={submitAccount} />
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
            Enter an identifier if requested by your organisation, then capture a live selfie to complete guarantor verification.
          </Text>
          <Input
            label="Identifier type"
            onChangeText={setIdentifierType}
            value={identifierType}
          />
          <Input
            label="Identifier value"
            onChangeText={setIdentifierValue}
            placeholder="Optional"
            value={identifierValue}
          />
          {selfiePreviewUri ? <Image source={{ uri: selfiePreviewUri }} style={styles.preview} /> : null}
          <Button label="Capture live selfie" onPress={() => void captureSelfie()} variant="secondary" />
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
            Your guarantor verification has been submitted. The organisation can now continue driver activation and review your linkage.
          </Text>
          <Button
            label="Back to sign in"
            onPress={() => navigation.navigate('Login')}
            variant="secondary"
          />
        </Card>
      )}
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
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  preview: {
    borderRadius: 18,
    height: 220,
    width: '100%',
  },
});

export default GuarantorSelfServiceScreen;
