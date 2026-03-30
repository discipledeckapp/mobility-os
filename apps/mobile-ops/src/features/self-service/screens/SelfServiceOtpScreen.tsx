'use client';

import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { FullScreenBlockingLoader } from '../../../components/processing-state';
import { Screen } from '../../../components/screen';
import { useSelfService } from '../../../contexts/self-service-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function SelfServiceOtpScreen({ navigation }: ScreenProps<'SelfServiceOtp'>) {
  const { bootstrapToken, exchangeOtpCode, loginWithPassword } = useSelfService();
  const [mode, setMode] = useState<'code' | 'link' | 'signin'>('code');
  const [otpCode, setOtpCode] = useState('');
  const [directToken, setDirectToken] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [submittingToken, setSubmittingToken] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const isProcessing = submittingOtp || submittingToken || submittingPassword;
  const processingTitle = submittingOtp
    ? 'Checking your invitation code'
    : submittingToken
      ? 'Opening your invite'
      : 'Signing you in';
  const processingMessage = submittingOtp
    ? 'Verifying the code and restoring your saved onboarding progress.'
    : submittingToken
      ? 'Validating your secure invite link and restoring your onboarding progress.'
      : 'Checking your sign-in details and taking you back to your onboarding flow.';

  const onSubmitOtp = async () => {
    if (!otpCode.trim()) {
      Alert.alert('Invitation code', 'Enter the invitation code from your organisation.');
      return;
    }

    setSubmittingOtp(true);
    try {
      await exchangeOtpCode(otpCode);
      navigation.replace('SelfServiceResume', {});
    } catch (error) {
      Alert.alert(
        'Access failed',
        error instanceof Error ? error.message : 'Unable to use that invitation code right now.',
      );
    } finally {
      setSubmittingOtp(false);
    }
  };

  const onSubmitToken = async () => {
    if (!directToken.trim()) {
      Alert.alert('Invite link', 'Paste the invitation token to continue.');
      return;
    }

    setSubmittingToken(true);
    try {
      await bootstrapToken(directToken);
      navigation.replace('SelfServiceResume', {});
    } catch (error) {
      Alert.alert(
        'Access failed',
        error instanceof Error ? error.message : 'Unable to open that invite link right now.',
      );
    } finally {
      setSubmittingToken(false);
    }
  };

  const onSubmitPassword = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Sign in', 'Enter your email or phone number and password.');
      return;
    }

    setSubmittingPassword(true);
    try {
      await loginWithPassword(identifier, password);
      navigation.replace('SelfServiceResume', {});
    } catch (error) {
      Alert.alert(
        'Sign in failed',
        error instanceof Error
          ? error.message
          : 'Unable to sign in right now. Check your details and try again.',
      );
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Driver onboarding</Text>
        <Text style={styles.title}>Choose how you want to continue</Text>
        <Text style={styles.copy}>Most drivers start with an invite. Returning drivers can sign in.</Text>
      </View>

      <View style={styles.modeRow}>
        <Pressable
          onPress={() => setMode('code')}
          style={[styles.modeChip, mode === 'code' ? styles.modeChipActive : null]}
        >
          <Text style={[styles.modeChipText, mode === 'code' ? styles.modeChipTextActive : null]}>
            Code
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('link')}
          style={[styles.modeChip, mode === 'link' ? styles.modeChipActive : null]}
        >
          <Text style={[styles.modeChipText, mode === 'link' ? styles.modeChipTextActive : null]}>
            Invite link
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('signin')}
          style={[styles.modeChip, mode === 'signin' ? styles.modeChipActive : null]}
        >
          <Text
            style={[styles.modeChipText, mode === 'signin' ? styles.modeChipTextActive : null]}
          >
            Sign in
          </Text>
        </Pressable>
      </View>

      {mode === 'code' ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Use invitation code</Text>
          <Text style={styles.sectionHint}>Enter the short code shared by your organisation.</Text>
          <Input
            autoCapitalize="characters"
            autoCorrect={false}
            label="Invitation code"
            onChangeText={setOtpCode}
            placeholder="Enter your code"
            value={otpCode}
          />
          <Button label="Continue" loading={submittingOtp} onPress={onSubmitOtp} />
        </Card>
      ) : null}

      {mode === 'link' ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Open invite link</Text>
          <Text style={styles.sectionHint}>Paste the secure token from your email or message.</Text>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            label="Invite token"
            onChangeText={setDirectToken}
            placeholder="Paste token"
            value={directToken}
          />
          <Button
            label="Open invite"
            loading={submittingToken}
            variant="secondary"
            onPress={onSubmitToken}
          />
        </Card>
      ) : null}

      {mode === 'signin' ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Sign in</Text>
          <Text style={styles.sectionHint}>Use this only if you already created your account.</Text>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email or phone number"
            onChangeText={setIdentifier}
            placeholder="Enter your email or phone"
            value={identifier}
          />
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            label="Password"
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
          />
          <Button
            label="Sign in"
            loading={submittingPassword}
            variant="secondary"
            onPress={onSubmitPassword}
          />
        </Card>
      ) : null}

      <Pressable onPress={() => navigation.navigate('GuarantorSelfServiceOtp')}>
        <Text style={styles.secondaryText}>Joining as a guarantor? Open guarantor access.</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.backText}>Back to entry</Text>
      </Pressable>
      <FullScreenBlockingLoader
        visible={isProcessing}
        activeStep={1}
        message={processingMessage}
        steps={['Checking secure access', 'Restoring onboarding context', 'Opening your next step']}
        title={processingTitle}
        variant="onboarding"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 30,
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
  modeRow: {
    flexDirection: 'row',
    gap: tokens.spacing.xs,
  },
  modeChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  modeChipActive: {
    borderColor: tokens.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  modeChipText: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  modeChipTextActive: {
    color: tokens.colors.primary,
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHint: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  backText: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryText: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SelfServiceOtpScreen;
