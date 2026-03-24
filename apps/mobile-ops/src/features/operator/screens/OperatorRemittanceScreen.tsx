'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { listOperatorRemittance } from '../../../api';
import { Badge } from '../../../components/badge';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { OperatorBottomNav } from '../../../components/operator-bottom-nav';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatDateOnly, formatMajorAmount, formatStatusLabel } from '../../../utils/formatting';
import { remittanceTone } from '../../../utils/status';

export function OperatorRemittanceScreen({ navigation }: ScreenProps<'OperatorRemittance'>) {
  const remittanceQuery = useQuery({
    queryKey: ['operator-remittance'],
    queryFn: () => listOperatorRemittance({ page: 1, limit: 100 }),
  });

  return (
    <Screen
      footer={<OperatorBottomNav currentTab="OperatorRemittance" navigation={navigation} />}
      refreshControl={<RefreshControl refreshing={remittanceQuery.isRefetching} onRefresh={() => void remittanceQuery.refetch()} />}
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Remittance</Text>
        <Text style={styles.copy}>Review all collections across drivers and resolve them on the go.</Text>
      </Card>

      {remittanceQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={88} /></Card>
          <Card><LoadingSkeleton height={88} /></Card>
        </>
      ) : remittanceQuery.data?.data.length ? (
        remittanceQuery.data.data.map((record) => (
          <Card key={record.id} style={styles.itemCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.amount}>{record.currency} {formatMajorAmount(record.amountMinorUnits)}</Text>
              <Badge label={formatStatusLabel(record.status)} tone={remittanceTone(record.status)} />
            </View>
            <Text style={styles.meta}>Due {formatDateOnly(record.dueDate)}</Text>
            <Text style={styles.meta}>Driver {record.driverId.slice(-8)}</Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('OperatorRemittanceDetail', { remittanceId: record.id })}
            >
              Open remittance
            </Text>
          </Card>
        ))
      ) : (
        <EmptyState
          actionLabel="Refresh remittance"
          message="No remittance records are available yet."
          title="No remittance"
          onAction={() => void remittanceQuery.refetch()}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
  itemCard: { gap: tokens.spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: tokens.spacing.sm },
  amount: { color: tokens.colors.ink, fontSize: 18, fontWeight: '800' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
  link: { color: tokens.colors.primary, fontWeight: '700' },
});

export default OperatorRemittanceScreen;
