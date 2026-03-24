'use client';

import { getAllBusinessModelSlugs, getSupportedCountryCodes } from '@mobility-os/domain-config';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { registerOrganisation } from '../../../api';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

const SUPPORTED_COUNTRIES = getSupportedCountryCodes();
const BUSINESS_MODELS = getAllBusinessModelSlugs();

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
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState(SUPPORTED_COUNTRIES[0] ?? 'NG');
  const [businessModel, setBusinessModel] = useState(BUSINESS_MODELS[0] ?? 'hire-purchase');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const suggestedSlug = useMemo(() => slugify(orgName), [orgName]);

  const onSubmit = async () => {
    if (
      !orgName.trim() ||
      !adminName.trim() ||
      !adminEmail.trim() ||
      !adminPassword ||
      !(slug.trim() || suggestedSlug)
    ) {
      Alert.alert('Sign up', 'Complete the organisation and administrator fields first.');
      return;
    }

    setSubmitting(true);
    try {
      await registerOrganisation({
        orgName: orgName.trim(),
        slug: (slug.trim() || suggestedSlug).trim(),
        country,
        businessModel,
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPhone: adminPhone.trim() || undefined,
        adminPassword,
      });

      navigation.navigate('SignupOtp', {
        orgName: orgName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPassword,
      });
    } catch (error) {
      Alert.alert(
        'Sign up failed',
        error instanceof Error ? error.message : 'Unable to start organisation signup.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Operator mobile signup</Text>
        <Text style={styles.title}>Create your organisation from your phone</Text>
        <Text style={styles.copy}>
          Register the tenant, verify the OTP sent to the admin email, then land directly in the
          operator workspace.
        </Text>
      </View>

      <Card style={styles.card}>
        <Input label="Organisation name" onChangeText={setOrgName} value={orgName} />
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          helperText={`Suggested: ${suggestedSlug || 'enter organisation name first'}`}
          label="Organisation slug"
          onChangeText={setSlug}
          value={slug}
        />
        <Input
          autoCapitalize="characters"
          helperText={`Supported: ${SUPPORTED_COUNTRIES.join(', ')}`}
          label="Country"
          onChangeText={(value) => setCountry(value.toUpperCase())}
          value={country}
        />
        <Input
          autoCapitalize="none"
          helperText={`Examples: ${BUSINESS_MODELS.join(', ')}`}
          label="Business model"
          onChangeText={setBusinessModel}
          value={businessModel}
        />
        <Input label="Administrator name" onChangeText={setAdminName} value={adminName} />
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          label="Administrator email"
          onChangeText={setAdminEmail}
          value={adminEmail}
        />
        <Input
          keyboardType="phone-pad"
          label="Administrator phone"
          onChangeText={setAdminPhone}
          value={adminPhone}
        />
        <Input
          autoCapitalize="none"
          label="Password"
          onChangeText={setAdminPassword}
          secureTextEntry
          value={adminPassword}
        />
        <Button label="Register organisation" loading={submitting} onPress={onSubmit} />
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

export default SignupScreen;
