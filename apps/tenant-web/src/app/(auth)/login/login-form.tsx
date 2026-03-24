'use client';

import { Button, Input, Label, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { type LoginActionState, loginAction } from './actions';

const initialState: LoginActionState = {};

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

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="identifier">Email or phone number</Label>
        <Input
          autoComplete="username"
          id="identifier"
          name="identifier"
          placeholder="you@company.com or +2348012345678"
          required
          type="text"
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
        <div className="relative">
          <Input
            autoComplete="current-password"
            className="pr-10"
            id="password"
            name="password"
            required
            type={showPassword ? 'text' : 'password'}
          />
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
            onClick={() => setShowPassword((v) => !v)}
            type="button"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
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
