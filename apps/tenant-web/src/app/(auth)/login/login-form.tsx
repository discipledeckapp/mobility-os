'use client';

import { Button, Input, Label, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { useActionState } from 'react';
import { type LoginActionState, loginAction } from './actions';

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="identifier">Email or phone number</Label>
        <Input
          autoComplete="username email"
          id="identifier"
          name="identifier"
          placeholder="you@organisation.com"
          required
          type="email"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
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
        {isPending ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-slate-500">
        New to Mobiris?{' '}
        <Link
          className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
          href="/signup"
        >
          Register your organisation →
        </Link>
      </p>
    </form>
  );
}
