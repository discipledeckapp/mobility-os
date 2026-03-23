'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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

export function DriverRecordsPanel({
  drivers,
  fleets,
  errorMessage,
  totalDrivers,
}: {
  drivers: DriverRecord[];
  fleets: FleetRecord[];
  errorMessage?: string | null;
  totalDrivers: number;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fleetId, setFleetId] = useState('');
  const [status, setStatus] = useState('');
  const [identityStatus, setIdentityStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fleetLabels = useMemo(
    () => new Map(fleets.map((fleet) => [fleet.id, fleet.name])),
    [fleets],
  );
  const fleetOptions = useMemo(() => toFleetOptions(fleets), [fleets]);

  const filteredDrivers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return drivers.filter((driver) => {
      if (fleetId && driver.fleetId !== fleetId) return false;
      if (status && driver.status !== status) return false;
      if (identityStatus && driver.identityStatus !== identityStatus) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        `${driver.firstName} ${driver.lastName}`,
        driver.phone,
        driver.email,
        driver.nationality,
        driver.identityReviewCaseId,
        driver.mobileAccessStatus,
        fleetLabels.get(driver.fleetId),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [drivers, fleetId, fleetLabels, identityStatus, searchQuery, status]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, fleetId, status, identityStatus]);

  const paginatedDrivers = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredDrivers.slice(startIndex, startIndex + pageSize);
  }, [filteredDrivers, page, pageSize]);

  return (
    <div className="space-y-6">
      <RegistryTable
        actions={
          <Link
            className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
            href="/drivers/new"
          >
            Add driver
          </Link>
        }
        description="Search, filter, and open driver records by name, phone, fleet, or identity status."
        emptyState={
          <div className="space-y-3">
            <Text tone="muted">
              {drivers.length === 0
                ? 'No drivers have been added for this organisation yet.'
                : 'No drivers match the current search or filters.'}
            </Text>
            {drivers.length === 0 ? (
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
        filteredItems={filteredDrivers.length}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
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
                <Text tone="muted">Verified</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {drivers.filter((driver) => driver.identityStatus === 'verified').length}
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-violet-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
              <div className="h-0.5 bg-violet-400" />
              <div className="space-y-1 px-5 py-4">
                <Text tone="muted">Guarantors linked</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {drivers.filter((driver) => driver.guarantorStatus === 'active').length}
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-sky-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
              <div className="h-0.5 bg-sky-400" />
              <div className="space-y-1 px-5 py-4">
                <Text tone="muted">Mobile access linked</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {drivers.filter((driver) => driver.mobileAccessStatus === 'linked').length}
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
              <div className="h-0.5 bg-slate-300" />
              <div className="space-y-1 px-5 py-4">
                <Text tone="muted">Showing</Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {filteredDrivers.length}
                </p>
              </div>
            </div>
          </div>
        }
        title="Driver registry"
        toolbar={
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="min-w-0 flex-[1.5] space-y-2">
              <Text tone="muted">Search drivers</Text>
              <Input
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
                onChange={setFleetId}
                options={fleetOptions}
                placeholder="All fleets"
                value={fleetId}
              />
              <SearchableSelect
                helperText="Filter by driver lifecycle status."
                inputId="driverStatusFilter"
                label="Status filter"
                onChange={setStatus}
                options={STATUS_OPTIONS}
                placeholder="All statuses"
                value={status}
              />
              <SearchableSelect
                helperText="Filter by identity workflow state."
                inputId="driverIdentityFilter"
                label="Identity filter"
                onChange={setIdentityStatus}
                options={IDENTITY_OPTIONS}
                placeholder="All identity states"
                value={identityStatus}
              />
            </div>
            <div className="flex items-end">
              <Button
                disabled={!searchQuery && !fleetId && !status && !identityStatus}
                onClick={() => {
                  setSearchQuery('');
                  setFleetId('');
                  setStatus('');
                  setIdentityStatus('');
                }}
                variant="ghost"
              >
                Clear filters
              </Button>
            </div>
          </div>
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
            {paginatedDrivers.map((driver) => (
              <TableRow className="group cursor-pointer hover:bg-slate-50/80" key={driver.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <Link
                      className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                      href={`/drivers/${driver.id}`}
                    >
                      {`${driver.firstName} ${driver.lastName}`}
                    </Link>
                    <p className="text-xs text-slate-400">{driver.email ?? driver.phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-[var(--mobiris-ink)]">{driver.phone}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-slate-600">{fleetLabels.get(driver.fleetId) ?? driver.fleetId}</p>
                </TableCell>
                <TableCell>
                  <Badge tone={getStatusTone(driver.status)}>{driver.status}</Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <Badge tone={getGuarantorTone(driver.guarantorStatus)}>
                    {driver.guarantorStatus === 'active'
                      ? 'Linked'
                      : driver.guarantorStatus === 'disconnected'
                        ? 'Disconnected'
                        : 'Missing'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge tone={getMobileAccessTone(driver.mobileAccessStatus)}>
                    {driver.mobileAccessStatus === 'linked'
                      ? 'Linked'
                      : driver.mobileAccessStatus === 'inactive'
                        ? 'Inactive account'
                        : 'Missing'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <Badge tone={getReadinessTone(driver.activationReadiness)}>
                      {getReadinessLabel(driver.activationReadiness)}
                    </Badge>
                    {driver.activationReadinessReasons[0] ? (
                      <p className="text-xs text-slate-500">{driver.activationReadinessReasons[0]}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  {driver.riskBand ? (
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
                    <span className="text-slate-300">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DriverStatusActions driver={driver} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegistryTable>
    </div>
  );
}
