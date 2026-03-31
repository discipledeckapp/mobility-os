import { Feather } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

type BottomNavTab = 'Home' | 'Remittance' | 'Notifications' | 'Profile';

const tabs: Array<{ key: BottomNavTab; label: string; icon: React.ComponentProps<typeof Feather>['name'] }> = [
  { key: 'Home', label: 'Home', icon: 'home' },
  { key: 'Remittance', label: 'Remittance', icon: 'credit-card' },
  { key: 'Notifications', label: 'Alerts', icon: 'bell' },
  { key: 'Profile', label: 'Profile', icon: 'user' },
];

interface BottomNavProps {
  currentTab: BottomNavTab;
  navigation: NavigationProp<RootStackParamList>;
}

export function BottomNav({ currentTab, navigation }: BottomNavProps) {
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
                  if (tab.key === 'Remittance') {
                    navigation.navigate('Remittance', {});
                  } else {
                    navigation.navigate(tab.key);
                  }
                }
              }}
              style={[styles.item, active ? styles.itemActive : null]}
            >
              <View style={[styles.icon, active ? styles.iconActive : null]}>
                <Feather
                  color={active ? '#FFFFFF' : tokens.colors.inkSoft}
                  name={tab.icon}
                  size={16}
                />
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
    gap: tokens.spacing.sm,
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
    width: 32,
    height: 32,
    borderRadius: 16,
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
  label: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  labelActive: {
    color: tokens.colors.ink,
  },
});
