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
import { useServerActionState } from '../../../lib/use-server-action-state';
import { forgotPasswordAction, type ForgotPasswordActionState } from './actions';

const initialState: ForgotPasswordActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useServerActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <Card className="w-full max-w-md border-slate-200/80 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
      <CardHeader>
        <CardTitle>Recover platform access</CardTitle>
        <CardDescription>
          Request a secure password reset link for your control-plane staff account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" required type="email" />
          </div>
          <Button disabled={pending} type="submit">
            {pending ? 'Sending reset link…' : 'Send reset link'}
          </Button>
        </form>
        {state.error ? <Text className="text-rose-700">{state.error}</Text> : null}
        {state.success ? <Text className="text-emerald-700">{state.success}</Text> : null}
        <Link className="text-sm font-medium text-[var(--mobiris-primary-dark)]" href="/login">
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
