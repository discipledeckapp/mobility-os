'use client';

import { getAllBusinessModelSlugs } from '@mobility-os/domain-config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { createFleet, getFleet, listOperatingUnits, updateFleet } from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

const BUSINESS_MODELS = getAllBusinessModelSlugs();

export function FleetDetailScreen({ navigation, route }: ScreenProps<'OperatorFleetDetail'>) {
  const fleetId = route.params?.fleetId;
  const initialOperatingUnitId = route.params?.operatingUnitId ?? '';
  const isEditing = Boolean(fleetId);
  const queryClient = useQueryClient();
  const unitsQuery = useQuery({
    queryKey: ['operator-operating-units', 'all'],
    queryFn: () => listOperatingUnits(),
  });
  const fleetQuery = useQuery({
    queryKey: ['operator-fleet', fleetId],
    queryFn: () => getFleet(fleetId ?? ''),
    enabled: isEditing,
  });
  const [operatingUnitId, setOperatingUnitId] = useState(initialOperatingUnitId);
  const [name, setName] = useState('');
  const [businessModel, setBusinessModel] = useState(BUSINESS_MODELS[0] ?? 'hire-purchase');

  useEffect(() => {
    if (fleetQuery.data) {
      setOperatingUnitId(fleetQuery.data.operatingUnitId);
      setName(fleetQuery.data.name);
      setBusinessModel(fleetQuery.data.businessModel);
    }
  }, [fleetQuery.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        operatingUnitId: operatingUnitId.trim(),
        name: name.trim(),
        businessModel: businessModel.trim(),
      };
      return isEditing && fleetId ? updateFleet(fleetId, payload) : createFleet(payload);
    },
    onSuccess: async (fleet) => {
      await queryClient.invalidateQueries({ queryKey: ['operator-fleets'] });
      await queryClient.invalidateQueries({ queryKey: ['operator-fleet', fleet.id] });
      Alert.alert(
        isEditing ? 'Fleet updated' : 'Fleet created',
        `${fleet.name} is ready for vehicles and dispatch.`,
      );
      navigation.replace('OperatorFleetDetail', {
        fleetId: fleet.id,
        operatingUnitId: fleet.operatingUnitId,
      });
    },
    onError: (error) => {
      Alert.alert('Fleet', error instanceof Error ? error.message : 'Unable to save the fleet.');
    },
  });

  const onSubmit = () => {
    if (!operatingUnitId.trim() || !name.trim() || !businessModel.trim()) {
      Alert.alert('Fleet', 'Operating unit, fleet name, and business model are required.');
      return;
    }
    mutation.mutate();
  };

  if (fleetQuery.isLoading) {
    return (
      <Screen>
        <Card><LoadingSkeleton height={180} /></Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.section}>
        <Text style={styles.title}>{isEditing ? 'Edit fleet' : 'Create fleet'}</Text>
        <Text style={styles.copy}>
          Fleets sit inside operating units and carry the business model used for operations.
        </Text>
      </Card>

      <Card style={styles.section}>
        <Input
          helperText={`Available operating unit ids: ${(unitsQuery.data ?? []).map((unit) => unit.id).join(', ') || 'none'}`}
          label="Operating unit ID"
          onChangeText={setOperatingUnitId}
          value={operatingUnitId}
        />
        <Input label="Fleet name" onChangeText={setName} value={name} />
        <Input
          helperText={`Available business models: ${BUSINESS_MODELS.join(', ')}`}
          label="Business model"
          onChangeText={setBusinessModel}
          value={businessModel}
        />
        <Button
          label={isEditing ? 'Update fleet' : 'Create fleet'}
          loading={mutation.isPending}
          onPress={onSubmit}
        />
        {isEditing ? (
          <Button
            label="Open vehicles"
            variant="secondary"
            onPress={() => navigation.navigate('OperatorVehicles')}
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

export default FleetDetailScreen;
