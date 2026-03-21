'use client';

import { Button, Input, Label, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { useActionState } from 'react';
import { type ResetPasswordState, resetPasswordAction } from './actions';

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-800">Password updated</p>
          <p className="mt-1 text-sm text-emerald-700">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
        </div>
        <Link
          className="block w-full rounded-[var(--mobiris-radius-button)] bg-[var(--mobiris-primary)] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--mobiris-primary-dark)]"
          href="/login"
        >
          Sign in now →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input name="token" type="hidden" value={token} />

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          autoComplete="new-password"
          id="newPassword"
          minLength={8}
          name="newPassword"
          placeholder="Minimum 8 characters"
          required
          type="password"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          autoComplete="new-password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Re-enter your password"
          required
          type="password"
        />
      </div>

      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <Text tone="danger">{state.error}</Text>
        </div>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? 'Updating…' : 'Update password'}
      </Button>

      <p className="text-center text-sm text-slate-500">
        <Link
          className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
          href="/forgot-password"
        >
          Request a new link
        </Link>
      </p>
    </form>
  );
}
