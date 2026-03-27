'use client';

import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { submitDriverSelfServiceGuarantor } from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { useSelfService } from '../../../contexts/self-service-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function DriverGuarantorScreen({ navigation }: ScreenProps<'DriverGuarantor'>) {
  const { token, driver, refreshSelfService } = useSelfService();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Guarantor', 'Enter your guarantor’s email address.');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      Alert.alert(
        'Guarantor',
        'Add the guarantor’s full name and phone number so the invite can be verified correctly.',
      );
      setShowExtraFields(true);
      return;
    }

    if (!token) {
      Alert.alert('Session expired', 'Your onboarding session has expired. Please start again.');
      navigation.replace('SelfServiceOtp');
      return;
    }

    setSubmitting(true);
    try {
      await submitDriverSelfServiceGuarantor(token, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        relationship: relationship.trim() || undefined,
      });
      await refreshSelfService();
      Alert.alert(
        'Invite sent',
        `${driver?.organisationName ?? 'Your organisation'} will contact your guarantor using this invite.`,
        [{ text: 'Continue', onPress: () => navigation.navigate('SelfServiceReadiness') }],
      );
    } catch (error) {
      Alert.alert(
        'Guarantor',
        error instanceof Error ? error.message : 'Unable to submit guarantor details right now.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Guarantor</Text>
        <Text style={styles.title}>Add your guarantor</Text>
        <Text style={styles.copy}>
          Start with their email. We will use it to send the invite and continue verification.
        </Text>
      </View>

      <Card style={styles.card}>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          label="Guarantor email"
          helperText="This is the main detail we need first."
          onChangeText={setEmail}
          placeholder="guarantor@email.com"
          value={email}
        />

        {!showExtraFields ? (
          <Pressable onPress={() => setShowExtraFields(true)}>
            <Text style={styles.expandText}>Add name and phone</Text>
          </Pressable>
        ) : (
          <View style={styles.extraFields}>
            <Input
              label="Full name"
              onChangeText={setName}
              placeholder="Guarantor's full name"
              value={name}
            />
            <Input
              keyboardType="phone-pad"
              label="Phone number"
              onChangeText={setPhone}
              placeholder="08012345678"
              value={phone}
            />
            <Input
              label="Relationship (optional)"
              onChangeText={setRelationship}
              placeholder="Friend, sibling, employer"
              value={relationship}
            />
          </View>
        )}

        <Button label="Send guarantor invite" loading={submitting} onPress={onSubmit} />
      </Card>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
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
  expandText: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  extraFields: {
    gap: tokens.spacing.md,
  },
  backText: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DriverGuarantorScreen;
