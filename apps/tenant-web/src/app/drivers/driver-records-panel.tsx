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
              href={"/subscription" as never}
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

function getVerificationComponentLabel(
  driver: DriverRecord,
  key: 'identity' | 'guarantor' | 'drivers_license',
): { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' } {
  const component = driver.verificationComponents?.find((item) => item.key === key);
  const baseLabel =
    key === 'identity' ? 'Identity' : key === 'guarantor' ? 'Guarantor' : 'Licence';

  if (component) {
    if (!component.required || component.status === 'not_required') {
      return { label: `${baseLabel}: Not required`, tone: 'neutral' };
    }
    if (component.status === 'completed') {
      return { label: `${baseLabel}: Complete`, tone: 'success' };
    }
    return { label: `${baseLabel}: Needed`, tone: 'warning' };
  }

  if (key === 'identity') {
    return driver.identityStatus === 'verified'
      ? { label: 'Identity: Complete', tone: 'success' }
      : { label: 'Identity: Needed', tone: 'warning' };
  }

  if (key === 'guarantor') {
    if (!driver.hasGuarantor && !driver.guarantorStatus) {
      return { label: 'Guarantor: Not required', tone: 'neutral' };
    }

    if (driver.guarantorStatus === 'active') {
      return { label: 'Guarantor: Complete', tone: 'success' };
    }

    if (driver.guarantorStatus === 'disconnected') {
      return { label: 'Guarantor: Reconnect', tone: 'warning' };
    }

    return { label: 'Guarantor: Needed', tone: 'warning' };
  }

  return driver.hasApprovedLicence
    ? { label: 'Licence: Complete', tone: 'success' }
    : { label: 'Licence: Not required', tone: 'neutral' };
}

function getRiskBadge(driver: DriverRecord): {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  hint?: string;
} {
  if (driver.riskBand) {
    if (driver.riskBand === 'critical') {
      return { label: 'High risk', tone: 'danger', hint: 'Requires immediate review' };
    }
    if (
      driver.riskBand === 'high' ||
      driver.riskBand === 'medium' ||
      driver.isWatchlisted
    ) {
      const riskResult: {
        label: string;
        tone: 'warning';
        hint?: string;
      } = {
        label: driver.riskBand === 'high' ? 'High risk' : 'Medium risk',
        tone: 'warning',
      };
      if (driver.isWatchlisted) {
        riskResult.hint = 'Watchlist match found';
      }
      return riskResult;
    }
    return { label: 'Low risk', tone: 'success' };
  }

  if (driver.hasResolvedIdentity) {
    return { label: 'No signal', tone: 'neutral' };
  }

  return { label: 'Unverified', tone: 'neutral' };
}

function getStatusSummary(driver: DriverRecord): Array<{
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}> {
  return [
    {
      label:
        driver.locked
          ? 'Locked'
          : driver.status === 'active'
            ? 'Active'
            : driver.status === 'inactive'
              ? 'Inactive'
              : driver.status === 'suspended'
                ? 'Suspended'
                : 'Terminated',
      tone: driver.locked ? 'neutral' : getStatusTone(driver.status),
    },
    {
      label: getReadinessLabel(driver.activationReadiness),
      tone: getReadinessTone(driver.activationReadiness),
    },
  ];
}

function needsVerificationAttention(driver: DriverRecord): boolean {
  return (
    driver.verificationComponents?.some(
      (component) => component.required && component.status !== 'completed',
    ) ??
    driver.identityStatus !== 'verified'
  );
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
  showDocuments,
  tenantVerificationTierLabel,
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
  showDocuments: boolean;
  tenantVerificationTierLabel: string;
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
    () => drivers.filter((driver) => driver.status === 'active' && driver.activationReadiness === 'ready').length,
    [drivers],
  );
  const unverifiedDrivers = useMemo(
    () => drivers.filter((driver) => needsVerificationAttention(driver)).length,
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
        description={`See who can operate now, who still needs ${tenantVerificationTierLabel}, and where operator follow-up is required.`}
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
                <Text tone="muted">Ready to operate</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {verifiedActiveDrivers}
                </p>
                <Text tone="muted">On this page</Text>
              </div>
            </div>
            <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-violet-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
              <div className="h-0.5 bg-violet-400" />
              <div className="space-y-1 px-5 py-4">
                <Text tone="muted">Need verification</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {unverifiedDrivers}
                </p>
                <Text tone="muted">{tenantVerificationTierLabel}</Text>
              </div>
            </div>
            <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-sky-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
              <div className="h-0.5 bg-sky-400" />
              <div className="space-y-1 px-5 py-4">
                <Text tone="muted">Guarantor complete</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {
                    drivers.filter((driver) =>
                      getVerificationComponentLabel(driver, 'guarantor').tone === 'success',
                    ).length
                  }
                </p>
                <Text tone="muted">Required drivers only</Text>
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
            <Text tone="muted">Search</Text>
            <Input
                name="q"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, phone, email, or fleet"
                value={searchQuery}
              />
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SearchableSelect
                helperText="Show one fleet at a time."
                inputId="driverFleetFilter"
                label="Fleet"
                name="fleetId"
                onChange={setFleetId}
                options={fleetOptions}
                placeholder="All fleets"
                value={fleetId}
              />
              <SearchableSelect
                helperText="Show one driver status."
                inputId="driverStatusFilter"
                label="Status"
                name="status"
                onChange={setStatus}
                options={STATUS_OPTIONS}
                placeholder="All statuses"
                value={status}
              />
              <SearchableSelect
                helperText="Show one identity state."
                inputId="driverIdentityFilter"
                label="Identity"
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
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verification</TableHead>
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
                  <div className="space-y-1">
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
                    <p className="text-xs text-slate-500">
                      {fleetLabels.get(driver.fleetId) ?? driver.fleetId}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {driver.locked ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {getStatusSummary(driver).map((item) => (
                          <Badge key={item.label} tone={item.tone}>
                            {item.label}
                          </Badge>
                        ))}
                      </div>
                      {driver.activationReadinessReasons[0] ? (
                        <p className="text-xs text-slate-500">{driver.activationReadinessReasons[0]}</p>
                      ) : null}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {driver.locked ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(['identity', 'guarantor', 'drivers_license'] as const).map((key) => {
                        const component = getVerificationComponentLabel(driver, key);
                        return (
                          <Badge key={component.label} tone={component.tone}>
                            {component.label}
                          </Badge>
                        );
                      })}
                      {driver.identityReviewCaseId ? (
                        <Link
                          className="inline-flex items-center text-xs font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/drivers/${driver.id}/review`}
                        >
                          Review open
                        </Link>
                      ) : null}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {driver.locked ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <div className="space-y-1">
                      <Badge tone={getRiskBadge(driver).tone}>{getRiskBadge(driver).label}</Badge>
                      {getRiskBadge(driver).hint ? (
                        <p className="text-xs text-slate-500">{getRiskBadge(driver).hint}</p>
                      ) : null}
                    </div>
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
                      {needsVerificationAttention(driver) ? (
                        <Link
                          className="text-xs font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/drivers/${driver.id}?tab=verification`}
                        >
                          Request verification
                        </Link>
                      ) : null}
                      {showDocuments ? (
                        <Link
                          className="text-xs font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/drivers/${driver.id}?tab=documents`}
                        >
                          Documents
                        </Link>
                      ) : null}
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
