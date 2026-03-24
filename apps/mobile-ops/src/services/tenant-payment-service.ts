import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TenantPaymentCheckoutRecord } from '../api';
import { STORAGE_KEYS } from '../constants';

export type PendingTenantPaymentRecord = {
  provider: string;
  reference: string;
  purpose: string;
  invoiceId?: string;
  checkoutUrl: string;
  createdAt: string;
};

export async function getPendingTenantPayment(): Promise<PendingTenantPaymentRecord | null> {
  const serialized = await AsyncStorage.getItem(STORAGE_KEYS.pendingTenantPayment);
  if (!serialized) {
    return null;
  }

  try {
    return JSON.parse(serialized) as PendingTenantPaymentRecord;
  } catch {
    return null;
  }
}

export async function setPendingTenantPayment(
  checkout: TenantPaymentCheckoutRecord,
  input: { invoiceId?: string } = {},
): Promise<PendingTenantPaymentRecord> {
  const pending: PendingTenantPaymentRecord = {
    provider: checkout.provider,
    reference: checkout.reference,
    purpose: checkout.purpose,
    ...(input.invoiceId ? { invoiceId: input.invoiceId } : {}),
    checkoutUrl: checkout.checkoutUrl,
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.pendingTenantPayment, JSON.stringify(pending));
  return pending;
}

export async function clearPendingTenantPayment(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.pendingTenantPayment);
}
