import { ScrollView, type ScrollViewProps, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';

interface ScreenProps extends ScrollViewProps {
  padded?: boolean;
}

export function Screen({ children, padded = true, contentContainerStyle, ...props }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          padded ? styles.padded : null,
          contentContainerStyle,
        ]}
        {...props}
      >
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  content: {
    flexGrow: 1,
  },
  padded: {
    padding: tokens.spacing.md,
  },
  inner: {
    gap: tokens.spacing.md,
  },
});
