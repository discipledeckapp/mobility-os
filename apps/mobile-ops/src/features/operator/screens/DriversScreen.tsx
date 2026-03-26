'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { listDrivers } from '../../../api';
import { Badge } from '../../../components/badge';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { OperatorBottomNav } from '../../../components/operator-bottom-nav';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatStatusLabel } from '../../../utils/formatting';
import { identityTone, readinessTone } from '../../../utils/status';

export function DriversScreen({ navigation }: ScreenProps<'OperatorDrivers'>) {
  const [query, setQuery] = useState('');
  const [readinessFilter, setReadinessFilter] = useState<'all' | 'queue' | 'ready'>('all');
  const driversQuery = useQuery({
    queryKey: ['operator-drivers', query],
    queryFn: () => listDrivers({ q: query.trim() || undefined, page: 1, limit: 100 }),
  });

  const allDrivers = driversQuery.data?.data ?? [];
  const filteredDrivers = allDrivers.filter((driver) => {
    if (readinessFilter === 'queue') {
      return driver.activationReadiness !== 'ready';
    }
    if (readinessFilter === 'ready') {
      return driver.activationReadiness === 'ready';
    }
    return true;
  });

  const allCount = allDrivers.length;
  const queueCount = allDrivers.filter((d) => d.activationReadiness !== 'ready').length;
  const readyCount = allDrivers.filter((d) => d.activationReadiness === 'ready').length;

  const onRefresh = async () => {
    try {
      await driversQuery.refetch();
    } catch (error) {
      Alert.alert('Drivers', error instanceof Error ? error.message : 'Unable to refresh drivers.');
    }
  };

  return (
    <Screen
      footer={<OperatorBottomNav currentTab="OperatorDrivers" navigation={navigation} />}
      refreshControl={<RefreshControl refreshing={driversQuery.isRefetching} onRefresh={() => void onRefresh()} />}
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Drivers</Text>
        <Text style={styles.copy}>
          Search the full tenant driver registry, jump into the readiness queue, and open any
          driver record.
        </Text>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          label="Search"
          onChangeText={setQuery}
          placeholder="Name, phone, email, or status"
          value={query}
        />
        <View style={styles.filterRow}>
          {(
            [
              { key: 'all', label: 'All drivers', count: allCount },
              { key: 'queue', label: 'Readiness queue', count: queueCount },
              { key: 'ready', label: 'Ready', count: readyCount },
            ] as const
          ).map(({ key, label, count }) => (
            <Pressable
              key={key}
              onPress={() => setReadinessFilter(key)}
              style={[styles.filterChip, readinessFilter === key ? styles.filterChipActive : null]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  readinessFilter === key ? styles.filterChipTextActive : null,
                ]}
              >
                {label}
                {driversQuery.data ? ` · ${count}` : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {driversQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={88} /></Card>
          <Card><LoadingSkeleton height={88} /></Card>
        </>
      ) : filteredDrivers.length ? (
        filteredDrivers.map((driver) => (
          <Card key={driver.id} style={styles.driverCard}>
            <View style={styles.rowBetween}>
              <View style={styles.copyBlock}>
                <Text style={styles.driverName}>{driver.firstName} {driver.lastName}</Text>
                <Text style={styles.meta}>{driver.phone ?? 'No phone recorded'}</Text>
                <Text style={styles.meta}>{driver.email ?? 'No email recorded'}</Text>
              </View>
              <Badge label={formatStatusLabel(driver.status)} tone="neutral" />
            </View>
            <View style={styles.badgeRow}>
              <Badge label={formatStatusLabel(driver.identityStatus)} tone={identityTone(driver.identityStatus)} />
              <Badge
                label={formatStatusLabel(driver.assignmentReadiness ?? 'not_ready')}
                tone={readinessTone(driver.assignmentReadiness ?? 'not_ready')}
              />
            </View>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('OperatorDriverDetail', { driverId: driver.id })}
            >
              Open driver record
            </Text>
          </Card>
        ))
      ) : (
        <EmptyState
          actionLabel="Refresh"
          message={
            readinessFilter === 'queue'
              ? 'No drivers are currently waiting in the readiness queue.'
              : readinessFilter === 'ready'
                ? 'No drivers are marked ready yet.'
                : 'No drivers match the current query.'
          }
          title="No drivers found"
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
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xs },
  filterChip: {
    borderColor: tokens.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  filterChipText: { color: tokens.colors.inkSoft, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#FFFFFF' },
  driverCard: { gap: tokens.spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: tokens.spacing.sm },
  copyBlock: { flex: 1, gap: 4 },
  driverName: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, fontSize: 13 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xs },
  link: { color: tokens.colors.primary, fontWeight: '700' },
});

export default DriversScreen;
