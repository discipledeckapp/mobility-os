'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { listTenantWorkOrders, listVehicles } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { OperatorBottomNav } from '../../../components/operator-bottom-nav';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatDateTime, formatMajorAmount, formatStatusLabel } from '../../../utils/formatting';
import { assignmentStatusTone } from '../../../utils/status';

export function OperatorMaintenanceScreen({ navigation }: ScreenProps<'OperatorMaintenance'>) {
  const workOrdersQuery = useQuery({
    queryKey: ['operator-maintenance', 'work-orders'],
    queryFn: () => listTenantWorkOrders({ page: 1, limit: 100 }),
  });
  const vehiclesQuery = useQuery({
    queryKey: ['operator-maintenance', 'vehicles'],
    queryFn: () => listVehicles({ page: 1, limit: 100 }),
  });

  const onRefresh = async () => {
    try {
      await Promise.all([workOrdersQuery.refetch(), vehiclesQuery.refetch()]);
    } catch (error) {
      Alert.alert(
        'Maintenance',
        error instanceof Error ? error.message : 'Unable to refresh the maintenance workspace.',
      );
    }
  };

  const workOrders = workOrdersQuery.data?.data ?? [];
  const vehicles = vehiclesQuery.data?.data ?? [];
  const vehicleMap = new Map(
    vehicles.map((vehicle) => [
      vehicle.id,
      vehicle.tenantVehicleCode || vehicle.systemVehicleCode || `${vehicle.make} ${vehicle.model}`,
    ]),
  );
  const openOrders = workOrders.filter((item) => !['completed', 'cancelled'].includes(item.status));
  const urgentOrders = openOrders.filter((item) => ['critical', 'high'].includes(item.priority));
  const costedOrders = workOrders.filter((item) => typeof item.totalCostMinorUnits === 'number');

  return (
    <Screen
      footer={<OperatorBottomNav currentTab="OperatorMore" navigation={navigation} />}
      refreshControl={
        <RefreshControl
          refreshing={workOrdersQuery.isRefetching || vehiclesQuery.isRefetching}
          onRefresh={() => void onRefresh()}
        />
      }
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Maintenance</Text>
        <Text style={styles.copy}>
          Watch tenant-wide work orders, spot urgent repairs quickly, and jump into the affected
          vehicle record to update the job.
        </Text>
      </Card>

      <View style={styles.metricGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Open work orders</Text>
          <Text style={styles.metricValue}>{openOrders.length}</Text>
          <Text style={styles.metricHint}>Jobs still awaiting resolution</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Urgent attention</Text>
          <Text style={styles.metricValue}>{urgentOrders.length}</Text>
          <Text style={styles.metricHint}>Critical or high-priority repairs</Text>
        </Card>
      </View>

      <Card style={styles.metricCard}>
        <Text style={styles.metricLabel}>Cost visibility</Text>
        <Text style={styles.metricValue}>{costedOrders.length}</Text>
        <Text style={styles.metricHint}>Work orders already carrying recorded cost totals</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Action paths</Text>
        <View style={styles.actionGrid}>
          <Button label="Open vehicles" onPress={() => navigation.navigate('OperatorVehicles')} />
          <Button
            label="Open inspections"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorInspections')}
          />
        </View>
      </Card>

      {workOrdersQuery.isLoading || vehiclesQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={96} /></Card>
          <Card><LoadingSkeleton height={96} /></Card>
        </>
      ) : workOrders.length ? (
        workOrders.map((workOrder) => {
          const vehicleLabel = vehicleMap.get(workOrder.vehicleId) ?? workOrder.vehicleId;
          return (
            <Card key={workOrder.id} style={styles.itemCard}>
              <View style={styles.rowBetween}>
                <View style={styles.copyBlock}>
                  <Text style={styles.itemTitle}>{vehicleLabel}</Text>
                  <Text style={styles.meta}>{workOrder.issueDescription}</Text>
                  <Text style={styles.meta}>Opened {formatDateTime(workOrder.createdAt)}</Text>
                </View>
                <Badge
                  label={formatStatusLabel(workOrder.status)}
                  tone={assignmentStatusTone(workOrder.status)}
                />
              </View>
              <View style={styles.badgeRow}>
                <Badge label={formatStatusLabel(workOrder.priority)} tone="warning" />
                {typeof workOrder.totalCostMinorUnits === 'number' ? (
                  <Badge
                    label={`${workOrder.currency ?? 'NGN'} ${formatMajorAmount(workOrder.totalCostMinorUnits)}`}
                    tone="neutral"
                  />
                ) : null}
              </View>
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('OperatorVehicleDetail', { vehicleId: workOrder.vehicleId })}
              >
                Open vehicle command center
              </Text>
            </Card>
          );
        })
      ) : (
        <EmptyState
          title="No work orders"
          message="No tenant-wide maintenance work orders are open right now."
          actionLabel="Open vehicles"
          onAction={() => navigation.navigate('OperatorVehicles')}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  metricGrid: { flexDirection: 'row', gap: tokens.spacing.md },
  metricCard: { flex: 1, gap: tokens.spacing.xs },
  metricLabel: { color: tokens.colors.inkSoft, fontSize: 13, fontWeight: '600' },
  metricValue: { color: tokens.colors.ink, fontSize: 24, fontWeight: '800' },
  metricHint: { color: tokens.colors.inkSoft, fontSize: 12, lineHeight: 18 },
  actionGrid: { flexDirection: 'row', gap: tokens.spacing.sm },
  itemCard: { gap: tokens.spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: tokens.spacing.sm },
  copyBlock: { flex: 1, gap: 4 },
  itemTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, fontSize: 13, lineHeight: 18 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xs },
  link: { color: tokens.colors.primary, fontWeight: '700' },
});

export default OperatorMaintenanceScreen;
