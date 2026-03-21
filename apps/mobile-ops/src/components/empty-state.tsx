import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';
import { Button } from './button';
import { Card } from './card';

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xl,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.primaryTint,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: tokens.colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
  },
});
