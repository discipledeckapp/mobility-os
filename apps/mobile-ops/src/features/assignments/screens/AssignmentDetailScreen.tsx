'use client';

import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { reportAssignmentIncident, type AssignmentRecord, isNetworkError } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { ConfirmationModal } from '../../../components/confirmation-modal';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import { mobileEnv } from '../../../config/env';
import { OFFLINE_ACTION_TYPE } from '../../../constants';
import { useAuth } from '../../../contexts/auth-context';
import { useSelfService } from '../../../contexts/self-service-context';
import { useToast } from '../../../contexts/toast-context';
import { useDriverProfile } from '../../../hooks/use-driver-profile';
import type { ScreenProps } from '../../../navigation/types';
import {
  cancelDriverAssignment,
  completeDriverAssignment,
  fetchAssignmentDetail,
  startDriverAssignment,
} from '../../../services/assignment-service';
import { enqueueOfflineAction } from '../../../services/offline-queue-service';
import { convertMajorToMinorUnits, submitRemittance } from '../../../services/remittance-service';
import { tokens } from '../../../theme/tokens';

export function AssignmentDetailScreen({ navigation, route }: ScreenProps<'AssignmentDetail'>) {
  const { session } = useAuth();
  const { token: selfServiceToken } = useSelfService();
  const { showToast } = useToast();
  const { assignmentId } = route.params;
  const { driver } = useDriverProfile(Boolean(session?.linkedDriverId));
  const [assignment, setAssignment] = useState<AssignmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRemittanceSheet, setShowRemittanceSheet] = useState(false);
  const [showIncidentSheet, setShowIncidentSheet] = useState(false);
  const [remittanceAmount, setRemittanceAmount] = useState('');
  const [remittanceDate, setRemittanceDate] = useState(new Date());
  const [showRemittanceDatePicker, setShowRemittanceDatePicker] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentCategory, setIncidentCategory] = useState('collision');
  const [incidentSeverity, setIncidentSeverity] = useState('minor');
  const [incidentEstimatedCost, setIncidentEstimatedCost] = useState('');

  const canWriteAssignments = useMemo(
    () => session?.permissions.includes('assignments:write') ?? false,
    [session?.permissions],
  );
  const currencyCode = session?.defaultCurrency ?? '';

  const load = useCallback(async () => {
    const nextAssignment = await fetchAssignmentDetail(assignmentId);
    setAssignment(nextAssignment);
  }, [assignmentId]);

  useEffect(() => {
    load()
      .catch((error) => {
        Alert.alert(
          'Assignment details',
          error instanceof Error ? error.message : 'Unable to load assignment details.',
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
      showToast('Assignment refreshed.', 'success');
    } catch (error) {
      Alert.alert(
        'Assignment details',
        error instanceof Error ? error.message : 'Unable to refresh assignment details.',
      );
    } finally {
      setRefreshing(false);
    }
  };

  const queueActionIfOffline = async (
    type:
      | typeof OFFLINE_ACTION_TYPE.assignmentStart
      | typeof OFFLINE_ACTION_TYPE.assignmentComplete
      | typeof OFFLINE_ACTION_TYPE.assignmentCancel,
    payload: { assignmentId: string; notes?: string },
    message: string,
  ) => {
    if (!mobileEnv.enableOfflineQueue) {
      return false;
    }

    await enqueueOfflineAction({ type, payload });
    showToast(message, 'info');
    return true;
  };

  const runAction = async (
    action: () => Promise<AssignmentRecord>,
    successMessage: string,
    offlineFallback?: {
      type:
        | typeof OFFLINE_ACTION_TYPE.assignmentStart
        | typeof OFFLINE_ACTION_TYPE.assignmentComplete
        | typeof OFFLINE_ACTION_TYPE.assignmentCancel;
      payload: { assignmentId: string; notes?: string };
      message: string;
    },
  ) => {
    setSubmitting(true);
    try {
      const nextAssignment = await action();
      setAssignment(nextAssignment);
      showToast(successMessage, 'success');
    } catch (error) {
      if (offlineFallback && isNetworkError(error)) {
        const queued = await queueActionIfOffline(
          offlineFallback.type,
          offlineFallback.payload,
          offlineFallback.message,
        );
        if (queued) {
          return;
        }
      }

      showToast(
        error instanceof Error ? error.message : 'Unable to update this assignment.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitRemittance = async () => {
    if (!assignment) {
      return;
    }

    const amountMinorUnits = convertMajorToMinorUnits(remittanceAmount, session?.currencyMinorUnit);

    if (amountMinorUnits === null) {
      showToast('Enter a valid positive remittance amount.', 'error');
      return;
    }

    if (!currencyCode) {
      showToast('The organisation currency is not configured.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      assignmentId: assignment.id,
      amountMinorUnits,
      currency: currencyCode,
      dueDate: remittanceDate.toISOString().slice(0, 10),
    };

    try {
      await submitRemittance(payload);
      setShowRemittanceSheet(false);
      setRemittanceAmount('');
      setRemittanceDate(new Date());
      showToast('Remittance submitted successfully.', 'success');
    } catch (error) {
      if (mobileEnv.enableOfflineQueue && isNetworkError(error)) {
        await enqueueOfflineAction({
          type: OFFLINE_ACTION_TYPE.remittanceRecord,
          payload,
        });
        setShowRemittanceSheet(false);
        setRemittanceAmount('');
        setRemittanceDate(new Date());
        showToast(
          'You are offline. The remittance has been queued and will sync when you reconnect.',
          'info',
        );
        return;
      }

      showToast(error instanceof Error ? error.message : 'Unable to submit remittance.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const onRemittanceDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowRemittanceDatePicker(false);
    }
    if (selectedDate) {
      setRemittanceDate(selectedDate);
    }
  };

  const onSubmitIncident = async () => {
    if (!assignment) {
      return;
    }

    if (!incidentTitle.trim()) {
      showToast('Incident title is required.', 'error');
      return;
    }

    const estimatedCostMinorUnits =
      incidentEstimatedCost.trim().length > 0
        ? convertMajorToMinorUnits(incidentEstimatedCost, session?.currencyMinorUnit)
        : undefined;
    if (incidentEstimatedCost.trim().length > 0 && estimatedCostMinorUnits === null) {
      showToast('Estimated repair cost must be a valid amount.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await reportAssignmentIncident(assignment.id, {
        category: incidentCategory,
        severity: incidentSeverity,
        title: incidentTitle.trim(),
        description: incidentDescription.trim() || undefined,
        occurredAt: new Date().toISOString(),
        estimatedCostMinorUnits: estimatedCostMinorUnits ?? undefined,
        currency: currencyCode || undefined,
      });
      setShowIncidentSheet(false);
      setIncidentTitle('');
      setIncidentDescription('');
      setIncidentEstimatedCost('');
      showToast('Incident reported successfully.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to report the incident.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !assignment) {
    return (
      <Screen>
        <Card style={styles.section}>
          <LoadingSkeleton height={28} width="52%" />
          <LoadingSkeleton height={18} width="90%" />
          <LoadingSkeleton height={18} width="60%" />
        </Card>
        <Card style={styles.section}>
          <LoadingSkeleton height={48} />
          <LoadingSkeleton height={48} />
          <LoadingSkeleton height={48} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle issues</Text>
          <Text style={styles.muted}>
            Report collisions, damage, or unexpected incidents so the organisation can respond before operations or remittance are affected.
          </Text>
          <Button
            label="Report vehicle incident"
            variant="secondary"
            onPress={() => setShowIncidentSheet(true)}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <>
      <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Card style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>Assignment {assignment.id.slice(-6).toUpperCase()}</Text>
            <Badge label={assignment.status.toUpperCase()} tone={statusTone(assignment.status)} />
          </View>
          <Text style={styles.muted}>
            Vehicle: {`${assignment.vehicle.make} ${assignment.vehicle.model}`}
          </Text>
          <Text style={styles.meta}>Plate: {assignment.vehicle.plate ?? 'Not recorded'}</Text>
          <Text style={styles.meta}>
            Started: {formatDateTime(assignment.startedAt, session?.formattingLocale)}
          </Text>
          <Text style={styles.meta}>
            Ended:{' '}
            {assignment.endedAt
              ? formatDateTime(assignment.endedAt, session?.formattingLocale)
              : 'Still active'}
          </Text>
          {assignment.notes ? <Text style={styles.meta}>Notes: {assignment.notes}</Text> : null}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Driver readiness</Text>
          {driver ? (
            <>
              <View style={styles.rowBetween}>
                <Text style={styles.meta}>Identity</Text>
                <Badge
                  label={formatStatusLabel(driver.identityStatus)}
                  tone={identityTone(driver.identityStatus)}
                />
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.meta}>Assignments</Text>
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
              Driver readiness information is not available on this device yet.
            </Text>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          {!canWriteAssignments ? (
            <Text style={styles.muted}>
              This account can review assignment details but cannot change assignment status.
            </Text>
          ) : (
            <View style={styles.actions}>
              {['created', 'assigned'].includes(assignment.status) ? (
                <Button
                  accessibilityHint="Mark this assignment as started"
                  label="Start assignment"
                  loading={submitting}
                  onPress={() =>
                    void runAction(
                      () => startDriverAssignment(assignment.id),
                      'Assignment has been started.',
                      {
                        type: OFFLINE_ACTION_TYPE.assignmentStart,
                        payload: { assignmentId: assignment.id },
                        message:
                          'You are offline. The start action has been queued and will sync when you reconnect.',
                      },
                    )
                  }
                />
              ) : null}
              {assignment.status === 'active' ? (
                <>
                  <Button
                    accessibilityHint="Mark this assignment as completed"
                    label="Complete assignment"
                    loading={submitting}
                    onPress={() =>
                      void runAction(
                        () => completeDriverAssignment(assignment.id),
                        'Assignment has been completed.',
                        {
                          type: OFFLINE_ACTION_TYPE.assignmentComplete,
                          payload: { assignmentId: assignment.id },
                          message:
                            'You are offline. The completion has been queued and will sync when you reconnect.',
                        },
                      )
                    }
                  />
                  <Button
                    accessibilityHint="Open the remittance quick sheet"
                    label="Record remittance"
                    variant="secondary"
                    onPress={() => setShowRemittanceSheet(true)}
                  />
                  <Button
                    accessibilityHint="Cancel this assignment"
                    label="Cancel assignment"
                    variant="secondary"
                    onPress={() => setShowCancelConfirm(true)}
                  />
                </>
              ) : null}
            </View>
          )}
        </Card>
      </Screen>

      <ConfirmationModal
        confirmLabel="Cancel assignment"
        message="The assignment will be cancelled for the linked driver."
        title="Cancel assignment?"
        visible={showCancelConfirm}
        onCancel={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false);
          void runAction(
            () => cancelDriverAssignment(assignment.id),
            'Assignment has been cancelled.',
            {
              type: OFFLINE_ACTION_TYPE.assignmentCancel,
              payload: { assignmentId: assignment.id },
              message:
                'You are offline. The cancellation has been queued and will sync when you reconnect.',
            },
          );
        }}
      />

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        transparent
        visible={showRemittanceSheet}
        onRequestClose={() => setShowRemittanceSheet(false)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Quick remittance</Text>
            <Text style={styles.muted}>
              Record a remittance for this assignment without leaving the detail screen.
            </Text>
            <Input
              helperText="Enter the amount in major currency units. The app converts it internally before submit."
              keyboardType="decimal-pad"
              label="Amount"
              onChangeText={setRemittanceAmount}
              value={remittanceAmount}
            />
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Collection date</Text>
              <Pressable onPress={() => setShowRemittanceDatePicker(true)}>
                <View style={styles.dateButton}>
                  <Text style={styles.dateButtonLabel}>
                    {formatDateOnly(remittanceDate.toISOString().slice(0, 10), session?.formattingLocale)}
                  </Text>
                </View>
              </Pressable>
              <Text style={styles.muted}>Choose the day the collection was received.</Text>
            </View>
            <View style={styles.sheetActions}>
              <Button
                label="Close"
                variant="secondary"
                onPress={() => setShowRemittanceSheet(false)}
              />
              <Button
                label="Submit"
                loading={submitting}
                onPress={() => void onSubmitRemittance()}
              />
            </View>
            {showRemittanceDatePicker ? (
              <DateTimePicker
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                mode="date"
                value={remittanceDate}
                onChange={onRemittanceDateChange}
              />
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        transparent
        visible={showIncidentSheet}
        onRequestClose={() => setShowIncidentSheet(false)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Vehicle incident</Text>
            <Text style={styles.muted}>
              Report the issue now so the company can assess safety, maintenance, and financial impact.
            </Text>
            <Input label="Title" onChangeText={setIncidentTitle} value={incidentTitle} />
            <Input
              helperText="collision, theft, vandalism, breakdown"
              label="Category"
              onChangeText={setIncidentCategory}
              value={incidentCategory}
            />
            <Input
              helperText="minor, major, critical"
              label="Severity"
              onChangeText={setIncidentSeverity}
              value={incidentSeverity}
            />
            <Input
              keyboardType="decimal-pad"
              label="Estimated repair cost"
              onChangeText={setIncidentEstimatedCost}
              value={incidentEstimatedCost}
            />
            <Input
              label="Description"
              multiline
              onChangeText={setIncidentDescription}
              value={incidentDescription}
            />
            <View style={styles.sheetActions}>
              <Button label="Close" variant="secondary" onPress={() => setShowIncidentSheet(false)} />
              <Button label="Submit" loading={submitting} onPress={() => void onSubmitIncident()} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
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

function readinessSummary(
  driver: {
    identityStatus: string;
    hasApprovedLicence: boolean;
    pendingDocumentCount: number;
    rejectedDocumentCount: number;
    expiredDocumentCount: number;
    assignmentReadiness?: string;
    assignmentReadinessReasons?: string[];
  },
) {
  if (
    driver.identityStatus === 'verified' &&
    driver.hasApprovedLicence &&
    driver.pendingDocumentCount === 0 &&
    driver.rejectedDocumentCount === 0 &&
    driver.expiredDocumentCount === 0 &&
    driver.assignmentReadiness === 'ready'
  ) {
    return 'This driver is currently clear for assignment operations.';
  }

  if (driver.assignmentReadinessReasons?.length) {
    return driver.assignmentReadinessReasons[0] ?? 'Readiness work is still outstanding.';
  }

  if (!driver.hasApprovedLicence) {
    return 'A valid approved licence is still required before operations should proceed.';
  }

  if (driver.identityStatus !== 'verified') {
    return 'Identity verification is not complete yet.';
  }

  return 'Refresh readiness after outstanding onboarding tasks are resolved.';
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

function formatDateOnly(value: string, locale?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale ?? undefined, {
    dateStyle: 'medium',
  }).format(date);
}

const styles = StyleSheet.create({
  section: {
    gap: tokens.spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
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
  meta: {
    color: tokens.colors.ink,
    lineHeight: 20,
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    gap: tokens.spacing.sm,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  sheetTitle: {
    color: tokens.colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  dateField: {
    gap: tokens.spacing.xs,
  },
  dateLabel: {
    color: tokens.colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.button,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  dateButtonLabel: {
    color: tokens.colors.ink,
    fontSize: 15,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    justifyContent: 'flex-end',
  },
});

export default AssignmentDetailScreen;
