'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { listDriverDocumentReviewQueue, listDriverLicenceReviewQueue } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { OperatorBottomNav } from '../../../components/operator-bottom-nav';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatDateOnly, formatDateTime, formatStatusLabel } from '../../../utils/formatting';
import { assignmentStatusTone, riskTone } from '../../../utils/status';

export function OperatorComplianceScreen({ navigation }: ScreenProps<'OperatorCompliance'>) {
  const documentsQuery = useQuery({
    queryKey: ['operator-compliance', 'documents'],
    queryFn: () => listDriverDocumentReviewQueue({ page: 1, limit: 100 }),
  });
  const licencesQuery = useQuery({
    queryKey: ['operator-compliance', 'licences'],
    queryFn: () => listDriverLicenceReviewQueue({ page: 1, limit: 100 }),
  });

  const onRefresh = async () => {
    try {
      await Promise.all([documentsQuery.refetch(), licencesQuery.refetch()]);
    } catch (error) {
      Alert.alert(
        'Compliance',
        error instanceof Error ? error.message : 'Unable to refresh the compliance workspace.',
      );
    }
  };

  const documents = documentsQuery.data?.data ?? [];
  const licences = licencesQuery.data?.data ?? [];

  return (
    <Screen
      footer={<OperatorBottomNav currentTab="OperatorMore" navigation={navigation} />}
      refreshControl={
        <RefreshControl
          refreshing={documentsQuery.isRefetching || licencesQuery.isRefetching}
          onRefresh={() => void onRefresh()}
        />
      }
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Compliance queues</Text>
        <Text style={styles.copy}>
          Track driver document exceptions, licence review risk, and jump into the affected driver
          record to continue follow-up.
        </Text>
      </Card>

      <View style={styles.metricGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Document queue</Text>
          <Text style={styles.metricValue}>{documents.length}</Text>
          <Text style={styles.metricHint}>Driver documents awaiting attention</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Licence queue</Text>
          <Text style={styles.metricValue}>{licences.length}</Text>
          <Text style={styles.metricHint}>Licence verifications with review pressure</Text>
        </Card>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Action paths</Text>
        <View style={styles.actionGrid}>
          <Button label="Open drivers" onPress={() => navigation.navigate('OperatorDrivers')} />
          <Button
            label="Readiness queue"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorReports')}
          />
        </View>
      </Card>

      {documentsQuery.isLoading || licencesQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={96} /></Card>
          <Card><LoadingSkeleton height={96} /></Card>
        </>
      ) : documents.length || licences.length ? (
        <>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Document review</Text>
            {documents.length ? (
              documents.slice(0, 8).map((document) => (
                <View key={document.id} style={styles.queueItem}>
                  <View style={styles.copyBlock}>
                    <Text style={styles.itemTitle}>{document.driverName}</Text>
                    <Text style={styles.meta}>
                      {formatStatusLabel(document.documentType)} · {document.fileName ?? 'Document evidence'}
                    </Text>
                    <Text style={styles.meta}>Queued {formatDateTime(document.createdAt)}</Text>
                  </View>
                  <View style={styles.queueActions}>
                    <Badge
                      label={formatStatusLabel(document.status)}
                      tone={assignmentStatusTone(document.status)}
                    />
                    <Text
                      style={styles.link}
                      onPress={() => navigation.navigate('OperatorDriverDetail', { driverId: document.driverId ?? '' })}
                    >
                      Open driver
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                title="No document review queue"
                message="Driver document review is currently clear."
              />
            )}
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Licence review</Text>
            {licences.length ? (
              licences.slice(0, 8).map((licence) => (
                <View key={licence.id} style={styles.queueItem}>
                  <View style={styles.copyBlock}>
                    <Text style={styles.itemTitle}>{licence.driverName}</Text>
                    <Text style={styles.meta}>
                      {licence.validity ? formatStatusLabel(licence.validity) : 'Unknown'} validity
                      {licence.expiryDate ? ` · Expires ${formatDateOnly(licence.expiryDate)}` : ''}
                    </Text>
                    <Text style={styles.meta}>Linked {formatDateTime(licence.createdAt)}</Text>
                  </View>
                  <View style={styles.queueActions}>
                    <Badge
                      label={formatStatusLabel(licence.riskImpact)}
                      tone={riskTone(licence.riskImpact)}
                    />
                    <Text
                      style={styles.link}
                      onPress={() => navigation.navigate('OperatorDriverDetail', { driverId: licence.driverId })}
                    >
                      Open driver
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                title="No licence review queue"
                message="No licence verifications currently need operator follow-up."
              />
            )}
          </Card>
        </>
      ) : (
        <EmptyState
          title="No compliance pressure"
          message="Driver document and licence review queues are currently clear."
          actionLabel="Open drivers"
          onAction={() => navigation.navigate('OperatorDrivers')}
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
  queueItem: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    paddingTop: tokens.spacing.sm,
    gap: tokens.spacing.xs,
  },
  copyBlock: { gap: 4 },
  itemTitle: { color: tokens.colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, fontSize: 13, lineHeight: 18 },
  queueActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: tokens.spacing.sm },
  link: { color: tokens.colors.primary, fontWeight: '700' },
});

export default OperatorComplianceScreen;
