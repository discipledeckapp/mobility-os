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
import { type FormEvent } from 'react';
import { useServerActionState } from '../../lib/use-server-action-state';
import {
  type BillingOperationsActionState,
  runBillingCycleAction,
  runCollectionsCycleAction,
  seedStandardPlansAction,
} from './actions';

const initialState: BillingOperationsActionState = {};

export function RunBillingOpsCard() {
  const [billingState, billingAction, billingPending] = useServerActionState(
    runBillingCycleAction,
    initialState,
  );
  const [collectionsState, collectionsAction, collectionsPending] = useServerActionState(
    runCollectionsCycleAction,
    initialState,
  );
  const [seedState, seedAction, seedPending] = useServerActionState(
    seedStandardPlansAction,
    initialState,
  );

  function handleBillingSubmit(event: FormEvent<HTMLFormElement>) {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        'Run the billing cycle now? This will generate due invoices and may settle them from funded platform wallets.',
      )
    ) {
      event.preventDefault();
    }
  }

  function handleCollectionsSubmit(event: FormEvent<HTMLFormElement>) {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        'Run collections now? This may debit funded platform wallets and move overdue organisations into a stricter billing posture.',
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <Card className="border-slate-200/80 bg-slate-950 text-white">
      <CardHeader>
        <CardTitle className="text-white">Run platform billing operations</CardTitle>
        <CardDescription>
          Trigger due billing or overdue collections deliberately from the control plane.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={billingAction} className="space-y-2" onSubmit={handleBillingSubmit}>
          <Button disabled={billingPending} type="submit" variant="secondary">
            {billingPending ? 'Running billing...' : 'Run billing cycle'}
          </Button>
          <Text className="text-xs leading-5 text-blue-100/60">
            Generates due invoices and attempts wallet settlement when funding is available.
          </Text>
          {billingState.error ? <Text className="text-rose-300">{billingState.error}</Text> : null}
          {billingState.success ? (
            <Text className="text-emerald-300">{billingState.success}</Text>
          ) : null}
        </form>

        <form action={collectionsAction} className="space-y-2" onSubmit={handleCollectionsSubmit}>
          <Button disabled={collectionsPending} type="submit" variant="secondary">
            {collectionsPending ? 'Running collections...' : 'Run collections cycle'}
          </Button>
          <Text className="text-xs leading-5 text-blue-100/60">
            Applies overdue collection logic and can change lifecycle posture when invoices remain
            unpaid.
          </Text>
          {collectionsState.error ? (
            <Text className="text-rose-300">{collectionsState.error}</Text>
          ) : null}
          {collectionsState.success ? (
            <Text className="text-emerald-300">{collectionsState.success}</Text>
          ) : null}
        </form>

        <div className="border-t border-white/10 pt-4">
          <form action={seedAction} className="space-y-2">
            <Button disabled={seedPending} type="submit" variant="secondary">
              {seedPending ? 'Seeding plans...' : 'Seed standard plans'}
            </Button>
            <Text className="text-xs leading-5 text-blue-100/60">
              Creates Starter (₦15k/mo) and Growth (₦35k/mo) plans if they don&apos;t already exist.
            </Text>
            {seedState.error ? <Text className="text-rose-300">{seedState.error}</Text> : null}
            {seedState.success ? <Text className="text-emerald-300">{seedState.success}</Text> : null}
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
