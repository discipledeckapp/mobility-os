import { redirect } from 'next/navigation';

export default function OperatingUnitsPage() {
  redirect('/settings?section=structure');
}
