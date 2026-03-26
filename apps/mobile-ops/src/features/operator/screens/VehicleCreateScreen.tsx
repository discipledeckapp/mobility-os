'use client';

import { VEHICLE_TYPES } from '@mobility-os/domain-config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createVehicle, listFleets } from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

// ---------------------------------------------------------------------------
// Inline picker sheet — used for fleet and vehicle type selection
// ---------------------------------------------------------------------------

interface PickerSheetProps<T extends string> {
  visible: boolean;
  title: string;
  options: { value: T; label: string; sublabel?: string }[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

function PickerSheet<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: PickerSheetProps<T>) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={pickerStyles.overlay} onPress={onClose}>
        <View style={pickerStyles.sheet}>
          <View style={pickerStyles.handle} />
          <Text style={pickerStyles.sheetTitle}>{title}</Text>
          <ScrollView style={pickerStyles.list} bounces={false}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[pickerStyles.option, opt.value === selected && pickerStyles.optionSelected]}
                onPress={() => { onSelect(opt.value); onClose(); }}
                activeOpacity={0.7}
              >
                <Text style={[pickerStyles.optionLabel, opt.value === selected && pickerStyles.optionLabelSelected]}>
                  {opt.label}
                </Text>
                {opt.sublabel ? (
                  <Text style={pickerStyles.optionSublabel}>{opt.sublabel}</Text>
                ) : null}
                {opt.value === selected ? (
                  <Text style={pickerStyles.checkmark}>✓</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: tokens.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: tokens.colors.ink,
    marginBottom: 12,
  },
  list: { flexGrow: 0 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.border,
    gap: 8,
  },
  optionSelected: {
    backgroundColor: `${tokens.colors.primary}10`,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: tokens.colors.ink,
  },
  optionLabelSelected: {
    color: tokens.colors.primary,
    fontWeight: '600',
  },
  optionSublabel: {
    fontSize: 12,
    color: tokens.colors.inkSoft,
  },
  checkmark: {
    fontSize: 16,
    color: tokens.colors.primary,
    fontWeight: '700',
  },
});

// ---------------------------------------------------------------------------
// Selector row — tappable field that opens a picker sheet
// ---------------------------------------------------------------------------

interface SelectorRowProps {
  label: string;
  value: string;
  placeholder?: string;
  onPress: () => void;
}

function SelectorRow({ label, value, placeholder, onPress }: SelectorRowProps) {
  return (
    <TouchableOpacity style={selectorStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={selectorStyles.label}>{label}</Text>
      <View style={selectorStyles.field}>
        <Text style={[selectorStyles.value, !value && selectorStyles.placeholder]}>
          {value || placeholder || 'Select…'}
        </Text>
        <Text style={selectorStyles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const selectorStyles = StyleSheet.create({
  row: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: tokens.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  value: {
    flex: 1,
    fontSize: 15,
    color: tokens.colors.ink,
  },
  placeholder: {
    color: tokens.colors.inkSoft,
  },
  chevron: {
    fontSize: 20,
    color: tokens.colors.inkSoft,
    lineHeight: 22,
  },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const vehicleTypeOptions = VEHICLE_TYPES.map((vt) => ({
  value: vt.slug,
  label: vt.name,
  sublabel: vt.category,
}));

export function VehicleCreateScreen({ navigation }: ScreenProps<'OperatorVehicleCreate'>) {
  const fleetsQuery = useQuery({
    queryKey: ['operator-vehicle-create', 'fleets'],
    queryFn: () => listFleets(),
  });

  const [fleetId, setFleetId] = useState('');
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]?.slug ?? 'motorcycle');
  const [tenantVehicleCode, setTenantVehicleCode] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('');

  const [fleetPickerOpen, setFleetPickerOpen] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const fleetOptions = (fleetsQuery.data ?? []).map((fleet) => ({
    value: fleet.id,
    label: fleet.name,
    sublabel: fleet.id,
  }));

  const selectedFleetLabel =
    fleetOptions.find((f) => f.value === fleetId)?.label ?? '';

  const selectedVehicleTypeLabel =
    vehicleTypeOptions.find((v) => v.value === vehicleType)?.label ?? vehicleType;

  const createMutation = useMutation({
    mutationFn: () =>
      createVehicle({
        fleetId,
        tenantVehicleCode: tenantVehicleCode.trim() || undefined,
        vehicleType,
        make,
        model,
        year: Number(year),
        plate: plate.trim() || undefined,
        vin: vin.trim() || undefined,
        color: color.trim() || undefined,
      }),
    onSuccess: (vehicle) => {
      Alert.alert('Vehicle created', 'The vehicle has been created successfully.');
      navigation.navigate('OperatorVehicleDetail', { vehicleId: vehicle.id });
    },
    onError: (error) => {
      Alert.alert(
        'Create vehicle',
        error instanceof Error ? error.message : 'Unable to create the vehicle.',
      );
    },
  });

  const onSubmit = () => {
    if (!fleetId) {
      Alert.alert('Create vehicle', 'Select a fleet for this vehicle.');
      return;
    }
    if (!make.trim() || !model.trim() || !year.trim()) {
      Alert.alert('Create vehicle', 'Make, model, and year are required.');
      return;
    }
    createMutation.mutate();
  };

  return (
    <Screen>
      <Card style={styles.section}>
        <Text style={styles.title}>Create vehicle</Text>
        <Text style={styles.copy}>Add a fleet asset from mobile for field operations and dispatch.</Text>
      </Card>

      <Card style={styles.section}>
        {fleetsQuery.isLoading ? (
          <LoadingSkeleton height={60} />
        ) : (
          <SelectorRow
            label="Fleet *"
            value={selectedFleetLabel}
            placeholder={fleetsQuery.data?.length === 0 ? 'No fleets available' : 'Select fleet…'}
            onPress={() => {
              if ((fleetsQuery.data?.length ?? 0) > 0) setFleetPickerOpen(true);
            }}
          />
        )}
        <SelectorRow
          label="Vehicle type *"
          value={selectedVehicleTypeLabel}
          onPress={() => setTypePickerOpen(true)}
        />
        <Input label="Tenant vehicle code" onChangeText={setTenantVehicleCode} value={tenantVehicleCode} />
        <Input label="Make *" onChangeText={setMake} value={make} />
        <Input label="Model *" onChangeText={setModel} value={model} />
        <Input keyboardType="number-pad" label="Year *" onChangeText={setYear} value={year} />
        <Input label="Plate" onChangeText={setPlate} value={plate} />
        <Input label="VIN" onChangeText={setVin} value={vin} />
        <Input label="Color" onChangeText={setColor} value={color} />
        <Button label="Create vehicle" loading={createMutation.isPending} onPress={onSubmit} />
      </Card>

      <PickerSheet
        visible={fleetPickerOpen}
        title="Select fleet"
        options={fleetOptions}
        selected={fleetId}
        onSelect={setFleetId}
        onClose={() => setFleetPickerOpen(false)}
      />
      <PickerSheet
        visible={typePickerOpen}
        title="Select vehicle type"
        options={vehicleTypeOptions}
        selected={vehicleType}
        onSelect={setVehicleType}
        onClose={() => setTypePickerOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default VehicleCreateScreen;
