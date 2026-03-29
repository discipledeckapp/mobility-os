'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, Linking, RefreshControl, StyleSheet, Text } from 'react-native';
import {
  changeTenantBillingPlan,
  getTenantBillingSummary,
  listTenantBillingPlans,
  initializeInvoicePayment,
  initializeWalletTopUp,
  verifyAndApplyTenantPayment,
} from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { LoadingSkeleton } from '../../../components/loading-skeleton';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import { useToast } from '../../../contexts/toast-context';
import {
  clearPendingTenantPayment,
  getPendingTenantPayment,
  setPendingTenantPayment,
  type PendingTenantPaymentRecord,
} from '../../../services/tenant-payment-service';
import { tokens } from '../../../theme/tokens';
import { formatDateOnly, formatDateTime, formatMajorAmount, formatStatusLabel } from '../../../utils/formatting';

export function WalletScreen() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const billingQuery = useQuery({
    queryKey: ['operator-wallet', 'billing-summary'],
    queryFn: getTenantBillingSummary,
  });
  const plansQuery = useQuery({
    queryKey: ['operator-wallet', 'plans'],
    queryFn: listTenantBillingPlans,
  });
  const [pendingPayment, setPendingPayment] = useState<PendingTenantPaymentRecord | null>(null);

  useEffect(() => {
    getPendingTenantPayment()
      .then(setPendingPayment)
      .catch(() => {
        setPendingPayment(null);
      });
  }, []);

  const refreshBilling = async () => {
    await Promise.all([
      billingQuery.refetch(),
      queryClient.invalidateQueries({ queryKey: ['operator-dashboard', 'overview'] }),
    ]);
  };

  const verifyMutation = useMutation({
    mutationFn: async (payment: PendingTenantPaymentRecord) =>
      verifyAndApplyTenantPayment({
        provider: payment.provider,
        purpose: payment.purpose,
        reference: payment.reference,
        ...(payment.invoiceId ? { invoiceId: payment.invoiceId } : {}),
      }),
    onSuccess: async (result) => {
      await clearPendingTenantPayment();
      setPendingPayment(null);
      await refreshBilling();
      showToast(
        `${formatStatusLabel(result.purpose)} ${result.status === 'applied' ? 'applied' : result.status}.`,
        result.status === 'applied' ? 'success' : 'info',
      );
    },
    onError: (error) => {
      Alert.alert(
        'Verify payment',
        error instanceof Error ? error.message : 'Unable to verify the provider payment yet.',
      );
    },
  });
  const changePlanMutation = useMutation({
    mutationFn: (planId: string) => changeTenantBillingPlan(planId),
    onSuccess: async () => {
      await refreshBilling();
      await plansQuery.refetch();
      showToast('Company plan updated.', 'success');
    },
    onError: (error) => {
      Alert.alert('Company plan', error instanceof Error ? error.message : 'Unable to change plan.');
    },
  });

  const topUp = async () => {
    try {
      const checkout = await initializeWalletTopUp({
        provider: 'paystack',
        amountMinorUnits: 100_000,
      });
      await setPendingTenantPayment(checkout);
      setPendingPayment(await getPendingTenantPayment());
      await Linking.openURL(checkout.checkoutUrl);
    } catch (error) {
      Alert.alert('Wallet top-up', error instanceof Error ? error.message : 'Unable to initialize wallet top-up.');
    }
  };

  const payOutstandingInvoice = async () => {
    const invoice = billingQuery.data?.outstandingInvoice;
    if (!invoice) {
      return;
    }
    try {
      const checkout = await initializeInvoicePayment({
        provider: 'paystack',
        invoiceId: invoice.id,
      });
      await setPendingTenantPayment(checkout, { invoiceId: invoice.id });
      setPendingPayment(await getPendingTenantPayment());
      await Linking.openURL(checkout.checkoutUrl);
    } catch (error) {
      Alert.alert('Invoice payment', error instanceof Error ? error.message : 'Unable to initialize invoice payment.');
    }
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={billingQuery.isRefetching} onRefresh={() => void billingQuery.refetch()} />}>
      <Card style={styles.section}>
        <Text style={styles.title}>Operational wallet</Text>
        <Text style={styles.copy}>Platform billing wallet, outstanding invoices, and mobile checkout links.</Text>
      </Card>
      {billingQuery.isLoading || !billingQuery.data ? (
        <Card><LoadingSkeleton height={120} /></Card>
      ) : (
        <>
          {billingQuery.data.subscription.enforcement?.stage === 'grace' ? (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Grace period</Text>
              <Text style={styles.meta}>
                Subscription expired. Renew within{' '}
                {billingQuery.data.subscription.enforcement.graceDaysRemaining} day(s). New
                drivers and new vehicles are blocked until renewal.
              </Text>
            </Card>
          ) : null}
          {billingQuery.data.subscription.enforcement?.stage === 'expired' ? (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Degraded mode</Text>
              <Text style={styles.meta}>
                Subscription expired. Drivers can still log remittance and view assignments, but
                new drivers, new vehicles, and new assignments are blocked until upgrade.
              </Text>
            </Card>
          ) : null}
          <Card style={styles.section}>
            <Text style={styles.balance}>
              {billingQuery.data.verificationWallet.currency}{' '}
              {formatMajorAmount(
                billingQuery.data.verificationWallet.balanceMinorUnits,
                session?.currencyMinorUnit ?? 2,
                session?.formattingLocale,
              )}
            </Text>
            <Text style={styles.meta}>Wallet: {billingQuery.data.verificationWallet.walletId}</Text>
            <Text style={styles.meta}>Plan: {billingQuery.data.subscription.planName}</Text>
            <Text style={styles.meta}>Subscription: {formatStatusLabel(billingQuery.data.subscription.status)}</Text>
            <Button label="Top up wallet via Paystack" onPress={() => void topUp()} />
          </Card>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Company plan</Text>
            <Text style={styles.meta}>
              Current plan: {billingQuery.data.subscription.planName}
            </Text>
            {billingQuery.data.subscription.trialEndsAt ? (
              <Text style={styles.meta}>
                Trial ends: {formatDateOnly(billingQuery.data.subscription.trialEndsAt, session?.formattingLocale)}
              </Text>
            ) : null}
            {(plansQuery.data ?? []).map((plan) => (
              <Card key={plan.id} style={styles.innerCard}>
                <Text style={styles.memberName}>{plan.name}</Text>
                <Text style={styles.meta}>
                  {plan.currency} {formatMajorAmount(plan.basePriceMinorUnits, session?.currencyMinorUnit ?? 2, session?.formattingLocale)} / {plan.billingInterval}
                </Text>
                <Button
                  label={plan.id === billingQuery.data.subscription.planId ? 'Current plan' : 'Switch to this plan'}
                  variant="secondary"
                  loading={changePlanMutation.isPending}
                  disabled={plan.id === billingQuery.data.subscription.planId}
                  onPress={() => changePlanMutation.mutate(plan.id)}
                />
              </Card>
            ))}
          </Card>
          {pendingPayment ? (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Pending payment verification</Text>
              <Text style={styles.meta}>Reference: {pendingPayment.reference}</Text>
              <Text style={styles.meta}>Purpose: {formatStatusLabel(pendingPayment.purpose)}</Text>
              <Text style={styles.meta}>Started: {formatDateTime(pendingPayment.createdAt, session?.formattingLocale)}</Text>
              <Button
                label="I completed payment, verify now"
                loading={verifyMutation.isPending}
                onPress={() => verifyMutation.mutate(pendingPayment)}
              />
              <Button
                label="Re-open checkout"
                variant="secondary"
                onPress={() => void Linking.openURL(pendingPayment.checkoutUrl)}
              />
              <Button
                label="Clear pending payment"
                variant="secondary"
                onPress={() =>
                  void clearPendingTenantPayment().then(() => {
                    setPendingPayment(null);
                  })
                }
              />
            </Card>
          ) : null}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Outstanding invoice</Text>
            {billingQuery.data.outstandingInvoice ? (
              <>
                <Text style={styles.meta}>Amount due: {billingQuery.data.outstandingInvoice.currency} {formatMajorAmount(billingQuery.data.outstandingInvoice.amountDueMinorUnits, session?.currencyMinorUnit ?? 2, session?.formattingLocale)}</Text>
                <Text style={styles.meta}>Due at: {billingQuery.data.outstandingInvoice.dueAt ? formatDateOnly(billingQuery.data.outstandingInvoice.dueAt, session?.formattingLocale) : 'No due date'}</Text>
                <Button label="Pay outstanding invoice" variant="secondary" onPress={() => void payOutstandingInvoice()} />
              </>
            ) : (
              <Text style={styles.meta}>There is no outstanding invoice right now.</Text>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  innerCard: { gap: tokens.spacing.xs },
  memberName: { color: tokens.colors.ink, fontSize: 16, fontWeight: '700' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
  balance: { color: tokens.colors.ink, fontSize: 30, fontWeight: '800' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default WalletScreen;
