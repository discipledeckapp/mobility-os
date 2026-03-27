'use client';

import { useEffect } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { Screen } from '../../../components/screen';
import { useSelfService } from '../../../contexts/self-service-context';
import { useToast } from '../../../contexts/toast-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function SelfServiceResumeScreen({ navigation, route }: ScreenProps<'SelfServiceResume'>) {
  const { showToast } = useToast();
  const {
    token,
    driver,
    documents,
    isLoading,
    isRefreshing,
    bootstrapToken,
    refreshSelfService,
    clearSelfService,
  } = useSelfService();

  useEffect(() => {
    if (!route.params?.token) {
      return;
    }

    if (token === route.params.token && driver) {
      return;
    }

    bootstrapToken(route.params.token).catch((error) => {
      Alert.alert(
        'Invite link',
        error instanceof Error ? error.message : 'Unable to open that onboarding link.',
      );
      navigation.replace('SelfServiceOtp');
    });
  }, [bootstrapToken, driver, navigation, route.params?.token, token]);

  const onRefresh = async () => {
    try {
      await refreshSelfService();
      showToast('Onboarding updated.', 'success');
    } catch (error) {
      Alert.alert(
        'Onboarding',
        error instanceof Error ? error.message : 'Unable to refresh this onboarding session.',
      );
    }
  };

  const onClear = async () => {
    await clearSelfService();
    navigation.replace('SelfServiceOtp');
  };

  if (isLoading) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <ActivityIndicator color={tokens.colors.primary} size="large" />
        <Text style={styles.loadingText}>Opening your onboarding…</Text>
      </Screen>
    );
  }

  if (!token || !driver) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <EmptyState
          actionLabel="Enter invitation code"
          message="No saved driver invite was found on this device."
          title="Invite not found"
          onAction={() => navigation.replace('SelfServiceOtp')}
        />
      </Screen>
    );
  }

  const nextStep = getNextStep(driver, documents.length);

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      <Card style={styles.heroCard}>
        <Text style={styles.kicker}>Welcome to {driver.organisationName ?? 'your organisation'}</Text>
        <Text style={styles.title}>
          {driver.firstName ? `Hi ${driver.firstName}` : 'Your onboarding is ready'}
        </Text>
        <Text style={styles.copy}>
          We saved your progress. Finish the next step and keep moving.
        </Text>
        <View style={styles.badgeRow}>
          <Badge label={formatIdentityStatus(driver.identityStatus)} tone={identityTone(driver.identityStatus)} />
          <Badge label={formatReadinessLabel(driver.authenticationAccess ?? 'not_ready')} tone={readinessTone(driver.authenticationAccess ?? 'not_ready')} />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Current status</Text>
        <View style={styles.metricRow}>
          <Metric label="Identity" value={formatIdentityStatus(driver.identityStatus)} />
          <Metric label="Documents" value={String(documents.length)} />
          <Metric label="Sign in" value={formatReadinessLabel(driver.authenticationAccess ?? 'not_ready')} />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Next step</Text>
        <Text style={styles.nextStepTitle}>{nextStep.title}</Text>
        <Text style={styles.copy}>{nextStep.description}</Text>
        <Button label={nextStep.cta} onPress={nextStep.onPress.bind(null, navigation)} />
        <Button label="Refresh" variant="secondary" onPress={() => void onRefresh()} />
        <Button label="Use another invite" variant="secondary" onPress={() => void onClear()} />
      </Card>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function getNextStep(
  driver: NonNullable<ReturnType<typeof useSelfService>['driver']>,
  uploadedDocuments: number,
) {
  if (!driver.hasMobileAccess) {
    return {
      title: 'Create your account',
      description: 'Use your email and password so you can resume onboarding anytime.',
      cta: 'Create account',
      onPress: (navigation: ScreenProps<'SelfServiceResume'>['navigation']) =>
        navigation.navigate('DriverAccountSetup'),
    };
  }

  if (
    driver.verificationPaymentStatus === 'driver_payment_required' ||
    driver.verificationPaymentStatus === 'wallet_missing' ||
    driver.verificationPaymentStatus === 'insufficient_balance' ||
    driver.identityStatus === 'unverified'
  ) {
    return {
      title: 'Verify your identity',
      description: 'Complete payment if required, then verify with your ID number and live selfie.',
      cta: 'Continue verification',
      onPress: (navigation: ScreenProps<'SelfServiceResume'>['navigation']) =>
        navigation.navigate('SelfServiceVerification'),
    };
  }

  if (!driver.hasGuarantor) {
    return {
      title: 'Add your guarantor',
      description: 'Your organisation needs a guarantor before readiness can be completed.',
      cta: 'Add guarantor',
      onPress: (navigation: ScreenProps<'SelfServiceResume'>['navigation']) =>
        navigation.navigate('DriverGuarantor'),
    };
  }

  return {
    title: uploadedDocuments > 0 ? 'Check readiness' : 'Upload your documents',
    description:
      uploadedDocuments > 0
        ? 'Your main onboarding steps are saved. Check what the operator still needs.'
        : 'Upload the required documents and finish onboarding.',
    cta: uploadedDocuments > 0 ? 'Open checklist' : 'Continue onboarding',
    onPress: (navigation: ScreenProps<'SelfServiceResume'>['navigation']) =>
      navigation.navigate(uploadedDocuments > 0 ? 'SelfServiceReadiness' : 'SelfServiceVerification'),
  };
}

function formatIdentityStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function identityTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'verified') return 'success';
  if (status === 'failed') return 'danger';
  if (status === 'review_needed' || status === 'pending_verification') return 'warning';
  return 'neutral';
}

function formatReadinessLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function readinessTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'ready') return 'success';
  if (status === 'blocked') return 'danger';
  return 'warning';
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
  },
  loadingText: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    textAlign: 'center',
  },
  heroCard: {
    gap: tokens.spacing.sm,
    backgroundColor: '#F8FBFF',
    borderColor: '#BFDBFE',
  },
  section: {
    gap: tokens.spacing.sm,
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
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: '#F8FAFC',
    padding: tokens.spacing.sm,
    gap: 4,
  },
  metricLabel: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: tokens.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  nextStepTitle: {
    color: tokens.colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
});

export default SelfServiceResumeScreen;
