'use client';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import {
  clearOfflineQueue,
  flushOfflineQueue,
  getQueuedActions,
  removeQueuedAction,
} from '../../../services/offline-queue-service';
import { tokens } from '../../../theme/tokens';
import { formatDateTime, formatStatusLabel } from '../../../utils/formatting';

type QueuedAction = Awaited<ReturnType<typeof getQueuedActions>>[number];

function describeAction(action: QueuedAction) {
  switch (action.type) {
    case 'assignment_accept':
      return 'Driver accepted assignment terms';
    case 'assignment_decline':
      return 'Driver declined assignment';
    case 'assignment_start':
      return 'Driver started assignment';
    case 'assignment_complete':
      return 'Driver ended assignment';
    case 'assignment_cancel':
      return 'Driver cancelled assignment';
    case 'remittance_record':
      return 'Remittance submission waiting to sync';
  }
}

export function OfflineQueueScreen({ navigation }: ScreenProps<'OfflineQueue'>) {
  const [actions, setActions] = useState<QueuedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadQueue = useCallback(async () => {
    const queue = await getQueuedActions();
    setActions(queue);
    return queue;
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadQueue()
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, [loadQueue]),
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadQueue();
    } finally {
      setRefreshing(false);
    }
  };

  const onSyncNow = async () => {
    try {
      setSyncing(true);
      await flushOfflineQueue();
      await loadQueue();
      Alert.alert('Offline queue', 'Queued actions have been retried.');
    } catch (error) {
      Alert.alert(
        'Offline queue',
        error instanceof Error ? error.message : 'Unable to retry queued actions right now.',
      );
    } finally {
      setSyncing(false);
    }
  };

  const onRemove = async (actionId: string) => {
    await removeQueuedAction(actionId);
    await loadQueue();
  };

  const onClearAll = async () => {
    Alert.alert(
      'Clear offline queue',
      'Remove all queued offline actions from this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear queue',
          style: 'destructive',
          onPress: () => {
            void clearOfflineQueue().then(() => loadQueue());
          },
        },
      ],
    );
  };

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
    >
      <Card style={styles.section}>
        <Text style={styles.kicker}>Offline actions</Text>
        <Text style={styles.title}>Sync queue</Text>
        <Text style={styles.copy}>
          Review actions captured while the device was offline. Retry sync manually, or remove stale
          items before they reach the server.
        </Text>
        <View style={styles.badgeRow}>
          <Badge
            label={`${actions.length} waiting`}
            tone={actions.length > 0 ? 'warning' : 'success'}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.actionRow}>
          <Button label="Sync now" loading={syncing} onPress={() => void onSyncNow()} />
          <Button label="Clear queue" variant="secondary" onPress={() => void onClearAll()} />
        </View>
        <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </Card>

      {loading ? (
        <>
          <Card><LoadingSkeleton height={96} /></Card>
          <Card><LoadingSkeleton height={96} /></Card>
        </>
      ) : actions.length ? (
        actions.map((action) => (
          <Card key={action.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{describeAction(action)}</Text>
            <Text style={styles.meta}>Queued {formatDateTime(action.createdAt)}</Text>
            {'payload' in action && 'assignmentId' in action.payload ? (
              <Text style={styles.meta}>Assignment {action.payload.assignmentId}</Text>
            ) : null}
            {'payload' in action && 'clientReferenceId' in action.payload ? (
              <Text style={styles.meta}>Reference {action.payload.clientReferenceId}</Text>
            ) : null}
            <View style={styles.actionRow}>
              <Badge label={formatStatusLabel(action.type)} tone="neutral" />
              <Button
                label="Remove"
                variant="secondary"
                onPress={() => void onRemove(action.id)}
              />
            </View>
          </Card>
        ))
      ) : (
        <EmptyState
          title="Queue is clear"
          message="No offline assignment or remittance actions are waiting to sync."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  kicker: {
    color: tokens.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xs },
  itemCard: { gap: tokens.spacing.sm },
  itemTitle: { color: tokens.colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, fontSize: 13, lineHeight: 18 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
});

export default OfflineQueueScreen;
