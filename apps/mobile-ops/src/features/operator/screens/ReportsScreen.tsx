'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { getLicenceExpiryReport, getOperationalReadinessReport } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatDateOnly, formatStatusLabel } from '../../../utils/formatting';
import { readinessTone } from '../../../utils/status';

export function ReportsScreen({ navigation }: ScreenProps<'OperatorReports'>) {
  const readinessQuery = useQuery({
    queryKey: ['operator-reports', 'readiness'],
    queryFn: getOperationalReadinessReport,
  });
  const expiryQuery = useQuery({
    queryKey: ['operator-reports', 'licence-expiry'],
    queryFn: getLicenceExpiryReport,
  });

  const refreshing = readinessQuery.isRefetching || expiryQuery.isRefetching;
  const readyDrivers =
    readinessQuery.data?.drivers.filter((driver) => driver.activationReadiness === 'ready').length ?? 0;
  const queuedDrivers =
    readinessQuery.data?.drivers.filter((driver) => driver.activationReadiness !== 'ready').length ?? 0;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void Promise.all([readinessQuery.refetch(), expiryQuery.refetch()])} />}>
      <Card style={styles.section}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.copy}>Operational readiness and licence expiry signals optimized for mobile review.</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Operational readiness</Text>
        <View style={styles.summaryRow}>
          <Badge label={`${readyDrivers} ready`} tone="success" />
          <Badge label={`${queuedDrivers} in readiness queue`} tone={queuedDrivers > 0 ? 'warning' : 'neutral'} />
        </View>
        {readinessQuery.isLoading ? (
          <LoadingSkeleton height={120} />
        ) : (
          readinessQuery.data?.drivers.slice(0, 5).map((driver) => (
            <Card key={driver.id} style={styles.innerCard}>
              <Text style={styles.itemTitle}>{driver.fullName}</Text>
              <View style={styles.summaryRow}>
                <Badge
                  label={`Activation ${formatStatusLabel(driver.activationReadiness)}`}
                  tone={readinessTone(driver.activationReadiness)}
                />
                <Badge
                  label={`Assignments ${formatStatusLabel(driver.assignmentReadiness)}`}
                  tone={readinessTone(driver.assignmentReadiness)}
                />
              </View>
              <Text style={styles.meta}>Licence expiry: {driver.approvedLicenceExpiresAt ? formatDateOnly(driver.approvedLicenceExpiresAt) : 'Not on file'}</Text>
              {driver.expectedRemittanceAmountMinorUnits ? (
                <Text style={styles.meta}>
                  Expected remittance: {driver.remittanceCurrency ?? 'NGN'} {driver.expectedRemittanceAmountMinorUnits / 100}
                  {driver.nextRemittanceDueDate ? ` • due ${formatDateOnly(driver.nextRemittanceDueDate)}` : ''}
                </Text>
              ) : null}
              {driver.remittanceRiskReason ? <Text style={styles.meta}>{driver.remittanceRiskReason}</Text> : null}
              {driver.activationReadinessReasons[0] ? (
                <Text style={styles.meta}>{driver.activationReadinessReasons[0]}</Text>
              ) : null}
              <Button
                label={driver.activationReadiness === 'ready' ? 'Review and activate driver' : 'Resolve readiness blockers'}
                variant="secondary"
                onPress={() => navigation.navigate('OperatorDriverDetail', { driverId: driver.id })}
              />
            </Card>
          ))
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Licence expiry</Text>
        {expiryQuery.isLoading ? (
          <LoadingSkeleton height={120} />
        ) : (
          expiryQuery.data?.slice(0, 5).map((item) => (
            <Card key={item.driverId} style={styles.innerCard}>
              <Text style={styles.itemTitle}>{item.fullName}</Text>
              <Text style={styles.meta}>Expires: {formatDateOnly(item.expiresAt)}</Text>
              <Text style={styles.meta}>Days remaining: {item.daysUntilExpiry}</Text>
            </Card>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  innerCard: { gap: tokens.spacing.xs },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xs },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
  itemTitle: { color: tokens.colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default ReportsScreen;
