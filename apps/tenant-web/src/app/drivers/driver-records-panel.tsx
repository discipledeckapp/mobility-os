'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Input,
  RegistryTable,
  SearchableSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  type SearchableSelectOption,
} from '@mobility-os/ui';
import type { DriverRecord, FleetRecord } from '../../lib/api-core';
import {
  getDriverIdentityLabel,
  getDriverIdentityTone,
} from '../../lib/driver-identity';
import { DriverStatusActions } from './driver-status-actions';

function LockIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
      <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LockedDriverModal({ driver, onClose }: { driver: DriverRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white shadow-[0_32px_80px_-28px_rgba(15,23,42,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-4 px-8 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 ring-4 ring-amber-100">
            <svg aria-hidden="true" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
              <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-[var(--mobiris-ink)]">
              Driver record locked
            </h2>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-[var(--mobiris-ink)]">{driver.firstName} {driver.lastName}</span>{' '}
              exists in your roster but is beyond your current plan's driver limit. Upgrade your plan to unlock access to this driver and their full activity.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] hover:bg-[var(--mobiris-primary-dark)]"
              href={"/billing" as never}
              onClick={onClose}
            >
              Upgrade plan
            </Link>
            <button
              className="h-10 rounded-[var(--mobiris-radius-button)] text-sm font-medium text-slate-500 hover:text-slate-800"
              onClick={onClose}
              type="button"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_OPTIONS: SearchableSelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'terminated', label: 'Terminated' },
];

const IDENTITY_OPTIONS: SearchableSelectOption[] = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending_verification', label: 'Pending verification' },
  { value: 'verified', label: 'Verified' },
  { value: 'review_needed', label: 'Review needed' },
  { value: 'failed', label: 'Failed' },
];

function toFleetOptions(fleets: FleetRecord[]): SearchableSelectOption[] {
  return [...fleets]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((fleet) => ({ value: fleet.id, label: fleet.name }));
}

function getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'warning';
  if (status === 'terminated') return 'danger';
  return 'neutral';
}

function getGuarantorTone(status: string | null | undefined): 'success' | 'warning' | 'danger' {
  if (status === 'active') return 'success';
  if (status === 'disconnected') return 'warning';
  return 'danger';
}

function getMobileAccessTone(
  status: string | null | undefined,
): 'success' | 'warning' | 'danger' {
  if (status === 'linked') return 'success';
  if (status === 'inactive') return 'warning';
  return 'danger';
}

function getReadinessTone(
  status: string,
): 'success' | 'warning' | 'danger' {
  if (status === 'ready') return 'success';
  if (status === 'partially_ready') return 'warning';
  return 'danger';
}

function getReadinessLabel(status: string): string {
  if (status === 'ready') return 'Ready';
  if (status === 'partially_ready') return 'Partially ready';
  return 'Not ready';
}

