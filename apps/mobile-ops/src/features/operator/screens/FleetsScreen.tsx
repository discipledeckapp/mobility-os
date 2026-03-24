'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { getOperatingUnit, listFleets } from '../../../api';
import { Badge } from '../../../components/badge';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatStatusLabel } from '../../../utils/formatting';

export function FleetsScreen({ navigation, route }: ScreenProps<'OperatorFleets'>) {
  const operatingUnitId = route.params?.operatingUnitId;
  const unitQuery = useQuery({
    queryKey: ['operator-operating-unit', operatingUnitId],
    queryFn: () => getOperatingUnit(operatingUnitId ?? ''),
    enabled: Boolean(operatingUnitId),
  });
  const fleetsQuery = useQuery({
    queryKey: ['operator-fleets', operatingUnitId ?? 'all'],
    queryFn: () => listFleets({ operatingUnitId }),
  });

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={fleetsQuery.isRefetching}
          onRefresh={() => void fleetsQuery.refetch()}
        />
      }
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Fleets</Text>
        <Text style={styles.copy}>
          {unitQuery.data
            ? `Fleets under ${unitQuery.data.name}.`
            : 'Fleets are the deployable groups that assignments and vehicles attach to.'}
        </Text>
        <Text
          style={styles.link}
          onPress={() =>
            navigation.navigate('OperatorFleetDetail', {
              operatingUnitId,
            })
          }
        >
          Add fleet
        </Text>
      </Card>

      {fleetsQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={96} /></Card>
          <Card><LoadingSkeleton height={96} /></Card>
        </>
      ) : fleetsQuery.data?.length ? (
        fleetsQuery.data.map((fleet) => (
          <Card key={fleet.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{fleet.name}</Text>
            <Text style={styles.meta}>
              {fleet.businessModel} · operating unit {fleet.operatingUnitId}
            </Text>
            <Badge label={formatStatusLabel(fleet.status)} tone="neutral" />
            <Text
              style={styles.link}
              onPress={() =>
                navigation.navigate('OperatorFleetDetail', {
                  fleetId: fleet.id,
                  operatingUnitId: fleet.operatingUnitId,
                })
              }
            >
              Edit fleet
            </Text>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No fleets"
          message="Create a fleet so operators can assign drivers and vehicles."
          actionLabel="Create fleet"
          onAction={() =>
            navigation.navigate('OperatorFleetDetail', {
              operatingUnitId,
            })
          }
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
  itemTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
  link: { color: tokens.colors.primary, fontWeight: '700' },
});

export default FleetsScreen;
