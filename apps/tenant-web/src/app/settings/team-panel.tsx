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
import { useActionState, useState } from 'react';
import type { TeamMemberRecord } from '../../lib/api-core';
import { type TeamActionState, deactivateTeamMemberAction, inviteTeamMemberAction } from './actions';

const ROLE_OPTIONS = [
  { value: 'FLEET_MANAGER', label: 'Fleet Manager' },
  { value: 'FINANCE_OFFICER', label: 'Finance Officer' },
  { value: 'FIELD_OFFICER', label: 'Field Officer' },
  { value: 'READ_ONLY', label: 'Read Only' },
];

function roleLabel(role: string): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}

function roleTone(role: string): 'success' | 'warning' | 'neutral' | 'danger' {
  if (role === 'TENANT_OWNER') return 'success';
  if (role === 'FLEET_MANAGER') return 'warning';
  if (role === 'FINANCE_OFFICER') return 'neutral';
  return 'neutral';
}

const initialState: TeamActionState = {};

export function TeamPanel({
  members,
  canManage,
}: {
  members: TeamMemberRecord[];
  canManage: boolean;
}) {
  const [inviteState, inviteAction, invitePending] = useActionState(inviteTeamMemberAction, initialState);
  const [deactivateState, deactivateAction, deactivatePending] = useActionState(
    deactivateTeamMemberAction,
    initialState,
  );
  const [showInviteForm, setShowInviteForm] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Team members</CardTitle>
            <CardDescription>
              Operator accounts that can access this organisation's workspace.
            </CardDescription>
          </div>
          {canManage && (
            <Button onClick={() => setShowInviteForm((v) => !v)} type="button" variant="secondary">
              {showInviteForm ? 'Cancel' : '+ Invite member'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showInviteForm && canManage && (
          <form action={inviteAction} className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Invite a new team member</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="inviteName">Full name</Label>
                <Input id="inviteName" name="name" placeholder="Amaka Obi" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inviteEmail">Work email</Label>
                <Input id="inviteEmail" name="email" placeholder="amaka@example.com" required type="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inviteRole">Role</Label>
                <select
                  className="flex h-10 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
                  id="inviteRole"
                  name="role"
                  required
                >
                  <option value="">Select a role…</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invitePhone">Phone (optional)</Label>
                <Input id="invitePhone" name="phone" placeholder="+2348012345678" type="tel" />
              </div>
            </div>
            {inviteState.error ? <Text tone="danger">{inviteState.error}</Text> : null}
            {inviteState.success ? (
              <Text tone="success">{inviteState.success}</Text>
            ) : null}
            <Button disabled={invitePending} type="submit">
              {invitePending ? 'Sending invite…' : 'Send invite'}
            </Button>
            <p className="text-xs text-slate-400">
              The invited member will receive an email to set their password and activate their account.
            </p>
          </form>
        )}

        {deactivateState.error ? (
          <Text tone="danger">{deactivateState.error}</Text>
        ) : null}

        <TableViewport>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-slate-500">{member.email}</TableCell>
                  <TableCell>
                    <Badge tone={roleTone(member.role)}>{roleLabel(member.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    {member.isActive ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="danger">Inactive</Badge>
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      {member.isActive && member.role !== 'TENANT_OWNER' && (
                        <form action={deactivateAction}>
                          <input name="userId" type="hidden" value={member.id} />
                          <Button
                            disabled={deactivatePending}
                            type="submit"
                            variant="secondary"
                          >
                            Deactivate
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell className="py-8 text-center text-slate-400" colSpan={canManage ? 5 : 4}>
                    No team members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableViewport>
      </CardContent>
    </Card>
  );
}
