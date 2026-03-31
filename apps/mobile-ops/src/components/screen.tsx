import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollView as ScrollViewHandle,
  type ScrollViewProps,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useRef } from 'react';
import { ScreenScrollProvider } from './screen-scroll-context';
import { tokens } from '../theme/tokens';

interface ScreenProps extends ScrollViewProps {
  padded?: boolean;
  footer?: ScrollViewProps['children'];
}

export function Screen({
  children,
  padded = true,
  footer,
  contentContainerStyle,
  ...props
}: ScreenProps) {
  const scrollRef = useRef<ScrollViewHandle>(null);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const scrollContextValue = useMemo(
    () => ({
      scrollToInput: (y: number) => {
        const offset = Math.max(0, y - height * 0.22);
        scrollRef.current?.scrollTo({ y: offset, animated: true });
      },
    }),
    [height],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? Math.max(insets.top, 8) : 0}
        style={styles.flex}
      >
        <ScreenScrollProvider value={scrollContextValue}>
          <ScrollView
            ref={scrollRef}
            automaticallyAdjustKeyboardInsets
            contentInsetAdjustmentBehavior="always"
            contentContainerStyle={[
              styles.content,
              padded ? styles.padded : null,
              footer ? styles.withFooterInset : null,
              contentContainerStyle,
            ]}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            {...props}
          >
            <View style={styles.inner}>{children}</View>
          </ScrollView>
        </ScreenScrollProvider>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl * 1.5,
  },
  withFooterInset: {
    paddingBottom: tokens.spacing.xl * 5,
  },
  inner: {
    gap: tokens.spacing.md,
  },
  footer: {
    backgroundColor: 'transparent',
  },
});
