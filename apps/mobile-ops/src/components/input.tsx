import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { tokens } from '../theme/tokens';

interface InputProps extends TextInputProps {
  label: string;
  helperText?: string;
  errorText?: string;
}

export function Input({ label, helperText, errorText, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityHint={props.accessibilityHint ?? helperText}
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={tokens.colors.inkSoft}
        style={[styles.input, errorText ? styles.inputError : null, style]}
        {...props}
      />
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
      {!errorText && helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.ink,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: tokens.colors.ink,
  },
  inputError: {
    borderColor: tokens.colors.error,
  },
  helper: {
    fontSize: 12,
    color: tokens.colors.inkSoft,
  },
  error: {
    fontSize: 12,
    color: tokens.colors.error,
  },
});
