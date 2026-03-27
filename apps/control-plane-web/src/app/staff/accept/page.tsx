import { Suspense } from 'react';
import { AcceptStaffInvitationClient } from './accept-staff-invitation-client';

export const dynamic = 'force-dynamic';

export default function AcceptStaffInvitationPage() {
  return (
    <Suspense fallback={null}>
      <AcceptStaffInvitationClient />
    </Suspense>
  );
}
