'use client';

import { useQuery } from '@tanstack/react-query';
import { describeRemittanceSchedule } from '@mobility-os/domain-config';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { listOperatorAssignments } from '../../../api';
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
import { assignmentStatusTone } from '../../../utils/status';

export function OperatorAssignmentsScreen({ navigation }: ScreenProps<'OperatorAssignments'>) {
  const assignmentsQuery = useQuery({
    queryKey: ['operator-assignments'],
    queryFn: () => listOperatorAssignments({ page: 1, limit: 100 }),
  });

  return (
    <Screen
      footer={<OperatorBottomNav currentTab="OperatorAssignments" navigation={navigation} />}
      refreshControl={<RefreshControl refreshing={assignmentsQuery.isRefetching} onRefresh={() => void assignmentsQuery.refetch()} />}
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Assignments</Text>
        <Text style={styles.copy}>Review and dispatch assignments across the tenant fleet.</Text>
        <Button label="Create assignment" onPress={() => navigation.navigate('OperatorAssignmentCreate')} />
      </Card>

      {assignmentsQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={88} /></Card>
          <Card><LoadingSkeleton height={88} /></Card>
        </>
      ) : assignmentsQuery.data?.data.length ? (
        assignmentsQuery.data.data.map((assignment) => (
          <Card key={assignment.id} style={styles.assignmentCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.assignmentCode}>Assignment {assignment.id.slice(-6).toUpperCase()}</Text>
              <Badge label={formatStatusLabel(assignment.status)} tone={assignmentStatusTone(assignment.status)} />
            </View>
            <Text style={styles.meta}>Driver: {assignment.driverId.slice(-8)}</Text>
            <Text style={styles.meta}>Vehicle: {assignment.vehicleId.slice(-8)}</Text>
            <Text style={styles.meta}>Started: {formatDateTime(assignment.startedAt)}</Text>
            {assignment.remittanceAmountMinorUnits ? (
              <Text style={styles.meta}>
                Expected remittance: {assignment.remittanceCurrency ?? 'NGN'} {assignment.remittanceAmountMinorUnits / 100}
                {' • '}
                {describeRemittanceSchedule({
                  remittanceFrequency: assignment.remittanceFrequency,
                  ...(assignment.remittanceCollectionDay !== undefined
                    ? { remittanceCollectionDay: assignment.remittanceCollectionDay }
                    : {}),
                })}
              </Text>
            ) : (
              <Text style={styles.meta}>No remittance plan configured yet.</Text>
            )}
          </Card>
        ))
      ) : (
        <EmptyState
          actionLabel="Refresh assignments"
          message="No assignments are available yet."
          title="No assignments"
          onAction={() => void assignmentsQuery.refetch()}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
  assignmentCard: { gap: tokens.spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: tokens.spacing.sm },
  assignmentCode: { color: tokens.colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default OperatorAssignmentsScreen;
