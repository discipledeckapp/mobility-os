import type { NavigationProp } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

type OperatorBottomNavTab =
  | 'OperatorDashboard'
  | 'OperatorDrivers'
  | 'OperatorAssignments'
  | 'OperatorRemittance'
  | 'OperatorMore';

const tabs: Array<{ key: OperatorBottomNavTab; label: string; icon: string }> = [
  { key: 'OperatorDashboard', label: 'Dashboard', icon: 'D' },
  { key: 'OperatorDrivers', label: 'Drivers', icon: 'Dr' },
  { key: 'OperatorAssignments', label: 'Ops', icon: 'Op' },
  { key: 'OperatorRemittance', label: 'Cash', icon: '₦' },
  { key: 'OperatorMore', label: 'More', icon: '⋯' },
];

interface OperatorBottomNavProps {
  currentTab: OperatorBottomNavTab;
  navigation: NavigationProp<RootStackParamList>;
}

export function OperatorBottomNav({ currentTab, navigation }: OperatorBottomNavProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const active = tab.key === currentTab;
          return (
            <Pressable
              accessibilityRole="button"
              key={tab.key}
              onPress={() => {
                if (!active) {
                  navigation.navigate(tab.key);
                }
              }}
              style={[styles.item, active ? styles.itemActive : null]}
            >
              <View style={[styles.icon, active ? styles.iconActive : null]}>
                <Text style={[styles.iconLabel, active ? styles.iconLabelActive : null]}>
                  {tab.icon}
                </Text>
              </View>
              <Text style={[styles.label, active ? styles.labelActive : null]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.xs,
    paddingBottom: tokens.spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: tokens.radius.card,
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: tokens.spacing.xs,
  },
  itemActive: {
    backgroundColor: tokens.colors.primaryTint,
  },
  icon: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  iconActive: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  iconLabel: {
    color: tokens.colors.inkSoft,
    fontSize: 11,
    fontWeight: '800',
  },
  iconLabelActive: {
    color: '#FFFFFF',
  },
  label: {
    color: tokens.colors.inkSoft,
    fontSize: 11,
    fontWeight: '600',
  },
  labelActive: {
    color: tokens.colors.ink,
  },
});
