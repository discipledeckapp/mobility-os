'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text } from 'react-native';
import { getVehicle, updateVehicle, updateVehicleStatus } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatStatusLabel } from '../../../utils/formatting';
import { assignmentStatusTone } from '../../../utils/status';

export function VehicleDetailScreen({ route }: ScreenProps<'OperatorVehicleDetail'>) {
  const vehicleQuery = useQuery({
    queryKey: ['operator-vehicle', route.params.vehicleId],
    queryFn: () => getVehicle(route.params.vehicleId),
  });
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [vin, setVin] = useState('');
  const [tenantVehicleCode, setTenantVehicleCode] = useState('');

  const updateMutation = useMutation({
    mutationFn: () =>
      updateVehicle(route.params.vehicleId, {
        plate: plate.trim() || undefined,
        color: color.trim() || undefined,
        vin: vin.trim() || undefined,
        tenantVehicleCode: tenantVehicleCode.trim() || undefined,
      }),
    onSuccess: async () => {
      await vehicleQuery.refetch();
      Alert.alert('Vehicle updated', 'Vehicle details have been updated.');
    },
    onError: (error) => {
      Alert.alert('Vehicle update', error instanceof Error ? error.message : 'Unable to update vehicle details.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateVehicleStatus(route.params.vehicleId, status),
    onSuccess: async () => {
      await vehicleQuery.refetch();
      Alert.alert('Vehicle status', 'Vehicle status has been updated.');
    },
    onError: (error) => {
      Alert.alert('Vehicle status', error instanceof Error ? error.message : 'Unable to update vehicle status.');
    },
  });

  const vehicle = vehicleQuery.data;

  if (vehicleQuery.isLoading || !vehicle) {
    return (
      <Screen>
        <Card><LoadingSkeleton height={180} /></Card>
      </Screen>
    );
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={vehicleQuery.isRefetching} onRefresh={() => void vehicleQuery.refetch()} />}>
      <Card style={styles.section}>
        <Text style={styles.title}>{vehicle.tenantVehicleCode || vehicle.systemVehicleCode}</Text>
        <Badge label={formatStatusLabel(vehicle.status)} tone={assignmentStatusTone(vehicle.status)} />
        <Text style={styles.meta}>{vehicle.make} {vehicle.model} {vehicle.year}</Text>
        <Text style={styles.meta}>Fleet: {vehicle.fleetId}</Text>
      </Card>

      <Card style={styles.section}>
        <Input label="Tenant vehicle code" onChangeText={setTenantVehicleCode} placeholder={vehicle.tenantVehicleCode} value={tenantVehicleCode} />
        <Input label="Plate" onChangeText={setPlate} placeholder={vehicle.plate ?? ''} value={plate} />
        <Input label="Color" onChangeText={setColor} placeholder={vehicle.color ?? ''} value={color} />
        <Input label="VIN" onChangeText={setVin} placeholder={vehicle.vin ?? ''} value={vin} />
        <Button label="Save vehicle details" loading={updateMutation.isPending} onPress={() => updateMutation.mutate()} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Status actions</Text>
        <Button label="Mark available" variant="secondary" loading={statusMutation.isPending} onPress={() => statusMutation.mutate('available')} />
        <Button label="Mark maintenance" variant="secondary" loading={statusMutation.isPending} onPress={() => statusMutation.mutate('maintenance')} />
        <Button label="Mark retired" variant="secondary" loading={statusMutation.isPending} onPress={() => statusMutation.mutate('retired')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default VehicleDetailScreen;
