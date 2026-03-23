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
  updateProfileAction,
  type SettingsActionState,
} from './actions';

const initialState: SettingsActionState = {};

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
}: {
  session: TenantAuthSessionRecord;
  tenant: TenantRecord;
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    initialState,
  );
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organisation</CardTitle>
          <CardDescription>
            Reference details for the organisation attached to the current session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Text tone="muted">Organisation name</Text>
            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
              {tenant.name}
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
            <Text tone="muted">Business model access</Text>
            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
              {session.role}
            </p>
          </div>
          <div>
            <Text tone="muted">Status</Text>
            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
              {tenant.status}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
