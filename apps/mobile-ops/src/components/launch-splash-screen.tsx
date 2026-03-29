import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';

export function LaunchSplashScreen({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity }]}>
      <View style={styles.logoHalo} />
      <View style={styles.logoCore}>
        <Text style={styles.logoMark}>M</Text>
      </View>
      <Text style={styles.title}>Mobiris Fleet OS</Text>
      <Text style={styles.subtitle}>Fleet & Driver Operations Platform</Text>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              transform: [
                {
                  scaleX: opacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.82, 1],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

export function createSplashFadeAnimation(value: Animated.Value) {
  return Animated.timing(value, {
    toValue: 0,
    duration: 240,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
    zIndex: 50,
  },
  logoHalo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  logoCore: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
    shadowColor: '#2563EB',
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  logoMark: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  title: {
    marginTop: tokens.spacing.lg,
    color: tokens.colors.ink,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: tokens.spacing.sm,
    color: tokens.colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  progressTrack: {
    marginTop: tokens.spacing.lg,
    width: 144,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
    overflow: 'hidden',
  },
  progressBar: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: tokens.colors.primary,
  },
});
