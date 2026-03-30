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
  recommendedProvider?: 'paystack' | 'flutterwave';
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function parseAmountToMinorUnits(amountRaw: string, currencyMinorUnitRaw: string): number | null {
  const normalized = amountRaw.replace(/,/g, '').trim();
  if (!normalized) {
    return null;
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const currencyMinorUnit = Number.parseInt(currencyMinorUnitRaw, 10);
  if (!Number.isFinite(currencyMinorUnit) || currencyMinorUnit < 0 || currencyMinorUnit > 6) {
    return null;
  }

  const [wholePart, fractionalPart = ''] = normalized.split('.');
  if (fractionalPart.length > currencyMinorUnit) {
    return null;
  }

  const whole = Number.parseInt(wholePart ?? '0', 10);
  if (!Number.isFinite(whole)) {
    return null;
  }

  const paddedFraction = `${fractionalPart}${'0'.repeat(currencyMinorUnit)}`.slice(
    0,
    currencyMinorUnit,
  );
  const fraction = paddedFraction ? Number.parseInt(paddedFraction, 10) : 0;
  const factor = 10 ** currencyMinorUnit;
  const amountMinorUnits = whole * factor + fraction;

  return Number.isFinite(amountMinorUnits) ? amountMinorUnits : null;
}

function sanitizeCheckoutError(
  error: unknown,
  context: 'wallet_top_up' | 'card_setup' | 'invoice_payment',
  provider?: string,
): WalletCheckoutActionState {
  console.error(`[verification-funding] ${context} failed`, error);

  const message = error instanceof Error ? error.message : '';
  const isFlutterwave = provider === 'flutterwave';
  const providerFallback = isFlutterwave ? 'paystack' : 'flutterwave';

  if (/405|method not allowed/i.test(message)) {
    return {
      error: isFlutterwave
        ? 'Flutterwave could not open a hosted checkout right now. Switch to Paystack to continue funding.'
        : 'That funding option is temporarily unavailable. Try the other provider.',
      recommendedProvider: providerFallback,
    };
  }

  if (/502|503|504|bad gateway|service unavailable/i.test(message)) {
    return {
      error:
        'Verification funding is temporarily unavailable right now. Please try again in a moment.',
      ...(providerFallback ? { recommendedProvider: providerFallback } : {}),
    };
  }

  if (/flutterwave/i.test(message)) {
    return {
      error: 'Flutterwave could not start checkout right now. Try Paystack instead.',
      recommendedProvider: 'paystack',
    };
  }

  if (/paystack/i.test(message)) {
    return {
      error: 'Paystack could not start checkout right now. Try Flutterwave instead.',
      recommendedProvider: 'flutterwave',
    };
  }

  if (context === 'card_setup') {
    return {
      error:
        'We could not start saved payment method setup right now. Please try again shortly.',
    };
  }

  if (context === 'invoice_payment') {
    return {
      error: 'We could not start invoice payment right now. Please try again shortly.',
    };
  }

  return {
    error:
      'We could not start verification funding right now. Please try again shortly.',
  };
}

export async function initializeVerificationWalletTopUpAction(
  _prevState: WalletCheckoutActionState,
  formData: FormData,
): Promise<WalletCheckoutActionState> {
  const provider = getTrimmedValue(formData, 'provider');
  const amountRaw = getTrimmedValue(formData, 'amount');
  const currencyMinorUnitRaw = getTrimmedValue(formData, 'currencyMinorUnit');

  if (!provider || !amountRaw) {
    return { error: 'Choose a payment provider and enter an amount to continue.' };
  }

  const amountMinorUnits = parseAmountToMinorUnits(amountRaw, currencyMinorUnitRaw);
  if (!amountMinorUnits || amountMinorUnits <= 0) {
    return { error: 'Enter an amount greater than zero to fund verification funding.' };
  }

  try {
    const checkout = await initializeTenantWalletTopUpCheckout({
      provider,
      amountMinorUnits,
    });
    return { checkoutUrl: checkout.checkoutUrl };
  } catch (error) {
    return sanitizeCheckoutError(error, 'wallet_top_up', provider);
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
    return sanitizeCheckoutError(error, 'invoice_payment', provider);
  }
}

export async function initializeCardSetupCheckoutAction(
  _prevState: WalletCheckoutActionState,
  _formData: FormData,
): Promise<WalletCheckoutActionState> {
  const provider = 'paystack';
  const amountMinorUnits = 10_000;

  try {
    const checkout = await initializeTenantCardSetupCheckout({
      provider,
      amountMinorUnits,
    });
    return { checkoutUrl: checkout.checkoutUrl };
  } catch (error) {
    return sanitizeCheckoutError(error, 'card_setup', provider);
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
    console.error('[verification-funding] change plan failed', error);
    return {
      error: 'We could not change the subscription plan right now. Please try again shortly.',
    };
  }
}
