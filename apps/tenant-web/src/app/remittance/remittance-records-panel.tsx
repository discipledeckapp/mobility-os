'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from '@mobility-os/ui';
import {
  confirmManyRemittances,
  resolveManyRemittanceDisputes,
  type AssignmentRecord,
  type DriverRecord,
  type RemittanceRecord,
  type VehicleRecord,
} from '../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../lib/vehicle-display';
import { RemittanceRowActions } from './remittance-row-actions';

function formatAmount(amountMinorUnits: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDate(dateString: string, locale: string): string {
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString(locale, { dateStyle: 'medium' });
}

export function RemittanceRecordsPanel({
  remittances,
  assignments,
  drivers,
  vehicles,
  locale,
}: {
  remittances: RemittanceRecord[];
  assignments: AssignmentRecord[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  locale: string;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const assignmentLabels = useMemo(
    () => new Map(assignments.map((assignment) => [assignment.id, assignment.id])),
    [assignments],
  );
  const driverLabels = useMemo(
    () => new Map(drivers.map((driver) => [driver.id, `${driver.firstName} ${driver.lastName}`.trim()])),
    [drivers],
  );
  const vehicleLabels = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, getVehiclePrimaryLabel(vehicle)])),
    [vehicles],
  );

  const selectedPendingIds = selectedIds.filter((id) =>
    remittances.some((record) => record.id === id && record.status === 'pending'),
  );
  const selectedDisputedIds = selectedIds.filter((id) =>
    remittances.some((record) => record.id === id && record.status === 'disputed'),
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
    );
  };

  const runBulkAction = (action: 'confirm' | 'resolve') => {
    startTransition(async () => {
      try {
        if (action === 'confirm') {
          await confirmManyRemittances(selectedPendingIds, paidDate);
          setFeedback(`Confirmed ${selectedPendingIds.length} remittance record(s).`);
        } else {
          await resolveManyRemittanceDisputes(selectedDisputedIds, paidDate);
          setFeedback(`Resolved ${selectedDisputedIds.length} disputed remittance record(s).`);
        }
        setSelectedIds([]);
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'Bulk action failed.');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <Text tone="strong">Quick actions</Text>
            <Text tone="muted">
              Confirm multiple pending collections or resolve disputed ones without opening each row.
            </Text>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-[180px] space-y-2">
              <Text tone="muted">Payment date</Text>
              <Input type="date" value={paidDate} onChange={(event) => setPaidDate(event.target.value)} />
            </div>
            <Button disabled={pending || selectedPendingIds.length === 0} onClick={() => runBulkAction('confirm')}>
              Confirm selected ({selectedPendingIds.length})
            </Button>
            <Button
              disabled={pending || selectedDisputedIds.length === 0}
              variant="secondary"
              onClick={() => runBulkAction('resolve')}
            >
              Resolve disputes ({selectedDisputedIds.length})
            </Button>
          </div>
        </div>
        {feedback ? <Text className="mt-3" tone="muted">{feedback}</Text> : null}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Variance</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Sync</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {remittances.map((remittance) => (
              <TableRow key={remittance.id}>
                <TableCell>
                  <input
                    aria-label={`Select remittance ${remittance.id}`}
                    checked={selectedIds.includes(remittance.id)}
                    onChange={() => toggleSelection(remittance.id)}
                    type="checkbox"
                  />
                </TableCell>
                <TableCell>
                  <Badge
                    tone={
                      remittance.status === 'completed' || remittance.status === 'partially_settled'
                        ? 'success'
                        : remittance.status === 'disputed'
                          ? 'danger'
                          : remittance.status === 'waived' || remittance.status === 'cancelled_due_to_assignment_end'
                            ? 'neutral'
                            : 'warning'
                    }
                  >
                    {remittance.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Text>{assignmentLabels.get(remittance.assignmentId) ?? remittance.assignmentId}</Text>
                    <Text tone="muted">{remittance.assignmentId}</Text>
                  </div>
                </TableCell>
                <TableCell>{driverLabels.get(remittance.driverId) ?? remittance.driverId}</TableCell>
                <TableCell>{vehicleLabels.get(remittance.vehicleId) ?? remittance.vehicleId}</TableCell>
                <TableCell>{formatAmount(remittance.amountMinorUnits, remittance.currency, locale)}</TableCell>
                <TableCell>{remittance.reconciliation?.contractType ?? 'regular_hire'}</TableCell>
                <TableCell>
                  {remittance.reconciliation
                    ? formatAmount(remittance.reconciliation.varianceMinorUnits, remittance.currency, locale)
                    : 'Not available'}
                </TableCell>
                <TableCell>{formatDate(remittance.dueDate, locale)}</TableCell>
                <TableCell>
                  <Badge tone={remittance.syncStatus === 'offline_submitted' ? 'warning' : 'neutral'}>
                    {remittance.syncStatus ?? 'synced'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <RemittanceRowActions remittanceId={remittance.id} status={remittance.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
