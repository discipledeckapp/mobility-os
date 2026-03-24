'use client';

import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, StyleSheet, Text } from 'react-native';
import { confirmRemittance, disputeRemittance, getRemittance, waiveRemittance } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatDateOnly, formatMajorAmount, formatStatusLabel } from '../../../utils/formatting';
import { remittanceTone } from '../../../utils/status';

export function OperatorRemittanceDetailScreen({ navigation, route }: ScreenProps<'OperatorRemittanceDetail'>) {
  const [notes, setNotes] = React.useState('');
  const remittanceQuery = useQuery({
    queryKey: ['operator-remittance-detail', route.params.remittanceId],
    queryFn: () => getRemittance(route.params.remittanceId),
  });
  const actionMutation = useMutation({
    mutationFn: async (action: 'confirm' | 'dispute' | 'waive') => {
      if (action === 'confirm') {
        return confirmRemittance(route.params.remittanceId, new Date().toISOString().slice(0, 10));
      }
      if (!notes.trim()) {
        throw new Error('Add notes before disputing or waiving a remittance.');
      }
      return action === 'dispute'
        ? disputeRemittance(route.params.remittanceId, notes.trim())
        : waiveRemittance(route.params.remittanceId, notes.trim());
    },
    onSuccess: () => {
      Alert.alert('Remittance updated', 'The remittance status has been updated.');
      navigation.navigate('OperatorRemittance');
    },
    onError: (error) => {
      Alert.alert('Remittance', error instanceof Error ? error.message : 'Unable to update this remittance.');
    },
  });

  if (remittanceQuery.isLoading || !remittanceQuery.data) {
    return (
      <Screen>
        <Card><LoadingSkeleton height={160} /></Card>
      </Screen>
    );
  }

  const record = remittanceQuery.data;

  return (
    <Screen>
      <Card style={styles.section}>
        <Text style={styles.title}>{record.currency} {formatMajorAmount(record.amountMinorUnits)}</Text>
        <Badge label={formatStatusLabel(record.status)} tone={remittanceTone(record.status)} />
        <Text style={styles.meta}>Due date: {formatDateOnly(record.dueDate)}</Text>
        <Text style={styles.meta}>Assignment: {record.assignmentId}</Text>
        <Text style={styles.meta}>Driver: {record.driverId}</Text>
        <Text style={styles.meta}>Vehicle: {record.vehicleId}</Text>
      </Card>

      <Card style={styles.section}>
        <Input label="Resolution notes" multiline onChangeText={setNotes} value={notes} />
        <Button label="Confirm payment" loading={actionMutation.isPending} onPress={() => actionMutation.mutate('confirm')} />
        <Button label="Dispute remittance" loading={actionMutation.isPending} variant="secondary" onPress={() => actionMutation.mutate('dispute')} />
        <Button label="Waive remittance" loading={actionMutation.isPending} variant="secondary" onPress={() => actionMutation.mutate('waive')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default OperatorRemittanceDetailScreen;
