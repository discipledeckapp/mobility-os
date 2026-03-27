'use client';

import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { createDriverMobileAccount, updateDriverSelfServiceContact } from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import { useSelfService } from '../../../contexts/self-service-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

type SetupStep = 'email' | 'password';

export function DriverAccountSetupScreen({ navigation }: ScreenProps<'DriverAccountSetup'>) {
  const { loginWithPassword } = useAuth();
  const { token, driver } = useSelfService();
  const [step, setStep] = useState<SetupStep>('email');
  const [email, setEmail] = useState(driver?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    }),
    [password],
  );
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  const onContinueFromEmail = () => {
    if (!emailValid) {
      Alert.alert('Account setup', 'Enter a valid email address to continue.');
      return;
    }
    setStep('password');
  };

  const onSubmit = async () => {
    if (!token) {
      Alert.alert('Session expired', 'Your onboarding session has expired. Please start again.');
      navigation.replace('SelfServiceOtp');
      return;
    }

    if (passwordStrength < 3 || confirmPassword !== password) {
      Alert.alert(
        'Account setup',
        'Use a stronger password and confirm it correctly before continuing.',
      );
      return;
    }

    setSubmitting(true);
    try {
      await createDriverMobileAccount(token, { email: normalizedEmail, password });
      if (normalizedEmail !== (driver?.email ?? '').toLowerCase()) {
        await updateDriverSelfServiceContact(token, { email: normalizedEmail }).catch(() => undefined);
      }
      await loginWithPassword(normalizedEmail, password);
      Alert.alert(
        'Account ready',
        'Your sign-in is ready. You can keep going without logging in again.',
        [{ text: 'Continue', onPress: () => navigation.replace('SelfServiceResume') }],
      );
    } catch (error) {
      Alert.alert(
        'Account setup',
        error instanceof Error ? error.message : 'Unable to create your account right now.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Driver account</Text>
        <Text style={styles.title}>Create your login in two quick steps</Text>
        <Text style={styles.copy}>
          Start with your email, then choose a password. Everything else stays in your onboarding flow.
        </Text>
      </View>

      <View style={styles.stepRow}>
        <View style={[styles.stepChip, styles.stepChipActive]}>
          <Text style={styles.stepChipText}>1. Email</Text>
        </View>
        <View style={[styles.stepChip, step === 'password' ? styles.stepChipActive : null]}>
          <Text style={step === 'password' ? styles.stepChipText : styles.stepChipTextMuted}>
            2. Password
          </Text>
        </View>
      </View>

      {step === 'email' ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Step 1</Text>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email address"
            helperText="This becomes your sign-in username."
            onChangeText={setEmail}
            placeholder="you@example.com"
            value={email}
          />
          <Button label="Continue" onPress={onContinueFromEmail} />
        </Card>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Step 2</Text>
          <Text style={styles.emailSummary}>{normalizedEmail}</Text>
          <Input
            autoCapitalize="none"
            label="Password"
            helperText="Use 8+ characters with a number and uppercase letter."
            onChangeText={setPassword}
            secureTextEntry
            value={password}
          />
          <View style={styles.checkList}>
            <Text style={[styles.checkItem, passwordChecks.length ? styles.checkItemMet : null]}>
              {passwordChecks.length ? '✓' : '○'} 8+ characters
            </Text>
            <Text style={[styles.checkItem, passwordChecks.upper ? styles.checkItemMet : null]}>
              {passwordChecks.upper ? '✓' : '○'} Uppercase letter
            </Text>
            <Text style={[styles.checkItem, passwordChecks.number ? styles.checkItemMet : null]}>
              {passwordChecks.number ? '✓' : '○'} Number
            </Text>
          </View>
          <Input
            autoCapitalize="none"
            label="Confirm password"
            onChangeText={setConfirmPassword}
            secureTextEntry
            value={confirmPassword}
          />
          <Button label="Create account" loading={submitting} onPress={onSubmit} />
          <Button label="Back" variant="secondary" onPress={() => setStep('email')} />
        </Card>
      )}

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to onboarding</Text>
      </Pressable>
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
    fontSize: 28,
    fontWeight: '800',
  },
  copy: {
    color: tokens.colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  stepChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepChipActive: {
    borderColor: tokens.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  stepChipText: {
    color: tokens.colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  stepChipTextMuted: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    gap: tokens.spacing.md,
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  emailSummary: {
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  checkList: {
    gap: 6,
  },
  checkItem: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
  },
  checkItemMet: {
    color: '#15803d',
    fontWeight: '600',
  },
  backText: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DriverAccountSetupScreen;
