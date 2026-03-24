'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { listVehicles } from '../../../api';
import { Badge } from '../../../components/badge';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatStatusLabel } from '../../../utils/formatting';
import { assignmentStatusTone } from '../../../utils/status';

export function VehiclesScreen({ navigation }: ScreenProps<'OperatorVehicles'>) {
  const vehiclesQuery = useQuery({
    queryKey: ['operator-vehicles'],
    queryFn: () => listVehicles({ page: 1, limit: 100 }),
  });

  return (
    <Screen refreshControl={<RefreshControl refreshing={vehiclesQuery.isRefetching} onRefresh={() => void vehiclesQuery.refetch()} />}>
      <Card style={styles.section}>
        <Text style={styles.title}>Vehicles</Text>
        <Text style={styles.copy}>Read-only fleet vehicle visibility for mobile operators.</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('OperatorVehicleCreate')}>
          Add vehicle
        </Text>
      </Card>
      {vehiclesQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={88} /></Card>
          <Card><LoadingSkeleton height={88} /></Card>
        </>
      ) : vehiclesQuery.data?.data.length ? (
        vehiclesQuery.data.data.map((vehicle) => (
          <Card key={vehicle.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{vehicle.tenantVehicleCode || vehicle.systemVehicleCode}</Text>
            <Text style={styles.meta}>{vehicle.make} {vehicle.model} {vehicle.year}</Text>
            <Text style={styles.meta}>Plate: {vehicle.plate ?? 'Not recorded'}</Text>
            <Badge label={formatStatusLabel(vehicle.status)} tone={assignmentStatusTone(vehicle.status)} />
            <Text style={styles.link} onPress={() => navigation.navigate('OperatorVehicleDetail', { vehicleId: vehicle.id })}>
              Open vehicle
            </Text>
          </Card>
        ))
      ) : (
        <EmptyState actionLabel="Refresh" message="No vehicles are available yet." title="No vehicles" onAction={() => void vehiclesQuery.refetch()} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
  itemCard: { gap: tokens.spacing.xs },
  itemTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
  link: { color: tokens.colors.primary, fontWeight: '700' },
});

export default VehiclesScreen;
