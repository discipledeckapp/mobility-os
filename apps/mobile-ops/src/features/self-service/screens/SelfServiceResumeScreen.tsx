'use client';

import { useEffect } from 'react';
import {
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
        'Verification link',
        error instanceof Error ? error.message : 'Unable to open that verification link.',
      );
      navigation.replace('SelfServiceOtp');
    });
  }, [bootstrapToken, driver, navigation, route.params?.token, token]);

  const onRefresh = async () => {
    try {
      await refreshSelfService();
      showToast('Verification context refreshed.', 'success');
    } catch (error) {
      Alert.alert(
        'Verification status',
        error instanceof Error ? error.message : 'Unable to refresh verification status.',
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
        <Text style={styles.loadingText}>Loading verification context…</Text>
      </Screen>
    );
  }

  if (!token || !driver) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <EmptyState
          actionLabel="Enter verification code"
          message="No active driver verification session is stored on this device."
          title="Verification session not found"
          onAction={() => navigation.replace('SelfServiceOtp')}
        />
      </Screen>
    );
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      <Card style={styles.section}>
        <Text style={styles.kicker}>Mobiris driver onboarding</Text>
        <Text style={styles.title}>{`${driver.firstName} ${driver.lastName}`}</Text>
        <Text style={styles.copy}>
          This device is now linked to your self-service verification session. The next mobile phases will complete identity capture and document submission here.
        </Text>
        <View style={styles.badgeRow}>
          <Badge label={formatIdentityStatus(driver.identityStatus)} tone={identityTone(driver.identityStatus)} />
          <Badge
            label={formatReadinessLabel(driver.activationReadiness ?? 'not_ready')}
            tone={readinessTone(driver.activationReadiness ?? 'not_ready')}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Current status</Text>
        <Text style={styles.meta}>Phone: {driver.phone}</Text>
        {driver.email ? <Text style={styles.meta}>Email: {driver.email}</Text> : null}
        <Text style={styles.meta}>Identity: {formatIdentityStatus(driver.identityStatus)}</Text>
        <Text style={styles.meta}>
          Approved licence: {driver.hasApprovedLicence ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.meta}>
          Assignment readiness: {formatReadinessLabel(driver.assignmentReadiness ?? 'not_ready')}
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Document status</Text>
        <Text style={styles.meta}>Pending documents: {driver.pendingDocumentCount}</Text>
        <Text style={styles.meta}>Rejected documents: {driver.rejectedDocumentCount}</Text>
        <Text style={styles.meta}>Expired documents: {driver.expiredDocumentCount}</Text>
        <Text style={styles.meta}>Uploaded records visible: {documents.length}</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Readiness blockers</Text>
        {driver.activationReadinessReasons?.length ? (
          driver.activationReadinessReasons.map((reason) => (
            <Text key={reason} style={styles.reason}>
              • {reason}
            </Text>
          ))
        ) : (
          <Text style={styles.meta}>No activation blockers are currently reported.</Text>
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Next step</Text>
        <Text style={styles.copy}>
          Open the readiness checklist to see what still blocks activation or assignment access, then continue verification tasks from there.
        </Text>
        <Button label="Open readiness checklist" onPress={() => navigation.navigate('SelfServiceReadiness')} />
        <Button label="Continue verification" variant="secondary" onPress={() => navigation.navigate('SelfServiceVerification')} />
        <Button label="Refresh status" onPress={() => void onRefresh()} />
        <Button label="Use another verification code" variant="secondary" onPress={() => void onClear()} />
        <Button label="Back to sign in" variant="secondary" onPress={() => navigation.navigate('Login')} />
      </Card>
    </Screen>
  );
}

function formatIdentityStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function identityTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'verified') {
    return 'success';
  }
  if (status === 'failed') {
    return 'danger';
  }
  if (status === 'review_needed' || status === 'pending_verification') {
    return 'warning';
  }
  return 'neutral';
}

function formatReadinessLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function readinessTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'ready') {
    return 'success';
  }
  if (status === 'blocked') {
    return 'danger';
  }
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
  meta: {
    color: tokens.colors.ink,
    fontSize: 14,
  },
  reason: {
    color: tokens.colors.ink,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SelfServiceResumeScreen;
