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
import { type FormEvent, useActionState } from 'react';
import {
  type BillingOperationsActionState,
  runBillingCycleAction,
  runCollectionsCycleAction,
} from './actions';

const initialState: BillingOperationsActionState = {};

export function RunBillingOpsCard() {
  const [billingState, billingAction, billingPending] = useActionState(
    runBillingCycleAction,
    initialState,
  );
  const [collectionsState, collectionsAction, collectionsPending] = useActionState(
    runCollectionsCycleAction,
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
      </CardContent>
    </Card>
  );
}
