'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  RegistryTable,
  SearchableSelect,
  type SearchableSelectOption,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@mobility-os/ui';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { FleetRecord, VehicleRecord } from '../../lib/api-core';
import { getVehiclePrimaryLabel, getVehicleSecondaryLabel } from '../../lib/vehicle-display';
import { VehicleStatusActions } from './vehicle-status-actions';
import { CsvBulkImportCard } from '../../components/csv-bulk-import-card';

type CsvActionState = { error?: string; success?: string };

function LockIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
      <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LockedVehicleModal({ vehicle, onClose }: { vehicle: VehicleRecord; onClose: () => void }) {
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
              Vehicle record locked
            </h2>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-[var(--mobiris-ink)]">{vehicle.tenantVehicleCode ?? vehicle.systemVehicleCode}</span>{' '}
              exists in your fleet but is beyond your current plan's vehicle limit. Upgrade your plan to unlock access to this vehicle and its full history.
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
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
];

function toFleetOptions(fleets: FleetRecord[]): SearchableSelectOption[] {
  return [...fleets]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((fleet) => ({ value: fleet.id, label: fleet.name }));
}

function getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'available') {
    return 'success';
  }

  if (status === 'maintenance') {
    return 'warning';
  }

  if (status === 'retired') {
    return 'danger';
  }

  return 'neutral';
}

