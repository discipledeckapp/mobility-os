import type { Route } from 'next';
import { redirect } from 'next/navigation';

export default async function OperatingUnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect((`/operating-units/${id}/edit` as Route));
}
