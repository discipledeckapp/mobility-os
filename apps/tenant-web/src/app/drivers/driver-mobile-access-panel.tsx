'use client';

import { useActionState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import type { DriverMobileAccessRecord } from '../../lib/api-core';
import {
  disableDriverMobileAccessDeviceAction,
  unlinkDriverMobileAccessAction,
  updateDriverMobileAccessStatusAction,
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
  const linkState = EMPTY_STATE;
  const [unlinkState, unlinkAction, unlinkPending] = useActionState(
    unlinkDriverMobileAccessAction,
    EMPTY_STATE,
  );
  const [statusState, statusAction, statusPending] = useActionState(
    updateDriverMobileAccessStatusAction,
    EMPTY_STATE,
  );
  const [deviceState, deviceAction, devicePending] = useActionState(
    disableDriverMobileAccessDeviceAction,
    EMPTY_STATE,
  );
  const linkedUser = mobileAccess.linkedUser;

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Mobile access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {linkedUser ? (
          <div className="space-y-3 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <Text className="font-semibold text-[var(--mobiris-ink)]">{linkedUser.name}</Text>
                <Text tone="muted">{linkedUser.email}</Text>
                {linkedUser.phone ? (
                  <Text tone="muted">{linkedUser.phone}</Text>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={linkedUser.isActive ? 'success' : 'warning'}>
                  {linkedUser.isActive ? 'Linked' : 'Inactive account'}
                </Badge>
                <Badge tone="neutral">{roleLabel(linkedUser.role)}</Badge>
                <Badge tone={linkedUser.mobileAccessRevoked ? 'danger' : 'success'}>
                  {linkedUser.mobileAccessRevoked ? 'Mobile paused' : 'Mobile enabled'}
                </Badge>
              </div>
            </div>
            <div className="grid gap-3 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-white/80 p-3 sm:grid-cols-2">
              <div>
                <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Active devices
                </Text>
                <Text className="mt-1 font-semibold text-[var(--mobiris-ink)]">
                  {linkedUser.activePushDeviceCount ?? 0}
                </Text>
              </div>
              <div>
                <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Last device seen
                </Text>
                <Text className="mt-1 font-semibold text-[var(--mobiris-ink)]">
                  {linkedUser.lastPushDeviceSeenAt
                    ? new Date(linkedUser.lastPushDeviceSeenAt).toLocaleString()
                    : 'No device activity yet'}
                </Text>
              </div>
            </div>
            {linkedUser.pushDevices?.length ? (
              <div className="space-y-3">
                {linkedUser.pushDevices.map((device) => (
                  <div
                    className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-white/80 p-3"
                    key={device.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <Text className="font-semibold text-[var(--mobiris-ink)]">
                          {device.platform === 'ios'
                            ? 'iPhone or iPad'
                            : device.platform === 'android'
                              ? 'Android device'
                              : 'Web browser'}
                        </Text>
                        <Text tone="muted">Token: {device.tokenPreview}</Text>
                        <Text tone="muted">
                          Last seen: {new Date(device.lastSeenAt).toLocaleString()}
                        </Text>
                        <Text tone="muted">
                          {device.disabledAt
                            ? `Notifications turned off on ${new Date(device.disabledAt).toLocaleString()}`
                            : 'Notifications active'}
                        </Text>
                      </div>
                      {!device.disabledAt ? (
                        <form action={deviceAction}>
                          <input name="driverId" type="hidden" value={driverId} />
                          <input name="userId" type="hidden" value={linkedUser.id} />
                          <input name="deviceId" type="hidden" value={device.id} />
                          <Button disabled={devicePending} type="submit" variant="secondary">
                            {devicePending ? 'Turning off…' : 'Turn off this device'}
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <form action={statusAction} className="flex flex-wrap items-center gap-3">
              <input name="driverId" type="hidden" value={driverId} />
              <input name="userId" type="hidden" value={linkedUser.id} />
              <input
                name="revoked"
                type="hidden"
                value={linkedUser.mobileAccessRevoked ? 'false' : 'true'}
              />
              <Button disabled={statusPending} type="submit" variant="secondary">
                {statusPending
                  ? 'Updating…'
                  : linkedUser.mobileAccessRevoked
                    ? 'Restore mobile access'
                    : 'Pause mobile access'}
              </Button>
              {statusState.error ? (
                <Text tone="danger">{statusState.error}</Text>
              ) : statusState.success ? (
                <Text tone="success">{statusState.success}</Text>
              ) : null}
            </form>
            <form action={unlinkAction} className="flex flex-wrap items-center gap-3">
              <input name="driverId" type="hidden" value={driverId} />
              <input name="userId" type="hidden" value={linkedUser.id} />
              <Button className="bg-[var(--mobiris-error)] hover:bg-[var(--mobiris-error)] focus-visible:ring-[var(--mobiris-error)]" disabled={unlinkPending} type="submit">
                {unlinkPending ? 'Disconnecting…' : 'Disconnect mobile access'}
              </Button>
              {unlinkState.error ? (
                <Text tone="danger">{unlinkState.error}</Text>
              ) : unlinkState.success ? (
                <Text tone="success">{unlinkState.success}</Text>
              ) : null}
            </form>
            {deviceState.error ? (
              <Text tone="danger">{deviceState.error}</Text>
            ) : deviceState.success ? (
              <Text tone="success">{deviceState.success}</Text>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-amber-200 bg-amber-50/55 p-4">
            <Text className="font-semibold text-[var(--mobiris-ink)]">No organisation user is linked to this driver yet.</Text>
            <Text tone="muted">
              Mobile sign-in will not resolve to this driver until an organisation user is connected.
            </Text>
          </div>
        )}
        {linkState.error ? (
          <Text tone="danger">{linkState.error}</Text>
        ) : linkState.success ? (
          <Text tone="success">{linkState.success}</Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