export function VehicleRecordsPanel({
  vehicles,
  fleets,
  errorMessage,
  importAction,
  templateHref,
  exportHref,
}: {
  vehicles: VehicleRecord[];
  fleets: FleetRecord[];
  errorMessage?: string | null;
  importAction?: (state: CsvActionState, formData: FormData) => Promise<CsvActionState>;
  templateHref?: string;
  exportHref?: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fleetId, setFleetId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showImport, setShowImport] = useState(false);
  const [selectedLockedVehicle, setSelectedLockedVehicle] = useState<VehicleRecord | null>(null);

  const fleetLabels = useMemo(
    () => new Map(fleets.map((fleet) => [fleet.id, fleet.name])),
    [fleets],
  );
  const fleetOptions = useMemo(() => toFleetOptions(fleets), [fleets]);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      if (fleetId && vehicle.fleetId !== fleetId) {
        return false;
      }

      if (status && vehicle.status !== status) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        vehicle.tenantVehicleCode,
        vehicle.systemVehicleCode,
        vehicle.plate,
        vehicle.make,
        vehicle.model,
        vehicle.trim,
        vehicle.vehicleType,
        fleetLabels.get(vehicle.fleetId),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [fleetId, fleetLabels, searchQuery, status, vehicles]);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredVehicles.slice(startIndex, startIndex + pageSize);
  }, [filteredVehicles, page, pageSize]);

  const activeVehicleCount = vehicles.filter(
    (vehicle) => vehicle.status === 'available' || vehicle.status === 'assigned',
  ).length;

  return (
    <div className="space-y-6">
      {showImport && importAction && templateHref ? (
        <CsvBulkImportCard
          description="Download the vehicle template, map your existing fleet inventory into it, and import vehicles in bulk. Subscription limits are enforced during import."
          {...(exportHref ? { exportHref } : {})}
          formAction={importAction}
          templateHref={templateHref}
          title="Bulk import vehicles"
        />
      ) : null}
      <RegistryTable
        actions={
          <div className="flex items-center gap-2">
            {importAction ? (
              <button
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-ink)] transition-colors hover:bg-slate-50"
                onClick={() => setShowImport((v) => !v)}
                type="button"
              >
                {showImport ? 'Hide import' : 'Bulk import'}
              </button>
            ) : null}
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
              href="/vehicles/new"
            >
              Add vehicle
            </Link>
          </div>
        }
        description="Search, filter, and drill into vehicle records by organisation code, system code, plate, fleet, or vehicle profile."
        emptyState={
          <div className="space-y-3">
            <Text tone="muted">
              {vehicles.length === 0
                ? 'No vehicles have been added for this organisation yet.'
                : 'No vehicles match the current search or filters.'}
            </Text>
            {vehicles.length === 0 ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
                href="/vehicles/new"
              >
                Add the first vehicle
              </Link>
            ) : null}
          </div>
        }
        errorMessage={errorMessage}
        filteredItems={filteredVehicles.length}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        page={page}
        pageSize={pageSize}
        summary={
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="space-y-1 py-5">
                <Text tone="muted">Total vehicles</Text>
                <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                  {vehicles.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 py-5">
                <Text tone="muted">Available or assigned</Text>
                <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                  {activeVehicleCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 py-5">
                <Text tone="muted">Matching current filters</Text>
                <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                  {filteredVehicles.length}
                </p>
              </CardContent>
            </Card>
          </div>
        }
        title="Vehicle registry"
        toolbar={
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="min-w-0 flex-[1.5] space-y-2">
              <Text tone="muted">Search vehicles</Text>
              <Input
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by code, plate, make, model, or fleet"
                value={searchQuery}
              />
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <SearchableSelect
                helperText="Filter the registry to a single fleet."
                inputId="fleetFilter"
                label="Fleet filter"
                onChange={(nextFleetId) => {
                  setFleetId(nextFleetId);
                  setPage(1);
                }}
                options={fleetOptions}
                placeholder="All fleets"
                value={fleetId}
              />
              <SearchableSelect
                helperText="Filter by operational status."
                inputId="statusFilter"
                label="Status filter"
                onChange={(nextStatus) => {
                  setStatus(nextStatus);
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
                placeholder="All statuses"
                value={status}
              />
            </div>
            <div className="flex items-end">
              <Button
                disabled={!searchQuery && !fleetId && !status}
                onClick={() => {
                  setSearchQuery('');
                  setFleetId('');
                  setStatus('');
                  setPage(1);
                }}
                variant="ghost"
              >
                Clear filters
              </Button>
            </div>
          </div>
        }
        totalItems={vehicles.length}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Fleet</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVehicles.map((vehicle) => (
              <TableRow
                className={vehicle.locked ? 'opacity-60 bg-slate-50/50' : undefined}
                key={vehicle.id}
              >
                <TableCell>
                  <div className="space-y-1">
                    {vehicle.locked ? (
                      <button
                        className="flex items-center gap-1.5 font-semibold text-slate-400 hover:text-slate-600"
                        onClick={() => setSelectedLockedVehicle(vehicle)}
                        type="button"
                      >
                        <LockIcon />
                        {getVehiclePrimaryLabel(vehicle)}
                      </button>
                    ) : (
                      <Link
                        className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                        href={`/vehicles/${vehicle.id}`}
                      >
                        {getVehiclePrimaryLabel(vehicle)}
                      </Link>
                    )}
                    <Text tone="muted">{vehicle.systemVehicleCode}</Text>
                  </div>
                </TableCell>
                <TableCell>{getVehicleSecondaryLabel(vehicle, { includePlate: false })}</TableCell>
                <TableCell>{fleetLabels.get(vehicle.fleetId) ?? vehicle.fleetId}</TableCell>
                <TableCell>{vehicle.vehicleType}</TableCell>
                <TableCell>{vehicle.plate ?? 'Not recorded'}</TableCell>
                <TableCell>
                  {vehicle.locked ? (
                    <Badge tone="neutral">locked</Badge>
                  ) : (
                    <Badge tone={getStatusTone(vehicle.status)}>{vehicle.status}</Badge>
                  )}
                </TableCell>
                <TableCell className="align-top">
                  {vehicle.locked ? (
                    <button
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                      onClick={() => setSelectedLockedVehicle(vehicle)}
                      type="button"
                    >
                      Upgrade to unlock
                    </button>
                  ) : (
                    <VehicleStatusActions vehicle={vehicle} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegistryTable>
      {selectedLockedVehicle ? (
        <LockedVehicleModal
          onClose={() => setSelectedLockedVehicle(null)}
          vehicle={selectedLockedVehicle}
        />
      ) : null}
    </div>
  );
}
