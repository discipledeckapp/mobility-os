import { redirect } from 'next/navigation';

export default function BusinessEntitiesPage() {
  redirect('/settings?section=structure');
}
