import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { EmptyState } from '../components/empty-state';
import { LoadingSkeleton } from '../components/loading-skeleton';
import { Screen } from '../components/screen';
import { useAuth } from '../contexts/auth-context';
import { useDriverProfile } from '../hooks/use-driver-profile';
import { tokens } from '../theme/tokens';

export function ProfileScreen() {
  const { session, refreshSession } = useAuth();
  const { driver, loading, refreshing, refreshDriver } = useDriverProfile(
    Boolean(session?.linkedDriverId),
  );

  const onRefresh = async () => {
    try {
      await refreshSession();
      await refreshDriver();
    } catch (error) {
      Alert.alert(
        'Verification status',
        error instanceof Error ? error.message : 'Unable to refresh verification status.',
      );
    }
  };

  if (loading) {
    return (
      <Screen>
        <Card style={styles.section}>
          <LoadingSkeleton height={28} width="48%" />
          <LoadingSkeleton height={22} width="80%" />
          <LoadingSkeleton height={20} width="66%" />
        </Card>
        <Card style={styles.section}>
          <LoadingSkeleton height={18} width="50%" />
          <LoadingSkeleton height={18} width="65%" />
          <LoadingSkeleton height={18} width="58%" />
        </Card>
      </Screen>
    );
  }

  if (!session?.linkedDriverId || !driver) {
    return (
      <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <EmptyState
          actionLabel="Refresh status"
          message="This signed-in account does not yet have a driver record linked to it. Contact your fleet manager to complete the link."
          title="No linked driver profile"
          onAction={() => void onRefresh()}
        />
      </Screen>
    );
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Card style={styles.section}>
        <Text style={styles.title}>
          {driver.firstName} {driver.lastName}
        </Text>
        <View style={styles.badgeRow}>
          <Badge
            label={formatIdentityStatus(driver.identityStatus)}
            tone={identityTone(driver.identityStatus)}
          />
          {driver.riskBand ? (
            <Badge label={`Risk: ${driver.riskBand}`} tone={riskTone(driver.riskBand)} />
          ) : null}
          {driver.isWatchlisted ? <Badge label="Watchlist" tone="danger" /> : null}
        </View>
        <Text style={styles.meta}>Phone: {driver.phone}</Text>
        {driver.email ? <Text style={styles.meta}>Email: {driver.email}</Text> : null}
        <Text style={styles.meta}>
          Mobile access: {session.mobileAccessRevoked ? 'Revoked' : 'Active'}
        </Text>
        <Text style={styles.meta}>
          Last verification:{' '}
          {driver.identityLastVerifiedAt
            ? formatDateTime(driver.identityLastVerifiedAt, session?.formattingLocale)
            : 'Not yet verified'}
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Eligibility</Text>
        <Text style={styles.meta}>
          Approved licence: {driver.hasApprovedLicence ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.meta}>Pending documents: {driver.pendingDocumentCount}</Text>
        <Text style={styles.meta}>Rejected documents: {driver.rejectedDocumentCount}</Text>
        <Text style={styles.meta}>Expired documents: {driver.expiredDocumentCount}</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Next step</Text>
        <Text style={styles.muted}>{guidanceForDriver(driver)}</Text>
        {!driver.hasApprovedLicence ? (
          <Button
            accessibilityHint="Show guidance for the missing licence requirement"
            label="Upload licence now"
            onPress={() =>
              Alert.alert(
                'Next step',
                'Open the self-service verification link sent by your organisation and upload your current licence there.',
              )
            }
          />
        ) : null}
        {driver.identityStatus === 'review_needed' ? (
          <Button
            accessibilityHint="Show how to contact the fleet manager about a review case"
            label="Contact fleet manager"
            variant="secondary"
            onPress={() =>
              Alert.alert(
                'Review in progress',
                'Your verification is under review. Contact your fleet manager for the next update.',
              )
            }
          />
        ) : null}
        <Button
          accessibilityHint="Refresh your verification status and eligibility"
          label="Refresh status"
          variant="secondary"
          onPress={() => void onRefresh()}
        />
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

function riskTone(riskBand: string): 'neutral' | 'success' | 'warning' | 'danger' {
  const normalized = riskBand.toLowerCase();
  if (normalized === 'low') {
    return 'success';
  }
  if (normalized === 'medium') {
    return 'warning';
  }
  if (normalized === 'high' || normalized === 'critical') {
    return 'danger';
  }
  return 'neutral';
}

function formatDateTime(value: string, locale?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale ?? undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function guidanceForDriver(driver: NonNullable<ReturnType<typeof useDriverProfile>['driver']>) {
  if (driver.identityStatus === 'verified' && driver.hasApprovedLicence) {
    return 'Verification is complete and licence requirements are satisfied.';
  }
  if (driver.identityStatus === 'review_needed') {
    return `Verification is under review${
      driver.identityReviewCaseId ? ` under case ${driver.identityReviewCaseId}.` : '.'
    } Wait for operations support to confirm the decision.`;
  }
  if (!driver.hasApprovedLicence) {
    return 'An approved licence must be on file before new assignments can proceed. Upload the licence through the self-service flow or contact your fleet manager.';
  }
  return 'Complete the verification flow sent by your organisation, or contact support if guidance is missing.';
}

const styles = StyleSheet.create({
  section: {
    gap: tokens.spacing.sm,
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  muted: {
    color: tokens.colors.inkSoft,
    lineHeight: 20,
  },
  meta: {
    color: tokens.colors.ink,
    lineHeight: 20,
  },
});
