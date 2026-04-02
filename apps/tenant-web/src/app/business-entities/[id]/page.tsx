import type { Route } from 'next';
import { redirect } from 'next/navigation';

export default async function BusinessEntityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect((`/business-entities/${id}/edit` as Route));
}
