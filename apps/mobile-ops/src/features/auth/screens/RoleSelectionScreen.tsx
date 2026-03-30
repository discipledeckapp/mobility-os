'use client';

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/card';
import { Screen } from '../../../components/screen';
import { useAppEntry, type AppEntryRole } from '../../../contexts/app-entry-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

const ROLE_OPTIONS: Array<{
  id: AppEntryRole;
  title: string;
  subtitle: string;
  symbol: string;
}> = [
  {
    id: 'driver',
    title: 'Driver',
    subtitle: 'Accept assignments, verify identity, and continue onboarding.',
    symbol: '◎',
  },
  {
    id: 'operator',
    title: 'Fleet Manager / Operator',
    subtitle: 'Create your organisation, add vehicles, add drivers, and monitor operations.',
    symbol: '◧',
  },
  {
    id: 'guarantor',
    title: 'Guarantor',
    subtitle: 'Confirm a driver invite and complete guarantor verification.',
    symbol: '◇',
  },
];

export function RoleSelectionScreen({ navigation }: ScreenProps<'RoleSelection'>) {
  const { selectedRole, setSelectedRole } = useAppEntry();

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logoCore}>
          <Text style={styles.logoMark}>M</Text>
        </View>
        <Text style={styles.productName}>Mobiris Fleet OS</Text>
        <Text style={styles.stepLabel}>Step 1 of 2</Text>
        <Text style={styles.title}>Choose your path</Text>
        <Text style={styles.subtitle}>We will only show the steps that match this role.</Text>
      </View>

      <View style={styles.optionList}>
        {ROLE_OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => {
              void setSelectedRole(option.id).then(() => {
                navigation.replace('Login');
              });
            }}
          >
            <Card
              style={[
                styles.optionCard,
                selectedRole === option.id ? styles.optionCardSelected : null,
              ]}
            >
              <View style={styles.optionIconWrap}>
                <Text style={styles.optionIcon}>{option.symbol}</Text>
              </View>
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.lg,
  },
  logoCore: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
    shadowColor: '#2563EB',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  logoMark: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  productName: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stepLabel: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  optionList: {
    gap: tokens.spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    minHeight: 96,
  },
  optionCardSelected: {
    borderColor: tokens.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  optionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  optionIcon: {
    color: tokens.colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  optionSubtitle: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
});
