'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { listAuditLog } from '../../../api';
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

function actionTone(action: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (action.includes('created') || action.includes('started') || action.includes('approved')) {
    return 'success';
  }
  if (action.includes('updated') || action.includes('reviewed') || action.includes('submitted')) {
    return 'warning';
  }
  if (action.includes('rejected') || action.includes('archived') || action.includes('cancel')) {
    return 'danger';
  }
  return 'neutral';
}

function summarizeMetadata(metadata?: Record<string, unknown> | null) {
  if (!metadata) {
    return null;
  }
  const entries = Object.entries(metadata)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .slice(0, 3)
    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${String(value)}`);
  return entries.length ? entries.join(' · ') : null;
}

export function OperatorAuditScreen({ navigation }: ScreenProps<'OperatorAudit'>) {
  const auditQuery = useQuery({
    queryKey: ['operator-audit'],
    queryFn: () => listAuditLog({ page: 1, limit: 100 }),
  });

  const onRefresh = async () => {
    try {
      await auditQuery.refetch();
    } catch (error) {
      Alert.alert('Audit', error instanceof Error ? error.message : 'Unable to refresh audit history.');
    }
  };

  const events = auditQuery.data?.data ?? [];
  const creates = events.filter((item) => item.action.includes('created') || item.action.includes('started')).length;
  const updates = events.filter((item) => item.action.includes('updated') || item.action.includes('reviewed') || item.action.includes('submitted')).length;
  const systemEvents = events.filter((item) => !item.actorId).length;

  return (
    <Screen
      footer={<OperatorBottomNav currentTab="OperatorMore" navigation={navigation} />}
      refreshControl={<RefreshControl refreshing={auditQuery.isRefetching} onRefresh={() => void onRefresh()} />}
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Audit trail</Text>
        <Text style={styles.copy}>
          Review the recent driver, assignment, maintenance, inspection, and dispute changes across
          your tenant so you can reopen the right workflow quickly.
        </Text>
      </Card>

      <View style={styles.metricGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>New actions</Text>
          <Text style={styles.metricValue}>{creates}</Text>
          <Text style={styles.metricHint}>Creates and starts in this page window</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>State changes</Text>
          <Text style={styles.metricValue}>{updates}</Text>
          <Text style={styles.metricHint}>Updates, reviews, and submissions</Text>
        </Card>
      </View>

      <Card style={styles.metricCard}>
        <Text style={styles.metricLabel}>System-originated events</Text>
        <Text style={styles.metricValue}>{systemEvents}</Text>
        <Text style={styles.metricHint}>Events recorded without a direct acting user</Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Action paths</Text>
        <View style={styles.actionGrid}>
          <Button label="Open drivers" onPress={() => navigation.navigate('OperatorDrivers')} />
          <Button label="Open maintenance" variant="secondary" onPress={() => navigation.navigate('OperatorMaintenance')} />
        </View>
      </Card>

      {auditQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={96} /></Card>
          <Card><LoadingSkeleton height={96} /></Card>
        </>
      ) : events.length ? (
        events.map((event) => (
          <Card key={event.id} style={styles.itemCard}>
            <View style={styles.rowBetween}>
              <View style={styles.copyBlock}>
                <Text style={styles.itemTitle}>{formatStatusLabel(event.entityType)}</Text>
                <Text style={styles.meta}>
                  {event.actorId ? `Actor ${event.actorId.slice(0, 10)}` : 'System event'} · {formatDateTime(event.createdAt)}
                </Text>
                <Text style={styles.meta}>
                  {summarizeMetadata(event.metadata) ?? 'No extra event metadata was recorded for this action.'}
                </Text>
              </View>
              <Badge label={formatStatusLabel(event.action)} tone={actionTone(event.action)} />
            </View>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No audit events"
          message="Audit entries will appear here as your team changes operational records."
          actionLabel="Refresh"
          onAction={() => void onRefresh()}
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
});

export default OperatorAuditScreen;
