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
import { useActionState, useState } from 'react';
import { type LoginActionState, loginAction } from './actions';

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Card className="w-full max-w-md border-slate-200/80 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
      <CardHeader>
        <CardTitle>Platform admin login</CardTitle>
        <CardDescription>
          Use your platform credentials to provision organisations and review control-plane posture.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button disabled={isPending} type="submit">
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {state.error ? <Text className="mt-4 text-rose-700">{state.error}</Text> : null}
      </CardContent>
    </Card>
  );
}