function getDriverDisplayName(driver: DriverRecord): string {
  const fullName = `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim();
  if (fullName) {
    return fullName;
  }
  return driver.identityStatus === 'unverified' ? 'Onboarding in progress' : 'New Driver';
}

export function DriverRecordsPanel({
  drivers,
  fleets,
  errorMessage,
  filteredDrivers,
  initialFleetId,
  initialIdentityStatus,
  initialPage,
  initialPageSize,
  initialSearchQuery,
  initialStatus,
  totalDrivers,
}: {
  drivers: DriverRecord[];
  fleets: FleetRecord[];
  errorMessage?: string | null;
  filteredDrivers: number;
  initialFleetId: string;
  initialIdentityStatus: string;
  initialPage: number;
  initialPageSize: number;
  initialSearchQuery: string;
  initialStatus: string;
  totalDrivers: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [fleetId, setFleetId] = useState(initialFleetId);
  const [status, setStatus] = useState(initialStatus);
  const [identityStatus, setIdentityStatus] = useState(initialIdentityStatus);
  const [selectedLockedDriver, setSelectedLockedDriver] = useState<DriverRecord | null>(null);
  const page = initialPage;
  const pageSize = initialPageSize;

  const fleetLabels = useMemo(
    () => new Map(fleets.map((fleet) => [fleet.id, fleet.name])),
    [fleets],
  );
  const fleetOptions = useMemo(() => toFleetOptions(fleets), [fleets]);
  const verifiedActiveDrivers = useMemo(
    () =>
      drivers.filter((driver) => driver.status === 'active' && driver.identityStatus === 'verified')
        .length,
    [drivers],
  );
  const unverifiedDrivers = useMemo(
    () => drivers.filter((driver) => driver.identityStatus !== 'verified').length,
    [drivers],
  );

  const updateSearch = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    for (const [key, value] of Object.entries(updates)) {
      const normalized = typeof value === 'number' ? String(value) : value;
      if (!normalized) {
        params.delete(key);
      } else {
        params.set(key, normalized);
      }
    }

    const query = params.toString();
    router.replace((query ? `${pathname}?${query}` : pathname) as Route);
  };

  return (
    <div className="space-y-6">
      <RegistryTable
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
              href="/drivers/new"
            >
              Add driver
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4.5 text-sm font-semibold tracking-[-0.01em] text-[var(--mobiris-primary-dark)] transition-all duration-150 hover:bg-slate-50"
              href="/drivers#bulk-import"
            >
              Add in bulk
            </Link>
          </div>
        }
        description="Search, filter, and open driver records by name, phone, fleet, or identity status."
        emptyState={
          <div className="space-y-3">
            <Text tone="muted">
              {filteredDrivers === 0
                ? 'No drivers have been added for this organisation yet.'
                : 'No drivers match the current search or filters.'}
            </Text>
            {totalDrivers === 0 ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
                href="/drivers/new"
              >
                Add the first driver
              </Link>
            ) : null}
          </div>
        }
        errorMessage={errorMessage}
        filteredItems={filteredDrivers}
        onPageChange={(nextPage) => updateSearch({ page: nextPage })}
        onPageSizeChange={(nextPageSize) => updateSearch({ pageSize: nextPageSize, page: 1 })}
        page={page}
        pageSize={pageSize}
        summary={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
              <div className="h-0.5 bg-[var(--mobiris-primary)]" />
              <div className="space-y-1 px-5 py-4">
                <Text tone="muted">Total drivers</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {totalDrivers}
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-emerald-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
              <div className="h-0.5 bg-emerald-400" />
              <div className="space-y-1 px-5 py-4">
                <Text tone="muted">Verified active drivers</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {verifiedActiveDrivers}
                </p>
                <Text tone="muted">On this page</Text>
              </div>
            </div>
            <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-violet-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
              <div className="h-0.5 bg-violet-400" />
              <div className="space-y-1 px-5 py-4">
                <Text tone="muted">Unverified drivers</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {unverifiedDrivers}
                </p>
                <Text tone="muted">Onboarding pool</Text>
              </div>
            </div>
            <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-sky-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
              <div className="h-0.5 bg-sky-400" />
              <div className="space-y-1 px-5 py-4">
                <Text tone="muted">Guarantors linked</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {drivers.filter((driver) => driver.guarantorStatus === 'active').length}
                </p>
                <Text tone="muted">On this page</Text>
              </div>
            </div>
            <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
              <div className="h-0.5 bg-slate-300" />
              <div className="space-y-1 px-5 py-4">
                <Text tone="muted">Showing</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {drivers.length}
                </p>
                <Text tone="muted">Current page rows</Text>
              </div>
            </div>
          </div>
        }
        title="Driver registry"
        toolbar={
          <form action={pathname ?? '/drivers'} className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="min-w-0 flex-[1.5] space-y-2">
              <Text tone="muted">Search drivers</Text>
              <Input
                name="q"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, phone, email, or fleet"
                value={searchQuery}
              />
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SearchableSelect
                helperText="Filter the registry to a single fleet."
                inputId="driverFleetFilter"
                label="Fleet filter"
                name="fleetId"
                onChange={setFleetId}
                options={fleetOptions}
                placeholder="All fleets"
                value={fleetId}
              />
              <SearchableSelect
                helperText="Filter by driver lifecycle status."
                inputId="driverStatusFilter"
                label="Status filter"
                name="status"
                onChange={setStatus}
                options={STATUS_OPTIONS}
                placeholder="All statuses"
                value={status}
              />
              <SearchableSelect
                helperText="Filter by identity workflow state."
                inputId="driverIdentityFilter"
                label="Identity filter"
                name="identityStatus"
                onChange={setIdentityStatus}
                options={IDENTITY_OPTIONS}
                placeholder="All identity states"
                value={identityStatus}
              />
            </div>
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={pageSize} />
            <div className="flex items-end gap-3">
              <Button type="submit">Apply filters</Button>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setFleetId('');
                  setStatus('');
                  setIdentityStatus('');
                  router.replace(pathname as Route);
                }}
                type="button"
                variant="secondary"
              >
                Clear filters
              </Button>
            </div>
          </form>
        }
        totalItems={totalDrivers}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Fleet</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Identity</TableHead>
              <TableHead>Guarantor</TableHead>
              <TableHead>Mobile access</TableHead>
              <TableHead>Readiness</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow
                className={`group cursor-pointer hover:bg-slate-50/80${driver.locked ? ' opacity-60 bg-slate-50/50' : ''}`}
                key={driver.id}
              >
                <TableCell>
                  <div className="space-y-0.5">
                    {driver.locked ? (
                      <button
                        className="flex items-center gap-1.5 font-semibold text-slate-400 hover:text-slate-600"
                        onClick={() => setSelectedLockedDriver(driver)}
                        type="button"
                      >
                        <LockIcon />
                        {getDriverDisplayName(driver)}
                      </button>
                    ) : (
                      <Link
                        className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                        href={`/drivers/${driver.id}`}
                      >
                        {getDriverDisplayName(driver)}
                      </Link>
                    )}
                    <p className="text-xs text-slate-400">{driver.email ?? driver.phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className={`text-sm ${driver.locked ? 'text-slate-400' : 'text-[var(--mobiris-ink)]'}`}>{driver.phone}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-slate-600">{fleetLabels.get(driver.fleetId) ?? driver.fleetId}</p>
                </TableCell>
                <TableCell>
                  {driver.locked ? (
                    <Badge tone="neutral">locked</Badge>
                  ) : (
                    <Badge tone={getStatusTone(driver.status)}>{driver.status}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {driver.locked ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <div className="space-y-1.5">
                      <Badge tone={getDriverIdentityTone(driver.identityStatus)}>
                        {getDriverIdentityLabel(driver.identityStatus)}
                      </Badge>
                      {driver.identityReviewCaseId ? (
                        <Link
                          className="block text-xs font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/drivers/${driver.id}/review`}
                        >
                          Review open →
                        </Link>
                      ) : null}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {driver.locked ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <Badge tone={getGuarantorTone(driver.guarantorStatus)}>
                      {driver.guarantorStatus === 'active'
                        ? 'Linked'
                        : driver.guarantorStatus === 'disconnected'
                          ? 'Disconnected'
                          : 'Missing'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {driver.locked ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <Badge tone={getMobileAccessTone(driver.mobileAccessStatus)}>
                      {driver.mobileAccessStatus === 'linked'
                        ? 'Linked'
                        : driver.mobileAccessStatus === 'inactive'
                          ? 'Inactive account'
                          : 'Missing'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {driver.locked ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <div className="space-y-1.5">
                      <Badge tone={getReadinessTone(driver.activationReadiness)}>
                        {getReadinessLabel(driver.activationReadiness)}
                      </Badge>
                      {driver.activationReadinessReasons[0] ? (
                        <p className="text-xs text-slate-500">{driver.activationReadinessReasons[0]}</p>
                      ) : null}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {driver.locked ? (
                    <span className="text-slate-300">—</span>
                  ) : driver.riskBand ? (
                    <Badge
                      tone={
                        driver.riskBand === 'critical'
                          ? 'danger'
                          : driver.riskBand === 'high' ||
                              driver.riskBand === 'medium' ||
                              driver.isWatchlisted
                            ? 'warning'
                            : 'success'
                      }
                    >
                      {driver.isWatchlisted ? `${driver.riskBand} · watchlist` : driver.riskBand}
                    </Badge>
                  ) : driver.hasResolvedIdentity ? (
                    <Badge tone="neutral">no signal</Badge>
                  ) : (
                    <Badge tone="neutral">unverified</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {driver.locked ? (
                    <button
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                      onClick={() => setSelectedLockedDriver(driver)}
                      type="button"
                    >
                      Upgrade to unlock
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="text-xs font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                        href={`/drivers/${driver.id}?tab=verification`}
                      >
                        Request verification
                      </Link>
                      <Link
                        className="text-xs font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                        href={`/drivers/${driver.id}?tab=documents`}
                      >
                        Documents
                      </Link>
                      <DriverStatusActions driver={driver} />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegistryTable>
      {selectedLockedDriver ? (
        <LockedDriverModal
          driver={selectedLockedDriver}
          onClose={() => setSelectedLockedDriver(null)}
        />
      ) : null}
    </div>
  );
}
