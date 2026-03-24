'use client';

import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { isNetworkError, listRemittanceHistory, type RemittanceRecord } from '../../../api';
import { Badge } from '../../../components/badge';
import { BottomNav } from '../../../components/bottom-nav';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import { mobileEnv } from '../../../config/env';
import { OFFLINE_ACTION_TYPE } from '../../../constants';
import { useAuth } from '../../../contexts/auth-context';
import { useToast } from '../../../contexts/toast-context';
import { useAssignments } from '../../../hooks/use-assignments';
import { getCurrencyLabel } from '../../../lib/currency';
import type { ScreenProps } from '../../../navigation/types';
import { enqueueOfflineAction } from '../../../services/offline-queue-service';
import {
  convertMajorToMinorUnits,
  getCurrencyMultiplier,
  submitRemittance,
} from '../../../services/remittance-service';
import { tokens } from '../../../theme/tokens';

export function RemittanceScreen({ navigation, route }: ScreenProps<'Remittance'>) {
  const { session } = useAuth();
  const { showToast } = useToast();
  const { assignments, loading, refreshing, refreshAssignments } = useAssignments();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(
    route.params?.assignmentId ?? '',
  );
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [history, setHistory] = useState<RemittanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const eligibleAssignments = useMemo(
    () => assignments.filter((assignment) => ['active', 'completed'].includes(assignment.status)),
    [assignments],
  );
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

  const selectedAssignment = useMemo(
    () => eligibleAssignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null,
    [eligibleAssignments, selectedAssignmentId],
  );

  const onRefresh = async () => {
    try {
      const [records] = await Promise.all([listRemittanceHistory().catch(() => history), refreshAssignments()]);
      setHistory(records);
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
    const payload = {
      assignmentId: selectedAssignment.id,
      amountMinorUnits,
      currency: session.defaultCurrency,
      dueDate: dueDate.toISOString().slice(0, 10),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    try {
      await submitRemittance(payload);
      const records = await listRemittanceHistory().catch(() => history);
      setHistory(records);
      showToast('The collection has been recorded successfully.', 'success');
      navigation.goBack();
    } catch (error) {
      if (mobileEnv.enableOfflineQueue && isNetworkError(error)) {
        await enqueueOfflineAction({
          type: OFFLINE_ACTION_TYPE.remittanceRecord,
          payload,
        });
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
          <>
            <LoadingSkeleton height={72} />
            <LoadingSkeleton height={72} />
          </>
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
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Assignment</Text>
        {loading ? (
          <>
            <LoadingSkeleton height={72} />
            <LoadingSkeleton height={72} />
          </>
        ) : eligibleAssignments.length === 0 ? (
          <EmptyState
            actionLabel="Refresh assignments"
            message="No active or completed assignments are ready for remittance recording yet."
            title="No assignments available"
            onAction={() => void onRefresh()}
          />
        ) : (
          eligibleAssignments.map((assignment) => (
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
                    Started {formatDateTime(assignment.startedAt, session?.formattingLocale)}
                  </Text>
                </View>
                <Badge
                  label={assignment.status.toUpperCase()}
                  tone={assignment.status === 'completed' ? 'success' : 'warning'}
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
          helperText={`The app converts this to minor units using ${
            session?.currencyMinorUnit ?? 2
          } decimal place${session?.currencyMinorUnit === 1 ? '' : 's'} before submit.`}
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

        <Input
          accessibilityHint="Optional note about this collection"
          label="Notes"
          multiline
          onChangeText={setNotes}
          style={styles.notesInput}
          value={notes}
        />
        <Button
          accessibilityHint="Submit this remittance record"
          label="Submit remittance"
          loading={submitting}
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
    </Screen>
  );
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

function formatMajorAmount(amountMinorUnits: number, minorUnit?: number | null) {
  const safeMinorUnit =
    typeof minorUnit === 'number' && Number.isInteger(minorUnit) && minorUnit >= 0 ? minorUnit : 2;
  return (amountMinorUnits / getCurrencyMultiplier(safeMinorUnit)).toFixed(safeMinorUnit);
}

function historyTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'confirmed') {
    return 'success';
  }
  if (status === 'disputed') {
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
});

export default RemittanceScreen;
