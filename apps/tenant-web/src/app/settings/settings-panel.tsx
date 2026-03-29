'use client';

import { DocumentScope, getDocumentTypesByScope } from '@mobility-os/domain-config';
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
import { useActionState, useMemo, useState } from 'react';
import type {
  FleetRecord,
  TeamMemberRecord,
  TenantAuthSessionRecord,
  TenantRecord,
  VehicleRecord,
} from '../../lib/api-core';
import type {
  DataSubjectRequestRecord,
  NotificationPreferencesRecord,
  PrivacySupportRecord,
  UserNotificationRecord,
} from '../../lib/api-core';
import {
  type SettingsActionState,
  changePasswordAction,
  createDataSubjectRequestAction,
  syncMaintenanceRemindersAction,
  syncRemittanceRemindersAction,
  updateNotificationPreferencesAction,
  updateOrganisationSettingsAction,
  updateProfileAction,
} from './actions';
import { TeamPanel } from './team-panel';

const initialState: SettingsActionState = {};

const NOTIFICATION_LABELS: Record<keyof NotificationPreferencesRecord, string> = {
  verification_payment_receipt: 'Verification payment receipts',
  driver_verification_status: 'Driver verification updates',
  driver_licence_review_pending: 'Licence review pending alerts',
  driver_licence_review_resolved: 'Licence review decisions',
  guarantor_status: 'Guarantor status updates',
  assignment_issued: 'Assignment issued alerts',
  assignment_accepted: 'Assignment accepted alerts',
  assignment_changed: 'Assignment changed alerts',
  assignment_ended: 'Assignment ended alerts',
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

type SettingsSection =
  | 'account'
  | 'organisation'
  | 'drivers'
  | 'fleet'
  | 'notifications'
  | 'team'
  | 'privacy';

const NAV_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'organisation', label: 'Organisation' },
  { id: 'drivers', label: 'Drivers' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'team', label: 'Team' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
];

const DRIVER_DOCUMENT_OPTIONS = getDocumentTypesByScope(DocumentScope.Driver);

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

