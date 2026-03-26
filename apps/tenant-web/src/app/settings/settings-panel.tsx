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

type SettingsSection = 'account' | 'organisation' | 'drivers' | 'fleet' | 'notifications';

const NAV_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'organisation', label: 'Organisation' },
  { id: 'drivers', label: 'Drivers' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'notifications', label: 'Notifications' },
];

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

function SelectInput({
  id,
  name,
  defaultValue,
}: {
  id: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <select
      className="flex h-10 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
      defaultValue={defaultValue}
      id={id}
      name={name}
    >
      <option value="en">English</option>
      <option value="fr">Français</option>
    </select>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text tone="muted">{label}</Text>
      <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">{value}</p>
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
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

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

  const [requiresIdentityVerification, setRequiresIdentityVerification] = useState(
    tenant.requireIdentityVerificationForActivation ?? true,
  );
  const [requiresGuarantor, setRequiresGuarantor] = useState(
    tenant.requireGuarantor ?? true,
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Sidebar navigation — vertical on large screens, horizontal strip on small */}
      <nav className="lg:w-52 lg:shrink-0">
        {/* Small screen: horizontal flex-wrap strip */}
        <div className="flex flex-wrap gap-1 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50 p-1.5 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-[var(--mobiris-primary)] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Large screen: vertical sidebar */}
        <div className="hidden flex-col gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <button
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-[var(--mobiris-primary)] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content area */}
      <div className="min-w-0 flex-1">
        {/* Account section */}
        {activeSection === 'account' && (
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
                      <SelectInput
                        defaultValue={session.preferredLanguage ?? session.defaultLanguage ?? 'en'}
                        id="preferredLanguage"
                        name="preferredLanguage"
                      />
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
                  {passwordState.success ? (
                    <Text tone="success">{passwordState.success}</Text>
                  ) : null}
                  <Button disabled={passwordPending} type="submit" variant="secondary">
                    {passwordPending ? 'Updating…' : 'Change password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Organisation section */}
        {activeSection === 'organisation' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company identity</CardTitle>
                <CardDescription>
                  Control how your company name, logo, and language defaults appear across the
                  workspace.
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
                      <SelectInput
                        defaultValue={tenant.defaultLanguage ?? 'en'}
                        id="defaultLanguage"
                        name="defaultLanguage"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 px-3 py-2 text-sm">
                    <input
                      defaultChecked={tenant.autoSendDriverSelfServiceLinkOnCreate ?? true}
                      name="autoSendDriverSelfServiceLinkOnCreate"
                      type="checkbox"
                    />
                    Automatically send self-verification links when drivers are added
                  </label>
                  {organisationState.error ? (
                    <Text tone="danger">{organisationState.error}</Text>
                  ) : null}
                  {organisationState.success ? (
                    <Text tone="success">{organisationState.success}</Text>
                  ) : null}
                  <Button disabled={organisationPending} type="submit">
                    {organisationPending ? 'Saving…' : 'Save company identity'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workspace info</CardTitle>
                <CardDescription>
                  Read-only workspace identifiers assigned at provisioning time.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <ReadOnlyField label="Organisation name" value={tenant.displayName ?? tenant.name} />
                <ReadOnlyField label="Slug" value={tenant.slug} />
                <ReadOnlyField label="Country" value={tenant.country} />
                <ReadOnlyField
                  label="Default language"
                  value={
                    (tenant.defaultLanguage ?? session.defaultLanguage ?? 'en') === 'fr'
                      ? 'Français'
                      : 'English'
                  }
                />
                <ReadOnlyField
                  label="Guarantor capacity"
                  value={`${tenant.guarantorMaxActiveDrivers ?? session.guarantorMaxActiveDrivers ?? 2} active drivers per guarantor`}
                />
                {tenant.logoUrl ? (
                  <div className="flex items-center gap-3 md:col-span-2">
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Drivers section */}
        {activeSection === 'drivers' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identity verification</CardTitle>
                <CardDescription>
                  Configure what verification steps drivers must complete before activation,
                  including biometrics, government ID lookup, and who covers the cost.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={organisationAction} className="space-y-5">
                  {/* Require identity verification toggle */}
                  <div className="space-y-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Driver identity verification
                    </p>
                    <label className="flex items-center gap-3 text-sm">
                      <input
                        checked={requiresIdentityVerification}
                        name="requireIdentityVerificationForActivation"
                        onChange={(e) => setRequiresIdentityVerification(e.target.checked)}
                        type="checkbox"
                      />
                      <span className="font-medium text-slate-800">
                        Require identity verification before driver activation
                      </span>
                    </label>

                    <div
                      className={`space-y-3 border-l-2 border-slate-200 pl-6 ${requiresIdentityVerification ? '' : 'opacity-50'}`}
                    >
                      <label className="flex items-center gap-3 text-sm">
                        <input
                          defaultChecked={tenant.requireBiometricVerification ?? true}
                          disabled={!requiresIdentityVerification}
                          name="requireBiometricVerification"
                          type="checkbox"
                        />
                        <span className="text-slate-700">Require biometric selfie capture</span>
                      </label>
                      <label className="flex items-center gap-3 text-sm">
                        <input
                          defaultChecked={tenant.requireGovernmentVerificationLookup ?? true}
                          disabled={!requiresIdentityVerification}
                          name="requireGovernmentVerificationLookup"
                          type="checkbox"
                        />
                        <span className="text-slate-700">
                          Require government ID lookup when available
                        </span>
                      </label>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">
                          Who covers the verification cost?
                        </p>
                        <label className="flex items-center gap-3 text-sm">
                          <input
                            defaultChecked={!(tenant.driverPaysKyc ?? false)}
                            disabled={!requiresIdentityVerification}
                            name="driverPaysKyc"
                            type="radio"
                            value="false"
                          />
                          <span className="text-slate-700">
                            Organisation&apos;s verification wallet
                          </span>
                        </label>
                        <label className="flex items-start gap-3 text-sm">
                          <input
                            className="mt-0.5"
                            defaultChecked={tenant.driverPaysKyc ?? false}
                            disabled={!requiresIdentityVerification}
                            name="driverPaysKyc"
                            type="radio"
                            value="true"
                          />
                          <span className="text-slate-700">
                            Driver pays ₦5,000 per check
                            <span className="ml-1 text-xs text-slate-400">
                              (driver is prompted in the mobile app)
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Guarantor requirements */}
                  <div className="space-y-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Guarantor requirements
                    </p>
                    <label className="flex items-center gap-3 text-sm">
                      <input
                        checked={requiresGuarantor}
                        name="requireGuarantor"
                        onChange={(e) => setRequiresGuarantor(e.target.checked)}
                        type="checkbox"
                      />
                      <span className="font-medium text-slate-800">
                        Require guarantors for drivers
                      </span>
                    </label>
                    <div
                      className={`space-y-3 border-l-2 border-slate-200 pl-6 ${requiresGuarantor ? '' : 'opacity-50'}`}
                    >
                      <label className="flex items-center gap-3 text-sm">
                        <input
                          defaultChecked={tenant.requireGuarantorVerification ?? false}
                          disabled={!requiresGuarantor}
                          name="requireGuarantorVerification"
                          type="checkbox"
                        />
                        <span className="text-slate-700">
                          Require guarantor identity verification
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Driver document and guarantor capacity fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="requiredDriverDocumentSlugs">Required driver documents</Label>
                      <Input
                        defaultValue={(
                          tenant.requiredDriverDocumentSlugs ?? [
                            'national-id',
                            'drivers-license',
                          ]
                        ).join(', ')}
                        id="requiredDriverDocumentSlugs"
                        name="requiredDriverDocumentSlugs"
                      />
                      <Text tone="muted">
                        Use comma-separated document slugs such as `national-id, drivers-license`.
                      </Text>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guarantorMaxActiveDrivers">
                        Max active drivers per guarantor
                      </Label>
                      <Input
                        defaultValue={String(tenant.guarantorMaxActiveDrivers ?? 2)}
                        id="guarantorMaxActiveDrivers"
                        min="1"
                        name="guarantorMaxActiveDrivers"
                        type="number"
                      />
                    </div>
                  </div>

                  {organisationState.error ? (
                    <Text tone="danger">{organisationState.error}</Text>
                  ) : null}
                  {organisationState.success ? (
                    <Text tone="success">{organisationState.success}</Text>
                  ) : null}
                  <Button disabled={organisationPending} type="submit">
                    {organisationPending ? 'Saving…' : 'Save driver settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fleet section */}
        {activeSection === 'fleet' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle documents</CardTitle>
                <CardDescription>
                  Define which documents must be attached to each vehicle before it can be
                  considered compliant.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={organisationAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="requiredVehicleDocumentSlugs">
                      Required vehicle documents
                    </Label>
                    <Input
                      defaultValue={(
                        tenant.requiredVehicleDocumentSlugs ?? ['vehicle-license', 'insurance']
                      ).join(', ')}
                      id="requiredVehicleDocumentSlugs"
                      name="requiredVehicleDocumentSlugs"
                    />
                    <Text tone="muted">
                      Use comma-separated document slugs such as `vehicle-license, insurance,
                      road-worthiness`.
                    </Text>
                  </div>
                  {organisationState.error ? (
                    <Text tone="danger">{organisationState.error}</Text>
                  ) : null}
                  {organisationState.success ? (
                    <Text tone="success">{organisationState.success}</Text>
                  ) : null}
                  <Button disabled={organisationPending} type="submit">
                    {organisationPending ? 'Saving…' : 'Save fleet settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications section */}
        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification preferences</CardTitle>
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
                          ? (
                              Object.entries(notificationPreferences) as Array<
                                [
                                  keyof NotificationPreferencesRecord,
                                  NotificationPreferencesRecord[keyof NotificationPreferencesRecord],
                                ]
                              >
                            ).map(([topic, preference]) => (
                              <tr
                                className="rounded-lg border border-slate-200 bg-slate-50/80"
                                key={topic}
                              >
                                <td className="rounded-l-lg px-3 py-2 font-medium text-slate-700">
                                  {NOTIFICATION_LABELS[topic]}
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    defaultChecked={preference.email}
                                    name={`${topic}.email`}
                                    type="checkbox"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    defaultChecked={preference.inApp}
                                    name={`${topic}.inApp`}
                                    type="checkbox"
                                  />
                                </td>
                                <td className="rounded-r-lg px-3 py-2">
                                  <input
                                    defaultChecked={preference.push}
                                    name={`${topic}.push`}
                                    type="checkbox"
                                  />
                                </td>
                              </tr>
                            ))
                          : null}
                      </tbody>
                    </table>
                  </div>
                  {notificationState.error ? (
                    <Text tone="danger">{notificationState.error}</Text>
                  ) : null}
                  {notificationState.success ? (
                    <Text tone="success">{notificationState.success}</Text>
                  ) : null}
                  <Button disabled={notificationPending} type="submit">
                    {notificationPending ? 'Saving…' : 'Save notification settings'}
                  </Button>
                </form>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Reminder sync</p>
                  <div className="flex flex-wrap gap-3">
                    <form action={reminderAction}>
                      <Button disabled={reminderPending} type="submit" variant="secondary">
                        {reminderPending ? 'Refreshing…' : 'Refresh remittance reminders'}
                      </Button>
                    </form>
                    <form action={maintenanceReminderAction}>
                      <Button
                        disabled={maintenanceReminderPending}
                        type="submit"
                        variant="secondary"
                      >
                        {maintenanceReminderPending
                          ? 'Refreshing…'
                          : 'Refresh maintenance reminders'}
                      </Button>
                    </form>
                  </div>
                  {reminderState.error ? (
                    <Text tone="danger">{reminderState.error}</Text>
                  ) : null}
                  {reminderState.success ? (
                    <Text tone="success">{reminderState.success}</Text>
                  ) : null}
                  {maintenanceReminderState.error ? (
                    <Text tone="danger">{maintenanceReminderState.error}</Text>
                  ) : null}
                  {maintenanceReminderState.success ? (
                    <Text tone="success">{maintenanceReminderState.success}</Text>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent inbox</CardTitle>
                <CardDescription>
                  Latest organisation and remittance reminders delivered to this account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 6).map((notification) => (
                      <div
                        className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/80 px-4 py-3"
                        key={notification.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--mobiris-ink)]">
                              {notification.title}
                            </p>
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
                  <Text tone="muted">
                    No notifications have been delivered to this account yet.
                  </Text>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
