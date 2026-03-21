import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';
import { Button } from './button';

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Pressable onPress={onCancel} style={styles.backdrop}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button label="Back" onPress={onCancel} variant="secondary" />
            <Button label={confirmLabel} onPress={onConfirm} variant="danger" />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.md,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderRadius: tokens.radius.card,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  message: {
    color: tokens.colors.inkSoft,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
});
