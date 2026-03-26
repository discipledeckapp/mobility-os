'use client';

import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Guarantor', 'Enter the guarantor\'s full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Guarantor', 'Enter the guarantor\'s phone number.');
      return;
    }
    if (!token) {
      Alert.alert('Session expired', 'Your verification session has expired. Please start again.');
      navigation.replace('SelfServiceOtp');
      return;
    }

    setSubmitting(true);
    try {
      await submitDriverSelfServiceGuarantor(token, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        relationship: relationship.trim() || undefined,
      });
      await refreshSelfService();
      Alert.alert(
        'Guarantor submitted',
        'Your guarantor details have been submitted. Your organisation will review and verify them.',
        [{ text: 'Back to checklist', onPress: () => navigation.goBack() }],
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
        <Text style={styles.kicker}>Guarantor details</Text>
        <Text style={styles.title}>Add your guarantor</Text>
        <Text style={styles.copy}>
          A guarantor vouches for your character and reliability. Provide contact details for
          someone who can be reached by your fleet operator.
        </Text>
      </View>

      <Card style={styles.card}>
        <Input
          label="Full name"
          onChangeText={setName}
          placeholder="Guarantor's full name"
          value={name}
        />
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="phone-pad"
          label="Phone number"
          onChangeText={setPhone}
          placeholder="08012345678"
          value={phone}
        />
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          label="Email address (optional)"
          onChangeText={setEmail}
          placeholder="guarantor@email.com"
          value={email}
        />
        <Input
          label="Relationship (optional)"
          onChangeText={setRelationship}
          placeholder="e.g. Sibling, Friend, Employer"
          value={relationship}
        />
        <Button
          disabled={!name.trim() || !phone.trim()}
          label="Submit guarantor"
          loading={submitting}
          onPress={onSubmit}
        />
        <Button
          label="Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </Card>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Your guarantor will receive a verification link if your organisation requires it. Their
          details are kept confidential.
        </Text>
      </View>
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
  note: {
    paddingHorizontal: tokens.spacing.xs,
  },
  noteText: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default DriverGuarantorScreen;
