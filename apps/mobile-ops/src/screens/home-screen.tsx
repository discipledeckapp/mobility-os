import { useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { ConfirmationModal } from '../components/confirmation-modal';
import { EmptyState } from '../components/empty-state';
import { Input } from '../components/input';
import { LoadingSkeleton } from '../components/loading-skeleton';
import { Screen } from '../components/screen';
import { ASSIGNMENT_STATUS } from '../constants';
import { useAuth } from '../contexts/auth-context';
import { useAssignments } from '../hooks/use-assignments';
import type { AssignmentFilter } from '../services/assignment-service';
import { tokens } from '../theme/tokens';
import type { ScreenProps } from './index';

const FILTER_OPTIONS: Array<{ label: string; value: AssignmentFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: ASSIGNMENT_STATUS.active },
  { label: 'Completed', value: ASSIGNMENT_STATUS.completed },
  { label: 'Cancelled', value: ASSIGNMENT_STATUS.cancelled },
];

export function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const { session, logout } = useAuth();
  const {
    groupedAssignments,
    loading,
    refreshing,
    searchQuery,
    filter,
    setSearchQuery,
    setFilter,
    refreshAssignments,
  } = useAssignments();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const canWriteAssignments = useMemo(
    () => session?.permissions.includes('assignments:write') ?? false,
    [session?.permissions],
  );

  const onRefresh = async () => {
    try {
      await refreshAssignments();
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

    return (
      <EmptyState
        actionLabel="Refresh assignments"
        message="No assignments match the current search or filter. Try another filter or refresh the list."
        title="No assignments found"
        onAction={() => void onRefresh()}
      />
    );
  };

  return (
    <>
      <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text style={styles.kicker}>{session?.tenantName ?? 'Mobility OS'}</Text>
              <Text style={styles.title}>{session?.name ?? 'Field operator'}</Text>
              <Text style={styles.muted}>
                Review current assignments, record remittance, and check verification readiness.
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
            <Button
              accessibilityHint="Open the remittance recording form"
              label="Record remittance"
              onPress={() => navigation.navigate('Remittance', {})}
            />
          </View>
          <Button
            accessibilityHint="Sign out of the mobile operations app"
            label="Sign out"
            variant="secondary"
            onPress={() => setShowLogoutModal(true)}
          />
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
  if (status === 'completed') {
    return 'success';
  }
  if (status === 'cancelled') {
    return 'danger';
  }
  if (status === 'assigned' || status === 'created' || status === 'active') {
    return 'warning';
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

function formatGroupTitle(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

const styles = StyleSheet.create({
  heroCard: {
    gap: tokens.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  heroHeader: {
    gap: tokens.spacing.md,
  },
  heroCopy: {
    gap: 6,
  },
  heroActions: {
    flexDirection: 'row',
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
    fontSize: 24,
    fontWeight: '800',
  },
  muted: {
    color: tokens.colors.inkSoft,
    lineHeight: 20,
  },
  section: {
    gap: tokens.spacing.sm,
  },
  filterRow: {
    gap: tokens.spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: tokens.colors.primaryTint,
    borderColor: tokens.colors.primary,
  },
  filterLabel: {
    color: tokens.colors.ink,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: tokens.colors.primary,
  },
  group: {
    gap: tokens.spacing.sm,
  },
  groupTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  assignmentCard: {
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacing.sm,
    alignItems: 'center',
  },
  assignmentCode: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  vehicleTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: tokens.colors.ink,
    fontSize: 14,
  },
  warningCopy: {
    color: tokens.colors.warning,
    fontSize: 13,
    lineHeight: 18,
  },
});
