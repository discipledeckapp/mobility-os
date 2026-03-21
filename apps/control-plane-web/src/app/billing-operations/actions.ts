'use server';

import { revalidatePath } from 'next/cache';
import { runBillingCycle, runCollectionsCycle } from '../../lib/api-control-plane';

export interface BillingOperationsActionState {
  error?: string;
  success?: string;
}

export async function runBillingCycleAction(): Promise<BillingOperationsActionState> {
  try {
    const result = await runBillingCycle();
    revalidatePath('/billing-operations');
    revalidatePath('/subscriptions');
    revalidatePath('/platform-wallets');

    return {
      success: `Billing cycle completed for ${result.subscriptionCount} subscription(s).`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to run billing cycle.',
    };
  }
}

export async function runCollectionsCycleAction(): Promise<BillingOperationsActionState> {
  try {
    const result = await runCollectionsCycle();
    revalidatePath('/billing-operations');
    revalidatePath('/subscriptions');
    revalidatePath('/platform-wallets');

    return {
      success: `Collections run completed for ${result.invoiceCount} invoice(s).`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to run collections cycle.',
    };
  }
}
