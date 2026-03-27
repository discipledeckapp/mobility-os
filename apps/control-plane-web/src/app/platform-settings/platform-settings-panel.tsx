'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { useActionState } from 'react';
import type { PlatformSettingRecord } from '../../lib/api-control-plane';
import {
  type PlatformSettingsActionState,
  upsertPlatformSettingAction,
} from './actions';

const initialState: PlatformSettingsActionState = {};

function SettingEditor({
  settingKey,
  title,
  description,
  currentSetting,
}: {
  settingKey: string;
  title: string;
  description: string;
  currentSetting?: PlatformSettingRecord | null;
}) {
  const [state, formAction, pending] = useActionState(upsertPlatformSettingAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          <input name="key" type="hidden" value={settingKey} />
          <input
            name="description"
            type="hidden"
            value={currentSetting?.description ?? description}
          />
          <div className="space-y-2">
            <Text tone="muted">JSON value</Text>
            <textarea
              className="min-h-[260px] w-full rounded-[var(--mobiris-radius-card)] border border-slate-200 px-4 py-3 font-mono text-sm text-slate-800 shadow-[0_8px_22px_-18px_rgba(15,23,42,0.3)] focus:border-[var(--mobiris-primary-light)] focus:outline-none focus:ring-4 focus:ring-[var(--mobiris-primary-tint)]"
              defaultValue={JSON.stringify(currentSetting?.value ?? {}, null, 2)}
              name="value"
              spellCheck={false}
            />
          </div>
          {state.error ? <Text className="text-rose-700">{state.error}</Text> : null}
          {state.success ? <Text className="text-emerald-700">{state.success}</Text> : null}
          <Button disabled={pending} type="submit">
            {pending ? 'Saving…' : 'Save setting'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PlatformSettingsPanel({ settings }: { settings: PlatformSettingRecord[] }) {
  const verificationRouting =
    settings.find((setting) => setting.key === 'identity_verification_routing') ?? null;
  const billingPolicy =
    settings.find((setting) => setting.key === 'verification_billing_policy') ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SettingEditor
        currentSetting={verificationRouting}
        description="Govern country-specific liveness and lookup provider routing for the intelligence plane."
        settingKey="identity_verification_routing"
        title="Identity verification routing"
      />
      <SettingEditor
        currentSetting={billingPolicy}
        description="Define country-specific verification billing rules without leaking billing semantics into tenant operations."
        settingKey="verification_billing_policy"
        title="Verification billing policy"
      />
    </div>
  );
}
