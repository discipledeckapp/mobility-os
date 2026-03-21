import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.base, toneStyles[tone]]}>
      <Text style={[styles.label, textStyles[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});

const toneStyles = StyleSheet.create({
  neutral: {
    backgroundColor: tokens.colors.primaryTint,
  },
  success: {
    backgroundColor: '#E8F8F0',
  },
  warning: {
    backgroundColor: '#FFF5E5',
  },
  danger: {
    backgroundColor: '#FDECEC',
  },
});

const textStyles = StyleSheet.create({
  neutral: {
    color: tokens.colors.primaryDark,
  },
  success: {
    color: tokens.colors.success,
  },
  warning: {
    color: tokens.colors.warning,
  },
  danger: {
    color: tokens.colors.error,
  },
});
