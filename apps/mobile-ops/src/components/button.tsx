import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import { tokens } from '../theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  containerStyle,
  onPress,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  const handlePress: PressableProps['onPress'] = (event) => {
    Haptics.selectionAsync().catch(() => {
      // Ignore unsupported haptic environments.
    });
    onPress?.(event);
  };

  return (
    <Pressable
      accessibilityHint={props.accessibilityHint}
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        containerStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? tokens.colors.ink : '#FFFFFF'} />
      ) : (
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: tokens.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.md,
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderColor: tokens.colors.border,
  },
  danger: {
    backgroundColor: tokens.colors.error,
    borderColor: tokens.colors.error,
  },
});

const labelStyles = StyleSheet.create({
  primary: {
    color: '#FFFFFF',
  },
  secondary: {
    color: tokens.colors.ink,
  },
  danger: {
    color: '#FFFFFF',
  },
});
