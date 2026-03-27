'use client';

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
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { completeStaffInvitationAction, type StaffActionState } from '../actions';

type StaffInvitationPreviewRecord = {
  name: string;
  email: string;
  role: string;
  expiresAt: string;
};

const initialState: StaffActionState = {};

function roleLabel(role: string): string {
  if (role === 'PLATFORM_ADMIN') return 'Platform Admin';
  if (role === 'SUPPORT_AGENT') return 'Support Agent';
  if (role === 'BILLING_OPS') return 'Billing Ops';
  return role;
}

export function AcceptStaffInvitationClient() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';
  const [invitation, setInvitation] = useState<StaffInvitationPreviewRecord | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, formAction, pending] = useActionState(
    completeStaffInvitationAction,
    initialState,
  );

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setResolveError('This invitation link is incomplete.');
      setLoading(false);
      return;
    }

    fetch(`/api/staff/invitations/resolve?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | StaffInvitationPreviewRecord
          | { error?: string }
          | null;
        if (!response.ok) {
          throw new Error(
            payload && 'error' in payload && payload.error
              ? payload.error
              : 'This invitation is invalid or has expired.',
          );
        }
        return payload as StaffInvitationPreviewRecord;
      })
      .then((result) => {
        if (cancelled) return;
        setInvitation(result);
        setResolveError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setResolveError('This invitation is invalid or has expired.');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] px-4 py-10">
      <Card className="w-full max-w-xl border-slate-200/80">
        <CardHeader>
          <CardTitle>Accept staff invitation</CardTitle>
          <CardDescription>
            Set your password to activate your Mobility OS control-plane account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <Text tone="muted">Loading invitation…</Text> : null}
          {resolveError ? <Text tone="danger">{resolveError}</Text> : null}
          {invitation ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Text tone="muted">Invitation details</Text>
              <p className="mt-2 text-sm font-semibold text-slate-900">{invitation.name}</p>
              <p className="text-sm text-slate-600">{invitation.email}</p>
              <p className="text-sm text-slate-600">{roleLabel(invitation.role)}</p>
              <p className="mt-2 text-xs text-slate-500">
                Expires {new Date(invitation.expiresAt).toLocaleString()}
              </p>
            </div>
          ) : null}
          {!loading && !resolveError && invitation ? (
            <form action={formAction} className="space-y-4">
              <input name="token" type="hidden" value={token} />
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" minLength={8} name="password" required type="password" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  minLength={8}
                  name="confirmPassword"
                  required
                  type="password"
                />
              </div>
              {state.error ? <Text tone="danger">{state.error}</Text> : null}
              {state.success ? (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <Text tone="success">{state.success}</Text>
                  <Link href="/login">
                    <Button type="button">Continue to sign in</Button>
                  </Link>
                </div>
              ) : (
                <Button disabled={pending} type="submit">
                  {pending ? 'Activating account…' : 'Activate account'}
                </Button>
              )}
            </form>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
