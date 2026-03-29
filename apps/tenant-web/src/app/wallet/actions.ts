'use server';

import {
  changeTenantBillingPlan,
  initializeTenantCardSetupCheckout,
  initializeTenantInvoiceCheckout,
  initializeTenantWalletTopUpCheckout,
} from '../../lib/api-core';

export interface WalletCheckoutActionState {
  error?: string;
  success?: string;
  checkoutUrl?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function initializeVerificationWalletTopUpAction(
  _prevState: WalletCheckoutActionState,
  formData: FormData,
): Promise<WalletCheckoutActionState> {
  const provider = getTrimmedValue(formData, 'provider');
  const amountRaw = getTrimmedValue(formData, 'amountMinorUnits');

  if (!provider || !amountRaw) {
    return { error: 'Payment provider and amount are required.' };
  }

  const amountMinorUnits = Number.parseInt(amountRaw, 10);
  if (Number.isNaN(amountMinorUnits) || amountMinorUnits <= 0) {
    return { error: 'Enter a valid amount to fund the verification wallet.' };
  }

  try {
    const checkout = await initializeTenantWalletTopUpCheckout({
      provider,
      amountMinorUnits,
    });
    return { checkoutUrl: checkout.checkoutUrl };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Unable to initialize wallet funding checkout.',
    };
  }
}

export async function initializeOutstandingInvoiceCheckoutAction(
  _prevState: WalletCheckoutActionState,
  formData: FormData,
): Promise<WalletCheckoutActionState> {
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
    return {
      error: error instanceof Error ? error.message : 'Unable to initialize invoice checkout.',
    };
  }
}

export async function initializeCardSetupCheckoutAction(
  _prevState: WalletCheckoutActionState,
  formData: FormData,
): Promise<WalletCheckoutActionState> {
  const provider = getTrimmedValue(formData, 'provider');
  const amountRaw = getTrimmedValue(formData, 'amountMinorUnits');
  const amountMinorUnits = amountRaw ? Number.parseInt(amountRaw, 10) : 10_000;

  try {
    const checkout = await initializeTenantCardSetupCheckout({
      ...(provider ? { provider } : {}),
      ...(Number.isFinite(amountMinorUnits) && amountMinorUnits > 0
        ? { amountMinorUnits }
        : {}),
    });
    return { checkoutUrl: checkout.checkoutUrl };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to initialize card setup checkout.',
    };
  }
}

export async function changePlanAction(
  _prevState: WalletCheckoutActionState,
  formData: FormData,
): Promise<WalletCheckoutActionState> {
  const planId = getTrimmedValue(formData, 'planId');

  if (!planId) {
    return { error: 'Plan ID is required.' };
  }

  try {
    await changeTenantBillingPlan(planId);
    return { success: 'Plan updated successfully. Refresh to view the new billing status.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to change plan right now.',
    };
  }
}
