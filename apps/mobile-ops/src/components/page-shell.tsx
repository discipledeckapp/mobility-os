import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { Card } from './card';
import { tokens } from '../theme/tokens';

interface PageShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: ViewProps['children'];
  actions?: ViewProps['children'];
  children?: ViewProps['children'];
  style?: ViewProps['style'];
}

export function PageShell({
  eyebrow,
  title,
  subtitle,
  badge,
  actions,
  children,
  style,
}: PageShellProps) {
  return (
    <Card style={[styles.shell, style]}>
      <View style={styles.headerRow}>
        <View style={styles.copy}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {badge ? <View style={styles.badgeWrap}>{badge}</View> : null}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
      {children}
    </Card>
  );
}

export function SectionIntro({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ViewProps['children'];
}) {
  return (
    <View style={styles.sectionIntro}>
      <View style={styles.copy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.sectionAction}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: tokens.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  eyebrow: {
    color: tokens.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
  },
  actions: {
    gap: tokens.spacing.sm,
  },
  sectionIntro: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: tokens.spacing.sm,
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionAction: {
    alignSelf: 'center',
  },
});
