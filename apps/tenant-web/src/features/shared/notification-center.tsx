'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Button, Text } from '@mobility-os/ui';
import type { UserNotificationRecord } from '../../lib/api-core';
import { Modal } from './modal';

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function NotificationCenter({
  initialNotifications = [],
}: {
  initialNotifications?: UserNotificationRecord[];
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const unreadCount = useMemo(() => items.filter((item) => !item.readAt).length, [items]);

  useEffect(() => {
    void fetch('/api/notifications', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          return [];
        }
        return (await response.json()) as UserNotificationRecord[];
      })
      .then((data) => setItems(data))
      .catch(() => undefined);
  }, []);

  function markAsRead(notificationId: string) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PATCH',
        });
        if (!response.ok) {
          return;
        }
        const updated = (await response.json()) as UserNotificationRecord;
        setItems((current) =>
          current.map((item) => (item.id === notificationId ? updated : item)),
        );
      } catch {
        // Keep the current UI state if marking read fails.
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="secondary">
        Inbox
        {unreadCount > 0 ? (
          <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--mobiris-primary)] px-2 py-0.5 text-[11px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </Button>

      <Modal
        description="Organisation reminders, approvals, and risk updates delivered to this account."
        onClose={() => setOpen(false)}
        open={open}
        size="lg"
        title="Notification centre"
      >
        <div className="space-y-3">
          {items.length === 0 ? (
            <Text tone="muted">No notifications yet.</Text>
          ) : (
            items.map((notification) => (
              <div
                className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/80 px-4 py-4"
                key={notification.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[var(--mobiris-ink)]">
                        {notification.title}
                      </p>
                      {!notification.readAt ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{notification.body}</p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {!notification.readAt ? (
                      <Button
                        disabled={isPending}
                        onClick={() => markAsRead(notification.id)}
                        size="sm"
                        variant="ghost"
                      >
                        Mark read
                      </Button>
                    ) : null}
                    {notification.actionUrl ? (
                      <Link
                        className="inline-flex h-9 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-3.5 text-xs font-semibold text-[var(--mobiris-primary-dark)]"
                        href={notification.actionUrl as Route}
                        onClick={() => {
                          if (!notification.readAt) {
                            void markAsRead(notification.id);
                          }
                          setOpen(false);
                        }}
                      >
                        Open
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </>
  );
}
