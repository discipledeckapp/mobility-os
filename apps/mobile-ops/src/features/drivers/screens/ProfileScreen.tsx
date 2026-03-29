'use client';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../../components/badge';
import { BottomNav } from '../../../components/bottom-nav';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import { useSelfService } from '../../../contexts/self-service-context';
import { useToast } from '../../../contexts/toast-context';
import { useAssignments } from '../../../hooks/use-assignments';
import { useDriverProfile } from '../../../hooks/use-driver-profile';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function ProfileScreen({ navigation }: ScreenProps<'Profile'>) {
  const { session, refreshSession } = useAuth();
  const { token: selfServiceToken } = useSelfService();
  const { showToast } = useToast();
  const { driver, loading, refreshing, refreshDriver } = useDriverProfile(
    Boolean(session?.linkedDriverId),
  );
  const { assignments, refreshAssignments } = useAssignments(Boolean(session?.linkedDriverId));
  const licenceRequired = session?.requiredDriverDocumentSlugs?.includes('drivers-license') ?? true;
  const currentAssignment = useMemo(() => pickCurrentAssignment(assignments), [assignments]);

  const onRefresh = async () => {
    try {
      await refreshSession();
      await Promise.all([refreshDriver(), refreshAssignments()]);
      showToast('Verification status refreshed.', 'success');
    } catch (error) {
      Alert.alert(
        'Verification status',
        error instanceof Error ? error.message : 'Unable to refresh verification status.',
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      void Promise.all([refreshDriver(), refreshAssignments()]).catch(() => {
        // Pull-to-refresh surfaces visible errors when needed.
      });
    }, [refreshAssignments, refreshDriver]),
  );

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
      <Screen
        footer={<BottomNav currentTab="Profile" navigation={navigation} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
    <Screen
      footer={<BottomNav currentTab="Profile" navigation={navigation} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Verification status</Text>
        <View style={styles.statusPanel}>
          <Badge
            label={formatIdentityStatus(driver.identityStatus)}
            tone={identityTone(driver.identityStatus)}
          />
          <Text style={styles.statusTitle}>{getVerificationHeadline(driver.identityStatus)}</Text>
          <Text style={styles.muted}>{guidanceForDriver(driver, licenceRequired)}</Text>
          {driver.identityReviewCaseId ? (
            <Text style={styles.meta}>Review case: {driver.identityReviewCaseId}</Text>
          ) : null}
          <Text style={styles.meta}>
            Last verification:{' '}
            {driver.identityLastVerifiedAt
              ? formatDateTime(driver.identityLastVerifiedAt, session?.formattingLocale)
              : 'Not yet verified'}
          </Text>
        </View>
      </Card>

      {driver.identityStatus !== 'verified' ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Risk warning</Text>
          <Text style={styles.muted}>
            This driver has not completed identity verification. Risk is higher. Complete verification to reduce risk.
          </Text>
          <Text style={styles.muted}>
            Assignment acceptance is still required before remittance can start.
          </Text>
        </Card>
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.title}>
          {getDriverDisplayName(driver.firstName, driver.lastName, driver.identityStatus)}
        </Text>
        <View style={styles.badgeRow}>
          <Badge
            label={formatIdentityStatus(driver.identityStatus)}
            tone={identityTone(driver.identityStatus)}
          />
          {driver.identityStatus !== 'verified' ? (
            <Badge
              label={driver.status === 'active' ? 'Active (Unverified)' : 'Unverified Driver'}
              tone="warning"
            />
          ) : null}
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
      </Card>

      {currentAssignment ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Current assignment</Text>
          <View style={styles.statusPanel}>
            <Badge
              label={formatIdentityStatus(currentAssignment.status)}
              tone={assignmentTone(currentAssignment.status)}
            />
            <Text style={styles.statusTitle}>
              {currentAssignment.vehicle
                ? `${currentAssignment.vehicle.make} ${currentAssignment.vehicle.model}`
                : 'Assigned vehicle'}
            </Text>
            <Text style={styles.meta}>
              Plate: {currentAssignment.vehicle?.plate ?? 'Not recorded'}
            </Text>
            <Text style={styles.muted}>{assignmentGuidance(currentAssignment.status)}</Text>
            <Button
              accessibilityHint="Open the assignment details and operational actions"
              label={
                currentAssignment.status === 'active'
                  ? 'Open assignment workspace'
                  : 'Review assignment'
              }
              onPress={() =>
                navigation.navigate('AssignmentDetail', {
                  assignmentId: currentAssignment.id,
                })
              }
            />
          </View>
        </Card>
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Eligibility</Text>
        <Text style={styles.meta}>
          Approved licence: {licenceRequired ? (driver.hasApprovedLicence ? 'Yes' : 'No') : 'Not required'}
        </Text>
        <Text style={styles.meta}>Pending documents: {driver.pendingDocumentCount}</Text>
        <Text style={styles.meta}>Rejected documents: {driver.rejectedDocumentCount}</Text>
        <Text style={styles.meta}>Expired documents: {driver.expiredDocumentCount}</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Next step</Text>
        <Text style={styles.muted}>{guidanceForDriver(driver, licenceRequired)}</Text>
        {licenceRequired && !driver.hasApprovedLicence ? (
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
        {selfServiceToken ? (
          <Button
            accessibilityHint="Open the saved onboarding checklist for this device"
            label="Open readiness checklist"
            variant="secondary"
            onPress={() => navigation.navigate('SelfServiceReadiness')}
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

function getDriverDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  identityStatus?: string | null,
) {
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  if (fullName) {
    return fullName;
  }
  return identityStatus === 'unverified' ? 'Onboarding in progress' : 'New Driver';
}

function guidanceForDriver(
  driver: NonNullable<ReturnType<typeof useDriverProfile>['driver']>,
  licenceRequired: boolean,
) {
  if (driver.identityStatus === 'verified' && (!licenceRequired || driver.hasApprovedLicence)) {
    return 'Verification is complete and licence requirements are satisfied.';
  }
  if (driver.identityStatus === 'review_needed') {
    return `Verification is under review${
      driver.identityReviewCaseId ? ` under case ${driver.identityReviewCaseId}.` : '.'
    } Wait for operations support to confirm the decision.`;
  }
  if (licenceRequired && !driver.hasApprovedLicence) {
    return 'An approved licence must be on file before new assignments can proceed. Upload the licence through the self-service flow or contact your fleet manager.';
  }
  return 'Complete the verification flow sent by your organisation, or contact support if guidance is missing.';
}

function getVerificationHeadline(identityStatus: string) {
  if (identityStatus === 'verified') {
    return 'Verification complete';
  }
  if (identityStatus === 'review_needed') {
    return 'Verification under review';
  }
  if (identityStatus === 'failed') {
    return 'Verification failed';
  }
  if (identityStatus === 'pending_verification') {
    return 'Verification in progress';
  }
  return 'Verification not started';
}

function pickCurrentAssignment(
  assignments: Array<{
    id: string;
    status: string;
    createdAt: string;
    startedAt?: string | null;
    driverConfirmedAt?: string | null;
    vehicle?: {
      make: string;
      model: string;
      plate?: string | null;
    };
  }>,
) {
  return (
    assignments
      .filter((assignment) =>
        ['active', 'pending_driver_confirmation', 'created'].includes(assignment.status),
      )
      .sort(
        (left, right) =>
          new Date(right.driverConfirmedAt ?? right.startedAt ?? right.createdAt).getTime() -
          new Date(left.driverConfirmedAt ?? left.startedAt ?? left.createdAt).getTime(),
      )[0] ?? null
  );
}

function assignmentTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'active') {
    return 'success';
  }
  if (status === 'pending_driver_confirmation' || status === 'created') {
    return 'warning';
  }
  if (status === 'cancelled' || status === 'declined') {
    return 'danger';
  }
  return 'neutral';
}

function assignmentGuidance(status: string) {
  if (status === 'active') {
    return 'Your vehicle is assigned and remittance or return actions are now available from the assignment workspace.';
  }
  if (status === 'pending_driver_confirmation' || status === 'created') {
    return 'A vehicle has been assigned to you. Open the assignment to review the details and accept the terms if required.';
  }
  return 'This assignment is no longer active.';
}

const styles = StyleSheet.create({
  section: {
    gap: tokens.spacing.sm,
  },
  statusPanel: {
    gap: tokens.spacing.xs,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    backgroundColor: tokens.colors.card,
    padding: tokens.spacing.md,
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  statusTitle: {
    color: tokens.colors.ink,
    fontSize: 20,
    fontWeight: '700',
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

export default ProfileScreen;
