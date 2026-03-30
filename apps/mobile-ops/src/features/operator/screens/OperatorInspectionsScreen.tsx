'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { listTenantInspections, listVehicles } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { OperatorBottomNav } from '../../../components/operator-bottom-nav';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatDateTime, formatStatusLabel } from '../../../utils/formatting';
import { assignmentStatusTone, riskTone } from '../../../utils/status';

export function OperatorInspectionsScreen({ navigation }: ScreenProps<'OperatorInspections'>) {
  const inspectionsQuery = useQuery({
    queryKey: ['operator-inspections', 'tenant'],
    queryFn: () => listTenantInspections({ page: 1, limit: 100 }),
  });
  const vehiclesQuery = useQuery({
    queryKey: ['operator-inspections', 'vehicles'],
    queryFn: () => listVehicles({ page: 1, limit: 100 }),
  });

  const onRefresh = async () => {
    try {
      await Promise.all([inspectionsQuery.refetch(), vehiclesQuery.refetch()]);
    } catch (error) {
      Alert.alert(
        'Inspections',
        error instanceof Error ? error.message : 'Unable to refresh the inspections workspace.',
      );
    }
  };

  const inspections = inspectionsQuery.data?.data ?? [];
  const vehicles = vehiclesQuery.data?.data ?? [];
  const vehicleMap = new Map(
    vehicles.map((vehicle) => [
      vehicle.id,
      vehicle.tenantVehicleCode || vehicle.systemVehicleCode || `${vehicle.make} ${vehicle.model}`,
    ]),
  );
  const reviewQueue = inspections.filter((item) => ['submitted', 'under_review'].includes(item.status));
  const flagged = inspections.filter(
    (item) =>
      item.latestScore?.riskLevel === 'high' ||
      item.latestScore?.riskLevel === 'critical' ||
      item.results.some((result) => result.result === 'fail'),
  );

  return (
    <Screen
      footer={<OperatorBottomNav currentTab="OperatorMore" navigation={navigation} />}
      refreshControl={
        <RefreshControl
          refreshing={inspectionsQuery.isRefetching || vehiclesQuery.isRefetching}
          onRefresh={() => void onRefresh()}
        />
      }
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Inspections</Text>
        <Text style={styles.copy}>
          Review tenant-wide inspection activity, spot risky vehicles fast, and jump into the
          affected vehicle record to log the next inspection or resolve an issue.
        </Text>
      </Card>

      <View style={styles.metricGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Review queue</Text>
          <Text style={styles.metricValue}>{reviewQueue.length}</Text>
          <Text style={styles.metricHint}>Submitted inspections awaiting decision</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Flagged results</Text>
          <Text style={styles.metricValue}>{flagged.length}</Text>
          <Text style={styles.metricHint}>Inspections carrying risk or failed items</Text>
        </Card>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Action paths</Text>
        <View style={styles.actionGrid}>
          <Button label="Open vehicles" onPress={() => navigation.navigate('OperatorVehicles')} />
          <Button
            label="Open maintenance"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorMaintenance')}
          />
        </View>
      </Card>

      {inspectionsQuery.isLoading || vehiclesQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={96} /></Card>
          <Card><LoadingSkeleton height={96} /></Card>
        </>
      ) : inspections.length ? (
        inspections.map((inspection) => {
          const vehicleLabel = vehicleMap.get(inspection.vehicleId) ?? inspection.vehicleId;
          return (
            <Card key={inspection.id} style={styles.itemCard}>
              <View style={styles.rowBetween}>
                <View style={styles.copyBlock}>
                  <Text style={styles.itemTitle}>{vehicleLabel}</Text>
                  <Text style={styles.meta}>
                    {formatStatusLabel(inspection.inspectionType)} inspection
                  </Text>
                  <Text style={styles.meta}>Started {formatDateTime(inspection.startedAt)}</Text>
                </View>
                <Badge
                  label={formatStatusLabel(inspection.status)}
                  tone={assignmentStatusTone(inspection.status)}
                />
              </View>
              {inspection.summary ? <Text style={styles.meta}>{inspection.summary}</Text> : null}
              <View style={styles.badgeRow}>
                {inspection.latestScore ? (
                  <Badge
                    label={`${formatStatusLabel(inspection.latestScore.riskLevel)} risk`}
                    tone={riskTone(inspection.latestScore.riskLevel)}
                  />
                ) : null}
                <Badge label={`${inspection.results.length} checks`} tone="neutral" />
              </View>
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('OperatorVehicleDetail', { vehicleId: inspection.vehicleId })}
              >
                Open vehicle command center
              </Text>
            </Card>
          );
        })
      ) : (
        <EmptyState
          title="No inspections"
          message="No tenant-wide inspection records have been captured yet."
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

export default OperatorInspectionsScreen;
