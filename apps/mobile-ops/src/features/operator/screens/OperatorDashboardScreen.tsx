'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { getReportsOverview, listDrivers, listVehicles } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { OperatorBottomNav } from '../../../components/operator-bottom-nav';
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
  const vehiclesQuery = useQuery({
    queryKey: ['operator-dashboard', 'vehicles-total'],
    queryFn: () => listVehicles({ page: 1, limit: 1 }),
  });

  const onRefresh = async () => {
    try {
      await Promise.all([overviewQuery.refetch(), driversQuery.refetch(), vehiclesQuery.refetch()]);
    } catch (error) {
      Alert.alert(
        'Dashboard',
        error instanceof Error ? error.message : 'Unable to refresh the operator dashboard.',
      );
    }
  };

  if (overviewQuery.isLoading || driversQuery.isLoading || vehiclesQuery.isLoading) {
    return (
      <Screen footer={<OperatorBottomNav currentTab="OperatorDashboard" navigation={navigation} />}>
        <Card><LoadingSkeleton height={120} /></Card>
        <Card><LoadingSkeleton height={160} /></Card>
      </Screen>
    );
  }

  const overview = overviewQuery.data;
  const driversTotal = driversQuery.data?.total ?? 0;
  const vehiclesTotal = vehiclesQuery.data?.total ?? 0;
  const currency = overview?.wallet.currency ?? session?.defaultCurrency ?? 'NGN';
  const minorUnit = session?.currencyMinorUnit ?? 2;

  return (
    <Screen
      footer={<OperatorBottomNav currentTab="OperatorDashboard" navigation={navigation} />}
      refreshControl={
        <RefreshControl
          refreshing={overviewQuery.isRefetching || driversQuery.isRefetching || vehiclesQuery.isRefetching}
          onRefresh={() => void onRefresh()}
        />
      }
    >
      <Card style={styles.hero}>
        <Text style={styles.kicker}>Operator mode</Text>
        <Text style={styles.title}>{session?.tenantName ?? 'Mobility OS'}</Text>
        <Text style={styles.copy}>
          Run daily operations from your phone. Dispatch, remittance review, driver status, and
          key business health are all available here.
        </Text>
        <Badge label={(session?.role ?? 'operator').replace(/_/g, ' ')} tone="neutral" />
      </Card>

      <View style={styles.metricGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Drivers</Text>
          <Text style={styles.metricValue}>{driversTotal}</Text>
          <Text style={styles.metricHint}>
            {overview?.driverActivity.active ?? 0} active / {overview?.driverActivity.inactive ?? 0} inactive
          </Text>
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
          <Text style={styles.metricLabel}>Inflow / Outflow</Text>
          <Text style={styles.metricValueSmall}>
            +{overview ? formatMajorAmount(overview.wallet.totalInflowMinorUnits, minorUnit, session?.formattingLocale) : '0.00'}
          </Text>
          <Text style={styles.metricValueSmall}>
            -{overview ? formatMajorAmount(overview.wallet.totalOutflowMinorUnits, minorUnit, session?.formattingLocale) : '0.00'}
          </Text>
        </Card>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Today’s operating focus</Text>
        <View style={styles.actionGrid}>
          <Button label="Drivers" onPress={() => navigation.navigate('OperatorDrivers')} />
          <Button label="Dispatch" variant="secondary" onPress={() => navigation.navigate('OperatorAssignments')} />
        </View>
        <View style={styles.actionGrid}>
          <Button label="Remittance" variant="secondary" onPress={() => navigation.navigate('OperatorRemittance')} />
          <Button label="Reports" variant="secondary" onPress={() => navigation.navigate('OperatorReports')} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: tokens.spacing.sm },
  kicker: { color: tokens.colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
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
