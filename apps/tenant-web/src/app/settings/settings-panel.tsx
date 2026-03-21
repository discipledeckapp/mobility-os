'use client';

import { useActionState } from 'react';
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
                <Input id="currentPassword" name="currentPassword" required type="password" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" minLength={8} name="newPassword" required type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    minLength={8}
                    name="confirmPassword"
                    required
                    type="password"
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
