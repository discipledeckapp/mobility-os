'use client';

import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      Alert.alert('Sign in', 'Enter your email or phone number and password.');
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
      {/* ── Welcome ───────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <Text style={styles.wordmark}>Mobiris</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Fleet operations, handled.</Text>
      </View>

      {/* ── Saved driver verification (resumed self-service) ─────── */}
      {token && driver ? (
        <Card style={styles.driverCard}>
          <View style={styles.driverCardHeader}>
            <View style={styles.driverAvatarDot} />
            <View style={styles.driverCardInfo}>
              <Text style={styles.driverName}>{driver.firstName} {driver.lastName}</Text>
              <Text style={styles.driverHint}>Self-service verification in progress</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            <Badge label={formatStatusLabel(driver.identityStatus)} tone={identityTone(driver.identityStatus)} />
            <Badge
              label={`Sign in ${formatStatusLabel(driver.authenticationAccess ?? 'not_ready')}`}
              tone={readinessTone(driver.authenticationAccess ?? 'not_ready')}
            />
          </View>
          <Text style={styles.driverSummary}>{resumeSummary(driver)}</Text>
          <Button
            label="Continue where you left off"
            onPress={() => navigation.navigate('SelfServiceReadiness')}
          />
          <Button
            label="Open verification tasks"
            variant="secondary"
            onPress={() => navigation.navigate('SelfServiceVerification')}
          />
        </Card>
      ) : null}

      {/* ── Sign in form ──────────────────────────────────────────── */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Sign in</Text>
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
                    : 'Unable to unlock this device session.',
                );
              } finally {
                setSubmitting(false);
              }
            }}
          />
        ) : null}
        <TouchableOpacity
          style={styles.forgotRow}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </TouchableOpacity>
      </Card>

      {/* ── Secondary paths ───────────────────────────────────────── */}
      <View style={styles.secondaryRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SelfServiceOtp')}
        >
          <Text style={styles.secondaryButtonText}>I'm a driver — start verification</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.secondaryButtonText}>Create an organisation</Text>
        </TouchableOpacity>
      </View>

      {isOfflineSession ? (
        <Text style={styles.offlineNote}>
          Using cached offline session — actions will sync when connectivity is restored.
        </Text>
      ) : null}
    </Screen>
  );
}

function resumeSummary(driver: {
  identityStatus: string;
  authenticationAccess?: string;
  hasApprovedLicence: boolean;
  assignmentReadiness?: string;
  pendingDocumentCount: number;
  rejectedDocumentCount: number;
  expiredDocumentCount: number;
}) {
  if (driver.authenticationAccess === 'ready') {
    return 'Your sign-in account is ready. You can log in while activation and assignment checks continue separately.';
  }
  if (driver.identityStatus !== 'verified') {
    return 'Identity verification still needs attention.';
  }
  if (!driver.hasApprovedLicence) {
    return 'A valid approved licence is still missing.';
  }
  if (driver.assignmentReadiness !== 'ready') {
    return 'Your account can still be set up before assignment readiness is complete. Open the readiness checklist for the remaining operational steps.';
  }
  return 'Open the readiness checklist to review access and operational readiness.';
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    gap: tokens.spacing.md,
  },
  hero: {
    alignItems: 'center',
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.sm,
    gap: 4,
  },
  wordmark: {
    color: tokens.colors.primary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: tokens.colors.inkSoft,
    fontSize: 16,
    fontWeight: '400',
  },
  card: {
    gap: tokens.spacing.sm,
  },
  cardTitle: {
    color: tokens.colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  forgotRow: {
    alignItems: 'flex-end',
    paddingTop: 2,
  },
  forgotLink: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  driverCard: {
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.primaryTint,
  },
  driverCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  driverAvatarDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.primary,
  },
  driverCardInfo: {
    flex: 1,
  },
  driverName: {
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  driverHint: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  driverSummary: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryRow: {
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  secondaryButton: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: tokens.colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '40%',
    backgroundColor: tokens.colors.border,
  },
  offlineNote: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default LoginScreen;
