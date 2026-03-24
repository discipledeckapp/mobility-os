'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { getDriver, sendDriverSelfServiceLink, updateDriverStatus } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatDateTime, formatStatusLabel } from '../../../utils/formatting';
import { identityTone, readinessTone, riskTone } from '../../../utils/status';

export function DriverDetailScreen({ route }: ScreenProps<'OperatorDriverDetail'>) {
  const { driverId } = route.params;
  const driverQuery = useQuery({
    queryKey: ['operator-driver', driverId],
    queryFn: () => getDriver(driverId),
  });
  const linkMutation = useMutation({
    mutationFn: () => sendDriverSelfServiceLink(driverId),
    onSuccess: (result) => {
      Alert.alert('Self-service link sent', `Delivered to ${result.destination}.`);
    },
    onError: (error) => {
      Alert.alert('Self-service link', error instanceof Error ? error.message : 'Unable to send the self-service link.');
    },
  });
  const statusMutation = useMutation({
    mutationFn: (status: string) => updateDriverStatus(driverId, status),
    onSuccess: async () => {
      await driverQuery.refetch();
      Alert.alert('Driver status', 'Driver status updated.');
    },
    onError: (error) => {
      Alert.alert('Driver status', error instanceof Error ? error.message : 'Unable to update driver status.');
    },
  });

  if (driverQuery.isLoading || !driverQuery.data) {
    return (
      <Screen>
        <Card><LoadingSkeleton height={160} /></Card>
      </Screen>
    );
  }

  const driver = driverQuery.data;

  return (
    <Screen refreshControl={<RefreshControl refreshing={driverQuery.isRefetching} onRefresh={() => void driverQuery.refetch()} />}>
      <Card style={styles.section}>
        <Text style={styles.title}>{driver.firstName} {driver.lastName}</Text>
        <Text style={styles.meta}>{driver.phone}</Text>
        {driver.email ? <Text style={styles.meta}>{driver.email}</Text> : null}
        <View style={styles.badgeRow}>
          <Badge label={formatStatusLabel(driver.status)} tone="neutral" />
          <Badge label={formatStatusLabel(driver.identityStatus)} tone={identityTone(driver.identityStatus)} />
          <Badge
            label={formatStatusLabel(driver.assignmentReadiness ?? 'not_ready')}
            tone={readinessTone(driver.assignmentReadiness ?? 'not_ready')}
          />
          {driver.riskBand ? <Badge label={`Risk ${formatStatusLabel(driver.riskBand)}`} tone={riskTone(driver.riskBand)} /> : null}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Verification and readiness</Text>
        <Text style={styles.meta}>Identity review: {driver.identityReviewStatus ?? 'Not in review'}</Text>
        <Text style={styles.meta}>Last verified: {driver.identityLastVerifiedAt ? formatDateTime(driver.identityLastVerifiedAt) : 'Not yet verified'}</Text>
        <Text style={styles.meta}>Approved licence: {driver.hasApprovedLicence ? 'Yes' : 'No'}</Text>
        <Text style={styles.meta}>Pending docs: {driver.pendingDocumentCount}</Text>
        <Text style={styles.meta}>Rejected docs: {driver.rejectedDocumentCount}</Text>
        <Text style={styles.meta}>Expired docs: {driver.expiredDocumentCount}</Text>
        <Button
          label="Send self-service link"
          loading={linkMutation.isPending}
          onPress={() => linkMutation.mutate()}
        />
        <Button
          label="Set active"
          variant="secondary"
          loading={statusMutation.isPending}
          onPress={() => statusMutation.mutate('active')}
        />
        <Button
          label="Set suspended"
          variant="secondary"
          loading={statusMutation.isPending}
          onPress={() => statusMutation.mutate('suspended')}
        />
        <Button
          label="Set inactive"
          variant="secondary"
          loading={statusMutation.isPending}
          onPress={() => statusMutation.mutate('inactive')}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 26, fontWeight: '800' },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xs },
});

export default DriverDetailScreen;
