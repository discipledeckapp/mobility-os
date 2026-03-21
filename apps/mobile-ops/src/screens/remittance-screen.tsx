import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { isNetworkError } from '../api';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { EmptyState } from '../components/empty-state';
import { Input } from '../components/input';
import { LoadingSkeleton } from '../components/loading-skeleton';
import { Screen } from '../components/screen';
import { mobileEnv } from '../config/env';
import { OFFLINE_ACTION_TYPE } from '../constants';
import { useAuth } from '../contexts/auth-context';
import { useToast } from '../contexts/toast-context';
import { useAssignments } from '../hooks/use-assignments';
import { getCurrencyLabel } from '../lib/currency';
import { enqueueOfflineAction } from '../services/offline-queue-service';
import { convertMajorToMinorUnits, submitRemittance } from '../services/remittance-service';
import { tokens } from '../theme/tokens';
import type { ScreenProps } from './index';

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

  const selectedAssignment = useMemo(
    () => eligibleAssignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null,
    [eligibleAssignments, selectedAssignmentId],
  );

  const onRefresh = async () => {
    try {
      await refreshAssignments();
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
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Card style={styles.section}>
        <Text style={styles.title}>Record collection</Text>
        <Text style={styles.muted}>
          Select the assignment this payment belongs to, then record the amount and date.
        </Text>
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
  muted: {
    color: tokens.colors.inkSoft,
    lineHeight: 20,
  },
  option: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 14,
    padding: 14,
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
    gap: 4,
    flexShrink: 1,
  },
  optionTitle: {
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  dateField: {
    gap: 6,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.ink,
  },
  dateButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  dateButtonLabel: {
    color: tokens.colors.ink,
    fontSize: 16,
  },
  helper: {
    fontSize: 12,
    color: tokens.colors.inkSoft,
  },
  notesInput: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
});
