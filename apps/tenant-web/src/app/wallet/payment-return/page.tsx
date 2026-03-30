import type { Route } from 'next';
import { redirect } from 'next/navigation';

interface PaymentReturnPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaymentReturnPage({ searchParams }: PaymentReturnPageProps) {
  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();

  Object.entries(resolved).forEach(([key, value]) => {
    if (typeof value === 'string') {
      params.set(key, value);
      return;
    }

    value?.forEach((item) => params.append(key, item));
  });

  redirect(
    (`/verification-funding/payment-return${params.toString() ? `?${params.toString()}` : ''}`) as Route,
  );
}
