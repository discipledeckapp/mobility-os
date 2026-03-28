'use server';

import { revalidatePath } from 'next/cache';
import {
  changeTenantSubscriptionPlan,
  createFeatureFlagOverride,
  createSubscription,
  createTenantPlatformWalletEntry,
  listPlans,
  removeFeatureFlagOverride,
  transitionTenantLifecycle,
} from '../../../lib/api-control-plane';

export interface TenantDetailActionState {
  error?: string;
  success?: string;
}

export async function transitionTenantAction(
  tenantId: string,
  _previousState: TenantDetailActionState,
  formData: FormData,
): Promise<TenantDetailActionState> {
  const toStatus = String(formData.get('toStatus') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();

  if (!toStatus) {
    return { error: 'Choose a lifecycle transition.' };
  }

  try {
    await transitionTenantLifecycle(tenantId, {
      toStatus,
      ...(reason ? { reason } : {}),
    });
    revalidatePath(`/tenants/${tenantId}`);
    revalidatePath('/tenants');
    return { success: `Tenant moved to ${toStatus}.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to transition tenant.',
    };
  }
}

export interface CreditWalletActionState {
  error?: string;
  success?: string;
}

const PLAN_PERIOD_MONTHS: Record<string, number> = {
  monthly: 1,
  annual: 12,
};

export async function creditTenantWalletAction(
  tenantId: string,
  _prevState: CreditWalletActionState,
  formData: FormData,
): Promise<CreditWalletActionState> {
  const amountRaw = String(formData.get('amount') ?? '').trim();
  const currency = String(formData.get('currency') ?? 'NGN').trim();
  const description = String(formData.get('description') ?? '').trim();

  const parsedAmount = Number(amountRaw.replace(/,/g, ''));
  const amountMinorUnits = Math.round(parsedAmount * 100);
  if (!amountRaw || !Number.isFinite(parsedAmount) || amountMinorUnits <= 0) {
    return { error: 'Enter a valid credit amount (for example 1000.00).' };
  }

  try {
    await createTenantPlatformWalletEntry(tenantId, {
      type: 'credit',
      amountMinorUnits,
      currency,
      ...(description ? { description } : {}),
      referenceType: 'manual_staff_credit',
    });
    revalidatePath(`/tenants/${tenantId}`);
    revalidatePath('/platform-wallets');
    return {
      success: `Credited ${currency} ${(amountMinorUnits / 100).toFixed(2)} to tenant platform wallet.`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to credit wallet.',
    };
  }
}

export async function assignTenantPlanAction(
  tenantId: string,
  hasSubscription: boolean,
  _prevState: TenantDetailActionState,
  formData: FormData,
): Promise<TenantDetailActionState> {
  const planId = String(formData.get('planId') ?? '').trim();
  const onboardingMode = String(formData.get('onboardingMode') ?? 'active').trim();

  if (!planId) {
    return { error: 'Choose a plan.' };
  }

  try {
    if (hasSubscription) {
      await changeTenantSubscriptionPlan(tenantId, planId);
    } else {
      const plans = await listPlans();
      const selectedPlan = plans.find((plan) => plan.id === planId);

      if (!selectedPlan) {
        return { error: 'Selected plan no longer exists.' };
      }

      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date(currentPeriodStart);
      currentPeriodEnd.setMonth(
        currentPeriodEnd.getMonth() + (PLAN_PERIOD_MONTHS[selectedPlan.billingInterval] ?? 1),
      );
      const trialEndsAt =
        onboardingMode === 'trialing'
          ? new Date(currentPeriodStart.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : undefined;

      await createSubscription({
        tenantId,
        planId,
        currentPeriodStart: currentPeriodStart.toISOString(),
        currentPeriodEnd: currentPeriodEnd.toISOString(),
        ...(trialEndsAt ? { trialEndsAt } : {}),
      });
    }

    revalidatePath(`/tenants/${tenantId}`);
    revalidatePath('/tenants');
    revalidatePath('/subscriptions');
    return {
      success: hasSubscription ? 'Subscription plan changed.' : 'Plan assigned to organisation.',
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to update subscription plan.',
    };
  }
}

export async function addTenantFeatureOverrideAction(
  tenantId: string,
  _previousState: TenantDetailActionState,
  formData: FormData,
): Promise<TenantDetailActionState> {
  const flagKey = String(formData.get('flagKey') ?? '').trim();
  const isEnabled = String(formData.get('isEnabled') ?? 'true') === 'true';

  if (!flagKey) {
    return { error: 'Choose a feature flag.' };
  }

  try {
    await createFeatureFlagOverride(flagKey, {
      tenantId,
      isEnabled,
      value: isEnabled,
    });
    revalidatePath(`/tenants/${tenantId}`);
    revalidatePath('/feature-flags');
    return { success: 'Tenant feature override saved.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to save tenant override.',
    };
  }
}

export async function removeTenantFeatureOverrideAction(
  tenantId: string,
  overrideId: string,
): Promise<TenantDetailActionState> {
  try {
    await removeFeatureFlagOverride(overrideId);
    revalidatePath(`/tenants/${tenantId}`);
    revalidatePath('/feature-flags');
    return { success: 'Tenant feature override removed.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to remove tenant override.',
    };
  }
}
