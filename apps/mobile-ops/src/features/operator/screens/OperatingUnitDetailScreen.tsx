'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import {
  createOperatingUnit,
  getOperatingUnit,
  listBusinessEntities,
  updateOperatingUnit,
} from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function OperatingUnitDetailScreen({
  navigation,
  route,
}: ScreenProps<'OperatorOperatingUnitDetail'>) {
  const operatingUnitId = route.params?.operatingUnitId;
  const initialBusinessEntityId = route.params?.businessEntityId ?? '';
  const isEditing = Boolean(operatingUnitId);
  const queryClient = useQueryClient();
  const entitiesQuery = useQuery({
    queryKey: ['operator-business-entities'],
    queryFn: listBusinessEntities,
  });
  const unitQuery = useQuery({
    queryKey: ['operator-operating-unit', operatingUnitId],
    queryFn: () => getOperatingUnit(operatingUnitId ?? ''),
    enabled: isEditing,
  });
  const [businessEntityId, setBusinessEntityId] = useState(initialBusinessEntityId);
  const [name, setName] = useState('');

  useEffect(() => {
    if (unitQuery.data) {
      setBusinessEntityId(unitQuery.data.businessEntityId);
      setName(unitQuery.data.name);
    }
  }, [unitQuery.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        businessEntityId: businessEntityId.trim(),
        name: name.trim(),
      };
      return isEditing && operatingUnitId
        ? updateOperatingUnit(operatingUnitId, payload)
        : createOperatingUnit(payload);
    },
    onSuccess: async (unit) => {
      await queryClient.invalidateQueries({ queryKey: ['operator-operating-units'] });
      await queryClient.invalidateQueries({ queryKey: ['operator-operating-unit', unit.id] });
      Alert.alert(
        isEditing ? 'Operating unit updated' : 'Operating unit created',
        `${unit.name} is ready for fleet setup.`,
      );
      navigation.replace('OperatorOperatingUnitDetail', {
        operatingUnitId: unit.id,
        businessEntityId: unit.businessEntityId,
      });
    },
    onError: (error) => {
      Alert.alert(
        'Operating unit',
        error instanceof Error ? error.message : 'Unable to save the operating unit.',
      );
    },
  });

  const onSubmit = () => {
    if (!businessEntityId.trim() || !name.trim()) {
      Alert.alert('Operating unit', 'Business entity and unit name are required.');
      return;
    }
    mutation.mutate();
  };

  if (unitQuery.isLoading) {
    return (
      <Screen>
        <Card><LoadingSkeleton height={180} /></Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.section}>
        <Text style={styles.title}>{isEditing ? 'Edit operating unit' : 'Create operating unit'}</Text>
        <Text style={styles.copy}>
          Operating units map branches, depots, and local execution teams.
        </Text>
      </Card>

      <Card style={styles.section}>
        <Input
          helperText={`Available business entity ids: ${(entitiesQuery.data ?? []).map((entity) => entity.id).join(', ') || 'none'}`}
          label="Business entity ID"
          onChangeText={setBusinessEntityId}
          value={businessEntityId}
        />
        <Input label="Operating unit name" onChangeText={setName} value={name} />
        <Button
          label={isEditing ? 'Update operating unit' : 'Create operating unit'}
          loading={mutation.isPending}
          onPress={onSubmit}
        />
        {isEditing && operatingUnitId ? (
          <Button
            label="Open fleets"
            variant="secondary"
            onPress={() =>
              navigation.navigate('OperatorFleets', {
                operatingUnitId,
              })
            }
          />
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default OperatingUnitDetailScreen;
