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
import type { StaffMemberRecord } from '../../lib/api-control-plane';
import {
  type StaffActionState,
  createStaffMemberAction,
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

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" x2="23" y1="1" y2="23" />
    </svg>
  );
}

const initialState: StaffActionState = {};

export function StaffPanel({ members }: { members: StaffMemberRecord[] }) {
  const [createState, createAction, createPending] = useActionState(
    createStaffMemberAction,
    initialState,
  );
  const [deactivateState, deactivateAction, deactivatePending] = useActionState(
    deactivateStaffMemberAction,
    initialState,
  );
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Platform staff</CardTitle>
              <CardDescription>
                Control-plane staff accounts. Only PLATFORM_ADMIN can create new staff.
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm((v) => !v)} type="button" variant="secondary">
              {showForm ? 'Cancel' : '+ Add staff'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showForm && (
            <form
              action={createAction}
              className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-700">Create new platform staff</p>
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <select
                    className="flex h-10 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
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
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="staffPassword">Initial password</Label>
                  <div className="relative">
                    <Input
                      className="pr-10"
                      id="staffPassword"
                      minLength={8}
                      name="password"
                      placeholder="Minimum 8 characters"
                      required
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword((v) => !v)}
                      type="button"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              </div>
              {createState.error ? <Text className="text-rose-700">{createState.error}</Text> : null}
              {createState.success ? (
                <Text className="text-emerald-700">{createState.success}</Text>
              ) : null}
              <Button disabled={createPending} type="submit">
                {createPending ? 'Creating…' : 'Create staff member'}
              </Button>
            </form>
          )}

          {deactivateState.error ? (
            <Text className="text-rose-700">{deactivateState.error}</Text>
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
                        <Badge tone="danger">Inactive</Badge>
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
