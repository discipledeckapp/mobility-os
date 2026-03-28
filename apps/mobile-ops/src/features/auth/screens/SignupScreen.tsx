'use client';

import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { registerOrganisation } from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function SignupScreen({ navigation }: ScreenProps<'Signup'>) {
  const [orgName, setOrgName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<'identity' | 'security'>('identity');
  const suggestedSlug = useMemo(() => slugify(orgName), [orgName]);

  const onContinue = () => {
    if (!orgName.trim() || !adminEmail.trim()) {
      Alert.alert(
        'Create organisation',
        'Enter your organisation name and work email to continue.',
      );
      return;
    }

    setStage('security');
  };

  const onSubmit = async () => {
    if (!orgName.trim() || !adminEmail.trim() || !adminPassword) {
      Alert.alert('Create organisation', 'Choose a password to finish setting up your workspace.');
      return;
    }

    setSubmitting(true);
    try {
      await registerOrganisation({
        orgName: orgName.trim(),
        slug: suggestedSlug || 'mobiris-organisation',
        country: 'NG',
        businessModel: 'hire-purchase',
        adminName: orgName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPassword,
      });

      navigation.navigate('SignupOtp', {
        orgName: orgName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPassword,
      });
    } catch (error) {
      Alert.alert(
        'Create organisation',
        error instanceof Error ? error.message : 'Unable to start organisation setup.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Organisation setup</Text>
        <Text style={styles.title}>Create your workspace</Text>
        <Text style={styles.copy}>
          Start with the essentials. You can finish the rest after your email is verified.
        </Text>
      </View>

      <Card style={styles.card}>
        <Input
          label="Organisation name"
          onChangeText={setOrgName}
          placeholder="Your transport company"
          value={orgName}
        />
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          label="Work email"
          helperText="We will send your verification code here."
          onChangeText={setAdminEmail}
          placeholder="name@company.com"
          value={adminEmail}
        />
        <View style={styles.summaryStrip}>
          <Text style={styles.summaryLabel}>Workspace link</Text>
          <Text style={styles.summaryValue}>{suggestedSlug || 'created automatically'}</Text>
        </View>
        {stage === 'identity' ? (
          <>
            <Text style={styles.stageHint}>
              Start with email only. You will choose the account password in the next step.
            </Text>
            <Button label="Continue" onPress={onContinue} />
          </>
        ) : (
          <>
            <Input
              autoCapitalize="none"
              label="Password"
              helperText="Use 8 or more characters."
              onChangeText={setAdminPassword}
              secureTextEntry
              value={adminPassword}
            />
            <Button label="Create organisation" loading={submitting} onPress={onSubmit} />
            <Button label="Back" variant="secondary" onPress={() => setStage('identity')} />
          </>
        )}
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
  summaryStrip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: '#F8FAFC',
    padding: tokens.spacing.md,
    gap: 4,
  },
  summaryLabel: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: tokens.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  stageHint: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  backText: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SignupScreen;
