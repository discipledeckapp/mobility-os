import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import { listStaffMembers } from '../../lib/api-control-plane';
import { StaffPanel } from './staff-panel';

export default async function StaffPage() {
  const members = await listStaffMembers().catch(() => []);

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
