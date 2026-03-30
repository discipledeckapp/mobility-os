'use client';

import { useEffect } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useAuth } from '../../../contexts/auth-context';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { Screen } from '../../../components/screen';
import { useSelfService } from '../../../contexts/self-service-context';
import { useToast } from '../../../contexts/toast-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { isDriverMobileSession } from '../../../utils/roles';
import { buildDriverOnboardingSteps, resolveNextDriverAction } from '../verification-flow';

export function SelfServiceResumeScreen({ navigation, route }: ScreenProps<'SelfServiceResume'>) {
  const { showToast } = useToast();
  const { session } = useAuth();
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

  const driverWorkspaceReady =
    !!driver &&
    isDriverMobileSession(session) &&
    driver.authenticationAccess === 'ready' &&
    driver.activationReadiness === 'ready';

  useEffect(() => {
    if (driverWorkspaceReady) {
      navigation.replace('Home');
    }
  }, [driverWorkspaceReady, navigation]);

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

  const nextStep = resolveNextDriverAction(driver, documents.length);
  const onboardingSteps = buildDriverOnboardingSteps(driver);
  const pendingSteps = onboardingSteps.filter(
    (step) => step.required && step.status === 'pending' && step.key !== 'account',
  );

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      <Card style={styles.heroCard}>
        <Text style={styles.kicker}>Mobiris Fleet OS</Text>
        <Text style={styles.title}>
          {driver.firstName ? `Hi ${driver.firstName}` : 'Your onboarding is ready'}
        </Text>
        <Text style={styles.copy}>
          {driver.organisationName ?? 'Your organisation'} invited you to continue onboarding.
          We will keep this simple and take you to the next thing that matters.
        </Text>
        <View style={styles.badgeRow}>
          <Badge label={formatIdentityStatus(driver.identityStatus)} tone={identityTone(driver.identityStatus)} />
          <Badge label={formatReadinessLabel(driver.authenticationAccess ?? 'not_ready')} tone={readinessTone(driver.authenticationAccess ?? 'not_ready')} />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>What happens next</Text>
        <Text style={styles.nextStepTitle}>{nextStep.title}</Text>
        <Text style={styles.copy}>{nextStep.description}</Text>
        <Button label={nextStep.cta} onPress={() => navigation.navigate(nextStep.target)} />
        <Button label="Refresh" variant="secondary" onPress={() => void onRefresh()} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Quick status</Text>
        <View style={styles.metricRow}>
          <Metric label="Account" value={driver.hasMobileAccess ? 'Ready' : 'Pending'} />
          <Metric label="Identity" value={formatIdentityStatus(driver.identityStatus)} />
          <Metric label="Documents" value={String(documents.length)} />
          <Metric
            label="Remaining"
            value={pendingSteps.length > 0 ? String(pendingSteps.length) : 'Done'}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Your steps</Text>
        {onboardingSteps.filter((step) => step.required).map((step) => (
          <View key={step.key} style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                step.status === 'completed'
                  ? styles.stepDotComplete
                  : step.status === 'not_required'
                    ? styles.stepDotOptional
                    : styles.stepDotPending,
              ]}
            />
            <View style={styles.stepCopy}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>{step.label}</Text>
                <Badge
                  label={
                    step.status === 'completed'
                      ? 'Done'
                      : step.status === 'not_required'
                        ? 'Not required'
                        : 'Pending'
                  }
                  tone={
                    step.status === 'completed'
                      ? 'success'
                      : step.status === 'not_required'
                        ? 'neutral'
                        : 'warning'
                  }
                />
              </View>
              <Text style={styles.stepMessage}>{step.message}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Button label="Use another invite" variant="secondary" onPress={() => void onClear()} />
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
  stepRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    alignItems: 'flex-start',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  stepDotComplete: {
    backgroundColor: tokens.colors.success,
  },
  stepDotOptional: {
    backgroundColor: '#CBD5E1',
  },
  stepDotPending: {
    backgroundColor: '#F59E0B',
  },
  stepCopy: {
    flex: 1,
    gap: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  stepTitle: {
    color: tokens.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  stepMessage: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  nextStepTitle: {
    color: tokens.colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
});

export default SelfServiceResumeScreen;
