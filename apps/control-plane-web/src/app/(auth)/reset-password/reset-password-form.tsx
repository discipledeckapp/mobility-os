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
import { useServerActionState } from '../../../lib/use-server-action-state';
import { resetPasswordAction, type ResetPasswordActionState } from './actions';

const initialState: ResetPasswordActionState = {};

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';
  const [state, formAction, pending] = useServerActionState(resetPasswordAction, initialState);

  return (
    <Card className="w-full max-w-md border-slate-200/80 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>Complete your platform staff password reset securely.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!token ? <Text className="text-rose-700">This reset link is incomplete.</Text> : null}
        {token ? (
          <form action={formAction} className="space-y-4">
            <input name="token" type="hidden" value={token} />
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" minLength={8} name="password" required type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                minLength={8}
                name="confirmPassword"
                required
                type="password"
              />
            </div>
            <Button disabled={pending} type="submit">
              {pending ? 'Resetting password…' : 'Reset password'}
            </Button>
          </form>
        ) : null}
        {state.error ? <Text className="text-rose-700">{state.error}</Text> : null}
        {state.success ? (
          <div className="space-y-3">
            <Text className="text-emerald-700">{state.success}</Text>
            <Link href="/login">
              <Button type="button">Continue to sign in</Button>
            </Link>
          </div>
        ) : null}
        <Link className="text-sm font-medium text-[var(--mobiris-primary-dark)]" href="/login">
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
