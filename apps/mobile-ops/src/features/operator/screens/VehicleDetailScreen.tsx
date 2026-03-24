'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import {
  createVehicleIncident,
  createVehicleInspection,
  createVehicleMaintenanceEvent,
  getVehicle,
  updateVehicle,
  updateVehicleStatus,
  upsertVehicleMaintenanceSchedule,
} from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatDateTime, formatStatusLabel } from '../../../utils/formatting';
import { assignmentStatusTone } from '../../../utils/status';

function formatMoney(amountMinorUnits?: number | null, currency = 'NGN') {
  if (amountMinorUnits === undefined || amountMinorUnits === null) {
    return 'Not recorded';
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatMaybeDate(value?: string | null) {
  return value ? formatDateTime(value) : 'Not scheduled';
}

export function VehicleDetailScreen({ route }: ScreenProps<'OperatorVehicleDetail'>) {
  const vehicleQuery = useQuery({
    queryKey: ['operator-vehicle', route.params.vehicleId],
    queryFn: () => getVehicle(route.params.vehicleId),
  });

  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [vin, setVin] = useState('');
  const [tenantVehicleCode, setTenantVehicleCode] = useState('');
  const [odometerKm, setOdometerKm] = useState('');

  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionSummary, setInspectionSummary] = useState('');
  const [inspectionOdometerKm, setInspectionOdometerKm] = useState('');
  const [inspectionNextDueAt, setInspectionNextDueAt] = useState('');

  const [scheduleType, setScheduleType] = useState('preventive_service');
  const [scheduleIntervalDays, setScheduleIntervalDays] = useState('');
  const [scheduleIntervalKm, setScheduleIntervalKm] = useState('');
  const [scheduleNextDueAt, setScheduleNextDueAt] = useState('');
  const [scheduleNextDueKm, setScheduleNextDueKm] = useState('');

  const [maintenanceTitle, setMaintenanceTitle] = useState('');
  const [maintenanceScheduledFor, setMaintenanceScheduledFor] = useState('');
  const [maintenanceCost, setMaintenanceCost] = useState('');
  const [maintenanceVendor, setMaintenanceVendor] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentOccurredAt, setIncidentOccurredAt] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState('moderate');
  const [incidentCost, setIncidentCost] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');

  const vehicle = vehicleQuery.data;

  const refreshVehicle = async (message?: string) => {
    await vehicleQuery.refetch();
    if (message) {
      Alert.alert('Vehicle updated', message);
    }
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      updateVehicle(route.params.vehicleId, {
        plate: plate.trim() || undefined,
        color: color.trim() || undefined,
        vin: vin.trim() || undefined,
        tenantVehicleCode: tenantVehicleCode.trim() || undefined,
        odometerKm: odometerKm.trim() ? Number.parseInt(odometerKm, 10) : undefined,
      }),
    onSuccess: async () => {
      await refreshVehicle('Vehicle details have been updated.');
    },
    onError: (error) => {
      Alert.alert(
        'Vehicle update',
        error instanceof Error ? error.message : 'Unable to update vehicle details.',
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateVehicleStatus(route.params.vehicleId, status),
    onSuccess: async () => {
      await refreshVehicle('Vehicle status has been updated.');
    },
    onError: (error) => {
      Alert.alert(
        'Vehicle status',
        error instanceof Error ? error.message : 'Unable to update vehicle status.',
      );
    },
  });

  const inspectionMutation = useMutation({
    mutationFn: () =>
      createVehicleInspection(route.params.vehicleId, {
        inspectionType: 'routine',
        status: 'passed',
        inspectionDate: inspectionDate.trim() || new Date().toISOString(),
        odometerKm: inspectionOdometerKm.trim()
          ? Number.parseInt(inspectionOdometerKm, 10)
          : undefined,
        summary: inspectionSummary.trim(),
        reportSource: 'in_app',
        nextInspectionDueAt: inspectionNextDueAt.trim() || undefined,
      }),
    onSuccess: async () => {
      setInspectionSummary('');
      setInspectionDate('');
      setInspectionOdometerKm('');
      setInspectionNextDueAt('');
      await refreshVehicle('Inspection saved.');
    },
    onError: (error) => {
      Alert.alert(
        'Inspection',
        error instanceof Error ? error.message : 'Unable to save inspection.',
      );
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: () =>
      upsertVehicleMaintenanceSchedule(route.params.vehicleId, {
        scheduleType: scheduleType.trim() || 'preventive_service',
        intervalDays: scheduleIntervalDays.trim()
          ? Number.parseInt(scheduleIntervalDays, 10)
          : undefined,
        intervalKm: scheduleIntervalKm.trim()
          ? Number.parseInt(scheduleIntervalKm, 10)
          : undefined,
        nextDueAt: scheduleNextDueAt.trim() || undefined,
        nextDueOdometerKm: scheduleNextDueKm.trim()
          ? Number.parseInt(scheduleNextDueKm, 10)
          : undefined,
        source: 'operator_mobile',
        isActive: true,
      }),
    onSuccess: async () => {
      await refreshVehicle('Maintenance schedule saved.');
    },
    onError: (error) => {
      Alert.alert(
        'Maintenance schedule',
        error instanceof Error ? error.message : 'Unable to save maintenance schedule.',
      );
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: () =>
      createVehicleMaintenanceEvent(route.params.vehicleId, {
        category: 'preventive_service',
        title: maintenanceTitle.trim() || 'Preventive service',
        status: 'scheduled',
        scheduledFor: maintenanceScheduledFor.trim() || new Date().toISOString(),
        vendor: maintenanceVendor.trim() || undefined,
        description: maintenanceNotes.trim() || undefined,
        costMinorUnits: maintenanceCost.trim() ? Math.round(Number(maintenanceCost) * 100) : undefined,
        currency: 'NGN',
      }),
    onSuccess: async () => {
      setMaintenanceTitle('');
      setMaintenanceScheduledFor('');
      setMaintenanceCost('');
      setMaintenanceVendor('');
      setMaintenanceNotes('');
      await refreshVehicle('Maintenance event saved.');
    },
    onError: (error) => {
      Alert.alert(
        'Maintenance event',
        error instanceof Error ? error.message : 'Unable to save maintenance event.',
      );
    },
  });

  const incidentMutation = useMutation({
    mutationFn: () =>
      createVehicleIncident(route.params.vehicleId, {
        title: incidentTitle.trim(),
        occurredAt: incidentOccurredAt.trim() || new Date().toISOString(),
        category: 'incident',
        severity: incidentSeverity.trim() || 'moderate',
        description: incidentDescription.trim() || undefined,
        estimatedCostMinorUnits: incidentCost.trim() ? Math.round(Number(incidentCost) * 100) : undefined,
        currency: 'NGN',
      }),
    onSuccess: async () => {
      setIncidentTitle('');
      setIncidentOccurredAt('');
      setIncidentCost('');
      setIncidentDescription('');
      await refreshVehicle('Incident logged.');
    },
    onError: (error) => {
      Alert.alert(
        'Incident',
        error instanceof Error ? error.message : 'Unable to log incident.',
      );
    },
  });

  if (vehicleQuery.isLoading || !vehicle) {
    return (
      <Screen>
        <Card>
          <LoadingSkeleton height={180} />
        </Card>
      </Screen>
    );
  }

  const economics = vehicle.economics;
  const valuationCurrency = economics?.valuationCurrency ?? 'NGN';

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={vehicleQuery.isRefetching} onRefresh={() => void vehicleQuery.refetch()} />
      }
    >
      <Card style={styles.section}>
        <Text style={styles.title}>{vehicle.tenantVehicleCode || vehicle.systemVehicleCode}</Text>
        <Badge label={formatStatusLabel(vehicle.status)} tone={assignmentStatusTone(vehicle.status)} />
        <Text style={styles.meta}>
          {vehicle.make} {vehicle.model} {vehicle.year}
        </Text>
        <Text style={styles.meta}>Fleet: {vehicle.fleetName ?? vehicle.fleetId}</Text>
        <Text style={styles.meta}>
          Odometer: {vehicle.odometerKm ? `${vehicle.odometerKm.toLocaleString('en-NG')} km` : 'Not recorded'}
        </Text>
        <Text style={styles.meta}>{vehicle.maintenanceSummary ?? 'No maintenance summary yet.'}</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Edit vehicle details</Text>
        <Input label="Organisation vehicle code" onChangeText={setTenantVehicleCode} placeholder={vehicle.tenantVehicleCode} value={tenantVehicleCode} />
        <Input label="Plate" onChangeText={setPlate} placeholder={vehicle.plate ?? ''} value={plate} />
        <Input label="Color" onChangeText={setColor} placeholder={vehicle.color ?? ''} value={color} />
        <Input label="VIN" onChangeText={setVin} placeholder={vehicle.vin ?? ''} value={vin} />
        <Input
          keyboardType="numeric"
          label="Current odometer (km)"
          onChangeText={setOdometerKm}
          placeholder={vehicle.odometerKm?.toString() ?? ''}
          value={odometerKm}
        />
        <Button label="Save vehicle details" loading={updateMutation.isPending} onPress={() => updateMutation.mutate()} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Status actions</Text>
        <Button label="Mark available" variant="secondary" loading={statusMutation.isPending} onPress={() => statusMutation.mutate('available')} />
        <Button label="Mark maintenance" variant="secondary" loading={statusMutation.isPending} onPress={() => statusMutation.mutate('maintenance')} />
        <Button label="Mark retired" variant="secondary" loading={statusMutation.isPending} onPress={() => statusMutation.mutate('retired')} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Economics</Text>
        <Text style={styles.meta}>Revenue: {formatMoney(economics?.confirmedRevenueMinorUnits, valuationCurrency)}</Text>
        <Text style={styles.meta}>Expenses: {formatMoney(economics?.trackedExpenseMinorUnits, valuationCurrency)}</Text>
        <Text style={styles.meta}>Profit / loss: {formatMoney(economics?.profitMinorUnits, valuationCurrency)}</Text>
        <Text style={styles.meta}>
          Recommendation: {economics?.recommendation ? formatStatusLabel(economics.recommendation) : 'Not available'}
        </Text>
        <Text style={styles.meta}>
          Maintenance due: {vehicle.maintenanceDue?.dueCount ?? 0} due, {vehicle.maintenanceDue?.overdueCount ?? 0} overdue
        </Text>
        <Text style={styles.meta}>Next due: {formatMaybeDate(vehicle.maintenanceDue?.nextDueAt)}</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Log inspection</Text>
        <Input label="Inspection summary" multiline onChangeText={setInspectionSummary} style={styles.multilineInput} value={inspectionSummary} />
        <Input label="Inspection date (ISO)" onChangeText={setInspectionDate} placeholder="2026-03-24T09:00:00.000Z" value={inspectionDate} />
        <Input keyboardType="numeric" label="Odometer (km)" onChangeText={setInspectionOdometerKm} value={inspectionOdometerKm} />
        <Input label="Next due date (ISO)" onChangeText={setInspectionNextDueAt} placeholder="2026-04-24T09:00:00.000Z" value={inspectionNextDueAt} />
        <Button
          disabled={!inspectionSummary.trim()}
          label="Save inspection"
          loading={inspectionMutation.isPending}
          onPress={() => inspectionMutation.mutate()}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Preventive maintenance schedule</Text>
        <Input label="Schedule type" onChangeText={setScheduleType} value={scheduleType} />
        <Input keyboardType="numeric" label="Repeat every (days)" onChangeText={setScheduleIntervalDays} value={scheduleIntervalDays} />
        <Input keyboardType="numeric" label="Repeat every (km)" onChangeText={setScheduleIntervalKm} value={scheduleIntervalKm} />
        <Input label="Next due date (ISO)" onChangeText={setScheduleNextDueAt} placeholder="2026-04-24T09:00:00.000Z" value={scheduleNextDueAt} />
        <Input keyboardType="numeric" label="Next due odometer (km)" onChangeText={setScheduleNextDueKm} value={scheduleNextDueKm} />
        <Button label="Save maintenance schedule" loading={scheduleMutation.isPending} onPress={() => scheduleMutation.mutate()} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Maintenance activity</Text>
        <Input label="Title" onChangeText={setMaintenanceTitle} value={maintenanceTitle} />
        <Input label="Scheduled for (ISO)" onChangeText={setMaintenanceScheduledFor} placeholder="2026-03-24T09:00:00.000Z" value={maintenanceScheduledFor} />
        <Input label="Service provider" onChangeText={setMaintenanceVendor} value={maintenanceVendor} />
        <Input keyboardType="numeric" label="Cost" onChangeText={setMaintenanceCost} value={maintenanceCost} />
        <Input label="Notes" multiline onChangeText={setMaintenanceNotes} style={styles.multilineInput} value={maintenanceNotes} />
        <Button label="Save maintenance event" loading={maintenanceMutation.isPending} onPress={() => maintenanceMutation.mutate()} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Incident report</Text>
        <Input label="Incident title" onChangeText={setIncidentTitle} value={incidentTitle} />
        <Input label="Occurred at (ISO)" onChangeText={setIncidentOccurredAt} placeholder="2026-03-24T09:00:00.000Z" value={incidentOccurredAt} />
        <Input label="Severity" onChangeText={setIncidentSeverity} value={incidentSeverity} />
        <Input keyboardType="numeric" label="Estimated cost" onChangeText={setIncidentCost} value={incidentCost} />
        <Input label="Description" multiline onChangeText={setIncidentDescription} style={styles.multilineInput} value={incidentDescription} />
        <Button
          disabled={!incidentTitle.trim()}
          label="Log incident"
          loading={incidentMutation.isPending}
          onPress={() => incidentMutation.mutate()}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Recent history</Text>
        <View style={styles.timeline}>
          {vehicle.inspections?.slice(0, 3).map((inspection) => (
            <View key={inspection.id} style={styles.timelineItem}>
              <Text style={styles.timelineTitle}>Inspection: {formatStatusLabel(inspection.inspectionType)}</Text>
              <Text style={styles.meta}>{inspection.summary}</Text>
              <Text style={styles.meta}>{formatMaybeDate(inspection.inspectionDate)}</Text>
            </View>
          ))}
          {vehicle.maintenanceEvents?.slice(0, 3).map((event) => (
            <View key={event.id} style={styles.timelineItem}>
              <Text style={styles.timelineTitle}>Maintenance: {event.title}</Text>
              <Text style={styles.meta}>{event.description ?? formatStatusLabel(event.category)}</Text>
              <Text style={styles.meta}>{formatMaybeDate(event.completedAt ?? event.scheduledFor)}</Text>
            </View>
          ))}
          {vehicle.incidents?.slice(0, 3).map((incident) => (
            <View key={incident.id} style={styles.timelineItem}>
              <Text style={styles.timelineTitle}>Incident: {incident.title}</Text>
              <Text style={styles.meta}>{incident.description ?? formatStatusLabel(incident.severity)}</Text>
              <Text style={styles.meta}>{formatMaybeDate(incident.occurredAt)}</Text>
            </View>
          ))}
          {(!vehicle.inspections?.length && !vehicle.maintenanceEvents?.length && !vehicle.incidents?.length) ? (
            <Text style={styles.meta}>No vehicle lifecycle activity has been logged yet.</Text>
          ) : null}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
  multilineInput: { minHeight: 96, paddingTop: 14, textAlignVertical: 'top' },
  timeline: { gap: tokens.spacing.sm },
  timelineItem: {
    borderColor: tokens.colors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    padding: tokens.spacing.sm,
  },
  timelineTitle: { color: tokens.colors.ink, fontSize: 15, fontWeight: '700' },
});

export default VehicleDetailScreen;
