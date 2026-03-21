import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type AssignmentRecord, isNetworkError } from '../api';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { ConfirmationModal } from '../components/confirmation-modal';
import { Input } from '../components/input';
import { LoadingSkeleton } from '../components/loading-skeleton';
import { Screen } from '../components/screen';
import { mobileEnv } from '../config/env';
import { OFFLINE_ACTION_TYPE } from '../constants';
import { useAuth } from '../contexts/auth-context';
import { useToast } from '../contexts/toast-context';
import {
  cancelDriverAssignment,
  completeDriverAssignment,
  fetchAssignmentDetail,
  startDriverAssignment,
} from '../services/assignment-service';
import { enqueueOfflineAction } from '../services/offline-queue-service';
import { convertMajorToMinorUnits, submitRemittance } from '../services/remittance-service';
import { tokens } from '../theme/tokens';
import type { ScreenProps } from './index';

export function AssignmentDetailScreen({ route }: ScreenProps<'AssignmentDetail'>) {
  const { session } = useAuth();
  const { showToast } = useToast();
  const { assignmentId } = route.params;
  const [assignment, setAssignment] = useState<AssignmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRemittanceSheet, setShowRemittanceSheet] = useState(false);
  const [remittanceAmount, setRemittanceAmount] = useState('');

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
      dueDate: new Date().toISOString().slice(0, 10),
    };

    try {
      await submitRemittance(payload);
      setShowRemittanceSheet(false);
      setRemittanceAmount('');
      showToast('Remittance submitted successfully.', 'success');
    } catch (error) {
      if (mobileEnv.enableOfflineQueue && isNetworkError(error)) {
        await enqueueOfflineAction({
          type: OFFLINE_ACTION_TYPE.remittanceRecord,
          payload,
        });
        setShowRemittanceSheet(false);
        setRemittanceAmount('');
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
                    accessibilityHint="Cancel this assignment after confirmation"
                    label="Cancel assignment"
                    loading={submitting}
                    variant="danger"
                    onPress={() => setShowCancelConfirm(true)}
                  />
                </>
              ) : null}
              <Button
                accessibilityHint="Open remittance for this assignment"
                label="Record remittance"
                variant="secondary"
                onPress={() => setShowRemittanceSheet(true)}
              />
            </View>
          )}
        </Card>
      </Screen>

      <ConfirmationModal
        confirmLabel="Confirm cancel"
        message="Use cancel only if the assignment can no longer continue. This action will be recorded."
        title="Cancel this assignment?"
        visible={showCancelConfirm}
        onCancel={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false);
          void runAction(
            () => cancelDriverAssignment(assignment.id, 'Cancelled from mobile ops'),
            'Assignment has been cancelled.',
            {
              type: OFFLINE_ACTION_TYPE.assignmentCancel,
              payload: { assignmentId: assignment.id, notes: 'Cancelled from mobile ops' },
              message:
                'You are offline. The cancellation has been queued and will sync when you reconnect.',
            },
          );
        }}
      />

      <Modal
        animationType="slide"
        onRequestClose={() => setShowRemittanceSheet(false)}
        transparent
        visible={showRemittanceSheet}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setShowRemittanceSheet(false)}>
          <Pressable onPress={() => {}} style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Submit remittance</Text>
            <Text style={styles.muted}>
              Record the amount collected for this assignment in{' '}
              {currencyCode || 'the organisation currency'}.
            </Text>
            <Input
              accessibilityHint="Enter the remittance amount in major currency units"
              keyboardType="decimal-pad"
              label={`Amount${currencyCode ? ` (${currencyCode})` : ''}`}
              onChangeText={setRemittanceAmount}
              placeholder="0.00"
              value={remittanceAmount}
            />
            <View style={styles.sheetActions}>
              <Button
                label="Back"
                onPress={() => setShowRemittanceSheet(false)}
                variant="secondary"
              />
              <Button
                label="Submit"
                loading={submitting}
                onPress={() => void onSubmitRemittance()}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    flex: 1,
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  muted: {
    color: tokens.colors.inkSoft,
    lineHeight: 20,
  },
  meta: {
    color: tokens.colors.ink,
    lineHeight: 20,
  },
  actions: {
    gap: tokens.spacing.sm,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    gap: tokens.spacing.md,
    padding: tokens.spacing.lg,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetTitle: {
    color: tokens.colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
});
