'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
  Text,
} from '@mobility-os/ui';
import { useState } from 'react';
import {
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
} from '../../features/shared/control-plane-page-patterns';
import { useServerActionState } from '../../lib/use-server-action-state';
import { SelectField } from '../../features/shared/select-field';
import type { StaffMemberRecord } from '../../lib/api-control-plane';
import {
  type StaffActionState,
  createStaffInvitationAction,
  deactivateStaffMemberAction,
} from './actions';

const ROLE_OPTIONS = [
  { value: 'PLATFORM_ADMIN', label: 'Platform Admin' },
  { value: 'SUPPORT_AGENT', label: 'Support Agent' },
  { value: 'BILLING_OPS', label: 'Billing Ops' },
];

function roleLabel(role: string): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}

const initialState: StaffActionState = {};

export function StaffPanel({ members }: { members: StaffMemberRecord[] }) {
  const [createState, createAction, createPending] = useServerActionState(
    createStaffInvitationAction,
    initialState,
  );
  const [deactivateState, deactivateAction, deactivatePending] = useServerActionState(
    deactivateStaffMemberAction,
    initialState,
  );
  const [showForm, setShowForm] = useState(false);

  const activeMembers = members.filter((member) => member.isActive).length;
  const pendingMembers = members.length - activeMembers;
  const platformAdmins = members.filter((member) => member.role === 'PLATFORM_ADMIN').length;

  return (
    <div className="space-y-6">
      <ControlPlaneHeroPanel
        badges={[
          { label: `${activeMembers} active`, tone: 'success' },
          { label: `${pendingMembers} pending`, tone: pendingMembers ? 'warning' : 'neutral' },
          { label: `${platformAdmins} platform admins`, tone: 'neutral' },
        ]}
        description="Platform staff should be invited deliberately and deactivated cleanly. This is the access registry for the people who operate tenant oversight, billing, governance, and intelligence workflows."
        eyebrow="Platform access control"
        title="Manage staff access, invitation state, and operational roles."
      />

      <ControlPlaneMetricGrid columns={3}>
        <ControlPlaneMetricCard label="Staff records" value={members.length} />
        <ControlPlaneMetricCard label="Active access" tone="success" value={activeMembers} />
        <ControlPlaneMetricCard label="Pending invitations" tone={pendingMembers ? 'warning' : 'success'} value={pendingMembers} />
      </ControlPlaneMetricGrid>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Platform staff registry</CardTitle>
              <CardDescription>
                Control-plane staff accounts. Only PLATFORM_ADMIN can create new staff.
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm((v) => !v)} type="button" variant="secondary">
              {showForm ? 'Cancel' : 'Invite staff'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showForm && (
            <form
              action={createAction}
              className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-700">Invite platform staff</p>
              <Text tone="muted">
                Issue a secure invite link so the staff member can set their own password.
              </Text>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="staffName">Full name</Label>
                  <Input id="staffName" name="name" placeholder="Tobi Adesanya" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="staffEmail">Email</Label>
                  <Input
                    id="staffEmail"
                    name="email"
                    placeholder="tobi@mobiris.io"
                    required
                    type="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="staffRole">Role</Label>
                  <SelectField
                    className="h-11 rounded-[var(--mobiris-radius-button)] border-[var(--mobiris-border)] text-[var(--mobiris-ink)] shadow-[0_8px_22px_-18px_rgba(15,23,42,0.3)] focus:border-[var(--mobiris-primary-light)] focus:ring-4 focus:ring-[var(--mobiris-primary-tint)]"
                    id="staffRole"
                    name="role"
                    required
                  >
                    <option value="">Select a role…</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </div>
              {createState.error ? <Text className="text-rose-700">{createState.error}</Text> : null}
              {createState.success ? (
                <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <Text className="text-emerald-700">{createState.success}</Text>
                  {createState.invitationUrl ? (
                    <div className="space-y-2">
                      <Input readOnly value={createState.invitationUrl} />
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => navigator.clipboard.writeText(createState.invitationUrl ?? '')}
                          type="button"
                          variant="secondary"
                        >
                          Copy invite link
                        </Button>
                        {createState.invitationExpiresAt ? (
                          <Text className="text-xs text-emerald-800/70">
                            Expires {new Date(createState.invitationExpiresAt).toLocaleString()}
                          </Text>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <Button disabled={createPending} type="submit">
                {createPending ? 'Creating invitation…' : 'Create invitation'}
              </Button>
            </form>
          )}

          {deactivateState.error ? (
            <Text className="text-rose-700">{deactivateState.error}</Text>
          ) : null}
          {deactivateState.success ? (
            <Text className="text-emerald-700">{deactivateState.success}</Text>
          ) : null}

          <TableViewport>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-slate-500">{member.email}</TableCell>
                    <TableCell>
                      <Badge tone="neutral">{roleLabel(member.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      {member.isActive ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="warning">Invitation pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.isActive && (
                        <form action={deactivateAction}>
                          <input name="userId" type="hidden" value={member.id} />
                          <Button disabled={deactivatePending} type="submit" variant="secondary">
                            Deactivate
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {members.length === 0 && (
                  <TableRow>
                    <TableCell className="py-8 text-center text-slate-400" colSpan={5}>
                      No staff members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableViewport>
        </CardContent>
      </Card>
    </div>
  );
}
