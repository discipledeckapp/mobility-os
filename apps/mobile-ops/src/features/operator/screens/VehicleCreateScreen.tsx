'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { createVehicle, listFleets } from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function VehicleCreateScreen({ navigation }: ScreenProps<'OperatorVehicleCreate'>) {
  const fleetsQuery = useQuery({
    queryKey: ['operator-vehicle-create', 'fleets'],
    queryFn: () => listFleets(),
  });
  const [fleetId, setFleetId] = useState('');
  const [tenantVehicleCode, setTenantVehicleCode] = useState('');
  const [vehicleType, setVehicleType] = useState('motorcycle');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      createVehicle({
        fleetId,
        tenantVehicleCode: tenantVehicleCode.trim() || undefined,
        vehicleType,
        make,
        model,
        year: Number(year),
        plate: plate.trim() || undefined,
        vin: vin.trim() || undefined,
        color: color.trim() || undefined,
      }),
    onSuccess: (vehicle) => {
      Alert.alert('Vehicle created', 'The vehicle has been created successfully.');
      navigation.navigate('OperatorVehicleDetail', { vehicleId: vehicle.id });
    },
    onError: (error) => {
      Alert.alert('Create vehicle', error instanceof Error ? error.message : 'Unable to create the vehicle.');
    },
  });

  const onSubmit = () => {
    if (!fleetId || !make.trim() || !model.trim() || !year.trim()) {
      Alert.alert('Create vehicle', 'Fleet, make, model, and year are required.');
      return;
    }
    createMutation.mutate();
  };

  return (
    <Screen>
      <Card style={styles.section}>
        <Text style={styles.title}>Create vehicle</Text>
        <Text style={styles.copy}>Add a fleet asset from mobile for field operations and dispatch.</Text>
      </Card>

      <Card style={styles.section}>
        {fleetsQuery.isLoading ? (
          <LoadingSkeleton height={120} />
        ) : (
          <Input
            helperText={`Available fleet ids: ${(fleetsQuery.data ?? []).map((fleet) => fleet.id).join(', ') || 'none'}`}
            label="Fleet ID"
            onChangeText={setFleetId}
            value={fleetId}
          />
        )}
        <Input label="Tenant vehicle code" onChangeText={setTenantVehicleCode} value={tenantVehicleCode} />
        <Input label="Vehicle type" onChangeText={setVehicleType} value={vehicleType} />
        <Input label="Make" onChangeText={setMake} value={make} />
        <Input label="Model" onChangeText={setModel} value={model} />
        <Input keyboardType="number-pad" label="Year" onChangeText={setYear} value={year} />
        <Input label="Plate" onChangeText={setPlate} value={plate} />
        <Input label="VIN" onChangeText={setVin} value={vin} />
        <Input label="Color" onChangeText={setColor} value={color} />
        <Button label="Create vehicle" loading={createMutation.isPending} onPress={onSubmit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default VehicleCreateScreen;
