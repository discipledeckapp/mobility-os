'use client';

import { useActionState, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Text,
} from '@mobility-os/ui';
import type { TenantAuthSessionRecord, TenantRecord } from '../../lib/api-core';
import {
  changePasswordAction,
  syncMaintenanceRemindersAction,
  syncRemittanceRemindersAction,
  updateProfileAction,
  updateNotificationPreferencesAction,
  updateOrganisationSettingsAction,
  type SettingsActionState,
} from './actions';
import type {
  NotificationPreferencesRecord,
  UserNotificationRecord,
} from '../../lib/api-core';
const initialState: SettingsActionState = {};
const NOTIFICATION_LABELS: Record<keyof NotificationPreferencesRecord, string> = {
  remittance_due: 'Remittance due reminders',
  remittance_overdue: 'Overdue remittance follow-up',
  remittance_reconciled: 'Reconciled remittance updates',
  late_remittance_risk: 'Late remittance risk signals',
  compliance_risk: 'Compliance and risk alerts',
  maintenance_due: 'Maintenance due reminders',
  maintenance_overdue: 'Overdue maintenance alerts',
  vehicle_incident_reported: 'Vehicle incident alerts',
  self_service_invite: 'Driver verification invites',
  billing_updates: 'Billing and renewal updates',
  trial_guidance: 'Trial onboarding and trial ending reminders',
  product_updates: 'Product improvements and feature announcements',
  marketing_updates: 'Campaigns, offers, and optional marketing updates',
};

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" x2="23" y1="1" y2="23" />
    </svg>
  );
}

