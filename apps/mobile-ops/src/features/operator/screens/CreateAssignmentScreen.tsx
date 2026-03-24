'use client';

import { computeNextRemittanceDueDate, describeRemittanceSchedule } from '@mobility-os/domain-config';
import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { createOperatorAssignment, listDrivers, listVehicles } from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function CreateAssignmentScreen({ navigation }: ScreenProps<'OperatorAssignmentCreate'>) {
  const driversQuery = useQuery({
    queryKey: ['operator-assignment-create', 'drivers'],
    queryFn: () => listDrivers({ page: 1, limit: 100, status: 'active' }),
  });
  const vehiclesQuery = useQuery({
    queryKey: ['operator-assignment-create', 'vehicles'],
    queryFn: () => listVehicles({ page: 1, limit: 100 }),
  });
  const [selectedDriverId, setSelectedDriverId] = React.useState('');
  const [selectedVehicleId, setSelectedVehicleId] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [remittanceAmountMinorUnits, setRemittanceAmountMinorUnits] = React.useState('');
  const [remittanceCurrency, setRemittanceCurrency] = React.useState('NGN');
  const [remittanceFrequency, setRemittanceFrequency] = React.useState<'daily' | 'weekly'>('daily');
  const [remittanceStartDate, setRemittanceStartDate] = React.useState(
    new Date().toISOString().slice(0, 10),
  );
  const [remittanceCollectionDay, setRemittanceCollectionDay] = React.useState('1');

  const createMutation = useMutation({
    mutationFn: () =>
      createOperatorAssignment({
        driverId: selectedDriverId,
        vehicleId: selectedVehicleId,
        remittanceAmountMinorUnits: Number(remittanceAmountMinorUnits),
        remittanceCurrency: remittanceCurrency.trim().toUpperCase(),
        remittanceFrequency,
        remittanceStartDate,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(remittanceFrequency === 'weekly'
          ? { remittanceCollectionDay: Number(remittanceCollectionDay) }
          : {}),
      }),
    onSuccess: () => {
      Alert.alert('Assignment created', 'The driver has been assigned successfully.');
      navigation.navigate('OperatorAssignments');
    },
    onError: (error) => {
      Alert.alert('Create assignment', error instanceof Error ? error.message : 'Unable to create the assignment.');
    },
  });

  const onSubmit = () => {
    if (!selectedDriverId || !selectedVehicleId) {
      Alert.alert('Create assignment', 'Select both a driver and a vehicle.');
      return;
    }
    if (!Number.isFinite(Number(remittanceAmountMinorUnits)) || Number(remittanceAmountMinorUnits) < 1) {
      Alert.alert('Create assignment', 'Enter a valid remittance amount in minor units.');
      return;
    }
    createMutation.mutate();
  };

  const projectedDueDate = computeNextRemittanceDueDate({
    remittanceFrequency,
    remittanceAmountMinorUnits: Number(remittanceAmountMinorUnits) || 0,
    remittanceCurrency,
    remittanceStartDate,
    ...(remittanceFrequency === 'weekly'
      ? { remittanceCollectionDay: Number(remittanceCollectionDay) }
      : {}),
  });

  return (
    <Screen>
      <Card style={styles.section}>
        <Text style={styles.title}>Create assignment</Text>
        <Text style={styles.copy}>Pick an active driver and an available vehicle from the tenant fleet.</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Driver</Text>
        {driversQuery.isLoading ? (
          <LoadingSkeleton height={140} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.choiceRow}>
              {driversQuery.data?.data.map((driver) => (
                <Text
                  key={driver.id}
                  style={[styles.choiceChip, selectedDriverId === driver.id ? styles.choiceChipActive : null]}
                  onPress={() => setSelectedDriverId(driver.id)}
                >
                  {driver.firstName} {driver.lastName}
                </Text>
              ))}
            </View>
          </ScrollView>
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle</Text>
        {vehiclesQuery.isLoading ? (
          <LoadingSkeleton height={140} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.choiceRow}>
              {vehiclesQuery.data?.data.map((vehicle) => (
                <Text
                  key={vehicle.id}
                  style={[styles.choiceChip, selectedVehicleId === vehicle.id ? styles.choiceChipActive : null]}
                  onPress={() => setSelectedVehicleId(vehicle.id)}
                >
                  {vehicle.tenantVehicleCode || vehicle.systemVehicleCode}
                </Text>
              ))}
            </View>
          </ScrollView>
        )}
      </Card>

      <Card style={styles.section}>
        <Input label="Notes" multiline onChangeText={setNotes} value={notes} />
        <Input
          keyboardType="number-pad"
          label="Expected remittance amount (minor units)"
          onChangeText={setRemittanceAmountMinorUnits}
          value={remittanceAmountMinorUnits}
        />
        <Input label="Currency" autoCapitalize="characters" onChangeText={setRemittanceCurrency} value={remittanceCurrency} />
        <Input
          label="Schedule"
          editable={false}
          value={describeRemittanceSchedule({
            remittanceFrequency,
            ...(remittanceFrequency === 'weekly'
              ? { remittanceCollectionDay: Number(remittanceCollectionDay) }
              : {}),
          })}
        />
        <View style={styles.choiceRow}>
          <Text
            style={[styles.choiceChip, remittanceFrequency === 'daily' ? styles.choiceChipActive : null]}
            onPress={() => setRemittanceFrequency('daily')}
          >
            Daily
          </Text>
          <Text
            style={[styles.choiceChip, remittanceFrequency === 'weekly' ? styles.choiceChipActive : null]}
            onPress={() => setRemittanceFrequency('weekly')}
          >
            Weekly
          </Text>
        </View>
        <Input label="First due date" onChangeText={setRemittanceStartDate} value={remittanceStartDate} />
        {remittanceFrequency === 'weekly' ? (
          <Input
            keyboardType="number-pad"
            label="Weekly collection day (1=Mon ... 7=Sun)"
            onChangeText={setRemittanceCollectionDay}
            value={remittanceCollectionDay}
          />
        ) : null}
        {projectedDueDate ? (
          <Text style={styles.copy}>Next projected remittance due date: {projectedDueDate}</Text>
        ) : null}
        <Button label="Create assignment" loading={createMutation.isPending} onPress={onSubmit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  choiceRow: { flexDirection: 'row', gap: tokens.spacing.sm },
  choiceChip: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: tokens.colors.ink,
    backgroundColor: '#FFFFFF',
  },
  choiceChipActive: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primaryTint,
  },
});

export default CreateAssignmentScreen;
