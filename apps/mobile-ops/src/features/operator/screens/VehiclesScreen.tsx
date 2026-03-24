'use client';

import { useQuery } from '@tanstack/react-query';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
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
import { useState } from 'react';

export function VehiclesScreen({ navigation }: ScreenProps<'OperatorVehicles'>) {
  const [filter, setFilter] = useState<'all' | 'maintenance'>('all');
  const vehiclesQuery = useQuery({
    queryKey: ['operator-vehicles'],
    queryFn: () => listVehicles({ page: 1, limit: 100 }),
  });

  const filteredVehicles =
    vehiclesQuery.data?.data.filter((vehicle) => {
      if (filter !== 'maintenance') {
        return true;
      }
      return ['maintenance', 'inspection', 'inactive'].includes(vehicle.status);
    }) ?? [];

  return (
    <Screen refreshControl={<RefreshControl refreshing={vehiclesQuery.isRefetching} onRefresh={() => void vehiclesQuery.refetch()} />}>
      <Card style={styles.section}>
        <Text style={styles.title}>Vehicles</Text>
        <Text style={styles.copy}>Track the fleet and quickly isolate vehicles that need maintenance attention.</Text>
        <View style={styles.filterRow}>
          <Pressable onPress={() => setFilter('all')} style={[styles.filterChip, filter === 'all' ? styles.filterChipActive : null]}>
            <Text style={[styles.filterChipText, filter === 'all' ? styles.filterChipTextActive : null]}>All vehicles</Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('maintenance')}
            style={[styles.filterChip, filter === 'maintenance' ? styles.filterChipActive : null]}
          >
            <Text style={[styles.filterChipText, filter === 'maintenance' ? styles.filterChipTextActive : null]}>
              Maintenance queue
            </Text>
          </Pressable>
        </View>
        <Text style={styles.link} onPress={() => navigation.navigate('OperatorVehicleCreate')}>
          Add vehicle
        </Text>
      </Card>
      {vehiclesQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={88} /></Card>
          <Card><LoadingSkeleton height={88} /></Card>
        </>
      ) : filteredVehicles.length ? (
        filteredVehicles.map((vehicle) => (
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
        <EmptyState
          actionLabel="Refresh"
          message={
            filter === 'maintenance'
              ? 'No vehicles are currently queued for maintenance review.'
              : 'No vehicles are available yet.'
          }
          title="No vehicles"
          onAction={() => void vehiclesQuery.refetch()}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xs },
  filterChip: {
    borderColor: tokens.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  filterChipText: { color: tokens.colors.inkSoft, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#FFFFFF' },
  itemCard: { gap: tokens.spacing.xs },
  itemTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
  link: { color: tokens.colors.primary, fontWeight: '700' },
});

export default VehiclesScreen;
