import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import { listStaffMembers } from '../../lib/api-control-plane';
import { StaffPanel } from './staff-panel';

export default async function StaffPage() {
  const members = await listStaffMembers().catch(() => []);

  return (
    <ControlPlaneShell
      description="Manage platform staff accounts and their access roles."
      eyebrow="Administration"
      title="Platform staff"
    >
      <StaffPanel members={members} />
    </ControlPlaneShell>
  );
}
