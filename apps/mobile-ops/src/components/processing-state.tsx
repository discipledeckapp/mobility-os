import { getProcessingContent, type ProcessingVariant } from '@mobility-os/domain-config';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from './card';
import { LoadingSkeleton } from './loading-skeleton';
import { tokens } from '../theme/tokens';

function getVariantAccent(variant: ProcessingVariant) {
  switch (variant) {
    case 'verification':
      return '#1D4ED8';
    case 'payment':
      return '#059669';
    case 'upload':
      return '#D97706';
    case 'reporting':
      return '#4F46E5';
    case 'assignment':
      return '#0F766E';
    case 'remittance':
      return '#0369A1';
    default:
      return tokens.colors.primary;
  }
}

function useRotatingTip(tips: string[], delayMs = 3600) {
  const safeTips = tips.length > 0 ? tips : ['Working on your request.'];
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (safeTips.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      setTipIndex((current) => (current + 1) % safeTips.length);
    }, delayMs);
    return () => clearInterval(interval);
  }, [delayMs, safeTips.length]);

  return safeTips[tipIndex] ?? safeTips[0];
}

function ProcessingOrb({
  accent,
  reducedMotion,
}: {
  accent: string;
  reducedMotion: boolean;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  const orbit = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const orbitLoop = Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: 5200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    pulseLoop.start();
    orbitLoop.start();
    return () => {
      pulseLoop.stop();
      orbitLoop.stop();
    };
  }, [orbit, pulse, reducedMotion]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.24, 0.5],
  });
  const orbitRotation = orbit.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.orbContainer}>
      <Animated.View
        style={[
          styles.orbGlow,
          {
            backgroundColor: accent,
            opacity: reducedMotion ? 0.24 : pulseOpacity,
            transform: reducedMotion ? undefined : [{ scale: pulseScale }],
          },
        ]}
      />
      <View style={styles.orbShell}>
        <View style={[styles.orbCore, { backgroundColor: accent }]} />
      </View>
      <Animated.View
        style={[
          styles.orbRing,
          { borderColor: `${accent}55`, transform: reducedMotion ? undefined : [{ rotate: orbitRotation }] },
        ]}
      />
      <View style={styles.orbScanTrack}>
        <ActivityIndicator color={accent} size="small" />
      </View>
    </View>
  );
}

export function InlineProcessingCard({
  variant,
  title,
  message,
  steps,
  activeStep = 0,
  tips,
}: {
  variant: ProcessingVariant;
  title?: string;
  message?: string;
  steps?: string[];
  activeStep?: number;
  tips?: string[];
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const content = getProcessingContent(variant);
  const resolvedTitle = title ?? content.title;
  const resolvedMessage = message ?? content.message;
  const resolvedSteps = steps ?? content.steps;
  const resolvedTips = tips ?? content.tips;
  const accent = getVariantAccent(variant);
  const activeTip = useRotatingTip(resolvedTips);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion).catch(() => undefined);
  }, []);

  return (
    <Card style={styles.processingCard}>
      <View style={styles.processingHeader}>
        <ProcessingOrb accent={accent} reducedMotion={reducedMotion} />
        <View style={styles.processingCopy}>
          <Text style={[styles.processingEyebrow, { color: accent }]}>Guided processing</Text>
          <Text style={styles.processingTitle}>{resolvedTitle}</Text>
          <Text style={styles.processingMessage}>{resolvedMessage}</Text>
        </View>
      </View>

      {resolvedSteps.length > 0 ? (
        <View style={styles.stepsBlock}>
          {resolvedSteps.map((step: string, index: number) => {
            const isComplete = index < activeStep;
            const isActive = index === activeStep;
            return (
              <View key={`${variant}-${step}`} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    isComplete ? styles.stepDotComplete : null,
                    isActive ? { borderColor: accent, backgroundColor: `${accent}18` } : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepDotText,
                      isComplete ? styles.stepDotTextComplete : null,
                      isActive ? { color: accent } : null,
                    ]}
                  >
                    {isComplete ? '✓' : index + 1}
                  </Text>
                </View>
                <Text style={[styles.stepText, !isComplete && !isActive ? styles.stepTextMuted : null]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={styles.tipCard}>
        <Text style={styles.tipEyebrow}>While you wait</Text>
        <Text style={styles.tipText}>{activeTip}</Text>
      </View>
    </Card>
  );
}

export function FullScreenBlockingLoader({
  visible,
  variant,
  title,
  message,
  steps,
  activeStep = 0,
  tips,
}: {
  visible: boolean;
  variant: ProcessingVariant;
  title?: string;
  message?: string;
  steps?: string[];
  activeStep?: number;
  tips?: string[];
}) {
  if (!visible) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <InlineProcessingCard
          activeStep={activeStep}
          message={message}
          steps={steps}
          tips={tips}
          title={title}
          variant={variant}
        />
      </View>
    </Modal>
  );
}

export function ProcessingScreen({
  variant,
  title,
  message,
  steps,
  activeStep = 0,
  tips,
}: {
  variant: ProcessingVariant;
  title?: string;
  message?: string;
  steps?: string[];
  activeStep?: number;
  tips?: string[];
}) {
  return (
    <View style={styles.screenWrapper}>
      <InlineProcessingCard
        activeStep={activeStep}
        message={message}
        steps={steps}
        tips={tips}
        title={title}
        variant={variant}
      />
    </View>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  const widths = useMemo(
    () =>
      Array.from({ length: lines }).map((_, index) =>
        index === 0 ? '45%' : index === lines - 1 ? '60%' : '92%',
      ),
    [lines],
  );

  return (
    <Card style={styles.skeletonCard}>
      {widths.map((width, index) => (
        <LoadingSkeleton height={index === 1 ? 28 : 16} key={`skeleton-${index + 1}`} width={width} />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  processingCard: {
    gap: tokens.spacing.md,
    backgroundColor: '#FBFDFF',
    borderColor: '#D7E3F5',
  },
  processingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.md,
  },
  processingCopy: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  processingEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  processingTitle: {
    color: tokens.colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  processingMessage: {
    color: tokens.colors.inkSoft,
    lineHeight: 21,
  },
  stepsBlock: {
    gap: tokens.spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  stepDotComplete: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF3',
  },
  stepDotText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  stepDotTextComplete: {
    color: '#047857',
  },
  stepText: {
    flex: 1,
    color: tokens.colors.ink,
    fontWeight: '600',
  },
  stepTextMuted: {
    color: tokens.colors.inkSoft,
    fontWeight: '500',
  },
  tipCard: {
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  tipEyebrow: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  tipText: {
    color: '#334155',
    lineHeight: 21,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.md,
    backgroundColor: 'rgba(2, 6, 23, 0.34)',
  },
  screenWrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.background,
  },
  skeletonCard: {
    gap: tokens.spacing.sm,
  },
  orbContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGlow: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  orbShell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#DCE7F7',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  orbRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
  },
  orbScanTrack: {
    position: 'absolute',
    bottom: 2,
  },
});
