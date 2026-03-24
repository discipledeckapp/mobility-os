'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { getLicenceExpiryReport, getOperationalReadinessReport } from '../../../api';
import { Badge } from '../../../components/badge';
import { Card } from '../../../components/card';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import { tokens } from '../../../theme/tokens';
import { formatDateOnly, formatStatusLabel } from '../../../utils/formatting';
import { readinessTone } from '../../../utils/status';

export function ReportsScreen() {
  const readinessQuery = useQuery({
    queryKey: ['operator-reports', 'readiness'],
    queryFn: getOperationalReadinessReport,
  });
  const expiryQuery = useQuery({
    queryKey: ['operator-reports', 'licence-expiry'],
    queryFn: getLicenceExpiryReport,
  });

  const refreshing = readinessQuery.isRefetching || expiryQuery.isRefetching;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void Promise.all([readinessQuery.refetch(), expiryQuery.refetch()])} />}>
      <Card style={styles.section}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.copy}>Operational readiness and licence expiry signals optimized for mobile review.</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Operational readiness</Text>
        {readinessQuery.isLoading ? (
          <LoadingSkeleton height={120} />
        ) : (
          readinessQuery.data?.drivers.slice(0, 5).map((driver) => (
            <Card key={driver.id} style={styles.innerCard}>
              <Text style={styles.itemTitle}>{driver.fullName}</Text>
              <Badge label={formatStatusLabel(driver.assignmentReadiness)} tone={readinessTone(driver.assignmentReadiness)} />
              <Text style={styles.meta}>Licence expiry: {driver.approvedLicenceExpiresAt ? formatDateOnly(driver.approvedLicenceExpiresAt) : 'Not on file'}</Text>
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
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
  itemTitle: { color: tokens.colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default ReportsScreen;
