'use server';

import { revalidatePath } from 'next/cache';
import { createPlan, listPlans, runBillingCycle, runCollectionsCycle } from '../../lib/api-control-plane';

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

export async function seedStandardPlansAction(): Promise<BillingOperationsActionState> {
  const STANDARD_PLANS = [
    {
      name: 'Starter Monthly',
      tier: 'starter',
      billingInterval: 'monthly',
      basePriceMinorUnits: 1500000,
      currency: 'NGN',
      features: {
        vehicleCap: 5,
        driverCap: 10,
        seatLimit: 1,
        verificationEnabled: false,
        walletEnabled: false,
        intelligenceEnabled: false,
      },
    },
    {
      name: 'Growth Monthly',
      tier: 'growth',
      billingInterval: 'monthly',
      basePriceMinorUnits: 3500000,
      currency: 'NGN',
      features: {
        vehicleCap: 20,
        driverCap: null,
        seatLimit: 5,
        verificationEnabled: true,
        walletEnabled: true,
        intelligenceEnabled: false,
      },
    },
    {
      name: 'Starter Annual',
      tier: 'starter',
      billingInterval: 'annual',
      basePriceMinorUnits: 15300000,
      currency: 'NGN',
      features: {
        vehicleCap: 5,
        driverCap: 10,
        seatLimit: 1,
        verificationEnabled: false,
        walletEnabled: false,
        intelligenceEnabled: false,
      },
    },
    {
      name: 'Growth Annual',
      tier: 'growth',
      billingInterval: 'annual',
      basePriceMinorUnits: 35700000,
      currency: 'NGN',
      features: {
        vehicleCap: 20,
        driverCap: null,
        seatLimit: 5,
        verificationEnabled: true,
        walletEnabled: true,
        intelligenceEnabled: false,
      },
    },
  ];

  try {
    const existing = await listPlans();
    const existingNames = new Set(existing.map((p) => p.name));
    const toCreate = STANDARD_PLANS.filter((p) => !existingNames.has(p.name));

    if (toCreate.length === 0) {
      return { success: 'All standard plans already exist.' };
    }

    await Promise.all(toCreate.map((plan) => createPlan(plan)));
    revalidatePath('/billing-operations');
    revalidatePath('/subscriptions');

    return { success: `Seeded ${toCreate.length} plan(s): ${toCreate.map((p) => p.name).join(', ')}.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to seed standard plans.',
    };
  }
}
