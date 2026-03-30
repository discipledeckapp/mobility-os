'use server';

import {
  changeTenantBillingPlan,
  initializeTenantInvoiceCheckout,
  initializeTenantSubscriptionBillingSetupCheckout,
} from '../../lib/api-core';

export interface SubscriptionActionState {
  error?: string;
  success?: string;
  checkoutUrl?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeSubscriptionError(
  error: unknown,
  context: 'invoice_payment' | 'billing_payment_method' | 'plan_change',
): SubscriptionActionState {
  console.error(`[subscription] ${context} failed`, error);

  if (context === 'billing_payment_method') {
    return {
      error:
        'We could not start billing payment method setup right now. Please try again shortly.',
    };
  }

  if (context === 'plan_change') {
    return {
      error: 'We could not change the subscription plan right now. Please try again shortly.',
    };
  }

  return {
    error: 'We could not start invoice payment right now. Please try again shortly.',
  };
}

export async function initializeOutstandingInvoiceCheckoutAction(
  _prevState: SubscriptionActionState,
  formData: FormData,
): Promise<SubscriptionActionState> {
  const provider = getTrimmedValue(formData, 'provider');
  const invoiceId = getTrimmedValue(formData, 'invoiceId');

  if (!provider || !invoiceId) {
    return { error: 'Payment provider and invoice are required.' };
  }

  try {
    const checkout = await initializeTenantInvoiceCheckout({
      provider,
      invoiceId,
    });
    return { checkoutUrl: checkout.checkoutUrl };
  } catch (error) {
    return sanitizeSubscriptionError(error, 'invoice_payment');
  }
}

export async function initializeSubscriptionBillingSetupAction(
  _prevState: SubscriptionActionState,
  formData: FormData,
): Promise<SubscriptionActionState> {
  const provider = getTrimmedValue(formData, 'provider') || 'paystack';

  try {
    const checkout = await initializeTenantSubscriptionBillingSetupCheckout({
      provider,
      amountMinorUnits: 10_000,
    });
    return { checkoutUrl: checkout.checkoutUrl };
  } catch (error) {
    return sanitizeSubscriptionError(error, 'billing_payment_method');
  }
}

export async function changePlanAction(
  _prevState: SubscriptionActionState,
  formData: FormData,
): Promise<SubscriptionActionState> {
  const planId = getTrimmedValue(formData, 'planId');

  if (!planId) {
    return { error: 'Plan ID is required.' };
  }

  try {
    await changeTenantBillingPlan(planId);
    return { success: 'Plan updated successfully. Refresh to view the new billing status.' };
  } catch (error) {
    return sanitizeSubscriptionError(error, 'plan_change');
  }
}
