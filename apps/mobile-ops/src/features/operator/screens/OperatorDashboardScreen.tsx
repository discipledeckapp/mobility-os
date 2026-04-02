'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
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
    staleTime: 120_000,
  });
  const driversQuery = useQuery({
    queryKey: ['operator-dashboard', 'drivers-total'],
    queryFn: () => listDrivers({ page: 1, limit: 1 }),
    staleTime: 120_000,
  });
  const readinessQuery = useQuery({
    queryKey: ['operator-dashboard', 'readiness'],
    queryFn: getOperationalReadinessReport,
    staleTime: 60_000,
  });
  const vehiclesQuery = useQuery({
    queryKey: ['operator-dashboard', 'vehicles-total'],
    queryFn: () => listVehicles({ page: 1, limit: 1 }),
    staleTime: 120_000,
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
  const primaryTasks = [
    {
      id: 'readiness',
      label: queuedDrivers > 0 ? `Clear readiness queue (${queuedDrivers})` : 'Review readiness',
      hint:
        queuedDrivers > 0
          ? 'Drivers are waiting on verification, documentation, or activation review.'
          : 'Check the readiness queue before dispatch opens.',
      target: 'OperatorReports' as const,
    },
    {
      id: 'dispatch',
      label: 'Dispatch assignments',
      hint: 'Open assignment operations to issue, confirm, and track live work.',
      target: 'OperatorAssignments' as const,
    },
    {
      id: 'cash',
      label: 'Track remittance',
      hint: 'Review expected collections and investigate any at-risk remittance.',
      target: 'OperatorRemittance' as const,
    },
  ];

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
        compact
        eyebrow="Operator home"
        title={session?.organisationDisplayName ?? session?.tenantName ?? 'Mobiris Fleet OS'}
        subtitle="See the next operational priority first, then jump into dispatch, remittance, or compliance."
        badge={<Badge label={(session?.role ?? 'operator').replace(/_/g, ' ')} tone="neutral" />}
      >
        {session?.organisationLogoUrl ? (
          <Text style={styles.meta}>Logo: {session.organisationLogoUrl}</Text>
        ) : null}
      </PageShell>

      <Card style={styles.section}>
        <SectionIntro
          title="Do this now"
          subtitle="The mobile dashboard should push the highest-value work forward first."
        />
        <View style={styles.priorityList}>
          {primaryTasks.map((task, index) => (
            <Pressable key={task.id} onPress={() => navigation.navigate(task.target)}>
              <View style={[styles.priorityCard, index === 0 ? styles.priorityCardPrimary : null]}>
                <View style={styles.priorityIndex}>
                  <Text style={styles.priorityIndexLabel}>{index + 1}</Text>
                </View>
                <View style={styles.priorityCopy}>
                  <Text style={styles.priorityTitle}>{task.label}</Text>
                  <Text style={styles.metricHint}>{task.hint}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </Card>

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
          <Text style={styles.metricLabel}>Verification credit</Text>
          <Text style={styles.metricValue}>
            {currency} {overview ? formatMajorAmount(overview.wallet.totalBalanceMinorUnits, minorUnit, session?.formattingLocale) : '0.00'}
          </Text>
          <Text style={styles.metricHint}>Available company-paid verification credit headline balance</Text>
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
          title="Quick workspaces"
          subtitle="Use these when you already know the area you need."
        />
        <View style={styles.actionGrid}>
          <Button label="Drivers" onPress={() => navigation.navigate('OperatorDrivers')} />
          <Button
            label="Assignments"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorAssignments')}
          />
        </View>
        <View style={styles.actionGrid}>
          <Button
            label="Remittance"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorRemittance')}
          />
          <Button label="Reports" variant="secondary" onPress={() => navigation.navigate('OperatorReports')} />
        </View>
        <View style={styles.actionGrid}>
          <Button
            label="Maintenance queue"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorMaintenance')}
          />
          <Button
            label="Inspections"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorInspections')}
          />
        </View>
        <View style={styles.actionGrid}>
          <Button
            label="Compliance"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorCompliance')}
          />
          <Button
            label="Verification Credit"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorVerificationCredit')}
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
  priorityList: {
    gap: tokens.spacing.sm,
  },
  priorityCard: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    backgroundColor: '#FFFFFF',
    padding: tokens.spacing.md,
    flexDirection: 'row',
    gap: tokens.spacing.md,
    alignItems: 'flex-start',
  },
  priorityCardPrimary: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primaryTint,
  },
  priorityIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityIndexLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  priorityCopy: {
    flex: 1,
    gap: 4,
  },
  priorityTitle: {
    color: tokens.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default OperatorDashboardScreen;