function LogoUploadField({ currentUrl }: { currentUrl?: string | null | undefined }) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl === 'string') {
        setPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="flex items-center gap-3">
          <img
            alt="Organisation logo"
            className="h-14 w-14 rounded-xl border border-slate-200 object-contain p-1"
            src={preview}
          />
          <button
            className="text-sm text-slate-500 hover:text-rose-600"
            onClick={() => setPreview(null)}
            type="button"
          >
            Remove
          </button>
        </div>
      ) : null}
      <input name="logoUrl" type="hidden" value={preview ?? ''} />
      <input
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="block w-full cursor-pointer rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--mobiris-ink)] file:mr-3 file:rounded-[var(--mobiris-radius-button)] file:border-0 file:bg-[var(--mobiris-primary)]/10 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-[var(--mobiris-primary)]"
        id="logoFile"
        onChange={handleFile}
        type="file"
      />
      <p className="text-xs text-slate-400">
        PNG, JPG, SVG or WebP. Shown in the workspace header.
      </p>
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
  privacySupport,
  members,
  fleets,
  vehicles,
  canManage,
  dataRequests,
}: {
  session: TenantAuthSessionRecord;
  tenant: TenantRecord;
  notificationPreferences: NotificationPreferencesRecord | null;
  notifications: UserNotificationRecord[];
  privacySupport: PrivacySupportRecord | null;
  members: TeamMemberRecord[];
  fleets: FleetRecord[];
  vehicles: VehicleRecord[];
  canManage: boolean;
  dataRequests: DataSubjectRequestRecord[];
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
  const [privacyRequestState, privacyRequestAction, privacyRequestPending] = useActionState(
    createDataSubjectRequestAction,
    initialState,
  );

  const [requiresIdentityVerification, setRequiresIdentityVerification] = useState(
    tenant.requireIdentityVerificationForActivation ?? true,
  );
  const [requiresGuarantor, setRequiresGuarantor] = useState(tenant.requireGuarantor ?? false);
  const selectedDriverDocumentSlugs = useMemo(
    () => new Set(tenant.requiredDriverDocumentSlugs ?? []),
    [tenant.requiredDriverDocumentSlugs],
  );
  const customDriverDocumentTypes = useMemo(
    () =>
      (tenant.customDriverDocumentTypes ?? []).filter(
        (slug) => !DRIVER_DOCUMENT_OPTIONS.some((document) => document.slug === slug),
      ),
    [tenant.customDriverDocumentTypes],
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
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="logoFile">Company logo</Label>
                      <LogoUploadField currentUrl={tenant.logoUrl} />
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
                  <Text tone="muted">
                    When drivers pay the verification fee, Mobiris always sends the self-service
                    verification link automatically so they can complete payment and onboarding.
                  </Text>
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
                <ReadOnlyField
                  label="Organisation name"
                  value={tenant.displayName ?? tenant.name}
                />
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
                            defaultChecked={!(tenant.driverPaysKyc ?? true)}
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
                            defaultChecked={tenant.driverPaysKyc ?? true}
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
                          defaultChecked={tenant.guarantorBlocking ?? false}
                          disabled={!requiresGuarantor}
                          name="guarantorBlocking"
                          type="checkbox"
                        />
                        <span className="text-slate-700">
                          Block driver readiness until guarantor is added
                          <span className="ml-1 text-slate-500 font-normal">
                            (off = driver is ready, missing guarantor shown as a risk flag)
                          </span>
                        </span>
                      </label>
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
                    <div className="space-y-3 md:col-span-2">
                      <Label htmlFor="requiredDriverDocumentSlugs">Required driver documents</Label>
                      <div className="grid gap-3 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2">
                        {DRIVER_DOCUMENT_OPTIONS.map((document) => (
                          <label className="flex items-start gap-3 text-sm" key={document.slug}>
                            <input
                              defaultChecked={selectedDriverDocumentSlugs.has(document.slug)}
                              name="requiredDriverDocumentSlugs"
                              type="checkbox"
                              value={document.slug}
                            />
                            <span className="space-y-0.5">
                              <span className="block font-medium text-slate-800">
                                {document.name}
                              </span>
                              <span className="block text-slate-500">
                                {document.hasExpiry
                                  ? 'Track expiry during onboarding.'
                                  : 'Collect once during onboarding.'}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                      <Text tone="muted">
                        Supporting documents stay optional unless you select them here.
                      </Text>
                      <div className="space-y-2">
                        <Label htmlFor="customDriverDocumentTypes">Custom document types</Label>
                        <Input
                          defaultValue={customDriverDocumentTypes.join(', ')}
                          id="customDriverDocumentTypes"
                          name="customDriverDocumentTypes"
                          placeholder="guarantor-letter, union-card"
                        />
                        <Text tone="muted">
                          Add any extra document types you want collected. Custom entries entered
                          here will be included in onboarding.
                        </Text>
                      </div>
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
                    <Label htmlFor="requiredVehicleDocumentSlugs">Required vehicle documents</Label>
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

        {/* Team section */}
        {activeSection === 'team' && (
          <TeamPanel canManage={canManage} fleets={fleets} members={members} vehicles={vehicles} />
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
                  {reminderState.error ? <Text tone="danger">{reminderState.error}</Text> : null}
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

        {activeSection === 'privacy' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy and data requests</CardTitle>
                <CardDescription>
                  Submit access, correction, deletion, or processing-restriction requests without
                  leaving your account workflow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={privacyRequestAction} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="requestType">Request type</Label>
                      <select
                        className="flex h-10 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
                        defaultValue="access"
                        id="requestType"
                        name="requestType"
                      >
                        <option value="access">Access my data</option>
                        <option value="correction">Correct my data</option>
                        <option value="deletion">Delete my data</option>
                        <option value="restriction">Restrict processing</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="privacySupport">Support contact</Label>
                      <div className="rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        {privacySupport?.supportEmail ?? 'support@mobiris.ng'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details">Details</Label>
                    <textarea
                      className="min-h-28 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--mobiris-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
                      id="details"
                      name="details"
                      placeholder="Tell us what you want reviewed, corrected, deleted, or restricted."
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Mobility OS records the request time, policy version, and request scope for
                    audit. For verification-specific consent, use the dedicated verification consent
                    step.
                  </p>
                  {privacyRequestState.error ? (
                    <Text tone="danger">{privacyRequestState.error}</Text>
                  ) : null}
                  {privacyRequestState.success ? (
                    <Text tone="success">{privacyRequestState.success}</Text>
                  ) : null}
                  <Button disabled={privacyRequestPending} type="submit">
                    {privacyRequestPending ? 'Submitting…' : 'Submit privacy request'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legal and support</CardTitle>
                <CardDescription>
                  Current document versions and support channels used for privacy requests.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ReadOnlyField
                  label="Privacy policy version"
                  value={privacySupport?.privacyPolicyVersion ?? '2026-03-27'}
                />
                <ReadOnlyField
                  label="Terms version"
                  value={privacySupport?.termsVersion ?? '2026-03-27'}
                />
                <ReadOnlyField
                  label="Support email"
                  value={privacySupport?.supportEmail ?? 'support@mobiris.ng'}
                />
                {privacySupport?.supportPhonePrimary ? (
                  <ReadOnlyField
                    label="Primary support phone"
                    value={privacySupport.supportPhonePrimary}
                  />
                ) : null}
                {privacySupport?.supportPhoneSecondary ? (
                  <ReadOnlyField
                    label="Secondary support phone"
                    value={privacySupport.supportPhoneSecondary}
                  />
                ) : null}
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    className="text-sm font-semibold text-[var(--mobiris-primary)] underline hover:no-underline"
                    href="/privacy"
                  >
                    Open Privacy Policy
                  </a>
                  <a
                    className="text-sm font-semibold text-[var(--mobiris-primary)] underline hover:no-underline"
                    href="/terms"
                  >
                    Open Terms of Use
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submitted requests</CardTitle>
                <CardDescription>
                  Track your current privacy and data-protection requests from the same workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dataRequests.length === 0 ? (
                  <Text tone="muted">
                    No data requests have been submitted from this account yet.
                  </Text>
                ) : (
                  dataRequests.map((request) => (
                    <div
                      className="rounded-[var(--mobiris-radius-card)] border border-slate-200 px-4 py-3"
                      key={request.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold capitalize text-[var(--mobiris-ink)]">
                          {request.requestType.replace(/_/g, ' ')}
                        </p>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        Submitted {new Date(request.createdAt).toLocaleString()}
                      </p>
                      {request.details ? (
                        <p className="mt-2 text-sm text-slate-600">{request.details}</p>
                      ) : null}
                      {request.resolutionNotes ? (
                        <p className="mt-2 text-sm text-slate-600">
                          Resolution: {request.resolutionNotes}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
