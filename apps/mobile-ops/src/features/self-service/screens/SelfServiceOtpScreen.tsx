'use client';

import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { useSelfService } from '../../../contexts/self-service-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function SelfServiceOtpScreen({ navigation }: ScreenProps<'SelfServiceOtp'>) {
  const { bootstrapToken, exchangeOtpCode } = useSelfService();
  const [otpCode, setOtpCode] = useState('');
  const [directToken, setDirectToken] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [submittingToken, setSubmittingToken] = useState(false);

  const onSubmitOtp = async () => {
    if (!otpCode.trim()) {
      Alert.alert('Driver verification', 'Enter the OTP code sent by your organisation.');
      return;
    }

    setSubmittingOtp(true);
    try {
      await exchangeOtpCode(otpCode);
      navigation.replace('SelfServiceResume', {});
    } catch (error) {
      Alert.alert(
        'Verification access failed',
        error instanceof Error ? error.message : 'Unable to exchange that OTP code right now.',
      );
    } finally {
      setSubmittingOtp(false);
    }
  };

  const onSubmitToken = async () => {
    if (!directToken.trim()) {
      Alert.alert('Driver verification', 'Paste the verification token to continue.');
      return;
    }

    setSubmittingToken(true);
    try {
      await bootstrapToken(directToken);
      navigation.replace('SelfServiceResume', {});
    } catch (error) {
      Alert.alert(
        'Verification access failed',
        error instanceof Error ? error.message : 'Unable to use that verification token right now.',
      );
    } finally {
      setSubmittingToken(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Mobiris driver onboarding</Text>
        <Text style={styles.title}>Continue your verification</Text>
        <Text style={styles.copy}>
          Enter the OTP code sent by your organisation to resume self-verification on this device.
        </Text>
      </View>

      <Card style={styles.card}>
        <Input
          autoCapitalize="characters"
          autoCorrect={false}
          label="OTP code"
          onChangeText={setOtpCode}
          placeholder="Enter the verification code"
          value={otpCode}
        />
        <Button label="Continue with OTP" loading={submittingOtp} onPress={onSubmitOtp} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Already have a direct token?</Text>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          label="Verification token"
          onChangeText={setDirectToken}
          placeholder="Paste token"
          value={directToken}
        />
        <Button
          label="Use verification token"
          loading={submittingToken}
          variant="secondary"
          onPress={onSubmitToken}
        />
      </Card>

      <Button label="Back to sign in" variant="secondary" onPress={() => navigation.navigate('Login')} />
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
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default SelfServiceOtpScreen;
