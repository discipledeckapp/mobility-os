'use client';

import { useActionState, useState } from 'react';
import { getCountryConfig, getSupportedCountryCodes } from '@mobility-os/domain-config';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  SearchableSelect,
  Text,
} from '@mobility-os/ui';
import type { DriverGuarantorRecord } from '../../lib/api-core';
import {
  removeDriverGuarantorAction,
  saveDriverGuarantorAction,
  sendGuarantorSelfServiceLinkAction,
  type DriverGuarantorActionState,
  type SendDriverSelfServiceLinkActionState,
  updateGuarantorReminderControlsAction,
} from './actions';

const initialState: DriverGuarantorActionState = {};
const initialSendLinkState: SendDriverSelfServiceLinkActionState = {};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

function getGuarantorBadge(status: string | null | undefined, hasVerifiedIdentity: boolean) {
  if (!status) {
    return { label: 'Missing', tone: 'danger' as const };
  }
  if (status === 'disconnected') {
    return { label: 'Disconnected', tone: 'warning' as const };
  }
  if (hasVerifiedIdentity) {
    return { label: 'Verified', tone: 'success' as const };
  }
  return { label: 'Pending verification', tone: 'warning' as const };
}

export function DriverGuarantorPanel({
  driverId,
  guarantor,
  defaultCountryCode,
}: {
  driverId: string;
  guarantor: DriverGuarantorRecord | null;
  defaultCountryCode?: string | null;
}) {
  const [isEditing, setIsEditing] = useState(!guarantor);
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);
  const countryOptions = getSupportedCountryCodes().map((countryCode) => ({
    value: countryCode,
    label: getCountryConfig(countryCode).name,
  }));
  const [countryCode, setCountryCode] = useState(
    guarantor?.countryCode ?? defaultCountryCode ?? '',
  );
  const [saveState, saveAction, isSaving] = useActionState(
    saveDriverGuarantorAction,
    initialState,
  );
  const [removeState, removeAction, isRemoving] = useActionState(
    removeDriverGuarantorAction,
    initialState,
  );
  const [sendLinkState, sendLinkAction, isSendingLink] = useActionState(
    sendGuarantorSelfServiceLinkAction,
    initialSendLinkState,
  );
  const [reminderState, reminderAction, isUpdatingReminderState] = useActionState(
    updateGuarantorReminderControlsAction,
    initialState,
  );
  const isDisconnected = guarantor?.status === 'disconnected';
  const guarantorBadge = getGuarantorBadge(guarantor?.status, Boolean(guarantor?.personId));
  const inviteActionLabel =
    guarantor?.status === 'pending_verification' ? 'Resend invitation' : 'Send invitation';
  const inviteHelperText =
    guarantor?.status === 'pending_verification'
      ? 'The guarantor is still pending verification. Resend the invitation without creating a duplicate guarantor record to'
      : 'Send an invitation to';

  return (
    <Card className={isDisconnected ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-white'}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Guarantor</CardTitle>
            <Badge tone={guarantorBadge.tone}>{guarantorBadge.label}</Badge>
          </div>
          <Text tone="muted">
            Guarantors are contacted if a driver defaults on remittance commitments. Save the guarantor profile first, then complete guarantor verification before the driver is treated as fully ready.
          </Text>
        </div>
        <Button
          onClick={() => setIsEditing((current) => !current)}
          size="sm"
          type="button"
          variant="ghost"
        >
          {isEditing ? 'Close' : guarantor ? 'Edit guarantor' : 'Add guarantor'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {guarantor ? (
          <div className="grid gap-4 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)] bg-slate-50 p-4 md:grid-cols-2">
            <div className="space-y-1">
              <Text tone="muted">Name</Text>
              <Text>{guarantor.name}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Phone</Text>
              <Text>{guarantor.phone}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Email</Text>
              <Text>{guarantor.email || 'Not collected yet'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Phone country</Text>
              <Text>{guarantor.countryCode || 'Stored as full international number'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Relationship</Text>
              <Text>{guarantor.relationship || 'Not collected yet'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Date of birth</Text>
              <Text>{guarantor.dateOfBirth || 'Will be captured during verification if available'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Gender</Text>
              <Text>{guarantor.gender || 'Will be captured during verification if available'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Linked on</Text>
              <Text>{formatDate(guarantor.createdAt)}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Status</Text>
              <Text>{guarantorBadge.label}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Invite status</Text>
              <Text>{guarantor.inviteStatus || 'Not sent yet'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Last invite sent</Text>
              <Text>{guarantor.lastInviteSentAt ? formatDate(guarantor.lastInviteSentAt) : 'Not sent yet'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Invite expires</Text>
              <Text>{guarantor.inviteExpiresAt ? formatDate(guarantor.inviteExpiresAt) : 'No active invite'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Reminder count</Text>
              <Text>{guarantor.guarantorReminderCount ?? 0}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Last reminder sent</Text>
              <Text>
                {guarantor.lastGuarantorReminderSentAt
                  ? formatDate(guarantor.lastGuarantorReminderSentAt)
                  : 'No reminder sent yet'}
              </Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Reminder status</Text>
              <Text>{guarantor.guarantorReminderSuppressed ? 'Paused' : 'Active'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Disconnected on</Text>
              <Text>{guarantor.disconnectedAt ? formatDate(guarantor.disconnectedAt) : 'Still linked'}</Text>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Text tone="muted">Disconnect note</Text>
              <Text>{guarantor.disconnectedReason || 'No disconnect note recorded.'}</Text>
            </div>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
              <div className="space-y-2">
                <Text tone="muted">Live Selfie</Text>
                <div className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-white">
                  {guarantor.selfieImageUrl ? (
                    <img
                      alt={`${guarantor.name} live selfie`}
                      className="aspect-[4/3] w-full object-cover"
                      src={guarantor.selfieImageUrl}
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center p-4 text-center">
                      <Text tone="muted">No stored live-selfie image yet.</Text>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Text tone="muted">Government Record Image</Text>
                <div className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-white">
                  {guarantor.providerImageUrl ? (
                    <img
                      alt={`${guarantor.name} government record`}
                      className="aspect-[4/3] w-full object-cover"
                      src={guarantor.providerImageUrl}
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center p-4 text-center">
                      <Text tone="muted">No provider record image stored yet.</Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-dashed border-[var(--mobiris-border)] bg-slate-50 p-4">
            <Text tone="muted">No guarantor linked.</Text>
          </div>
        )}

        {isEditing ? (
          <form action={saveAction} className="grid gap-4 md:grid-cols-2">
            <input name="driverId" type="hidden" value={driverId} />
            <div className="space-y-2">
              <Label htmlFor={`guarantor-name-${driverId}`}>Name</Label>
              <Input
                defaultValue={guarantor?.name ?? ''}
                id={`guarantor-name-${driverId}`}
                name="name"
                placeholder="Enter guarantor name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`guarantor-phone-${driverId}`}>Phone</Label>
              <Input
                defaultValue={guarantor?.phone ?? ''}
                id={`guarantor-phone-${driverId}`}
                name="phone"
                placeholder="08012345678"
                required
              />
              <Text tone="muted">
                If you do not choose a country, enter the number in full international format.
              </Text>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`guarantor-email-${driverId}`}>Email</Label>
              <Input
                defaultValue={guarantor?.email ?? ''}
                id={`guarantor-email-${driverId}`}
                name="email"
                placeholder="guarantor@example.com"
                type="email"
              />
              <Text tone="muted">
                Required to send a guarantor self-service verification link.
              </Text>
            </div>
            <div className="space-y-2">
              <SearchableSelect
                helperText="Optional. Choose the guarantor phone country to allow local-number formatting."
                inputId={`guarantor-country-${driverId}`}
                label="Phone country"
                name="countryCode"
                onChange={setCountryCode}
                options={countryOptions}
                placeholder="Use E.164 instead"
                value={countryCode}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`guarantor-relationship-${driverId}`}>Relationship</Label>
              <Input
                defaultValue={guarantor?.relationship ?? ''}
                id={`guarantor-relationship-${driverId}`}
                name="relationship"
                placeholder="Friend, sibling, spouse, employer"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <Button disabled={isSaving} type="submit">
                {isSaving ? 'Saving...' : 'Save guarantor'}
              </Button>
              {guarantor ? (
                <Button
                  disabled={isSaving}
                  onClick={() => setIsEditing(false)}
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        ) : null}

        {guarantor ? (
          isConfirmingDisconnect ? (
            <div className="flex flex-wrap items-start gap-3">
              <div className="space-y-0.5">
                <Text tone="muted">Disconnect guarantor?</Text>
                <Text tone="danger">This will remove the guarantor link and the driver may no longer be eligible for new assignments.</Text>
              </div>
              <form action={removeAction} className="flex gap-2">
                <input name="driverId" type="hidden" value={driverId} />
                <input name="reason" type="hidden" value="Disconnected by operator request" />
                <Button disabled={isRemoving} size="sm" type="submit" variant="ghost">
                  {isRemoving ? 'Disconnecting...' : 'Confirm disconnect'}
                </Button>
                <Button
                  disabled={isRemoving}
                  onClick={() => setIsConfirmingDisconnect(false)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </form>
            </div>
          ) : (
            <Button
              disabled={isRemoving}
              onClick={() => setIsConfirmingDisconnect(true)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Disconnect guarantor
            </Button>
          )
        ) : null}

        {guarantor && !isDisconnected && guarantor.email ? (
          <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-0.5">
                <Text>Guarantor self-service verification</Text>
                <Text tone="muted">
                  {inviteHelperText}{' '}
                  <span className="font-medium text-slate-700">{guarantor.email}</span>.
                </Text>
              </div>
              <form action={sendLinkAction}>
                <input name="driverId" type="hidden" value={driverId} />
                <Button disabled={isSendingLink} size="sm" type="submit" variant="ghost">
                  {isSendingLink ? 'Sending…' : inviteActionLabel}
                </Button>
              </form>
              <form action={reminderAction}>
                <input name="driverId" type="hidden" value={driverId} />
                <input
                  name="suppressed"
                  type="hidden"
                  value={guarantor.guarantorReminderSuppressed ? 'false' : 'true'}
                />
                <Button disabled={isUpdatingReminderState} size="sm" type="submit" variant="ghost">
                  {isUpdatingReminderState
                    ? 'Updating…'
                    : guarantor.guarantorReminderSuppressed
                      ? 'Resume reminders'
                      : 'Pause reminders'}
                </Button>
              </form>
            </div>
            {sendLinkState.error ? (
              <Text tone="danger" className="mt-2">{sendLinkState.error}</Text>
            ) : null}
            {sendLinkState.success ? (
              <Text tone="success" className="mt-2">{sendLinkState.success}</Text>
            ) : null}
            {reminderState.error ? (
              <Text tone="danger" className="mt-2">{reminderState.error}</Text>
            ) : null}
            {reminderState.success ? (
              <Text tone="success" className="mt-2">{reminderState.success}</Text>
            ) : null}
          </div>
        ) : guarantor && !isDisconnected && !guarantor.email ? (
          <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-dashed border-slate-200 bg-slate-50 p-4">
            <Text tone="muted">
              Add the guarantor's email address to send them a self-service verification link.
            </Text>
          </div>
        ) : null}

        {saveState.error ? <Text tone="danger">{saveState.error}</Text> : null}
        {saveState.success ? <Text tone="success">{saveState.success}</Text> : null}
        {removeState.error ? <Text tone="danger">{removeState.error}</Text> : null}
        {removeState.success ? <Text tone="success">{removeState.success}</Text> : null}
      </CardContent>
    </Card>
  );
}
