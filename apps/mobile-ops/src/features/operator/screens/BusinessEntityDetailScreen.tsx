'use client';

import { getAllBusinessModelSlugs, getSupportedCountryCodes } from '@mobility-os/domain-config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import {
  createBusinessEntity,
  getBusinessEntity,
  updateBusinessEntity,
} from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

const BUSINESS_MODELS = getAllBusinessModelSlugs();
const COUNTRY_CODES = getSupportedCountryCodes();

export function BusinessEntityDetailScreen({
  navigation,
  route,
}: ScreenProps<'OperatorBusinessEntityDetail'>) {
  const businessEntityId = route.params?.businessEntityId;
  const isEditing = Boolean(businessEntityId);
  const queryClient = useQueryClient();
  const entityQuery = useQuery({
    queryKey: ['operator-business-entity', businessEntityId],
    queryFn: () => getBusinessEntity(businessEntityId ?? ''),
    enabled: isEditing,
  });
  const [name, setName] = useState('');
  const [country, setCountry] = useState('NG');
  const [businessModel, setBusinessModel] = useState(BUSINESS_MODELS[0] ?? 'hire-purchase');

  useEffect(() => {
    if (entityQuery.data) {
      setName(entityQuery.data.name);
      setCountry(entityQuery.data.country);
      setBusinessModel(entityQuery.data.businessModel);
    }
  }, [entityQuery.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        country: country.trim().toUpperCase(),
        businessModel: businessModel.trim(),
      };
      return isEditing && businessEntityId
        ? updateBusinessEntity(businessEntityId, payload)
        : createBusinessEntity(payload);
    },
    onSuccess: async (entity) => {
      await queryClient.invalidateQueries({ queryKey: ['operator-business-entities'] });
      await queryClient.invalidateQueries({ queryKey: ['operator-business-entity', entity.id] });
      Alert.alert(
        isEditing ? 'Business entity updated' : 'Business entity created',
        `${entity.name} is ready for operating-unit setup.`,
      );
      navigation.replace('OperatorBusinessEntityDetail', { businessEntityId: entity.id });
    },
    onError: (error) => {
      Alert.alert(
        'Business entity',
        error instanceof Error ? error.message : 'Unable to save the business entity.',
      );
    },
  });

  const onSubmit = () => {
    if (!name.trim() || !country.trim() || !businessModel.trim()) {
      Alert.alert('Business entity', 'Name, country, and business model are required.');
      return;
    }
    mutation.mutate();
  };

  if (entityQuery.isLoading) {
    return (
      <Screen>
        <Card><LoadingSkeleton height={180} /></Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.section}>
        <Text style={styles.title}>{isEditing ? 'Edit business entity' : 'Create business entity'}</Text>
        <Text style={styles.copy}>
          Business entities are the top-level operator structure above operating units and fleets.
        </Text>
      </Card>

      <Card style={styles.section}>
        <Input label="Entity name" onChangeText={setName} value={name} />
        <Input
          autoCapitalize="characters"
          helperText={`Supported examples: ${COUNTRY_CODES.slice(0, 10).join(', ')}`}
          label="Country"
          maxLength={2}
          onChangeText={setCountry}
          value={country}
        />
        <Input
          helperText={`Available business models: ${BUSINESS_MODELS.join(', ')}`}
          label="Business model"
          onChangeText={setBusinessModel}
          value={businessModel}
        />
        <Button
          label={isEditing ? 'Update business entity' : 'Create business entity'}
          loading={mutation.isPending}
          onPress={onSubmit}
        />
        {isEditing && businessEntityId ? (
          <Button
            label="Open operating units"
            variant="secondary"
            onPress={() =>
              navigation.navigate('OperatorOperatingUnits', {
                businessEntityId,
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

export default BusinessEntityDetailScreen;
