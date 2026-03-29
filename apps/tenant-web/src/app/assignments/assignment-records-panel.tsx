'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
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
import type {
  AssignmentRecord,
  DriverRecord,
  FleetRecord,
  VehicleRecord,
} from '../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../lib/vehicle-display';
import { AssignmentRowActions } from './assignment-row-actions';

const STATUS_OPTIONS: SearchableSelectOption[] = [
  { value: 'created', label: 'Created' },
  { value: 'pending_driver_confirmation', label: 'Pending driver confirmation' },
  { value: 'active', label: 'Active' },
  { value: 'declined', label: 'Declined' },
  { value: 'ended', label: 'Ended' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatPaymentModel(value?: string | null): string {
  if (!value) return 'Remittance';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function toFleetOptions(fleets: FleetRecord[]): SearchableSelectOption[] {
  return [...fleets]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((fleet) => ({ value: fleet.id, label: fleet.name }));
}

function getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'pending_driver_confirmation' || status === 'created') return 'warning';
  if (status === 'cancelled' || status === 'declined') return 'danger';
  return 'neutral';
}

function formatDateTime(value?: string | null): string {
  if (!value) return 'Not started';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function AssignmentRecordsPanel({
  assignments,
  drivers,
  vehicles,
  fleets,
}: {
  assignments: AssignmentRecord[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  fleets: FleetRecord[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fleetId, setFleetId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const driverLabels = useMemo(
    () =>
      new Map(
        drivers.map((driver) => [driver.id, `${driver.firstName} ${driver.lastName}`]),
      ),
    [drivers],
  );
  const vehicleLabels = useMemo(
    () =>
      new Map(vehicles.map((vehicle) => [vehicle.id, getVehiclePrimaryLabel(vehicle)])),
    [vehicles],
  );
  const fleetLabels = useMemo(
    () => new Map(fleets.map((fleet) => [fleet.id, fleet.name])),
    [fleets],
  );
  const fleetOptions = useMemo(() => toFleetOptions(fleets), [fleets]);

  const filteredAssignments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return assignments.filter((assignment) => {
      if (fleetId && assignment.fleetId !== fleetId) return false;
      if (status && assignment.status !== status) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        assignment.id,
        driverLabels.get(assignment.driverId),
        vehicleLabels.get(assignment.vehicleId),
        fleetLabels.get(assignment.fleetId),
        assignment.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [assignments, driverLabels, fleetId, fleetLabels, searchQuery, status, vehicleLabels]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, fleetId, status]);

  const paginatedAssignments = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredAssignments.slice(startIndex, startIndex + pageSize);
  }, [filteredAssignments, page, pageSize]);

  return (
    <RegistryTable
      actions={
        <Link
          className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
          href="/assignments/new"
        >
          Create assignment
        </Link>
      }
      description="Search, filter, and open assignment records by driver, vehicle, fleet, or lifecycle state."
      emptyState={
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <>
              <Text tone="muted">
                No assignments have been created yet. Start with a single assignment or import a prepared list.
              </Text>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
                  href="/assignments/new"
                >
                  Create the first assignment
                </Link>
                <a
                  className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4.5 text-sm font-semibold tracking-[-0.01em] text-[var(--mobiris-primary-dark)]"
                  href="#bulk-import"
                >
                  Import assignments in bulk
                </a>
              </div>
            </>
          ) : (
            <Text tone="muted">No assignments match the current search or filters.</Text>
          )}
        </div>
      }
      filteredItems={filteredAssignments.length}
      onPageChange={setPage}
      onPageSizeChange={(nextPageSize) => {
        setPageSize(nextPageSize);
        setPage(1);
      }}
      page={page}
      pageSize={pageSize}
      summary={
        assignments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="space-y-1 py-5">
                <Text tone="muted">Total assignments</Text>
                <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                  {assignments.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 py-5">
                <Text tone="muted">Active assignments</Text>
                <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                  {assignments.filter((assignment) => assignment.status === 'active').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 py-5">
                <Text tone="muted">Matching current filters</Text>
                <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                  {filteredAssignments.length}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null
      }
      title="Assignment registry"
      toolbar={
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <div className="min-w-0 flex-[1.4] space-y-2">
            <Text tone="muted">Search</Text>
            <Input
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by assignment, driver, vehicle, fleet, or note"
              value={searchQuery}
            />
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <SearchableSelect
              helperText="Show one fleet at a time."
              inputId="assignmentFleetFilter"
              label="Fleet"
              onChange={setFleetId}
              options={fleetOptions}
              placeholder="All fleets"
              value={fleetId}
            />
            <SearchableSelect
              helperText="Show one lifecycle state."
              inputId="assignmentStatusFilter"
              label="Status"
              onChange={setStatus}
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
              }}
              variant="ghost"
            >
              Clear filters
            </Button>
          </div>
        </div>
      }
      totalItems={assignments.length}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment</TableHead>
            <TableHead>Payment model</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Fleet</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {paginatedAssignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                <div className="space-y-1">
                  <Link
                    className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                    href={`/assignments/${assignment.id}`}
                  >
                    {assignment.id}
                  </Link>
                  <Text tone="muted">{assignment.notes ?? 'No note added'}</Text>
                </div>
                </TableCell>
                <TableCell>
                  <Badge tone={assignment.paymentModel === 'salary' || assignment.paymentModel === 'commission' ? 'neutral' : 'warning'}>
                    {formatPaymentModel(assignment.paymentModel)}
                  </Badge>
                </TableCell>
                <TableCell>{driverLabels.get(assignment.driverId) ?? assignment.driverId}</TableCell>
              <TableCell>{vehicleLabels.get(assignment.vehicleId) ?? assignment.vehicleId}</TableCell>
              <TableCell>{fleetLabels.get(assignment.fleetId) ?? assignment.fleetId}</TableCell>
              <TableCell>
                <Badge tone={getStatusTone(assignment.status)}>{assignment.status}</Badge>
              </TableCell>
              <TableCell>{formatDateTime(assignment.startedAt)}</TableCell>
              <TableCell>
                <AssignmentRowActions
                  assignmentId={assignment.id}
                  status={assignment.status}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </RegistryTable>
  );
}
