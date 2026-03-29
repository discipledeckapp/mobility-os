'use client';

import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { computeNextRemittanceDueDate, describeRemittanceSchedule } from '@mobility-os/domain-config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { isNetworkError, listRemittanceHistory, type RemittanceRecord } from '../../../api';
import { Badge } from '../../../components/badge';
import { BottomNav } from '../../../components/bottom-nav';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { FullScreenBlockingLoader, InlineProcessingCard, SkeletonCard } from '../../../components/processing-state';
import { Screen } from '../../../components/screen';
import { mobileEnv } from '../../../config/env';
import { OFFLINE_ACTION_TYPE } from '../../../constants';
import { useAuth } from '../../../contexts/auth-context';
import { useToast } from '../../../contexts/toast-context';
import { useAssignments } from '../../../hooks/use-assignments';
import { getCurrencyLabel } from '../../../lib/currency';
import type { ScreenProps } from '../../../navigation/types';
import { enqueueOfflineAction, getQueuedActions } from '../../../services/offline-queue-service';
import {
  convertMajorToMinorUnits,
  getCurrencyMultiplier,
  submitRemittance,
} from '../../../services/remittance-service';
import { tokens } from '../../../theme/tokens';

export function RemittanceScreen({ navigation, route }: ScreenProps<'Remittance'>) {
  const { session } = useAuth();
  const { showToast } = useToast();
  const { assignments, loading, refreshing, refreshAssignments } = useAssignments(
    Boolean(session?.linkedDriverId),
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(
    route.params?.assignmentId ?? '',
  );
  const [assignmentQuery, setAssignmentQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [shiftCode, setShiftCode] = useState('');
  const [checkpointLabel, setCheckpointLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [history, setHistory] = useState<RemittanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [queuedRemittanceCount, setQueuedRemittanceCount] = useState(0);

  const eligibleAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.status === 'active' &&
          (!assignment.paymentModel ||
            assignment.paymentModel === 'remittance' ||
            assignment.paymentModel === 'hire_purchase'),
      ),
    [assignments],
  );
  const filteredAssignments = useMemo(() => {
    const query = assignmentQuery.trim().toLowerCase();
    if (!query) {
      return eligibleAssignments;
    }
    return eligibleAssignments.filter((assignment) =>
      `${assignment.id} ${assignment.status} ${assignment.driverId} ${assignment.vehicleId}`
        .toLowerCase()
        .includes(query),
    );
  }, [assignmentQuery, eligibleAssignments]);
  const currencyLabel = useMemo(
    () => getCurrencyLabel(session?.defaultCurrency, session?.formattingLocale),
    [session?.defaultCurrency, session?.formattingLocale],
  );

  useEffect(() => {
    if (!selectedAssignmentId && route.params?.assignmentId) {
      setSelectedAssignmentId(route.params.assignmentId);
    }
  }, [route.params?.assignmentId, selectedAssignmentId]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const records = await listRemittanceHistory();
        setHistory(records);
        const queued = await getQueuedActions();
        setQueuedRemittanceCount(
          queued.filter((action) => action.type === OFFLINE_ACTION_TYPE.remittanceRecord).length,
        );
      } catch {
        // Keep history best-effort on this screen.
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory().catch(() => {
      setHistoryLoading(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshAssignments().catch(() => {
        // Manual refresh handles visible error messaging.
      });
    }, [refreshAssignments]),
  );

  const selectedAssignment = useMemo(
    () => eligibleAssignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null,
    [eligibleAssignments, selectedAssignmentId],
  );
  const suggestedAmount = useMemo(() => {
    const nextDueAmountMinorUnits =
      selectedAssignment?.financialContract?.summary.nextDueAmountMinorUnits ??
      selectedAssignment?.financialContract?.summary.expectedPerPeriodAmountMinorUnits ??
      selectedAssignment?.remittanceAmountMinorUnits;
    if (!nextDueAmountMinorUnits) {
      return '';
    }
    return String(
      nextDueAmountMinorUnits / getCurrencyMultiplier(session?.currencyMinorUnit),
    );
  }, [selectedAssignment?.financialContract, selectedAssignment?.remittanceAmountMinorUnits, session?.currencyMinorUnit]);
  const suggestedDueDate = useMemo(() => {
    if (!selectedAssignment) {
      return null;
    }
    return computeNextRemittanceDueDate({
      remittanceFrequency: selectedAssignment.remittanceFrequency,
      remittanceAmountMinorUnits: selectedAssignment.remittanceAmountMinorUnits,
      remittanceCurrency: selectedAssignment.remittanceCurrency,
      remittanceStartDate: selectedAssignment.remittanceStartDate,
      ...(selectedAssignment.remittanceCollectionDay !== undefined
        ? { remittanceCollectionDay: selectedAssignment.remittanceCollectionDay }
        : {}),
    });
  }, [selectedAssignment]);

  useEffect(() => {
    if (selectedAssignment && suggestedAmount) {
      setAmount(suggestedAmount);
    }
  }, [selectedAssignment, suggestedAmount]);

  useEffect(() => {
    if (suggestedDueDate) {
      setDueDate(new Date(`${suggestedDueDate}T00:00:00.000Z`));
    }
  }, [suggestedDueDate]);

  const onRefresh = async () => {
    try {
      const [records, queued] = await Promise.all([
        listRemittanceHistory().catch(() => history),
        getQueuedActions(),
        refreshAssignments(),
      ]);
      setHistory(records);
      setQueuedRemittanceCount(
        queued.filter((action) => action.type === OFFLINE_ACTION_TYPE.remittanceRecord).length,
      );
      showToast('Assignments refreshed.', 'success');
    } catch (error) {
      Alert.alert(
        'Remittance',
        error instanceof Error ? error.message : 'Unable to refresh assignments.',
      );
    }
  };

  const onSubmit = async () => {
    const amountMinorUnits = convertMajorToMinorUnits(amount, session?.currencyMinorUnit);

    if (!selectedAssignment) {
      showToast('Select an assignment before submitting.', 'error');
      return;
    }
    if (amountMinorUnits === null) {
      showToast('Enter a valid positive amount.', 'error');
      return;
    }
    if (!session?.defaultCurrency) {
      showToast('The organisation currency is not configured.', 'error');
      return;
    }

    setSubmitting(true);
    const clientReferenceId = `remittance-${selectedAssignment.id}-${Date.now()}`;
    const payload = {
      assignmentId: selectedAssignment.id,
      amountMinorUnits,
      currency: session.defaultCurrency,
      dueDate: dueDate.toISOString().slice(0, 10),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(shiftCode.trim() ? { shiftCode: shiftCode.trim() } : {}),
      ...(checkpointLabel.trim() ? { checkpointLabel: checkpointLabel.trim() } : {}),
      clientReferenceId,
      submissionSource: 'online' as const,
      syncStatus: 'synced' as const,
      originalCapturedAt: new Date().toISOString(),
      evidence: notes.trim()
        ? {
            note: notes.trim(),
            capturedOffline: false,
          }
        : undefined,
    };

    try {
      await submitRemittance(payload);
      const records = await listRemittanceHistory().catch(() => history);
      setHistory(records);
      setQueuedRemittanceCount(0);
      showToast('The collection has been recorded successfully.', 'success');
      navigation.goBack();
    } catch (error) {
      if (mobileEnv.enableOfflineQueue && isNetworkError(error)) {
        await enqueueOfflineAction({
          type: OFFLINE_ACTION_TYPE.remittanceRecord,
          payload: {
            ...payload,
            submissionSource: 'offline_queue',
            syncStatus: 'offline_submitted',
            evidence: {
              ...(payload.evidence ?? {}),
              note: notes.trim() || undefined,
              capturedOffline: true,
            },
          },
        });
        const queued = await getQueuedActions();
        setQueuedRemittanceCount(
          queued.filter((action) => action.type === OFFLINE_ACTION_TYPE.remittanceRecord).length,
        );
        showToast(
          'You are offline. The remittance has been queued and will sync when you reconnect.',
          'info',
        );
        navigation.goBack();
        return;
      }

      showToast(
        error instanceof Error ? error.message : 'Unable to record this remittance.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <Screen
      footer={<BottomNav currentTab="Remittance" navigation={navigation} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Record collection</Text>
        <Text style={styles.muted}>
          Select the assignment this payment belongs to, then record the amount and date.
        </Text>
      </Card>

      <Card style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Recent collections</Text>
          <Button
            accessibilityHint="Open the full remittance history for this account"
            containerStyle={styles.historyButton}
            label="View full history"
            variant="secondary"
            onPress={() => navigation.navigate('RemittanceHistory')}
          />
        </View>
        {historyLoading ? (
          <InlineProcessingCard
            activeStep={1}
            message="Loading recent collections and checking the latest remittance state for this mobile account."
            steps={[
              'Loading recent collections',
              'Refreshing remittance status',
              'Preparing assignment options',
            ]}
            title="Preparing remittance history"
            variant="remittance"
          />
        ) : history.length === 0 ? (
          <Text style={styles.muted}>No collections have been recorded from this mobile account yet.</Text>
        ) : (
          history.map((record) => (
            <View key={record.id} style={styles.historyRow}>
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>
                  {currencyLabel} {formatMajorAmount(record.amountMinorUnits, session?.currencyMinorUnit)}
                </Text>
                <Text style={styles.muted}>
                  Due {formatDateOnly(record.dueDate, session?.formattingLocale)}
                </Text>
                <Text style={styles.muted}>
                  Assignment {record.assignmentId.slice(-6).toUpperCase()}
                </Text>
              </View>
              <Badge label={record.status.toUpperCase()} tone={historyTone(record.status)} />
            </View>
          ))
        )}
        {queuedRemittanceCount > 0 ? (
          <View style={styles.queueNote}>
            <Text style={styles.queueTitle}>Offline queue</Text>
            <Text style={styles.muted}>
              {queuedRemittanceCount} remittance submission{queuedRemittanceCount === 1 ? '' : 's'} waiting to sync.
            </Text>
          </View>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Assignment</Text>
        <Input
          accessibilityHint="Search assignments by ID"
          label="Search assignment"
          onChangeText={setAssignmentQuery}
          value={assignmentQuery}
        />
        {loading ? (
          <>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </>
        ) : filteredAssignments.length === 0 ? (
          <EmptyState
            actionLabel="Refresh assignments"
            message={
              eligibleAssignments.length === 0
                ? 'No active remittance-enabled assignments are ready for collection recording yet.'
                : 'No assignments match your current search.'
            }
            title="No assignments available"
            onAction={() => void onRefresh()}
          />
        ) : (
          filteredAssignments.map((assignment) => (
            <Pressable
              key={assignment.id}
              accessibilityHint="Select this assignment for remittance"
              onPress={() => setSelectedAssignmentId(assignment.id)}
            >
              <View
                style={[
                  styles.option,
                  selectedAssignmentId === assignment.id ? styles.optionSelected : null,
                ]}
              >
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>
                    Assignment {assignment.id.slice(-6).toUpperCase()}
                  </Text>
                  <Text style={styles.muted}>
                    Confirmed{' '}
                    {formatDateTime(
                      assignment.driverConfirmedAt ?? assignment.startedAt,
                      session?.formattingLocale,
                    )}
                  </Text>
                </View>
                <Badge
                  label={assignment.status.toUpperCase()}
                  tone="warning"
                />
              </View>
            </Pressable>
          ))
        )}
      </Card>

      <Card style={styles.section}>
        <Input
          accessibilityHint="Enter the amount in major currency units"
          keyboardType="decimal-pad"
          label={`Amount (${currencyLabel})`}
          onChangeText={setAmount}
          value={amount}
          helperText={
            selectedAssignment?.financialContract
              ? `${selectedAssignment.financialContract.display.summaryLabel} installment is prefilled from the contract summary.`
              : `The app converts this to minor units using ${
                  session?.currencyMinorUnit ?? 2
                } decimal place${session?.currencyMinorUnit === 1 ? '' : 's'} before submit.`
          }
        />
        <Input
          accessibilityHint="The organisation currency is fixed for remittance"
          editable={false}
          label="Currency"
          value={session?.defaultCurrency ?? ''}
          helperText="Collections are recorded in the organisation currency."
        />

        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Collection date</Text>
          <Pressable
            accessibilityHint="Choose the collection date from a calendar picker"
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateButton}>
              <Text style={styles.dateButtonLabel}>
                {formatDateOnly(dueDate.toISOString().slice(0, 10), session?.formattingLocale)}
              </Text>
            </View>
          </Pressable>
          <Text style={styles.helper}>Choose the day the collection was received.</Text>
        </View>

        {selectedAssignment ? (
          <Text style={styles.helper}>
              {describeRemittanceSchedule({
                remittanceFrequency: selectedAssignment.remittanceFrequency,
                ...(selectedAssignment.remittanceCollectionDay !== undefined
                  ? { remittanceCollectionDay: selectedAssignment.remittanceCollectionDay }
                  : {}),
              })}
          </Text>
        ) : null}
        {selectedAssignment?.financialContract ? (
          <Text style={styles.helper}>
            Paid so far {(
              selectedAssignment.financialContract.summary.cumulativePaidAmountMinorUnits / 100
            ).toLocaleString(session?.formattingLocale ?? 'en-NG', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            {selectedAssignment.financialContract.currency}. Remaining balance{' '}
            {(
              (selectedAssignment.financialContract.summary.outstandingBalanceMinorUnits ?? 0) / 100
            ).toLocaleString(session?.formattingLocale ?? 'en-NG', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            {selectedAssignment.financialContract.currency}.
          </Text>
        ) : null}

        <Input
          accessibilityHint="Optional note about this collection"
          label="Notes"
          multiline
          onChangeText={setNotes}
          style={styles.notesInput}
          value={notes}
        />
        <Input
          accessibilityHint="Optional shift label for later cash reconciliation"
          label="Shift code"
          onChangeText={setShiftCode}
          value={shiftCode}
          helperText="Optional. Use a simple code like MORNING, PM, or DEPOT-A."
        />
        <Input
          accessibilityHint="Optional mid-day or route checkpoint label"
          label="Checkpoint"
          onChangeText={setCheckpointLabel}
          value={checkpointLabel}
          helperText="Optional. Useful for mid-day cash visibility or partial-day returns."
        />
        <Button
          accessibilityHint="Submit this remittance record"
          label="Submit remittance"
          loading={submitting}
          loadingLabel="Submitting remittance"
          onPress={() => void onSubmit()}
        />
      </Card>

      {showDatePicker ? (
        <DateTimePicker
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          mode="date"
          value={dueDate}
          onChange={onDateChange}
        />
      ) : null}
      <FullScreenBlockingLoader
        visible={submitting}
        activeStep={1}
        message="Recording the collection, updating remittance history, and refreshing assignment context."
        steps={[
          'Preparing collection data',
          'Recording remittance',
          'Refreshing assignment history',
        ]}
        title="Processing remittance"
        variant="remittance"
      />
    </Screen>
  );
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

function formatDateOnly(value: string, locale?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale ?? undefined, {
    dateStyle: 'medium',
  }).format(date);
}

function formatMajorAmount(amountMinorUnits: number, minorUnit?: number | null) {
  const safeMinorUnit =
    typeof minorUnit === 'number' && Number.isInteger(minorUnit) && minorUnit >= 0 ? minorUnit : 2;
  return (amountMinorUnits / getCurrencyMultiplier(safeMinorUnit)).toFixed(safeMinorUnit);
}

function historyTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'completed' || status === 'partially_settled') {
    return 'success';
  }
  if (status === 'disputed' || status === 'cancelled_due_to_assignment_end') {
    return 'danger';
  }
  if (status === 'pending') {
    return 'warning';
  }
  return 'neutral';
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
  muted: {
    color: tokens.colors.inkSoft,
    lineHeight: 20,
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  historyButton: {
    minHeight: 40,
  },
  option: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  optionSelected: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primaryTint,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    color: tokens.colors.ink,
    fontWeight: '700',
  },
  historyRow: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
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
  helper: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  queueNote: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    backgroundColor: '#F8FAFC',
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  queueTitle: {
    color: tokens.colors.ink,
    fontWeight: '700',
  },
});

export default RemittanceScreen;
