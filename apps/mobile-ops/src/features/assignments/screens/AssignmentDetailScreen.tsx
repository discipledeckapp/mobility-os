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
import { FullScreenBlockingLoader, InlineProcessingCard, SkeletonCard } from '../../../components/processing-state';
import { Screen } from '../../../components/screen';
import { mobileEnv } from '../../../config/env';
import { OFFLINE_ACTION_TYPE } from '../../../constants';
import { useAuth } from '../../../contexts/auth-context';
import { useSelfService } from '../../../contexts/self-service-context';
import { useToast } from '../../../contexts/toast-context';
import { useDriverProfile } from '../../../hooks/use-driver-profile';
import type { ScreenProps } from '../../../navigation/types';
import {
  acceptDriverAssignmentTerms,
  cancelDriverAssignment,
  completeDriverAssignment,
  declineDriverAssignment,
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
  const [remittanceNotes, setRemittanceNotes] = useState('');
  const [showRemittanceDatePicker, setShowRemittanceDatePicker] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentCategory, setIncidentCategory] = useState('collision');
  const [incidentSeverity, setIncidentSeverity] = useState('minor');
  const [incidentEstimatedCost, setIncidentEstimatedCost] = useState('');
  const processingVariant = showIncidentSheet
    ? 'generic_action'
    : showRemittanceSheet
      ? 'remittance'
      : 'assignment';
  const processingTitle = showIncidentSheet
    ? 'Submitting vehicle incident'
    : showRemittanceSheet
      ? 'Recording remittance'
      : 'Updating assignment';
  const processingMessage = showIncidentSheet
    ? 'Saving the incident report and attaching it to the assignment record.'
    : showRemittanceSheet
      ? 'Recording the collection and refreshing assignment finance status.'
      : 'Applying the assignment change and refreshing the latest driver context.';

  const canWriteAssignments = useMemo(
    () => Boolean(session?.linkedDriverId) || session?.permissions.includes('assignments:write') || false,
    [session?.linkedDriverId, session?.permissions],
  );
  const currencyCode = session?.defaultCurrency ?? '';
  const supportsRemittance =
    !assignment?.paymentModel ||
    assignment.paymentModel === 'remittance' ||
    assignment.paymentModel === 'hire_purchase';
  const activationState = assignment ? getAssignmentActivationState(assignment) : 'awaiting_confirmation';
  const paymentModelLabel = assignment ? getPaymentModelLabel(assignment) : 'Remittance';
  const expectedAmountLabel = assignment ? getExpectedAmountLabel(assignment, session?.formattingLocale) : null;
  const frequencyLabel = assignment ? getFrequencyLabel(assignment) : null;

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
      | typeof OFFLINE_ACTION_TYPE.assignmentAccept
      | typeof OFFLINE_ACTION_TYPE.assignmentDecline
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
          | typeof OFFLINE_ACTION_TYPE.assignmentAccept
          | typeof OFFLINE_ACTION_TYPE.assignmentDecline
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
    const clientReferenceId = `remittance-${assignment.id}-${Date.now()}`;
    const payload = {
      assignmentId: assignment.id,
      amountMinorUnits,
      currency: currencyCode,
      dueDate: remittanceDate.toISOString().slice(0, 10),
      ...(remittanceNotes.trim() ? { notes: remittanceNotes.trim() } : {}),
      clientReferenceId,
      submissionSource: 'online' as const,
      syncStatus: 'synced' as const,
      originalCapturedAt: new Date().toISOString(),
      evidence: remittanceNotes.trim()
        ? { note: remittanceNotes.trim(), capturedOffline: false }
        : undefined,
    };

    try {
      await submitRemittance(payload);
      setShowRemittanceSheet(false);
      setRemittanceAmount('');
      setRemittanceNotes('');
      setRemittanceDate(new Date());
      showToast('Remittance submitted successfully.', 'success');
    } catch (error) {
      if (mobileEnv.enableOfflineQueue && isNetworkError(error)) {
        await enqueueOfflineAction({
          type: OFFLINE_ACTION_TYPE.remittanceRecord,
          payload: {
            ...payload,
            submissionSource: 'offline_queue',
            syncStatus: 'offline_submitted',
            evidence: remittanceNotes.trim()
              ? { note: remittanceNotes.trim(), capturedOffline: true }
              : { capturedOffline: true },
          },
        });
        setShowRemittanceSheet(false);
        setRemittanceAmount('');
        setRemittanceNotes('');
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
        <InlineProcessingCard
          activeStep={1}
          message="Loading assignment detail, refreshing readiness signals, and preparing driver actions."
          steps={[
            'Loading assignment detail',
            'Refreshing readiness status',
            'Preparing field actions',
          ]}
          title="Preparing assignment workspace"
          variant="assignment"
        />
        <SkeletonCard lines={3} />
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
            <Text style={styles.kicker}>Driver activation</Text>
            <Badge label={activationStateLabel(activationState)} tone={activationStateTone(activationState)} />
          </View>
          <Text style={styles.title}>Your assigned vehicle is ready</Text>
          <Text style={styles.muted}>{activationStateGuidance(activationState)}</Text>
          {expectedAmountLabel ? (
            <View style={styles.amountPanel}>
              <Text style={styles.amountLabel}>Expected amount</Text>
              <Text style={styles.amountValue}>{expectedAmountLabel}</Text>
              {frequencyLabel ? <Text style={styles.amountHint}>{frequencyLabel}</Text> : null}
            </View>
          ) : null}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Vehicle</Text>
              <Text style={styles.summaryValue}>{`${assignment.vehicle.make} ${assignment.vehicle.model}`}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Plate</Text>
              <Text style={styles.summaryValue}>{assignment.vehicle.plate ?? 'Not recorded'}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Vehicle code</Text>
              <Text style={styles.summaryValue}>
                {assignment.vehicle.tenantVehicleCode ?? assignment.vehicle.systemVehicleCode ?? 'Not recorded'}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Payment model</Text>
              <Text style={styles.summaryValue}>{paymentModelLabel}</Text>
            </View>
          </View>
          {assignment.notes ? <Text style={styles.meta}>Notes: {assignment.notes}</Text> : null}
          {supportsRemittance && assignment.financialContract ? (
            <Text style={styles.meta}>Contract: {assignment.financialContract.display.expectedRemittanceTerms}</Text>
          ) : null}
          {supportsRemittance && assignment.financialContract ? (
            <>
              <Text style={styles.meta}>
                Paid so far:{' '}
                {(assignment.financialContract.summary.cumulativePaidAmountMinorUnits / 100).toLocaleString(
                  session?.formattingLocale ?? 'en-NG',
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                )}{' '}
                {assignment.financialContract.currency}
              </Text>
              {assignment.financialContract.summary.outstandingBalanceMinorUnits !== null &&
              assignment.financialContract.summary.outstandingBalanceMinorUnits !== undefined ? (
                <Text style={styles.meta}>
                  Remaining balance:{' '}
                  {(assignment.financialContract.summary.outstandingBalanceMinorUnits / 100).toLocaleString(
                    session?.formattingLocale ?? 'en-NG',
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}{' '}
                  {assignment.financialContract.currency}
                </Text>
              ) : null}
              {assignment.financialContract.summary.nextDueDate ? (
                <Text style={styles.meta}>
                  Next due: {assignment.financialContract.summary.nextDueDate} ·{' '}
                  {((assignment.financialContract.summary.nextDueAmountMinorUnits ?? 0) / 100).toLocaleString(
                    session?.formattingLocale ?? 'en-NG',
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}{' '}
                  {assignment.financialContract.currency}
                </Text>
              ) : null}
            </>
          ) : null}
        </Card>

        {driver && !isOnboardingComplete(driver) ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Driver readiness</Text>
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
          </Card>
        ) : null}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>What do you do now?</Text>
          {!canWriteAssignments ? (
            <Text style={styles.muted}>
              This account can review assignment details but cannot change assignment status.
            </Text>
          ) : (
            <View style={styles.actions}>
              {activationState === 'awaiting_confirmation' ? (
                <>
                  <Button
                    accessibilityHint="Accept this assignment and confirm that you are ready to begin"
                    containerStyle={styles.primaryAction}
                    label="Accept assignment"
                    loading={submitting}
                    loadingLabel="Accepting assignment"
                    onPress={() =>
                      void runAction(
                        () => acceptDriverAssignmentTerms(assignment.id),
                        'Assignment accepted.',
                        {
                          type: OFFLINE_ACTION_TYPE.assignmentAccept,
                          payload: { assignmentId: assignment.id },
                          message:
                            'You are offline. The acceptance has been queued and will sync when you reconnect.',
                        },
                      )
                    }
                  />
                  <Button
                    accessibilityHint="Reject this assignment"
                    containerStyle={styles.secondaryAction}
                    label="Reject assignment"
                    loading={submitting}
                    loadingLabel="Rejecting assignment"
                    variant="secondary"
                    onPress={() =>
                      void runAction(
                        () => declineDriverAssignment(assignment.id),
                        'Assignment rejected.',
                        {
                          type: OFFLINE_ACTION_TYPE.assignmentDecline,
                          payload: { assignmentId: assignment.id },
                          message:
                            'You are offline. The decline has been queued and will sync when you reconnect.',
                        },
                      )
                    }
                  />
                </>
              ) : null}
              {activationState === 'accepted_ready' ? (
                <Button
                  accessibilityHint="Begin this assignment"
                  containerStyle={styles.primaryAction}
                  label="Begin assignment"
                  loading={submitting}
                  loadingLabel="Beginning assignment"
                  onPress={() =>
                    void runAction(
                      () => startDriverAssignment(assignment.id),
                      'Assignment is now active.',
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
              {activationState === 'active' ? (
                <>
                  <Button
                    accessibilityHint="Mark this assignment as completed"
                    containerStyle={styles.primaryAction}
                    label="End assignment"
                    loading={submitting}
                    loadingLabel="Ending assignment"
                    onPress={() =>
                      void runAction(
                        () => completeDriverAssignment(assignment.id),
                        'Assignment has been ended.',
                        {
                          type: OFFLINE_ACTION_TYPE.assignmentComplete,
                          payload: { assignmentId: assignment.id },
                          message:
                            'You are offline. The end action has been queued and will sync when you reconnect.',
                        },
                      )
                    }
                  />
                  {supportsRemittance ? (
                    <>
                      <Button
                        accessibilityHint="Open the remittance quick sheet"
                        label="Record remittance"
                        variant="secondary"
                        onPress={() => setShowRemittanceSheet(true)}
                      />
                      <Button
                        accessibilityHint="Open remittance history for this driver"
                        label="View remittance history"
                        variant="secondary"
                        onPress={() => navigation.navigate('RemittanceHistory')}
                      />
                    </>
                  ) : null}
                  <Button
                    accessibilityHint="Report a vehicle issue linked to this assignment"
                    label="Report vehicle incident"
                    variant="secondary"
                    onPress={() => setShowIncidentSheet(true)}
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

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>What happens next</Text>
          {activationState === 'awaiting_confirmation' ? (
            <Text style={styles.muted}>
              Accept this assignment to confirm that you are taking responsibility for this vehicle.
              Once accepted, you can begin operations and any remittance actions will appear here when required.
            </Text>
          ) : activationState === 'accepted_ready' ? (
            <Text style={styles.muted}>
              Your assignment has been accepted. Begin the assignment when you are ready to start operating this vehicle.
            </Text>
          ) : supportsRemittance ? (
            <Text style={styles.muted}>
              This assignment is active. Record remittance as collections are made, and use remittance history to track what has already been submitted.
            </Text>
          ) : (
            <Text style={styles.muted}>
              This assignment is active. Continue operating the vehicle and use the available assignment actions when something changes.
            </Text>
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

      {supportsRemittance ? (
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
            <Input
              helperText="Optional evidence note for partial-day returns, cash handover, or disputes."
              label="Evidence / notes"
              multiline
              onChangeText={setRemittanceNotes}
              value={remittanceNotes}
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
                loadingLabel="Submitting remittance"
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
      ) : null}

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
              <Button
                label="Submit"
                loading={submitting}
                loadingLabel="Submitting incident"
                onPress={() => void onSubmitIncident()}
              />
            </View>
          </View>
        </View>
      </Modal>
      <FullScreenBlockingLoader
        visible={submitting}
        activeStep={1}
        message={processingMessage}
        steps={
          showIncidentSheet
            ? ['Capturing incident details', 'Saving incident record', 'Refreshing assignment']
            : showRemittanceSheet
              ? ['Preparing collection data', 'Recording remittance', 'Refreshing assignment']
              : ['Applying assignment action', 'Syncing operational state', 'Refreshing assignment']
        }
        title={processingTitle}
        variant={processingVariant}
      />
    </>
  );
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function isOnboardingComplete(driver: {
  identityStatus: string;
  hasApprovedLicence: boolean;
  requiredDriverDocumentSlugs?: string[];
}) {
  const licenceRequired = driver.requiredDriverDocumentSlugs?.includes('drivers-license') ?? true;
  return driver.identityStatus === 'verified' && (!licenceRequired || driver.hasApprovedLicence);
}

function getAssignmentActivationState(assignment: AssignmentRecord) {
  if (
    assignment.contractStatus !== 'accepted' ||
    ['driver_action_required', 'pending_driver_confirmation', 'created'].includes(assignment.status)
  ) {
    return 'awaiting_confirmation' as const;
  }
  if (assignment.status === 'accepted') {
    return 'accepted_ready' as const;
  }
  if (assignment.status === 'active') {
    return 'active' as const;
  }
  if (assignment.status === 'declined' || assignment.status === 'cancelled') {
    return 'cancelled' as const;
  }
  return 'ended' as const;
}

function activationStateLabel(
  state: ReturnType<typeof getAssignmentActivationState>,
) {
  switch (state) {
    case 'awaiting_confirmation':
      return 'Awaiting your confirmation';
    case 'accepted_ready':
      return 'Accepted • Ready to begin';
    case 'active':
      return 'Active';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Completed';
  }
}

function activationStateTone(
  state: ReturnType<typeof getAssignmentActivationState>,
): 'neutral' | 'success' | 'warning' | 'danger' {
  if (state === 'awaiting_confirmation') {
    return 'warning';
  }
  if (state === 'accepted_ready' || state === 'active') {
    return 'success';
  }
  if (state === 'cancelled') {
    return 'danger';
  }
  return 'neutral';
}

function activationStateGuidance(state: ReturnType<typeof getAssignmentActivationState>) {
  if (state === 'awaiting_confirmation') {
    return 'Review the vehicle details below and accept the assignment to move into operations.';
  }
  if (state === 'accepted_ready') {
    return 'You have accepted this assignment. Begin it when you are ready to start operating.';
  }
  if (state === 'active') {
    return 'This assignment is active. Use the actions below to manage remittance, incidents, and completion.';
  }
  if (state === 'cancelled') {
    return 'This assignment is no longer available for operations.';
  }
  return 'This assignment has been completed.';
}

function getPaymentModelLabel(assignment: AssignmentRecord) {
  const raw =
    assignment.paymentModel ??
    (assignment.financialContract?.contractType === 'hire_purchase' ? 'hire_purchase' : 'remittance');
  if (raw === 'hire_purchase') {
    return 'Hire purchase';
  }
  if (raw === 'salary') {
    return 'Salary';
  }
  if (raw === 'commission') {
    return 'Commission';
  }
  return 'Remittance';
}

function getExpectedAmountLabel(assignment: AssignmentRecord, locale?: string | null) {
  const currency =
    assignment.financialContract?.currency ?? assignment.remittanceCurrency ?? 'NGN';
  const amountMinorUnits =
    assignment.financialContract?.summary.nextDueAmountMinorUnits ??
    assignment.financialContract?.summary.expectedPerPeriodAmountMinorUnits ??
    assignment.remittanceAmountMinorUnits ??
    null;
  if (amountMinorUnits === null || amountMinorUnits === undefined) {
    return null;
  }
  return formatCurrencyFromMinorUnits(amountMinorUnits, currency, locale);
}

function getFrequencyLabel(assignment: AssignmentRecord) {
  const raw =
    assignment.financialContract?.schedule.frequency ?? assignment.remittanceFrequency ?? null;
  if (!raw) {
    return null;
  }
  return `${formatStatusLabel(raw)} collection`;
}

function formatCurrencyFromMinorUnits(
  amountMinorUnits: number,
  currency: string,
  locale?: string | null,
) {
  return new Intl.NumberFormat(locale ?? 'en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
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
  if (status === 'ended') {
    return 'success';
  }
  if (status === 'cancelled' || status === 'declined') {
    return 'danger';
  }
  if (
    status === 'pending_driver_confirmation' ||
    status === 'driver_action_required' ||
    status === 'accepted' ||
    status === 'created' ||
    status === 'active'
  ) {
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
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  kicker: {
    color: tokens.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  amountPanel: {
    gap: tokens.spacing.xs,
    borderWidth: 0,
    borderRadius: tokens.radius.card,
    backgroundColor: '#F8FAFC',
    padding: tokens.spacing.lg,
  },
  amountLabel: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountValue: {
    color: tokens.colors.ink,
    fontSize: 34,
    fontWeight: '800',
  },
  amountHint: {
    color: tokens.colors.primaryDark,
    fontSize: 15,
    fontWeight: '600',
  },
  summaryGrid: {
    gap: tokens.spacing.sm,
  },
  summaryCard: {
    gap: tokens.spacing.xs,
    borderWidth: 0,
    borderRadius: tokens.radius.card,
    backgroundColor: '#F8FAFC',
    padding: tokens.spacing.md,
  },
  summaryLabel: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryValue: {
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    gap: tokens.spacing.sm,
  },
  primaryAction: {
    minHeight: 56,
    shadowColor: tokens.colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  secondaryAction: {
    minHeight: 52,
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
