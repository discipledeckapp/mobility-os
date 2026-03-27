'use client';

import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { createDriverMobileAccount, updateDriverSelfServiceContact } from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { useSelfService } from '../../../contexts/self-service-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function DriverAccountSetupScreen({ navigation }: ScreenProps<'DriverAccountSetup'>) {
  const { token, driver } = useSelfService();
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
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
  const emailError =
    email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      ? 'Enter a valid email address.'
      : undefined;
  const passwordError =
    password.length > 0 && passwordStrength < 4
      ? 'Use all 4 password requirements below.'
      : undefined;
  const confirmPasswordError =
    confirmPassword.length > 0 && confirmPassword !== password
      ? 'Passwords do not match.'
      : undefined;
  const canSubmit =
    normalizedEmail.length > 0 &&
    !emailError &&
    passwordStrength === 4 &&
    confirmPassword === password &&
    confirmPassword.length > 0 &&
    !submitting;

  const onSubmit = async () => {
    if (!normalizedEmail) {
      Alert.alert('Create account', 'Enter the email address you want to use to sign in.');
      return;
    }
    if (emailError) {
      Alert.alert('Create account', emailError);
      return;
    }
    if (passwordStrength < 4) {
      Alert.alert('Create account', 'Your password must meet all listed requirements.');
      return;
    }
    if (confirmPassword !== password) {
      Alert.alert('Create account', 'Confirm your password to continue.');
      return;
    }
    if (!token) {
      Alert.alert('Session expired', 'Your verification session has expired. Please start again.');
      navigation.replace('SelfServiceOtp');
      return;
    }

    setSubmitting(true);
    try {
      await createDriverMobileAccount(token, { email: normalizedEmail, password });
      // If the email differs from what the operator originally recorded, sync it back
      if (normalizedEmail !== (driver?.email ?? '').toLowerCase()) {
        await updateDriverSelfServiceContact(token, { email: normalizedEmail }).catch(() => {
          // Non-fatal — account was created; email sync will be retried next context refresh
        });
      }
      Alert.alert(
        'Account created',
        'Your sign-in account is ready. You can now return to the sign-in screen and log in, even if operational approval is still pending.',
        [{ text: 'Go to sign in', onPress: () => navigation.navigate('Login') }],
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
        <Text style={styles.kicker}>Set up your account</Text>
        <Text style={styles.title}>
          {driver ? `Welcome, ${driver.firstName}` : 'Create your sign-in'}
        </Text>
        <Text style={styles.copy}>
          Choose the email and password you will use to access the driver app. Account access is
          separate from operational approval, so you can sign in before assignment eligibility is complete.
        </Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next</Text>
          <Text style={styles.infoCopy}>
            Creating this account gives you app access. Your operator can still keep activation,
            assignment, or remittance actions restricted until your readiness checks are complete.
          </Text>
        </View>
        {driver?.phone ? (
          <Input
            editable={false}
            helperText="Phone is set by your operator and cannot be changed here."
            label="Phone"
            style={styles.readOnly}
            value={driver.phone}
          />
        ) : null}
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          label="Email address"
          onChangeText={setEmail}
          placeholder="your@email.com"
          helperText="Use an email you can access. It becomes your sign-in username."
          errorText={emailError}
          value={email}
        />
        <Input
          autoCapitalize="none"
          label="Password"
          onChangeText={setPassword}
          secureTextEntry
          helperText="Your password must satisfy every requirement below."
          errorText={passwordError}
          value={password}
        />
        {password.length > 0 ? (
          <View style={styles.strengthWrap}>
            <View style={styles.strengthBar}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthSegment,
                    i < passwordStrength
                      ? passwordStrength <= 1
                        ? styles.strengthDanger
                        : passwordStrength === 2
                          ? styles.strengthWarn
                          : styles.strengthGood
                      : styles.strengthEmpty,
                  ]}
                />
              ))}
            </View>
            <View style={styles.checkList}>
              {(
                [
                  { key: 'length', label: '8+ characters' },
                  { key: 'upper', label: 'Uppercase letter' },
                  { key: 'number', label: 'Number' },
                  { key: 'special', label: 'Special character' },
                ] as const
              ).map(({ key, label }) => (
                <Text
                  key={key}
                  style={[styles.checkItem, passwordChecks[key] ? styles.checkItemMet : null]}
                >
                  {passwordChecks[key] ? '✓' : '○'} {label}
                </Text>
              ))}
            </View>
          </View>
        ) : null}
        <Input
          autoCapitalize="none"
          label="Confirm password"
          onChangeText={setConfirmPassword}
          secureTextEntry
          errorText={confirmPasswordError}
          value={confirmPassword}
        />
        <Button
          label="Create sign-in account"
          disabled={!canSubmit}
          loading={submitting}
          onPress={onSubmit}
        />
        <Button
          label="Back to readiness checklist"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </Card>
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
  card: {
    gap: tokens.spacing.md,
  },
  infoCard: {
    backgroundColor: '#F7F9FC',
    borderColor: tokens.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: tokens.spacing.xs,
    padding: tokens.spacing.md,
  },
  infoTitle: {
    color: tokens.colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  infoCopy: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
  },
  strengthWrap: {
    gap: tokens.spacing.xs,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthEmpty: {
    backgroundColor: tokens.colors.border,
  },
  strengthDanger: {
    backgroundColor: tokens.colors.error,
  },
  strengthWarn: {
    backgroundColor: '#F59E0B',
  },
  strengthGood: {
    backgroundColor: '#10B981',
  },
  checkList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  checkItem: {
    fontSize: 12,
    color: tokens.colors.inkSoft,
  },
  checkItemMet: {
    color: '#10B981',
    fontWeight: '600',
  },
  readOnly: {
    opacity: 0.65,
  },
});

export default DriverAccountSetupScreen;
