'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { getOperationalReadinessReport, getReportsOverview, listDrivers, listVehicles } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { OperatorBottomNav } from '../../../components/operator-bottom-nav';
import { PageShell, SectionIntro } from '../../../components/page-shell';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatMajorAmount } from '../../../utils/formatting';

export function OperatorDashboardScreen({ navigation }: ScreenProps<'OperatorDashboard'>) {
  const { session } = useAuth();
  const overviewQuery = useQuery({
    queryKey: ['operator-dashboard', 'overview'],
    queryFn: getReportsOverview,
  });
  const driversQuery = useQuery({
    queryKey: ['operator-dashboard', 'drivers-total'],
    queryFn: () => listDrivers({ page: 1, limit: 1 }),
  });
  const readinessQuery = useQuery({
    queryKey: ['operator-dashboard', 'readiness'],
    queryFn: getOperationalReadinessReport,
  });
  const vehiclesQuery = useQuery({
    queryKey: ['operator-dashboard', 'vehicles-total'],
    queryFn: () => listVehicles({ page: 1, limit: 1 }),
  });

  const onRefresh = async () => {
    try {
      await Promise.all([
        overviewQuery.refetch(),
        driversQuery.refetch(),
        readinessQuery.refetch(),
        vehiclesQuery.refetch(),
      ]);
    } catch (error) {
      Alert.alert(
        'Dashboard',
        error instanceof Error ? error.message : 'Unable to refresh the operator dashboard.',
      );
    }
  };

  if (overviewQuery.isLoading || driversQuery.isLoading || readinessQuery.isLoading || vehiclesQuery.isLoading) {
    return (
      <Screen footer={<OperatorBottomNav currentTab="OperatorDashboard" navigation={navigation} />}>
        <Card><LoadingSkeleton height={120} /></Card>
        <Card><LoadingSkeleton height={160} /></Card>
      </Screen>
    );
  }

  const overview = overviewQuery.data;
  const driversTotal = driversQuery.data?.total ?? 0;
  const readyDrivers =
    readinessQuery.data?.drivers.filter((driver) => driver.activationReadiness === 'ready').length ?? 0;
  const queuedDrivers =
    readinessQuery.data?.drivers.filter((driver) => driver.activationReadiness !== 'ready').length ?? 0;
  const vehiclesTotal = vehiclesQuery.data?.total ?? 0;
  const currency = overview?.wallet.currency ?? session?.defaultCurrency ?? 'NGN';
  const minorUnit = session?.currencyMinorUnit ?? 2;

  return (
    <Screen
      footer={<OperatorBottomNav currentTab="OperatorDashboard" navigation={navigation} />}
      refreshControl={
        <RefreshControl
          refreshing={
            overviewQuery.isRefetching ||
            driversQuery.isRefetching ||
            readinessQuery.isRefetching ||
            vehiclesQuery.isRefetching
          }
          onRefresh={() => void onRefresh()}
        />
      }
    >
      <PageShell
        eyebrow="Operator home"
        title={session?.organisationDisplayName ?? session?.tenantName ?? 'Mobiris Fleet OS'}
        subtitle="Drivers, vehicles, assignments, cash movement, and compliance all stay within quick mobile reach."
        badge={<Badge label={(session?.role ?? 'operator').replace(/_/g, ' ')} tone="neutral" />}
      >
        {session?.organisationLogoUrl ? (
          <Text style={styles.meta}>Logo: {session.organisationLogoUrl}</Text>
        ) : null}
      </PageShell>

      <View style={styles.metricGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Drivers</Text>
          <Text style={styles.metricValue}>{driversTotal}</Text>
          <Text style={styles.metricHint}>{readyDrivers} ready / {queuedDrivers} in readiness queue</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Vehicles</Text>
          <Text style={styles.metricValue}>{vehiclesTotal}</Text>
          <Text style={styles.metricHint}>Tracked mobile-access fleet assets</Text>
        </Card>
      </View>

      <View style={styles.metricGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Wallet balance</Text>
          <Text style={styles.metricValue}>
            {currency} {overview ? formatMajorAmount(overview.wallet.totalBalanceMinorUnits, minorUnit, session?.formattingLocale) : '0.00'}
          </Text>
          <Text style={styles.metricHint}>Operational wallet headline balance</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Expected / At risk</Text>
          <Text style={styles.metricValueSmall}>
            +{overview ? formatMajorAmount(overview.remittanceProjection.expectedThisWeekMinorUnits, minorUnit, session?.formattingLocale) : '0.00'}
          </Text>
          <Text style={styles.metricValueSmall}>
            {overview ? formatMajorAmount(overview.remittanceProjection.atRiskMinorUnits, minorUnit, session?.formattingLocale) : '0.00'} at risk
          </Text>
        </Card>
      </View>

      <Card style={styles.section}>
        <SectionIntro
          title="Start here"
          subtitle="Follow the same operating sequence used in tenant web so mobile feels familiar."
        />
        <Text style={styles.metricHint}>
          Follow the core operator flow: add a vehicle, add a driver, verify the driver, then create an assignment.
        </Text>
      </Card>

      <Card style={styles.section}>
        <SectionIntro
          title="Today’s operating focus"
          subtitle="The highest-value workspaces stay one tap away from the dashboard."
        />
        <View style={styles.actionGrid}>
          <Button label="Drivers" onPress={() => navigation.navigate('OperatorDrivers')} />
          <Button label="Dispatch" variant="secondary" onPress={() => navigation.navigate('OperatorAssignments')} />
        </View>
        <View style={styles.actionGrid}>
          <Button label="Remittance" variant="secondary" onPress={() => navigation.navigate('OperatorRemittance')} />
          <Button label="Reports" variant="secondary" onPress={() => navigation.navigate('OperatorReports')} />
        </View>
        <View style={styles.actionGrid}>
          <Button
            label={`Readiness queue (${queuedDrivers})`}
            variant="secondary"
            onPress={() => navigation.navigate('OperatorReports')}
          />
          <Button
            label="Maintenance queue"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorMaintenance')}
          />
        </View>
        <View style={styles.actionGrid}>
          <Button
            label="Inspections"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorInspections')}
          />
          <Button
            label="Compliance"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorCompliance')}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { color: tokens.colors.inkSoft, fontSize: 12, lineHeight: 18 },
  metricGrid: { flexDirection: 'row', gap: tokens.spacing.md },
  metricCard: { flex: 1, gap: tokens.spacing.xs },
  metricLabel: { color: tokens.colors.inkSoft, fontSize: 13, fontWeight: '600' },
  metricValue: { color: tokens.colors.ink, fontSize: 24, fontWeight: '800' },
  metricValueSmall: { color: tokens.colors.ink, fontSize: 16, fontWeight: '700' },
  metricHint: { color: tokens.colors.inkSoft, fontSize: 12, lineHeight: 18 },
  section: { gap: tokens.spacing.sm },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  actionGrid: { flexDirection: 'row', gap: tokens.spacing.sm },
});

export default OperatorDashboardScreen;
