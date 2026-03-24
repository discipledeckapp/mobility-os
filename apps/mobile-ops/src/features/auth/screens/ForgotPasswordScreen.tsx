'use client';

import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { requestPasswordReset } from '../../../api';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function ForgotPasswordScreen({ navigation }: ScreenProps<'ForgotPassword'>) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Reset password', 'Enter the account email first.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestPasswordReset({ email: email.trim().toLowerCase() });
      Alert.alert('Reset password', result.message);
      navigation.navigate('ResetPassword', { email: email.trim().toLowerCase() });
    } catch (error) {
      Alert.alert(
        'Reset password',
        error instanceof Error ? error.message : 'Unable to request a password reset right now.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Recover access</Text>
        <Text style={styles.title}>Request a password reset</Text>
        <Text style={styles.copy}>
          Enter the operator account email. The backend will send the reset token through the
          existing password recovery flow.
        </Text>
      </View>

      <Card style={styles.card}>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          label="Account email"
          onChangeText={setEmail}
          value={email}
        />
        <Button label="Send reset instructions" loading={submitting} onPress={onSubmit} />
        <Button
          label="I already have a token"
          variant="secondary"
          onPress={() => navigation.navigate('ResetPassword', { email })}
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
});

export default ForgotPasswordScreen;