function PasswordInput({
  id,
  name,
  minLength,
  required,
}: {
  id: string;
  name: string;
  minLength?: number;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        className="pr-10"
        id={id}
        minLength={minLength}
        name={name}
        required={required}
        type={show ? 'text' : 'password'}
      />
      <button
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
        onClick={() => setShow((v) => !v)}
        type="button"
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

export function SettingsPanel({
  session,
  tenant,
  notificationPreferences,
  notifications,
}: {
  session: TenantAuthSessionRecord;
  tenant: TenantRecord;
  notificationPreferences: NotificationPreferencesRecord | null;
  notifications: UserNotificationRecord[];
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [organisationState, organisationAction, organisationPending] = useActionState(
    updateOrganisationSettingsAction,
    initialState,
  );
  const [notificationState, notificationAction, notificationPending] = useActionState(
    updateNotificationPreferencesAction,
    initialState,
  );
  const [reminderState, reminderAction, reminderPending] = useActionState(
    syncRemittanceRemindersAction,
    initialState,
  );
  const [maintenanceReminderState, maintenanceReminderAction, maintenanceReminderPending] =
    useActionState(syncMaintenanceRemindersAction, initialState);
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update the operator details used across this organisation workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={profileAction} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input defaultValue={session.name} id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    defaultValue={session.phone ?? ''}
                    id="phone"
                    name="phone"
                    placeholder="+2348012345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Preferred language</Label>
                  <select
                    className="flex h-10 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
                    defaultValue={session.preferredLanguage ?? session.defaultLanguage ?? 'en'}
                    id="preferredLanguage"
                    name="preferredLanguage"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
              {profileState.error ? <Text tone="danger">{profileState.error}</Text> : null}
              {profileState.success ? <Text tone="success">{profileState.success}</Text> : null}
              <Button disabled={profilePending} type="submit">
                {profilePending ? 'Saving…' : 'Save profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Change your operator password without affecting any linked drivers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={passwordAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <PasswordInput id="currentPassword" name="currentPassword" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <PasswordInput id="newPassword" minLength={8} name="newPassword" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    minLength={8}
                    name="confirmPassword"
                    required
                  />
                </div>
              </div>
              {passwordState.error ? <Text tone="danger">{passwordState.error}</Text> : null}
              {passwordState.success ? <Text tone="success">{passwordState.success}</Text> : null}
              <Button disabled={passwordPending} type="submit" variant="secondary">
                {passwordPending ? 'Updating…' : 'Change password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
            <CardDescription>
              Control how your company name, logo, language defaults, and guarantor limits appear across the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={organisationAction} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Company display name</Label>
                  <Input
                    defaultValue={tenant.displayName ?? tenant.name}
                    id="displayName"
                    name="displayName"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    defaultValue={tenant.logoUrl ?? ''}
                    id="logoUrl"
                    name="logoUrl"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default language</Label>
                  <select
                    className="flex h-10 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
                    defaultValue={tenant.defaultLanguage ?? 'en'}
                    id="defaultLanguage"
                    name="defaultLanguage"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guarantorMaxActiveDrivers">Max active drivers per guarantor</Label>
                  <Input
                    defaultValue={String(tenant.guarantorMaxActiveDrivers ?? 2)}
                    id="guarantorMaxActiveDrivers"
                    min="1"
                    name="guarantorMaxActiveDrivers"
                    type="number"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 px-3 py-2 text-sm">
                  <input
                    defaultChecked={tenant.autoSendDriverSelfServiceLinkOnCreate ?? true}
                    name="autoSendDriverSelfServiceLinkOnCreate"
                    type="checkbox"
                  />
                  Automatically send self-verification links when drivers are added
                </label>
                <label className="flex items-center gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 px-3 py-2 text-sm">
                  <input
                    defaultChecked={tenant.requireIdentityVerificationForActivation ?? true}
                    name="requireIdentityVerificationForActivation"
                    type="checkbox"
                  />
                  Require identity verification before driver activation
                </label>
                <label className="flex items-center gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 px-3 py-2 text-sm">
                  <input
                    defaultChecked={tenant.requireBiometricVerification ?? true}
                    name="requireBiometricVerification"
                    type="checkbox"
                  />
                  Require biometric selfie capture during verification
                </label>
                <label className="flex items-center gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 px-3 py-2 text-sm">
                  <input
                    defaultChecked={tenant.requireGovernmentVerificationLookup ?? true}
                    name="requireGovernmentVerificationLookup"
                    type="checkbox"
                  />
                  Require government/provider identity lookup when available
                </label>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="requiredDriverDocumentSlugs">Required driver documents</Label>
                  <Input
                    defaultValue={(tenant.requiredDriverDocumentSlugs ?? ['national-id', 'drivers-license']).join(', ')}
                    id="requiredDriverDocumentSlugs"
                    name="requiredDriverDocumentSlugs"
                  />
                  <Text tone="muted">Use comma-separated document slugs such as `national-id, drivers-license`.</Text>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="requiredVehicleDocumentSlugs">Required vehicle documents</Label>
                  <Input
                    defaultValue={(tenant.requiredVehicleDocumentSlugs ?? ['vehicle-license', 'insurance']).join(', ')}
                    id="requiredVehicleDocumentSlugs"
                    name="requiredVehicleDocumentSlugs"
                  />
                  <Text tone="muted">Use comma-separated document slugs such as `vehicle-license, insurance, road-worthiness`.</Text>
                </div>
              </div>
              {organisationState.error ? <Text tone="danger">{organisationState.error}</Text> : null}
              {organisationState.success ? <Text tone="success">{organisationState.success}</Text> : null}
              <Button disabled={organisationPending} type="submit">
                {organisationPending ? 'Saving…' : 'Save organisation settings'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose which reminders and alerts reach you by email, in-app inbox, or push.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={notificationAction} className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[32rem] border-separate border-spacing-y-2 text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="pb-1 pr-4">Alert</th>
                      <th className="pb-1 pr-4">Email</th>
                      <th className="pb-1 pr-4">In-app</th>
                      <th className="pb-1">Push</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notificationPreferences
                      ? (Object.entries(notificationPreferences) as Array<
                          [keyof NotificationPreferencesRecord, NotificationPreferencesRecord[keyof NotificationPreferencesRecord]]
                        >).map(([topic, preference]) => (
                          <tr key={topic} className="rounded-lg border border-slate-200 bg-slate-50/80">
                            <td className="rounded-l-lg px-3 py-2 font-medium text-slate-700">
                              {NOTIFICATION_LABELS[topic]}
                            </td>
                            <td className="px-3 py-2">
                              <input defaultChecked={preference.email} name={`${topic}.email`} type="checkbox" />
                            </td>
                            <td className="px-3 py-2">
                              <input defaultChecked={preference.inApp} name={`${topic}.inApp`} type="checkbox" />
                            </td>
                            <td className="rounded-r-lg px-3 py-2">
                              <input defaultChecked={preference.push} name={`${topic}.push`} type="checkbox" />
                            </td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
              {notificationState.error ? <Text tone="danger">{notificationState.error}</Text> : null}
              {notificationState.success ? <Text tone="success">{notificationState.success}</Text> : null}
              <Button disabled={notificationPending} type="submit">
                {notificationPending ? 'Saving…' : 'Save notification settings'}
              </Button>
            </form>
            <div className="flex flex-wrap gap-3">
              <form action={reminderAction}>
                <Button disabled={reminderPending} type="submit" variant="secondary">
                  {reminderPending ? 'Refreshing…' : 'Refresh remittance reminders'}
                </Button>
              </form>
              <form action={maintenanceReminderAction}>
                <Button disabled={maintenanceReminderPending} type="submit" variant="secondary">
                  {maintenanceReminderPending ? 'Refreshing…' : 'Refresh maintenance reminders'}
                </Button>
              </form>
            </div>
            {reminderState.error ? <Text tone="danger">{reminderState.error}</Text> : null}
            {reminderState.success ? <Text tone="success">{reminderState.success}</Text> : null}
            {maintenanceReminderState.error ? <Text tone="danger">{maintenanceReminderState.error}</Text> : null}
            {maintenanceReminderState.success ? <Text tone="success">{maintenanceReminderState.success}</Text> : null}

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-[var(--mobiris-ink)]">Recent inbox</p>
                <p className="text-xs text-slate-500">
                  Latest organisation and remittance reminders delivered to this account.
                </p>
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 6).map((notification) => (
                    <div
                      className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/80 px-4 py-3"
                      key={notification.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--mobiris-ink)]">{notification.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{notification.body}</p>
                        </div>
                        <Text tone={notification.readAt ? 'muted' : 'success'}>
                          {notification.readAt ? 'Read' : 'New'}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Text tone="muted">No notifications have been delivered to this account yet.</Text>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organisation</CardTitle>
          <CardDescription>
            Current organisation identity and access defaults.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tenant.logoUrl ? (
            <div className="flex items-center gap-3">
              <img
                alt={`${tenant.displayName ?? tenant.name} logo`}
                className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                src={tenant.logoUrl}
              />
              <div>
                <Text tone="muted">Brand preview</Text>
                <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                  {tenant.displayName ?? tenant.name}
                </p>
              </div>
            </div>
          ) : null}
          <div>
            <Text tone="muted">Organisation name</Text>
            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
              {tenant.displayName ?? tenant.name}
            </p>
          </div>
          <div>
            <Text tone="muted">Slug</Text>
            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
              {tenant.slug}
            </p>
          </div>
          <div>
            <Text tone="muted">Country</Text>
            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
              {tenant.country}
            </p>
          </div>
          <div>
            <Text tone="muted">Default language</Text>
            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
              {(tenant.defaultLanguage ?? session.defaultLanguage ?? 'en') === 'fr'
                ? 'Français'
                : 'English'}
            </p>
          </div>
          <div>
            <Text tone="muted">Guarantor capacity</Text>
            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
              {tenant.guarantorMaxActiveDrivers ?? session.guarantorMaxActiveDrivers ?? 2} active drivers per guarantor
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
