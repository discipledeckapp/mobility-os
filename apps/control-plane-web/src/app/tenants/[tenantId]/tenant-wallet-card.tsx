'use client';

import {
  ActionPendingButtonState,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InlineLoadingState,
  Input,
  Label,
  Text,
} from '@mobility-os/ui';
import type { PlatformWalletBalanceRecord } from '../../../lib/api-control-plane';
import { useServerActionState } from '../../../lib/use-server-action-state';
import { type CreditWalletActionState, creditTenantWalletAction } from './actions';

export function TenantWalletCard({
  tenantId,
  walletBalance,
}: {
  tenantId: string;
  walletBalance: PlatformWalletBalanceRecord | null;
}) {
  const boundAction = creditTenantWalletAction.bind(null, tenantId);
  const initialState: CreditWalletActionState = {};
  const [state, formAction, pending] = useServerActionState(boundAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {walletBalance ? (
          <div>
            <Text tone="muted">Current balance</Text>
            <p className="mt-1 text-2xl font-bold text-[var(--mobiris-ink)]">
              {walletBalance.currency}{' '}
              {(walletBalance.balanceMinorUnits / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Last updated {new Date(walletBalance.updatedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <Text tone="muted">Wallet balance unavailable.</Text>
        )}

        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="amount">Credit amount</Label>
            <Input
              id="amount"
              min="0.01"
              name="amount"
              placeholder="e.g. 1000.00"
              required
              type="number"
              step="0.01"
            />
            <p className="text-xs text-slate-400">
              Enter the funding amount in major currency units. Example: 1000.00 credits NGN
              1,000.00.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input defaultValue="NGN" id="currency" name="currency" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g. Manual top-up for billing cycle"
            />
          </div>
          {state.error ? <Text tone="danger">{state.error}</Text> : null}
          {state.success ? <Text tone="success">{state.success}</Text> : null}
          {pending ? (
            <InlineLoadingState
              message="Recording the wallet credit and refreshing the current platform balance."
              title="Crediting platform wallet"
              variant="payment"
            />
          ) : null}
          <ActionPendingButtonState
            label="Credit wallet"
            pending={pending}
            pendingLabel="Crediting wallet"
            variant="secondary"
          />
        </form>
      </CardContent>
    </Card>
  );
}
