'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { listRemittanceHistory, type RemittanceRecord } from '../../../api';
import { Badge } from '../../../components/badge';
import { BottomNav } from '../../../components/bottom-nav';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import { useToast } from '../../../contexts/toast-context';
import { getCurrencyLabel } from '../../../lib/currency';
import type { ScreenProps } from '../../../navigation/types';
import { getCurrencyMultiplier } from '../../../services/remittance-service';
import { tokens } from '../../../theme/tokens';

export function RemittanceHistoryScreen({ navigation }: ScreenProps<'RemittanceHistory'>) {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [history, setHistory] = useState<RemittanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currencyLabel = useMemo(
    () => getCurrencyLabel(session?.defaultCurrency, session?.formattingLocale),
    [session?.defaultCurrency, session?.formattingLocale],
  );

  const loadHistory = useCallback(async () => {
    const records = await listRemittanceHistory();
    setHistory(records);
    return records;
  }, []);

  useEffect(() => {
    loadHistory()
      .catch((error) => {
        Alert.alert(
          'Remittance history',
          error instanceof Error ? error.message : 'Unable to load remittance history.',
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadHistory();
      showToast('Remittance history refreshed.', 'success');
    } catch (error) {
      Alert.alert(
        'Remittance history',
        error instanceof Error ? error.message : 'Unable to refresh remittance history.',
      );
    } finally {
      setRefreshing(false);
    }
  };

  const totals = useMemo(() => {
    const totalMinorUnits = history.reduce((sum, record) => sum + record.amountMinorUnits, 0);
    const pendingMinorUnits = history
      .filter((record) => record.status === 'pending')
      .reduce((sum, record) => sum + record.amountMinorUnits, 0);
    const confirmedMinorUnits = history
      .filter((record) => record.status === 'confirmed')
      .reduce((sum, record) => sum + record.amountMinorUnits, 0);

    return {
      totalMinorUnits,
      pendingMinorUnits,
      confirmedMinorUnits,
    };
  }, [history]);

  return (
    <Screen
      footer={<BottomNav currentTab="Remittance" navigation={navigation} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Remittance history</Text>
        <Text style={styles.muted}>
          Review the collections recorded from this device and their current status.
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total recorded</Text>
          <Text style={styles.summaryValue}>
            {currencyLabel} {formatMajorAmount(totals.totalMinorUnits, session?.currencyMinorUnit)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={styles.summaryValue}>
            {currencyLabel} {formatMajorAmount(totals.pendingMinorUnits, session?.currencyMinorUnit)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Confirmed</Text>
          <Text style={styles.summaryValue}>
            {currencyLabel} {formatMajorAmount(totals.confirmedMinorUnits, session?.currencyMinorUnit)}
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Collections</Text>
        {loading ? (
          <>
            <LoadingSkeleton height={84} />
            <LoadingSkeleton height={84} />
            <LoadingSkeleton height={84} />
          </>
        ) : history.length === 0 ? (
          <EmptyState
            actionLabel="Record remittance"
            message="No collections have been recorded from this account yet."
            title="No remittance history"
            onAction={() => navigation.navigate('Remittance', {})}
          />
        ) : (
          history.map((record) => (
            <View key={record.id} style={styles.historyRow}>
              <View style={styles.historyCopy}>
                <Text style={styles.historyAmount}>
                  {currencyLabel} {formatMajorAmount(record.amountMinorUnits, session?.currencyMinorUnit)}
                </Text>
                <Text style={styles.meta}>
                  Due {formatDateOnly(record.dueDate, session?.formattingLocale)}
                </Text>
                <Text style={styles.meta}>
                  Recorded {formatDateTime(record.createdAt, session?.formattingLocale)}
                </Text>
                <Text style={styles.meta}>
                  Assignment {record.assignmentId.slice(-6).toUpperCase()}
                </Text>
                {record.notes ? <Text style={styles.meta}>Notes: {record.notes}</Text> : null}
              </View>
              <Badge label={formatStatusLabel(record.status)} tone={historyTone(record.status)} />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

function formatDateTime(value: string, locale?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale ?? undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatDateOnly(value: string, locale?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale ?? undefined, {
    dateStyle: 'medium',
  }).format(date);
}

function formatMajorAmount(amountMinorUnits: number, minorUnit?: number | null) {
  const safeMinorUnit =
    typeof minorUnit === 'number' && Number.isInteger(minorUnit) && minorUnit >= 0 ? minorUnit : 2;
  return (amountMinorUnits / getCurrencyMultiplier(safeMinorUnit)).toFixed(safeMinorUnit);
}

function historyTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'confirmed') {
    return 'success';
  }
  if (status === 'disputed') {
    return 'danger';
  }
  if (status === 'pending') {
    return 'warning';
  }
  return 'neutral';
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

const styles = StyleSheet.create({
  section: {
    gap: tokens.spacing.sm,
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  muted: {
    color: tokens.colors.inkSoft,
    lineHeight: 20,
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  summaryLabel: {
    color: tokens.colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    color: tokens.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  historyRow: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: tokens.spacing.sm,
  },
  historyCopy: {
    flex: 1,
    gap: 4,
  },
  historyAmount: {
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: tokens.colors.ink,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default RemittanceHistoryScreen;
