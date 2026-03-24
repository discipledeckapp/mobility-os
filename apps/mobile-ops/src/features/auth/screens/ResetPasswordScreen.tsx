'use client';

import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { resetPassword } from '../../../api';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function ResetPasswordScreen({ navigation, route }: ScreenProps<'ResetPassword'>) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!token.trim() || !password) {
      Alert.alert('Reset password', 'Enter the reset token and your new password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await resetPassword({
        token: token.trim(),
        newPassword: password,
      });
      Alert.alert('Reset password', result.message);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert(
        'Reset password',
        error instanceof Error ? error.message : 'Unable to reset the password right now.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Complete reset</Text>
        <Text style={styles.title}>Set a new password</Text>
        <Text style={styles.copy}>
          Paste the reset token from the email{route.params?.email ? ` for ${route.params.email}` : ''},
          then choose a new password.
        </Text>
      </View>

      <Card style={styles.card}>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          label="Reset token"
          onChangeText={setToken}
          value={token}
        />
        <Input
          autoCapitalize="none"
          label="New password"
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />
        <Button label="Reset password" loading={submitting} onPress={onSubmit} />
        <Button
          label="Back to sign in"
          variant="secondary"
          onPress={() => navigation.navigate('Login')}
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

export default ResetPasswordScreen;
