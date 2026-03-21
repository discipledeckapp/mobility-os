'use client';

import { Button, Input, Label, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { useActionState } from 'react';
import { type ForgotPasswordState, forgotPasswordAction } from './actions';

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-800">Check your email</p>
          <p className="mt-1 text-sm text-emerald-700">
            If an account exists for that address, we've sent a password reset link. Check your
            inbox and spam folder.
          </p>
        </div>
        <Link
          className="block text-center text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
          href="/login"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          autoComplete="email"
          id="email"
          name="email"
          placeholder="you@organisation.com"
          required
          type="email"
        />
      </div>

      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <Text tone="danger">{state.error}</Text>
        </div>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? 'Sending…' : 'Send reset link'}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Remembered it?{' '}
        <Link
          className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
          href="/login"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
