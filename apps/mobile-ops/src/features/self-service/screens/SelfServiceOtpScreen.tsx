'use client';

import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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
      Alert.alert('Invitation code', 'Enter the invitation code from your organisation.');
      return;
    }

    setSubmittingOtp(true);
    try {
      await exchangeOtpCode(otpCode);
      navigation.replace('SelfServiceResume', {});
    } catch (error) {
      Alert.alert(
        'Access failed',
        error instanceof Error ? error.message : 'Unable to use that invitation code right now.',
      );
    } finally {
      setSubmittingOtp(false);
    }
  };

  const onSubmitToken = async () => {
    if (!directToken.trim()) {
      Alert.alert('Invite link', 'Paste the invitation token to continue.');
      return;
    }

    setSubmittingToken(true);
    try {
      await bootstrapToken(directToken);
      navigation.replace('SelfServiceResume', {});
    } catch (error) {
      Alert.alert(
        'Access failed',
        error instanceof Error ? error.message : 'Unable to open that invite link right now.',
      );
    } finally {
      setSubmittingToken(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Driver invite</Text>
        <Text style={styles.title}>Start with your invitation</Text>
        <Text style={styles.copy}>
          Most drivers join Mobiris through an organisation invite. Enter the code from your message
          or open the link directly.
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Invitation code</Text>
        <Input
          autoCapitalize="characters"
          autoCorrect={false}
          label="Code"
          onChangeText={setOtpCode}
          placeholder="Enter your code"
          value={otpCode}
        />
        <Button label="Continue" loading={submittingOtp} onPress={onSubmitOtp} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Already opened a link?</Text>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          label="Invite token"
          onChangeText={setDirectToken}
          placeholder="Paste token"
          value={directToken}
        />
        <Button
          label="Open invite"
          loading={submittingToken}
          variant="secondary"
          onPress={onSubmitToken}
        />
      </Card>

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.backText}>Back to entry</Text>
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
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  backText: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SelfServiceOtpScreen;
