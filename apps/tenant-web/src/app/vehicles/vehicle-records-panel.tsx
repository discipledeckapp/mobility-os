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
}: {
  vehicles: VehicleRecord[];
  fleets: FleetRecord[];
  errorMessage?: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fleetId, setFleetId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      <RegistryTable
        actions={
          <Link
            className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
            href="/vehicles/new"
          >
            Add vehicle
          </Link>
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
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="space-y-1">
                    <Link
                      className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                      href={`/vehicles/${vehicle.id}`}
                    >
                      {getVehiclePrimaryLabel(vehicle)}
                    </Link>
                    <Text tone="muted">{vehicle.systemVehicleCode}</Text>
                  </div>
                </TableCell>
                <TableCell>{getVehicleSecondaryLabel(vehicle, { includePlate: false })}</TableCell>
                <TableCell>{fleetLabels.get(vehicle.fleetId) ?? vehicle.fleetId}</TableCell>
                <TableCell>{vehicle.vehicleType}</TableCell>
                <TableCell>{vehicle.plate ?? 'Not recorded'}</TableCell>
                <TableCell>
                  <Badge tone={getStatusTone(vehicle.status)}>{vehicle.status}</Badge>
                </TableCell>
                <TableCell className="align-top">
                  <VehicleStatusActions vehicle={vehicle} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegistryTable>
    </div>
  );
}
