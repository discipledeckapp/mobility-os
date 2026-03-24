'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { getBusinessEntity, listOperatingUnits } from '../../../api';
import { Badge } from '../../../components/badge';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatStatusLabel } from '../../../utils/formatting';

export function OperatingUnitsScreen({ navigation, route }: ScreenProps<'OperatorOperatingUnits'>) {
  const businessEntityId = route.params?.businessEntityId;
  const entityQuery = useQuery({
    queryKey: ['operator-business-entity', businessEntityId],
    queryFn: () => getBusinessEntity(businessEntityId ?? ''),
    enabled: Boolean(businessEntityId),
  });
  const unitsQuery = useQuery({
    queryKey: ['operator-operating-units', businessEntityId ?? 'all'],
    queryFn: () => listOperatingUnits({ businessEntityId }),
  });

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={unitsQuery.isRefetching}
          onRefresh={() => void unitsQuery.refetch()}
        />
      }
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Operating units</Text>
        <Text style={styles.copy}>
          {entityQuery.data
            ? `Units under ${entityQuery.data.name}.`
            : 'Operating units group depots, branches, and execution zones.'}
        </Text>
        <Text
          style={styles.link}
          onPress={() =>
            navigation.navigate('OperatorOperatingUnitDetail', {
              businessEntityId,
            })
          }
        >
          Add operating unit
        </Text>
      </Card>

      {unitsQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={96} /></Card>
          <Card><LoadingSkeleton height={96} /></Card>
        </>
      ) : unitsQuery.data?.length ? (
        unitsQuery.data.map((unit) => (
          <Card key={unit.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{unit.name}</Text>
            <Text style={styles.meta}>Business entity: {unit.businessEntityId}</Text>
            <Badge label={formatStatusLabel(unit.status)} tone="neutral" />
            <Text
              style={styles.link}
              onPress={() =>
                navigation.navigate('OperatorOperatingUnitDetail', {
                  operatingUnitId: unit.id,
                  businessEntityId: unit.businessEntityId,
                })
              }
            >
              Edit operating unit
            </Text>
            <Text
              style={styles.link}
              onPress={() =>
                navigation.navigate('OperatorFleets', {
                  operatingUnitId: unit.id,
                })
              }
            >
              Open fleets
            </Text>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No operating units"
          message="Create an operating unit to organise fleets and vehicle dispatch."
          actionLabel="Create unit"
          onAction={() =>
            navigation.navigate('OperatorOperatingUnitDetail', {
              businessEntityId,
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

export default OperatingUnitsScreen;
