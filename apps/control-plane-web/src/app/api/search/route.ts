import { NextResponse } from 'next/server';
import { listInvoices, listSubscriptions, listTenants } from '../../../lib/api-control-plane';

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: 'organisation' | 'subscription' | 'invoice';
};

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (!q) {
    return NextResponse.json([] satisfies SearchItem[]);
  }

  try {
    const [organisations, subscriptions, invoices] = await Promise.all([
      listTenants(),
      listSubscriptions(),
      listInvoices(),
    ]);

    const organisationResults = organisations
      .filter((organisation) =>
        [organisation.name, organisation.slug, organisation.country, organisation.status].some(
          (value) => includesQuery(value, q),
        ),
      )
      .slice(0, 8)
      .map<SearchItem>((organisation) => ({
        id: organisation.id,
        title: organisation.name,
        subtitle: `${organisation.slug} · ${organisation.status}`,
        href: `/tenants/${organisation.id}`,
        type: 'organisation',
      }));

    const subscriptionResults = subscriptions
      .filter((subscription) =>
        [
          subscription.id,
          subscription.tenantId,
          subscription.planName,
          subscription.planTier,
          subscription.status,
        ].some((value) => includesQuery(value, q)),
      )
      .slice(0, 8)
      .map<SearchItem>((subscription) => ({
        id: subscription.id,
        title: subscription.planName,
        subtitle: `${subscription.planTier} · ${subscription.status} · ${subscription.tenantId}`,
        href: '/subscriptions',
        type: 'subscription',
      }));

    const invoiceResults = invoices
      .filter((invoice) =>
        [invoice.id, invoice.tenantId, invoice.subscriptionId, invoice.status].some((value) =>
          includesQuery(value, q),
        ),
      )
      .slice(0, 8)
      .map<SearchItem>((invoice) => ({
        id: invoice.id,
        title: `Invoice ${invoice.id.slice(0, 8)}`,
        subtitle: `${invoice.status} · ${invoice.tenantId}`,
        href: '/subscriptions',
        type: 'invoice',
      }));

    return NextResponse.json([...organisationResults, ...subscriptionResults, ...invoiceResults]);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unable to search right now.',
      },
      { status: 500 },
    );
  }
}
