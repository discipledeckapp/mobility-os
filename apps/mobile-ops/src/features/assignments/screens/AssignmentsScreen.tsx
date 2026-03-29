'use client';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../../components/badge';
import { BottomNav } from '../../../components/bottom-nav';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { ConfirmationModal } from '../../../components/confirmation-modal';
import { EmptyState } from '../../../components/empty-state';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import { ASSIGNMENT_STATUS } from '../../../constants';
import { useAuth } from '../../../contexts/auth-context';
import { useSelfService } from '../../../contexts/self-service-context';
import { useToast } from '../../../contexts/toast-context';
import { useAssignments } from '../../../hooks/use-assignments';
import { useDriverProfile } from '../../../hooks/use-driver-profile';
import type { ScreenProps } from '../../../navigation/types';
import type { AssignmentRecord, DriverRecord } from '../../../api';
import type { AssignmentFilter } from '../../../services/assignment-service';
import { tokens } from '../../../theme/tokens';

const FILTER_OPTIONS: Array<{ label: string; value: AssignmentFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending confirmation', value: ASSIGNMENT_STATUS.pendingDriverConfirmation },
  { label: 'Active', value: ASSIGNMENT_STATUS.active },
  { label: 'Ended', value: ASSIGNMENT_STATUS.ended },
  { label: 'Cancelled', value: ASSIGNMENT_STATUS.cancelled },
];

