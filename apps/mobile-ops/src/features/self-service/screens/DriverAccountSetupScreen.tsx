'use client';

import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { createDriverMobileAccount } from '../../../api';
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

  const onSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Create account', 'Enter the email address you want to use to sign in.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Create account', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Create account', 'Passwords do not match.');
      return;
    }
    if (!token) {
      Alert.alert('Session expired', 'Your verification session has expired. Please start again.');
      navigation.replace('SelfServiceOtp');
      return;
    }

    setSubmitting(true);
    try {
      await createDriverMobileAccount(token, { email: email.trim(), password });
      Alert.alert(
        'Account created',
        'Your sign-in account is ready. Return to the sign-in screen and log in with your email and password.',
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
          Choose an email and password. You will use these to sign in to the Mobiris driver app
          once your operator activates your profile.
        </Text>
      </View>

      <Card style={styles.card}>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          label="Email address"
          onChangeText={setEmail}
          placeholder="your@email.com"
          value={email}
        />
        <Input
          autoCapitalize="none"
          label="Password"
          onChangeText={setPassword}
          secureTextEntry
          helperText="At least 8 characters"
          value={password}
        />
        <Input
          autoCapitalize="none"
          label="Confirm password"
          onChangeText={setConfirmPassword}
          secureTextEntry
          value={confirmPassword}
        />
        <Button
          label="Create account"
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
});

export default DriverAccountSetupScreen;
