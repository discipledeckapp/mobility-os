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
import type { FleetRecord, TeamMemberRecord, VehicleRecord } from '../../lib/api-core';
import {
  type TeamActionState,
  deactivateTeamMemberAction,
  inviteTeamMemberAction,
  resendTeamInviteAction,
  updateTeamMemberAccessAction,
} from './actions';

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
const CUSTOM_PERMISSION_OPTIONS = [
  { value: 'drivers:write', label: 'Manage drivers' },
  { value: 'vehicles:write', label: 'Manage vehicles' },
  { value: 'assignments:write', label: 'Manage assignments' },
  { value: 'remittance:approve', label: 'Approve remittance' },
  { value: 'operational_wallets:write', label: 'Manage company wallet' },
  { value: 'maintenance:write', label: 'Manage maintenance' },
  { value: 'documents:write', label: 'Review documents' },
] as const;

export function TeamPanel({
  members,
  fleets,
  vehicles,
  canManage,
}: {
  members: TeamMemberRecord[];
  fleets: FleetRecord[];
  vehicles: VehicleRecord[];
  canManage: boolean;
}) {
  const [inviteState, inviteAction, invitePending] = useActionState(inviteTeamMemberAction, initialState);
  const [deactivateState, deactivateAction, deactivatePending] = useActionState(
    deactivateTeamMemberAction,
    initialState,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendTeamInviteAction,
    initialState,
  );
  const [accessState, accessAction, accessPending] = useActionState(
    updateTeamMemberAccessAction,
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
            <details className="rounded-lg border border-slate-200 bg-white p-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-700">
                Fleet scope and extra access
              </summary>
              <div className="mt-3 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Visible fleets
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {fleets.map((fleet) => (
                      <label
                        key={fleet.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      >
                        <input name="assignedFleetIds" type="checkbox" value={fleet.id} />
                        <span>{fleet.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Leave all unchecked to allow access across all fleets for this company.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Extra access
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CUSTOM_PERMISSION_OPTIONS.map((permission) => (
                      <label
                        key={permission.value}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      >
                        <input
                          name="customPermissions"
                          type="checkbox"
                          value={permission.value}
                        />
                        <span>{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Selected vehicles
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {vehicles.map((vehicle) => (
                      <label
                        key={vehicle.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      >
                        <input name="assignedVehicleIds" type="checkbox" value={vehicle.id} />
                        <span>{vehicle.tenantVehicleCode || vehicle.systemVehicleCode}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Select vehicles when this team member should manage a cross-fleet subset instead of an entire fleet.
                  </p>
                </div>
              </div>
            </details>
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
        {resendState.error ? <Text tone="danger">{resendState.error}</Text> : null}
        {resendState.success ? <Text tone="success">{resendState.success}</Text> : null}
        {accessState.error ? <Text tone="danger">{accessState.error}</Text> : null}
        {accessState.success ? <Text tone="success">{accessState.success}</Text> : null}

        <TableViewport>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Fleet scope</TableHead>
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
                  <TableCell className="text-slate-500">
                    {member.assignedVehicleIds.length > 0
                      ? `${member.assignedVehicleIds.length} vehicle${member.assignedVehicleIds.length === 1 ? '' : 's'}`
                      : member.assignedFleetIds.length === 0
                        ? 'All company fleets'
                        : `${member.assignedFleetIds.length} fleet${member.assignedFleetIds.length === 1 ? '' : 's'}`}
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
                      {member.isActive && member.role !== 'TENANT_OWNER' ? (
                        <div className="flex flex-wrap gap-2">
                          <details className="min-w-[18rem] rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <summary className="cursor-pointer text-sm font-medium text-slate-700">
                              Manage access
                            </summary>
                            <form action={accessAction} className="mt-3 space-y-3">
                              <input name="userId" type="hidden" value={member.id} />
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                  Fleet scope
                                </p>
                                <div className="grid gap-2">
                                  {fleets.map((fleet) => (
                                    <label
                                      key={`${member.id}-${fleet.id}`}
                                      className="flex items-center gap-2 text-sm text-slate-700"
                                    >
                                      <input
                                        defaultChecked={member.assignedFleetIds.includes(fleet.id)}
                                        name="assignedFleetIds"
                                        type="checkbox"
                                        value={fleet.id}
                                      />
                                      <span>{fleet.name}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                  Selected vehicles
                                </p>
                                <div className="grid gap-2">
                                  {vehicles.map((vehicle) => (
                                    <label
                                      key={`${member.id}-${vehicle.id}`}
                                      className="flex items-center gap-2 text-sm text-slate-700"
                                    >
                                      <input
                                        defaultChecked={member.assignedVehicleIds.includes(vehicle.id)}
                                        name="assignedVehicleIds"
                                        type="checkbox"
                                        value={vehicle.id}
                                      />
                                      <span>{vehicle.tenantVehicleCode || vehicle.systemVehicleCode}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                  Extra access
                                </p>
                                <div className="grid gap-2">
                                  {CUSTOM_PERMISSION_OPTIONS.map((permission) => (
                                    <label
                                      key={`${member.id}-${permission.value}`}
                                      className="flex items-center gap-2 text-sm text-slate-700"
                                    >
                                      <input
                                        defaultChecked={member.customPermissions.includes(permission.value)}
                                        name="customPermissions"
                                        type="checkbox"
                                        value={permission.value}
                                      />
                                      <span>{permission.label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <Button disabled={accessPending} type="submit" variant="secondary">
                                Save access
                              </Button>
                            </form>
                          </details>
                          <form action={resendAction}>
                            <input name="userId" type="hidden" value={member.id} />
                            <Button disabled={resendPending} type="submit" variant="secondary">
                              Resend invite
                            </Button>
                          </form>
                          <form action={deactivateAction}>
                            <input name="userId" type="hidden" value={member.id} />
                            <Button disabled={deactivatePending} type="submit" variant="secondary">
                              Deactivate
                            </Button>
                          </form>
                        </div>
                      ) : null}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell className="py-8 text-center text-slate-400" colSpan={canManage ? 6 : 5}>
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
