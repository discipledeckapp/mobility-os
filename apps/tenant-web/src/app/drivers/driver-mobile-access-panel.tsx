'use client';

import { useActionState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import type { DriverMobileAccessRecord } from '../../lib/api-core';
import {
  linkDriverMobileAccessAction,
  unlinkDriverMobileAccessAction,
  type DriverMobileAccessActionState,
} from './actions';

const EMPTY_STATE: DriverMobileAccessActionState = {};

function roleLabel(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function DriverMobileAccessPanel({
  driverId,
  mobileAccess,
}: {
  driverId: string;
  mobileAccess: DriverMobileAccessRecord;
}) {
  const [linkState, linkAction, linkPending] = useActionState(
    linkDriverMobileAccessAction,
    EMPTY_STATE,
  );
  const [unlinkState, unlinkAction, unlinkPending] = useActionState(
    unlinkDriverMobileAccessAction,
    EMPTY_STATE,
  );

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Mobile access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {mobileAccess.linkedUser ? (
          <div className="space-y-3 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <Text className="font-semibold text-[var(--mobiris-ink)]">{mobileAccess.linkedUser.name}</Text>
                <Text tone="muted">{mobileAccess.linkedUser.email}</Text>
                {mobileAccess.linkedUser.phone ? (
                  <Text tone="muted">{mobileAccess.linkedUser.phone}</Text>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={mobileAccess.linkedUser.isActive ? 'success' : 'warning'}>
                  {mobileAccess.linkedUser.isActive ? 'Linked' : 'Inactive account'}
                </Badge>
                <Badge tone="neutral">{roleLabel(mobileAccess.linkedUser.role)}</Badge>
              </div>
            </div>
            <form action={unlinkAction} className="flex flex-wrap items-center gap-3">
              <input name="driverId" type="hidden" value={driverId} />
              <input name="userId" type="hidden" value={mobileAccess.linkedUser.id} />
              <Button className="bg-[var(--mobiris-error)] hover:bg-[var(--mobiris-error)] focus-visible:ring-[var(--mobiris-error)]" disabled={unlinkPending} type="submit">
                {unlinkPending ? 'Disconnecting…' : 'Disconnect mobile access'}
              </Button>
              {unlinkState.error ? (
                <Text tone="danger">{unlinkState.error}</Text>
              ) : unlinkState.success ? (
                <Text tone="success">{unlinkState.success}</Text>
              ) : null}
            </form>
          </div>
        ) : (
          <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-amber-200 bg-amber-50/55 p-4">
            <Text className="font-semibold text-[var(--mobiris-ink)]">No organisation user is linked to this driver yet.</Text>
            <Text tone="muted">
              Mobile sign-in will not resolve to this driver until an organisation user is connected.
            </Text>
          </div>
        )}

        <div className="space-y-3">
          <Text className="font-semibold text-[var(--mobiris-ink)]">Suggested organisation users</Text>
          {mobileAccess.suggestedUsers.length === 0 ? (
            <Text tone="muted">
              No organisation users currently match this driver by email or phone.
            </Text>
          ) : (
            mobileAccess.suggestedUsers.map((user) => (
              <form
                action={linkAction}
                className="space-y-3 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/65 p-4"
                key={user.id}
              >
                <input name="driverId" type="hidden" value={driverId} />
                <input name="userId" type="hidden" value={user.id} />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Text className="font-semibold text-[var(--mobiris-ink)]">{user.name}</Text>
                    <Text tone="muted">{user.email}</Text>
                    {user.phone ? <Text tone="muted">{user.phone}</Text> : null}
                    {user.matchReason ? <Text tone="muted">{user.matchReason}</Text> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={user.isActive ? 'neutral' : 'warning'}>
                      {user.isActive ? 'Available' : 'Inactive'}
                    </Badge>
                    <Badge tone="neutral">{roleLabel(user.role)}</Badge>
                  </div>
                </div>
                <Button disabled={linkPending || !user.isActive} type="submit">
                  {linkPending ? 'Linking…' : 'Link mobile access'}
                </Button>
              </form>
            ))
          )}
          {linkState.error ? (
            <Text tone="danger">{linkState.error}</Text>
          ) : linkState.success ? (
            <Text tone="success">{linkState.success}</Text>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
