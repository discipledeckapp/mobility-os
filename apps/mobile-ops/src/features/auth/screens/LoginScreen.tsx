'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { useAppEntry } from '../../../contexts/app-entry-context';
import { useAuth } from '../../../contexts/auth-context';
import { useSelfService } from '../../../contexts/self-service-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatStatusLabel } from '../../../utils/formatting';
import { identityTone, readinessTone } from '../../../utils/status';

type EntryAction = {
  id: 'organisation' | 'driver' | 'guarantor' | 'invite' | 'login' | 'setup';
  title: string;
  subtitle: string;
  symbol: string;
  onPress: () => void;
};

export function LoginScreen({ navigation }: ScreenProps<'Login'>) {
  const {
    loginWithPassword,
    loginWithBiometric,
    biometricAvailable,
    biometricEnabled,
    isOfflineSession,
  } = useAuth();
  const { token, driver } = useSelfService();
  const { selectedRole, setSelectedRole } = useAppEntry();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const onSubmit = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Login', 'Enter your email and password to continue.');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithPassword(identifier.trim(), password);
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Unable to sign you in right now.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel =
    selectedRole === 'operator'
      ? 'Fleet Manager / Operator'
      : selectedRole === 'guarantor'
        ? 'Guarantor'
        : 'Driver';

  const entryActions: EntryAction[] =
    selectedRole === 'operator'
      ? [
          {
            id: 'organisation',
            title: 'Create organisation',
            subtitle: 'Start your fleet workspace',
            symbol: '◧',
            onPress: () => navigation.navigate('Signup'),
          },
          {
            id: 'login',
            title: 'Sign in',
            subtitle: 'Open your existing operator account',
            symbol: '→',
            onPress: () => setShowLoginForm(true),
          },
        ]
      : selectedRole === 'guarantor'
        ? [
            {
              id: 'guarantor',
              title: 'Use invitation code',
              subtitle: 'Open guarantor verification',
              symbol: '◇',
              onPress: () => navigation.navigate('GuarantorSelfServiceOtp'),
            },
            {
              id: 'login',
              title: 'Sign in',
              subtitle: 'Continue an existing guarantor account',
              symbol: '→',
              onPress: () => setShowLoginForm(true),
            },
          ]
        : [
            {
              id: 'invite',
              title: 'Use invitation code',
              subtitle: 'Start or resume driver onboarding',
              symbol: '◎',
              onPress: () => navigation.navigate('SelfServiceOtp'),
            },
            {
              id: 'login',
              title: 'Sign in',
              subtitle: 'Continue your driver account',
              symbol: '→',
              onPress: () => setShowLoginForm(true),
            },
          ];

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Animated.View
          style={[
            styles.logoHalo,
            {
              opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.34] }),
              transform: [
                {
                  scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] }),
                },
              ],
            },
          ]}
        />
        <View style={styles.logoCore}>
          <Text style={styles.wordmark}>M</Text>
        </View>
        <Text style={styles.productName}>Mobiris Fleet OS</Text>
        <Text style={styles.title}>
          {selectedRole === 'operator'
            ? 'Run fleet operations with less friction'
            : selectedRole === 'guarantor'
              ? 'Complete guarantor verification'
              : 'Continue driver onboarding'}
        </Text>
        <Text style={styles.subtitle}>
          {selectedRole === 'operator'
            ? 'Create your organisation, add vehicles, add drivers, and keep operations moving.'
            : selectedRole === 'guarantor'
              ? 'Use your invitation, confirm your role, and complete verification in a few guided steps.'
              : 'Use your invitation, verify your details, and finish the next required step quickly.'}
        </Text>
      </View>

      <Card style={styles.entryRuleCard}>
        <Text style={styles.entryRuleTitle}>{roleLabel}</Text>
        <Text style={styles.entryRuleCopy}>
          {selectedRole === 'operator'
            ? 'The operator flow starts with organisation setup, then moves into adding a vehicle, adding a driver, and verifying the driver.'
            : selectedRole === 'guarantor'
              ? 'Guarantor access usually starts from an organisation invite. Sign in only if you already created an account before.'
              : 'Driver access usually starts from an organisation invite. Sign in only if you already created your account before.'}
        </Text>
      </Card>

      {token && driver ? (
        <Card style={styles.resumeCard}>
          <View style={styles.resumeHeader}>
            <View style={styles.resumeDot} />
            <View style={styles.resumeCopy}>
              <Text style={styles.resumeTitle}>
                {driver.organisationName ?? 'Your organisation'} is waiting for you
              </Text>
              <Text style={styles.resumeSubtitle}>Resume your saved onboarding in one tap.</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            <Badge
              label={formatStatusLabel(driver.identityStatus)}
              tone={identityTone(driver.identityStatus)}
            />
            <Badge
              label={`Sign in ${formatStatusLabel(driver.authenticationAccess ?? 'not_ready')}`}
              tone={readinessTone(driver.authenticationAccess ?? 'not_ready')}
            />
          </View>
          <Text style={styles.resumeSummary}>{resumeSummary(driver)}</Text>
          <Button
            label="Continue onboarding"
            onPress={() => navigation.navigate('SelfServiceResume')}
          />
          <Button
            label="Open verification tasks"
            variant="secondary"
            onPress={() => navigation.navigate('SelfServiceVerification')}
          />
        </Card>
      ) : null}

      {selectedRole === 'driver' ? (
        <Card style={styles.pathCard}>
          <Text style={styles.pathTitle}>Driver path</Text>
          <Text style={styles.pathCopy}>
            Your steps are driven by your organisation&apos;s verification level. Identity, guarantor,
            and licence only appear when required for your onboarding.
          </Text>
        </Card>
      ) : null}

      {selectedRole === 'operator' ? (
        <Card style={styles.pathCard}>
          <Text style={styles.pathTitle}>Operator path</Text>
          <Text style={styles.pathCopy}>
            Start with organisation setup, then add a vehicle, add a driver, and verify the driver.
          </Text>
        </Card>
      ) : null}

      <View style={styles.optionsGrid}>
        {entryActions.map((action) => (
          <Pressable key={action.id} onPress={action.onPress} style={styles.optionCard}>
            <View style={styles.optionIconWrap}>
              <Text style={styles.optionIcon}>{action.symbol}</Text>
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>{action.title}</Text>
              <Text style={styles.optionSubtitle}>{action.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {showLoginForm ? (
        <Card style={styles.loginCard}>
          <View style={styles.loginHeader}>
            <Text style={styles.loginTitle}>
              {selectedRole === 'operator'
                ? 'Sign in to Mobiris Fleet OS'
                : 'Sign in to continue'}
            </Text>
            <Pressable onPress={() => setShowLoginForm(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email"
            onChangeText={setIdentifier}
            placeholder="you@example.com"
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
              label="Use biometric login"
              variant="secondary"
              onPress={async () => {
                setSubmitting(true);
                try {
                  await loginWithBiometric();
                } catch (error) {
                  Alert.alert(
                    'Biometric login',
                    error instanceof Error ? error.message : 'Unable to unlock this saved session.',
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            />
          ) : null}
          <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </Pressable>
        </Card>
      ) : null}

      {isOfflineSession ? (
        <Text style={styles.offlineNote}>
          Offline mode is active. Your last trusted session is available until connectivity returns.
        </Text>
      ) : null}

      <Pressable
        onPress={() => {
          navigation.replace('RoleSelection');
        }}
      >
        <Text style={styles.switchRoleLink}>Change role</Text>
      </Pressable>
    </Screen>
  );
}

function resumeSummary(driver: {
  identityStatus: string;
  authenticationAccess?: string;
  hasApprovedLicence: boolean;
  assignmentReadiness?: string;
}) {
  if (driver.authenticationAccess === 'ready') {
    return 'Your account is ready. Finish the remaining onboarding steps when you are ready.';
  }
  if (driver.identityStatus !== 'verified') {
    return 'Identity verification still needs attention.';
  }
  if (!driver.hasApprovedLicence) {
    return 'Your licence is still pending review.';
  }
  if (driver.assignmentReadiness !== 'ready') {
    return 'Your sign-in is ready. Operational checks are still being completed.';
  }
  return 'You are ready to open your driver workspace.';
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    gap: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.sm,
  },
  logoHalo: {
    position: 'absolute',
    top: 12,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: tokens.colors.primary,
  },
  logoCore: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
    shadowColor: tokens.colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  productName: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: tokens.colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  resumeCard: {
    gap: tokens.spacing.sm,
    backgroundColor: '#F8FBFF',
    borderColor: '#BFDBFE',
  },
  entryRuleCard: {
    gap: tokens.spacing.sm,
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  entryRuleTitle: {
    color: tokens.colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  entryRuleCopy: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  resumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  resumeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: tokens.colors.primary,
  },
  resumeCopy: {
    flex: 1,
    gap: 2,
  },
  resumeTitle: {
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  resumeSubtitle: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  resumeSummary: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  pathCard: {
    gap: tokens.spacing.sm,
    backgroundColor: '#F8FAFC',
  },
  pathTitle: {
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  pathCopy: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  optionsGrid: {
    gap: tokens.spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 14,
    shadowColor: '#101828',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  optionIcon: {
    color: tokens.colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  optionSubtitle: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
  },
  loginCard: {
    gap: tokens.spacing.sm,
  },
  loginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loginTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  closeText: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  forgotLink: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  offlineNote: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  switchRoleLink: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginScreen;
