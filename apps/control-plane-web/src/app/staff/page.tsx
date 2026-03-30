import { connection } from 'next/server';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import { listStaffMembers } from '../../lib/api-control-plane';
import { requirePlatformSession } from '../../lib/require-platform-session';
import { StaffPanel } from './staff-panel';

export default async function StaffPage() {
  await connection();

  const token = await requirePlatformSession();
  const members = await listStaffMembers(token).catch(() => []);

  return (
    <ControlPlaneShell
      description="Invite platform staff, track pending invitations, and deactivate access when needed."
      eyebrow="Administration"
      title="Platform staff"
    >
      <StaffPanel members={members} />
    </ControlPlaneShell>
  );
}
