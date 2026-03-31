'use client';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import {
  listUserNotifications,
  markUserNotificationRead,
  type UserNotificationRecord,
} from '../../../api';
import { Badge } from '../../../components/badge';
import { BottomNav } from '../../../components/bottom-nav';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { PageShell, SectionIntro } from '../../../components/page-shell';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import { useToast } from '../../../contexts/toast-context';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function NotificationsScreen({ navigation }: ScreenProps<'Notifications'>) {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<UserNotificationRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.readAt).length,
    [notifications],
  );

  const refreshNotifications = useCallback(async () => {
    setRefreshing(true);
    try {
      const nextNotifications = await listUserNotifications();
      setNotifications(nextNotifications);
    } catch (error) {
      Alert.alert(
        'Notifications',
        error instanceof Error ? error.message : 'Unable to load notifications right now.',
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshNotifications();
    }, [refreshNotifications]),
  );

  const handleNotificationOpen = useCallback(
    async (notification: UserNotificationRecord) => {
      try {
        if (!notification.readAt) {
          const updated = await markUserNotificationRead(notification.id);
          setNotifications((current) =>
            current.map((item) => (item.id === notification.id ? updated : item)),
          );
        }
      } catch {
        // Keep the open action available even if mark-read fails.
      }

      const assignmentId = extractNotificationAssignmentId(notification);
      if (assignmentId) {
        navigation.navigate('AssignmentDetail', { assignmentId });
        return;
      }

      if (notification.topic.startsWith('remittance_')) {
        navigation.navigate('RemittanceHistory');
        return;
      }

      Alert.alert(notification.title, notification.body);
    },
    [navigation],
  );

  return (
    <Screen
      footer={<BottomNav currentTab="Notifications" navigation={navigation} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshNotifications} />}
    >
      <PageShell
        eyebrow="Updates"
        title="Notifications"
        subtitle="Assignment changes, remittance updates, and account prompts show up here."
        badge={unreadCount > 0 ? <Badge label={`${unreadCount} new`} tone="warning" /> : undefined}
        actions={
          <Button
            label="Refresh updates"
            variant="secondary"
            onPress={() => void refreshNotifications()}
          />
        }
      />

      <Card style={styles.section}>
        <SectionIntro
          title="Latest activity"
          subtitle="Open an update to jump straight back into the right workflow."
        />
        {notifications.length === 0 ? (
          <EmptyState
            actionLabel="Refresh updates"
            message="Driver updates and reminders will appear here as your organisation sends them."
            title="No notifications yet"
            onAction={() => void refreshNotifications()}
          />
        ) : (
          notifications.map((notification) => (
            <View key={notification.id} style={styles.notificationCard}>
              <View style={styles.notificationCopy}>
                <View style={styles.notificationTitleRow}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {!notification.readAt ? <Badge label="New" tone="success" /> : null}
                </View>
                <Text style={styles.muted}>{notification.body}</Text>
                <Text style={styles.notificationTime}>
                  {formatDateTime(notification.createdAt, session?.formattingLocale)}
                </Text>
              </View>
              <Button
                label={extractNotificationAssignmentId(notification) ? 'Open' : 'View'}
                variant="secondary"
                onPress={() => void handleNotificationOpen(notification)}
              />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

function formatDateTime(value: string, locale?: string | null) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale ?? undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function extractNotificationAssignmentId(notification: UserNotificationRecord) {
  const metadataAssignmentId =
    notification.metadata && typeof notification.metadata.assignmentId === 'string'
      ? notification.metadata.assignmentId
      : null;
  if (metadataAssignmentId) {
    return metadataAssignmentId;
  }

  const actionUrl = notification.actionUrl ?? '';
  const assignmentMatch =
    actionUrl.match(/[?&]assignmentId=([^&]+)/)?.[1] ??
    actionUrl.match(/\/assignments\/([^/?#]+)/)?.[1];
  return assignmentMatch ? decodeURIComponent(assignmentMatch) : null;
}

const styles = StyleSheet.create({
  section: {
    gap: tokens.spacing.sm,
  },
  notificationCard: {
    gap: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
  },
  notificationCopy: {
    gap: tokens.spacing.xs,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: tokens.spacing.sm,
  },
  notificationTitle: {
    flex: 1,
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  notificationTime: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
  },
  muted: {
    color: tokens.colors.inkSoft,
    lineHeight: 20,
  },
});

export default NotificationsScreen;
