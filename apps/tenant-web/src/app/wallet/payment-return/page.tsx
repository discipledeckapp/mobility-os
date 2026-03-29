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
    error = 'The payment return URL did not include enough information to verify this payment.';
  } else if (status === 'cancelled') {
    error = 'The payment was cancelled before completion.';
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
      error =
        verifyError instanceof Error
          ? verifyError.message
          : 'Unable to verify and apply this payment.';
    }
  }

  return (
    <TenantAppShell
      description="Confirm the provider payment outcome and return to your organisation billing and wallet context."
      eyebrow="Finance"
      title="Payment return"
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
