'use client';

import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { verifySignupOtp } from '../../../api';
import { useAuth } from '../../../contexts/auth-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function SignupOtpScreen({ navigation, route }: ScreenProps<'SignupOtp'>) {
  const { loginWithPassword } = useAuth();
  const { orgName, adminEmail, adminPassword } = route.params;
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (code.trim().length !== 6) {
      Alert.alert('Verify signup', 'Enter the 6-digit code sent to the administrator email.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifySignupOtp({ email: adminEmail, code: code.trim() });
      if (!result.verified) {
        throw new Error('The verification code is invalid or expired.');
      }
      await loginWithPassword(adminEmail, adminPassword);
    } catch (error) {
      Alert.alert(
        'Verification failed',
        error instanceof Error ? error.message : 'Unable to verify this organisation signup.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Verify organisation</Text>
        <Text style={styles.title}>{orgName}</Text>
        <Text style={styles.copy}>
          Enter the 6-digit code sent to {adminEmail}. After verification, the app signs the
          administrator in automatically.
        </Text>
      </View>

      <Card style={styles.card}>
        <Input
          keyboardType="number-pad"
          label="Verification code"
          maxLength={6}
          onChangeText={setCode}
          value={code}
        />
        <Button label="Verify and continue" loading={submitting} onPress={onSubmit} />
        <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </Card>
    </Screen>
  );
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

export default SignupOtpScreen;
