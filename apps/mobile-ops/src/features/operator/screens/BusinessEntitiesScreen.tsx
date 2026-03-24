'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { listBusinessEntities } from '../../../api';
import { Badge } from '../../../components/badge';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { formatStatusLabel } from '../../../utils/formatting';

export function BusinessEntitiesScreen({ navigation }: ScreenProps<'OperatorBusinessEntities'>) {
  const entitiesQuery = useQuery({
    queryKey: ['operator-business-entities'],
    queryFn: listBusinessEntities,
  });

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={entitiesQuery.isRefetching}
          onRefresh={() => void entitiesQuery.refetch()}
        />
      }
    >
      <Card style={styles.section}>
        <Text style={styles.title}>Business entities</Text>
        <Text style={styles.copy}>
          Set up the legal and operational entities that sit above your operating units and fleets.
        </Text>
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('OperatorBusinessEntityDetail')}
        >
          Add business entity
        </Text>
      </Card>

      {entitiesQuery.isLoading ? (
        <>
          <Card><LoadingSkeleton height={96} /></Card>
          <Card><LoadingSkeleton height={96} /></Card>
        </>
      ) : entitiesQuery.data?.length ? (
        entitiesQuery.data.map((entity) => (
          <Card key={entity.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{entity.name}</Text>
            <Text style={styles.meta}>
              {entity.country} · {entity.businessModel}
            </Text>
            <Badge label={formatStatusLabel(entity.status)} tone="neutral" />
            <Text
              style={styles.link}
              onPress={() =>
                navigation.navigate('OperatorBusinessEntityDetail', {
                  businessEntityId: entity.id,
                })
              }
            >
              Edit entity
            </Text>
            <Text
              style={styles.link}
              onPress={() =>
                navigation.navigate('OperatorOperatingUnits', {
                  businessEntityId: entity.id,
                })
              }
            >
              Open operating units
            </Text>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No business entities"
          message="Create your first business entity to organise operating units and fleets."
          actionLabel="Create entity"
          onAction={() => navigation.navigate('OperatorBusinessEntityDetail')}
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

export default BusinessEntitiesScreen;
