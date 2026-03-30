import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { verifyAndApplyTenantPayment } from '../../../lib/api-core';

interface PaymentReturnPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getSafePaymentReturnError(error: unknown): string {
  console.error('[verification-funding] payment return failed', error);
  const message = error instanceof Error ? error.message : '';

  if (/405|method not allowed/i.test(message)) {
    return 'This payment gateway did not complete the return flow correctly. Please go back and try the other gateway.';
  }

  if (/502|503|504|bad gateway|service unavailable/i.test(message)) {
    return 'We could not confirm this payment right now. Please refresh in a moment or contact support if this keeps happening.';
  }

  return 'We could not confirm this payment yet. Please refresh shortly or contact support if the status does not update.';
}

export default async function PaymentReturnPage({ searchParams }: PaymentReturnPageProps) {
  const resolved = searchParams ? await searchParams : {};
  const provider = firstQueryValue(resolved.provider);
  const purpose = firstQueryValue(resolved.purpose);
  const invoiceId = firstQueryValue(resolved.invoiceId);
  const paystackReference = firstQueryValue(resolved.reference);
  const flutterwaveReference = firstQueryValue(resolved.tx_ref);
  const status = firstQueryValue(resolved.status);
  const reference = paystackReference ?? flutterwaveReference;

  let result: {
    status: string;
    provider: string;
    purpose: string;
    reference: string;
    paymentMethod?: {
      last4?: string | null;
      brand?: string | null;
    };
  } | null = null;
  let error: string | null = null;

  if (!provider || !purpose || !reference) {
    error = 'This checkout return is incomplete. Please restart the funding flow and try again.';
  } else if (status === 'cancelled') {
    error = 'The checkout was cancelled before payment completed.';
  } else {
    try {
      const response = await verifyAndApplyTenantPayment({
        provider,
        purpose,
        reference,
        ...(invoiceId ? { invoiceId } : {}),
      });
      const paymentMethod = response.paymentMethod
        ? {
            ...(response.paymentMethod.last4 ? { last4: response.paymentMethod.last4 } : {}),
            ...(response.paymentMethod.brand ? { brand: response.paymentMethod.brand } : {}),
          }
        : undefined;

      result = {
        status: response.status,
        provider: response.provider,
        purpose: response.purpose,
        reference: response.reference,
        ...(paymentMethod ? { paymentMethod } : {}),
      };
    } catch (verifyError) {
      error = getSafePaymentReturnError(verifyError);
    }
  }

  return (
    <TenantAppShell
      description="Confirm the verification funding outcome and return to the verification funding page."
      eyebrow="Verification Funding"
      title="Funding return"
    >
      <Card>
        <CardHeader>
          <CardTitle>Payment outcome</CardTitle>
          <CardDescription>
            This page verifies the provider response and applies the payment to the correct billing
            purpose.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Text>{error}</Text>
          ) : result ? (
            <>
              <Badge tone={result.status === 'applied' ? 'success' : 'warning'}>
                {result.status}
              </Badge>
              <div className="space-y-2 text-sm text-slate-600">
                <Text>Provider: {result.provider}</Text>
                <Text>Purpose: {result.purpose}</Text>
                <Text>Reference: {result.reference}</Text>
                {result.purpose === 'card_authorization_setup' ? (
                  <Text>
                    Saved card:{' '}
                    {result.paymentMethod?.brand && result.paymentMethod?.last4
                      ? `${result.paymentMethod.brand} ending in ${result.paymentMethod.last4}`
                      : 'Card activated'}
                  </Text>
                ) : null}
              </div>
            </>
          ) : (
            <Text>We are still waiting for the final payment verification result.</Text>
          )}
        </CardContent>
      </Card>
    </TenantAppShell>
  );
}
