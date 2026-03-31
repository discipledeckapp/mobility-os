'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { listRemittanceHistory, type RemittanceRecord } from '../../../api';
import { Badge } from '../../../components/badge';
import { BottomNav } from '../../../components/bottom-nav';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { PageShell, SectionIntro } from '../../../components/page-shell';
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
    const settledMinorUnits = history
      .filter((record) => record.status === 'completed' || record.status === 'partially_settled')
      .reduce((sum, record) => sum + record.amountMinorUnits, 0);
    const outstandingMinorUnits = history.reduce(
      (sum, record) => sum + (record.reconciliation?.outstandingBalanceMinorUnits ?? 0),
      0,
    );

    return {
      totalMinorUnits,
      pendingMinorUnits,
      settledMinorUnits,
      outstandingMinorUnits,
    };
  }, [history]);

  return (
    <Screen
      footer={<BottomNav currentTab="Remittance" navigation={navigation} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <PageShell
        eyebrow="Remittance"
        title="Remittance history"
        subtitle="Review the collections recorded from this device, including outstanding balances and partial settlement."
      />

      <Card style={styles.section}>
        <SectionIntro
          title="Summary"
          subtitle="Keep an eye on what is pending, what has settled, and what is still outstanding."
        />
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
          <Text style={styles.summaryLabel}>Settled</Text>
          <Text style={styles.summaryValue}>
            {currencyLabel} {formatMajorAmount(totals.settledMinorUnits, session?.currencyMinorUnit)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Outstanding</Text>
          <Text style={styles.summaryValue}>
            {currencyLabel} {formatMajorAmount(totals.outstandingMinorUnits, session?.currencyMinorUnit)}
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <SectionIntro
          title="Collections"
          subtitle="Each entry shows settlement state, variance, and remaining balance where available."
        />
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
                {record.reconciliation ? (
                  <>
                    <Text style={styles.meta}>
                      Expected {currencyLabel}{' '}
                      {formatMajorAmount(
                        record.reconciliation.expectedAmountMinorUnits,
                        session?.currencyMinorUnit,
                      )}
                    </Text>
                    <Text style={styles.meta}>
                      Variance {record.reconciliation.varianceMinorUnits < 0 ? '-' : '+'}
                      {currencyLabel}{' '}
                      {formatMajorAmount(
                        Math.abs(record.reconciliation.varianceMinorUnits),
                        session?.currencyMinorUnit,
                      )}
                    </Text>
                    {(record.reconciliation.outstandingBalanceMinorUnits ?? 0) > 0 ? (
                      <Text style={styles.meta}>
                        Outstanding {currencyLabel}{' '}
                        {formatMajorAmount(
                          record.reconciliation.outstandingBalanceMinorUnits ?? 0,
                          session?.currencyMinorUnit,
                        )}
                      </Text>
                    ) : null}
                  </>
                ) : null}
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
  if (status === 'completed' || status === 'partially_settled') {
    return 'success';
  }
  if (status === 'disputed' || status === 'cancelled_due_to_assignment_end') {
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
  muted: {
    color: tokens.colors.inkSoft,
    lineHeight: 20,
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
