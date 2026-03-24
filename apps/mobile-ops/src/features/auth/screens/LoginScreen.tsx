'use client';

import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/button';
import { Badge } from '../../../components/badge';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import { useSelfService } from '../../../contexts/self-service-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatStatusLabel } from '../../../utils/formatting';
import { identityTone, readinessTone } from '../../../utils/status';

export function LoginScreen({ navigation }: ScreenProps<'Login'>) {
  const {
    loginWithPassword,
    loginWithBiometric,
    biometricAvailable,
    biometricEnabled,
    isOfflineSession,
  } = useAuth();
  const { token, driver } = useSelfService();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Sign in', 'Enter both your email or phone number and password.');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithPassword(identifier.trim(), password);
    } catch (error) {
      Alert.alert(
        'Sign in failed',
        error instanceof Error ? error.message : 'Unable to sign you in right now.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Mobiris Mobile Ops</Text>
        <Text style={styles.title}>Secure field operations access</Text>
        <Text style={styles.copy}>
          Sign in with the same tenant account you use for operational workflows.
        </Text>
      </View>

      <Card style={styles.card}>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          label="Email or phone"
          onChangeText={setIdentifier}
          placeholder="Email address or phone number"
          value={identifier}
        />
        <Input
          autoCapitalize="none"
          label="Password"
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />
        <Button label="Sign in" loading={submitting} onPress={onSubmit} />
        {biometricAvailable && biometricEnabled ? (
          <Button
            label="Use biometric sign-in"
            variant="secondary"
            onPress={async () => {
              setSubmitting(true);
              try {
                await loginWithBiometric();
              } catch (error) {
                Alert.alert(
                  'Biometric sign-in',
                  error instanceof Error
                    ? error.message
                    : 'Unable to unlock this device session right now.',
                );
              } finally {
                setSubmitting(false);
              }
            }}
          />
        ) : null}
        <Button label="Create organisation" variant="secondary" onPress={() => navigation.navigate('Signup')} />
        <Button
          label="Forgot password"
          variant="secondary"
          onPress={() => navigation.navigate('ForgotPassword')}
        />
        {token && driver ? (
          <Card style={styles.resumeCard}>
            <Text style={styles.resumeTitle}>Saved driver verification</Text>
            <Text style={styles.resumeCopy}>
              {driver.firstName} {driver.lastName}
            </Text>
            <View style={styles.badgeRow}>
              <Badge label={formatStatusLabel(driver.identityStatus)} tone={identityTone(driver.identityStatus)} />
              <Badge
                label={formatStatusLabel(driver.assignmentReadiness ?? 'not_ready')}
                tone={readinessTone(driver.assignmentReadiness ?? 'not_ready')}
              />
            </View>
            <Text style={styles.resumeMeta}>{resumeSummary(driver)}</Text>
            <Button
              label="Resume readiness checklist"
              variant="secondary"
              onPress={() => navigation.navigate('SelfServiceReadiness')}
            />
            <Button
              label="Continue verification tasks"
              variant="secondary"
              onPress={() => navigation.navigate('SelfServiceVerification')}
            />
          </Card>
        ) : (
          <Button
            label="Continue driver verification"
            variant="secondary"
            onPress={() => navigation.navigate('SelfServiceOtp')}
          />
        )}
      </Card>
      {isOfflineSession ? (
        <Text style={styles.offlineNote}>
          You are using a cached offline session. New information and queued actions will sync when
          internet access is restored.
        </Text>
      ) : null}
    </Screen>
  );
}

function resumeSummary(driver: {
  identityStatus: string;
  hasApprovedLicence: boolean;
  assignmentReadiness?: string;
  pendingDocumentCount: number;
  rejectedDocumentCount: number;
  expiredDocumentCount: number;
}) {
  if (
    driver.identityStatus === 'verified' &&
    driver.hasApprovedLicence &&
    driver.assignmentReadiness === 'ready' &&
    driver.pendingDocumentCount === 0 &&
    driver.rejectedDocumentCount === 0 &&
    driver.expiredDocumentCount === 0
  ) {
    return 'Verification work on this device is complete. You can sign in for operations.';
  }

  if (driver.identityStatus !== 'verified') {
    return 'Identity verification still needs attention on this device.';
  }

  if (!driver.hasApprovedLicence) {
    return 'A valid approved licence is still missing from the onboarding checklist.';
  }

  return 'Open the readiness checklist to finish outstanding onboarding items.';
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  hero: {
    gap: 10,
    marginTop: 24,
  },
  kicker: {
    color: tokens.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 32,
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
  resumeCard: {
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.primaryTint,
  },
  resumeTitle: {
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  resumeCopy: {
    color: tokens.colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  resumeMeta: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  offlineNote: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default LoginScreen;
