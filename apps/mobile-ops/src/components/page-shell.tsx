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
  compact?: boolean;
}

export function PageShell({
  eyebrow,
  title,
  subtitle,
  badge,
  actions,
  children,
  style,
  compact = false,
}: PageShellProps) {
  return (
    <Card style={[styles.shell, compact ? styles.shellCompact : null, style]}>
      <View style={[styles.headerRow, compact ? styles.headerRowCompact : null]}>
        <View style={styles.copy}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={[styles.title, compact ? styles.titleCompact : null]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, compact ? styles.subtitleCompact : null]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {badge ? <View style={styles.badgeWrap}>{badge}</View> : null}
      </View>
      {actions ? (
        <View style={[styles.actions, compact ? styles.actionsCompact : null]}>{actions}</View>
      ) : null}
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
  shellCompact: {
    gap: tokens.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    justifyContent: 'space-between',
  },
  headerRowCompact: {
    gap: tokens.spacing.sm,
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
  titleCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  subtitleCompact: {
    fontSize: 13,
    lineHeight: 19,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
  },
  actions: {
    gap: tokens.spacing.sm,
  },
  actionsCompact: {
    gap: tokens.spacing.xs,
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