export function AssignmentsScreen({ navigation }: ScreenProps<'Home'>) {
  const { session, logout } = useAuth();
  const { token: selfServiceToken } = useSelfService();
  const { showToast } = useToast();
  const {
    assignments,
    groupedAssignments,
    loading,
    refreshing,
    searchQuery,
    filter,
    setSearchQuery,
    setFilter,
    refreshAssignments,
  } = useAssignments(Boolean(session?.linkedDriverId));
  const { driver } = useDriverProfile(Boolean(session?.linkedDriverId));
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const canWriteAssignments = useMemo(
    () => session?.permissions.includes('assignments:write') ?? false,
    [session?.permissions],
  );

  const onRefresh = async () => {
    try {
      await refreshAssignments();
      showToast('Assignments refreshed.', 'success');
    } catch (error) {
      Alert.alert(
        'Assignments',
        error instanceof Error ? error.message : 'Unable to refresh assignments.',
      );
    }
  };

  const renderLoadingState = () => (
    <>
      <Card style={styles.section}>
        <LoadingSkeleton height={26} width="48%" />
        <LoadingSkeleton height={18} width="90%" />
        <LoadingSkeleton height={48} />
      </Card>
      <Card style={styles.section}>
        <LoadingSkeleton height={44} />
        <LoadingSkeleton height={44} />
        <LoadingSkeleton height={120} />
      </Card>
    </>
  );

  const renderEmptyState = () => {
    if (!session?.linkedDriverId) {
      return (
        <EmptyState
          actionLabel="Open profile"
          message="This account is signed in, but there is no linked driver profile yet."
          title="No linked driver profile"
          onAction={() => navigation.navigate('Profile')}
        />
      );
    }

    if (searchQuery || filter !== 'all') {
      return (
        <EmptyState
          actionLabel="Clear filters"
          message="No assignments match the current search or filter. Clear the filters to return to the full list."
          title="No assignments match"
          onAction={() => {
            setSearchQuery('');
            setFilter('all');
          }}
        />
      );
    }

    return (
      <EmptyState
        actionLabel="Refresh assignments"
        message="No current assignments are linked to this account yet. Pull to refresh or check back after dispatch assigns a vehicle."
        title="No assignments yet"
        onAction={() => void onRefresh()}
      />
    );
  };

  const currentAssignment = useMemo(
    () => pickCurrentAssignment(assignments),
    [assignments],
  );
  const canRecordAnyRemittance = assignments.some(
    (assignment) =>
      assignment.status === 'active' &&
      (!assignment.paymentModel ||
        assignment.paymentModel === 'remittance' ||
        assignment.paymentModel === 'hire_purchase'),
  );
  const currentAssignmentSupportsRemittance =
    !currentAssignment?.paymentModel ||
    currentAssignment.paymentModel === 'remittance' ||
    currentAssignment.paymentModel === 'hire_purchase';

  useFocusEffect(
    useCallback(
      () => {
        void refreshAssignments().catch(() => {
          // Pull-to-refresh and action handlers surface visible errors.
        });
      },
      [refreshAssignments],
    ),
  );

  return (
    <>
      <Screen
        footer={<BottomNav currentTab="Home" navigation={navigation} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text style={styles.kicker}>Driver home</Text>
              <Text style={styles.title}>{session?.name ?? 'Field operator'}</Text>
              <Text style={styles.muted}>
                Check your assignment status, vehicle details, and the next action for today.
              </Text>
            </View>
            <Badge label={session?.role.replace(/_/g, ' ') ?? 'SIGNED IN'} tone="neutral" />
          </View>
          <View style={styles.heroActions}>
            <Button
              accessibilityHint="Open your verification and readiness status"
              label="Verification status"
              variant="secondary"
              onPress={() => navigation.navigate('Profile')}
            />
            {canRecordAnyRemittance ? (
              <Button
                accessibilityHint="Open the remittance recording form"
                label="Record remittance"
                onPress={() => navigation.navigate('Remittance', {})}
              />
            ) : null}
          </View>
          <Button
            accessibilityHint="Sign out of the mobile operations app"
            label="Sign out"
            variant="secondary"
            onPress={() => setShowLogoutModal(true)}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Ready to operate</Text>
          {driver ? (
            <>
              <View style={styles.readinessRow}>
                <Text style={styles.readinessLabel}>Identity</Text>
                <Badge
                  label={formatStatusLabel(driver.identityStatus)}
                  tone={identityTone(driver.identityStatus)}
                />
              </View>
              <View style={styles.readinessRow}>
                <Text style={styles.readinessLabel}>Activation</Text>
                <Badge
                  label={formatStatusLabel(driver.activationReadiness ?? 'not_ready')}
                  tone={readinessTone(driver.activationReadiness ?? 'not_ready')}
                />
              </View>
              <View style={styles.readinessRow}>
                <Text style={styles.readinessLabel}>Assignments</Text>
                <Badge
                  label={formatStatusLabel(driver.assignmentReadiness ?? 'not_ready')}
                  tone={readinessTone(driver.assignmentReadiness ?? 'not_ready')}
                />
              </View>
              <Text style={styles.muted}>{readinessSummary(driver)}</Text>
              {selfServiceToken ? (
                <Button
                  accessibilityHint="Open the onboarding readiness checklist for this driver"
                  label="Open readiness checklist"
                  variant="secondary"
                  onPress={() => navigation.navigate('SelfServiceReadiness')}
                />
              ) : null}
            </>
          ) : (
            <Text style={styles.muted}>
              Driver readiness will appear here once this account is linked to a driver profile.
            </Text>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Current assignment</Text>
          {currentAssignment ? (
            <>
              <View style={styles.rowBetween}>
                <Text style={styles.assignmentCode}>
                  Assignment {currentAssignment.id.slice(-6).toUpperCase()}
                </Text>
                <Badge
                  label={currentAssignment.status.toUpperCase()}
                  tone={statusTone(currentAssignment.status)}
                />
              </View>
              <Text style={styles.vehicleTitle}>
                {currentAssignment.vehicle
                  ? `${currentAssignment.vehicle.make} ${currentAssignment.vehicle.model}`
                  : 'Vehicle details unavailable'}
              </Text>
              <Text style={styles.meta}>
                Plate: {currentAssignment.vehicle?.plate ?? 'Not recorded'}
              </Text>
              <Text style={styles.meta}>
                Confirmed:{' '}
                {formatDateTime(
                  currentAssignment.driverConfirmedAt ?? currentAssignment.startedAt,
                  session?.formattingLocale,
                )}
              </Text>
              <View style={styles.heroActions}>
                <Button
                  label="Open assignment"
                  onPress={() =>
                    navigation.navigate('AssignmentDetail', {
                      assignmentId: currentAssignment.id,
                    })
                  }
                />
                {currentAssignmentSupportsRemittance ? (
                  <Button
                    label="Record remittance"
                    variant="secondary"
                    onPress={() =>
                      navigation.navigate('Remittance', {
                        assignmentId: currentAssignment.id,
                      })
                    }
                  />
                ) : null}
              </View>
            </>
          ) : (
            <Text style={styles.muted}>
              There is no active or pending assignment to highlight right now.
            </Text>
          )}
        </Card>

        <Card style={styles.section}>
          <Input
            accessibilityHint="Search assignments by assignment code, vehicle, plate number, or status"
            autoCapitalize="none"
            autoCorrect={false}
            label="Search assignments"
            onChangeText={setSearchQuery}
            placeholder="Search by code, plate, or vehicle"
            value={searchQuery}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTER_OPTIONS.map((option) => (
              <Pressable key={option.value} onPress={() => setFilter(option.value)}>
                <View
                  style={[
                    styles.filterChip,
                    filter === option.value ? styles.filterChipActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterLabel,
                      filter === option.value ? styles.filterLabelActive : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Card>

        {loading
          ? renderLoadingState()
          : groupedAssignments.length === 0
            ? renderEmptyState()
            : groupedAssignments.map((group) => (
                <View key={group.status} style={styles.group}>
                  <Text style={styles.groupTitle}>{formatGroupTitle(group.status)}</Text>
                  {group.records.map((assignment) => (
                    <Pressable
                      key={assignment.id}
                      accessibilityHint="Open assignment details"
                      onPress={() =>
                        navigation.navigate('AssignmentDetail', { assignmentId: assignment.id })
                      }
                    >
                      <Card style={styles.assignmentCard}>
                        <View style={styles.rowBetween}>
                          <Text style={styles.assignmentCode}>
                            Assignment {assignment.id.slice(-6).toUpperCase()}
                          </Text>
                          <Badge
                            label={assignment.status.toUpperCase()}
                            tone={statusTone(assignment.status)}
                          />
                        </View>
                        <Text style={styles.vehicleTitle}>
                          {assignment.vehicle
                            ? `${assignment.vehicle.make} ${assignment.vehicle.model}`
                            : 'Vehicle details unavailable'}
                        </Text>
                        <Text style={styles.muted}>
                          {assignment.vehicle?.tenantVehicleCode ??
                            assignment.vehicle?.systemVehicleCode ??
                            assignment.vehicleId}
                        </Text>
                        <Text style={styles.meta}>
                          Plate: {assignment.vehicle?.plate ?? 'Not recorded'}
                        </Text>
                        <Text style={styles.meta}>
                          Started: {formatDateTime(assignment.startedAt, session?.formattingLocale)}
                        </Text>
                        {!canWriteAssignments ? (
                          <Text style={styles.warningCopy}>
                            This account can view assignments but cannot change assignment status.
                          </Text>
                        ) : null}
                      </Card>
                    </Pressable>
                  ))}
                </View>
              ))}
      </Screen>

      <ConfirmationModal
        confirmLabel="Sign out"
        message="You will need to sign in again before continuing work."
        title="Sign out of mobile ops?"
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          void logout();
        }}
      />
    </>
  );
}

function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'ended') {
    return 'success';
  }
  if (status === 'cancelled' || status === 'declined') {
    return 'danger';
  }
  if (status === 'pending_driver_confirmation' || status === 'created' || status === 'active') {
    return 'warning';
  }
  return 'neutral';
}

function formatDateTime(value?: string | null, locale?: string | null) {
  if (!value) {
    return 'Not recorded';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale ?? undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatGroupTitle(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStatusLabel(status: string) {
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

function readinessTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'ready') {
    return 'success';
  }
  if (status === 'blocked') {
    return 'danger';
  }
  return 'warning';
}

function readinessSummary(driver: DriverRecord) {
  if (
    driver.identityStatus === 'verified' &&
    driver.hasApprovedLicence &&
    driver.pendingDocumentCount === 0 &&
    driver.rejectedDocumentCount === 0 &&
    driver.expiredDocumentCount === 0 &&
    driver.assignmentReadiness === 'ready'
  ) {
    return 'This account is clear for assignment operations.';
  }

  if (driver.assignmentReadinessReasons?.length) {
    return driver.assignmentReadinessReasons[0] ?? 'Additional readiness work is required.';
  }

  if (!driver.hasApprovedLicence) {
    return 'A valid approved licence is still required before operations can proceed.';
  }

  if (driver.identityStatus !== 'verified') {
    return 'Identity verification is not complete yet.';
  }

  return 'Refresh your readiness status after completing outstanding onboarding tasks.';
}

function pickCurrentAssignment(assignments: AssignmentRecord[]): AssignmentRecord | null {
  const prioritized = assignments
    .filter((assignment) =>
      ['active', 'pending_driver_confirmation', 'created'].includes(assignment.status),
    )
    .sort(
      (left, right) =>
        new Date(right.driverConfirmedAt ?? right.startedAt ?? right.createdAt).getTime() -
        new Date(left.driverConfirmedAt ?? left.startedAt ?? left.createdAt).getTime(),
    );

  return prioritized[0] ?? null;
}

const styles = StyleSheet.create({
  heroCard: {
    gap: tokens.spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  kicker: {
    color: tokens.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 26,
    fontWeight: '800',
  },
  muted: {
    color: tokens.colors.inkSoft,
    lineHeight: 20,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  section: {
    gap: tokens.spacing.sm,
  },
  readinessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  readinessLabel: {
    color: tokens.colors.ink,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  filterRow: {
    gap: tokens.spacing.sm,
  },
  filterChip: {
    borderRadius: tokens.radius.button,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.card,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  filterLabel: {
    color: tokens.colors.inkSoft,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  group: {
    gap: tokens.spacing.sm,
  },
  groupTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  assignmentCard: {
    gap: tokens.spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  assignmentCode: {
    color: tokens.colors.ink,
    fontWeight: '700',
  },
  vehicleTitle: {
    color: tokens.colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  meta: {
    color: tokens.colors.ink,
    lineHeight: 20,
  },
  warningCopy: {
    color: tokens.colors.warning,
    lineHeight: 20,
  },
});

export default AssignmentsScreen;
