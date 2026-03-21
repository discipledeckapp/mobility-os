'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Text,
} from '@mobility-os/ui';
import type { DriverRecord, FleetRecord, VehicleRecord } from '../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../lib/vehicle-display';
import { FleetSelectField } from '../../features/shared/fleet-select-field';
import {
  createAssignmentAction,
  type CreateAssignmentActionState,
} from './actions';

const initialState: CreateAssignmentActionState = {};

export function CreateAssignmentForm({
  fleets,
  fleetError,
  activeDrivers,
  availableVehicles,
  helperNote,
}: {
  fleets: FleetRecord[];
  fleetError?: string | null;
  activeDrivers: DriverRecord[];
  availableVehicles: VehicleRecord[];
  helperNote?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    createAssignmentAction,
    initialState,
  );
  const [fleetId, setFleetId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const selectableFleets = useMemo(
    () => fleets.filter((fleet) => fleet.status !== 'inactive'),
    [fleets],
  );
  const fleetDrivers = useMemo(
    () => activeDrivers.filter((driver) => !fleetId || driver.fleetId === fleetId),
    [activeDrivers, fleetId],
  );
  const fleetVehicles = useMemo(
    () => availableVehicles.filter((vehicle) => !fleetId || vehicle.fleetId === fleetId),
    [availableVehicles, fleetId],
  );
  const selectedDriver = useMemo(
    () => activeDrivers.find((driver) => driver.id === driverId) ?? null,
    [activeDrivers, driverId],
  );

  useEffect(() => {
    if (driverId && !fleetDrivers.some((driver) => driver.id === driverId)) {
      setDriverId('');
    }
  }, [driverId, fleetDrivers]);

  useEffect(() => {
    if (vehicleId && !fleetVehicles.some((vehicle) => vehicle.id === vehicleId)) {
      setVehicleId('');
    }
  }, [fleetVehicles, vehicleId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create assignment</CardTitle>
        <CardDescription>
          Pair an active driver with an available vehicle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-blue-800">Before you start:</span> Both the driver and vehicle must be active and available. Only eligible options appear in the quick-picks below. Drivers also need an approved licence on file.
        </div>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <FleetSelectField
            fleetError={fleetError}
            fleets={fleets}
            onChange={setFleetId}
            value={fleetId}
          />

          <div className="space-y-2">
            <Label htmlFor="driverId">Driver ID</Label>
            <Input
              id="driverId"
              name="driverId"
              onChange={(event) => setDriverId(event.target.value)}
              placeholder="drv_123"
              required
              value={driverId}
            />
            {fleetDrivers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fleetDrivers.slice(0, 4).map((driver) => (
                  <Button
                    className="max-w-full"
                    key={driver.id}
                    onClick={() => setDriverId(driver.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {driver.firstName} {driver.lastName}
                  </Button>
                ))}
              </div>
            ) : (
              <Text tone="muted">
                {fleetId
                  ? 'No active drivers are available in the selected fleet.'
                  : 'Select a fleet to see active drivers.'}
              </Text>
            )}
            {selectedDriver && !selectedDriver.hasApprovedLicence ? (
              <Text tone="danger">
                This driver cannot be assigned yet because no approved driver licence is on file.
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehicle ID</Label>
            <Input
              id="vehicleId"
              name="vehicleId"
              onChange={(event) => setVehicleId(event.target.value)}
              placeholder="veh_123"
              required
              value={vehicleId}
            />
            {fleetVehicles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fleetVehicles.slice(0, 4).map((vehicle) => (
                  <Button
                    className="max-w-full"
                    key={vehicle.id}
                    onClick={() => setVehicleId(vehicle.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {getVehiclePrimaryLabel(vehicle)}
                  </Button>
                ))}
              </div>
            ) : (
              <Text tone="muted">
                {fleetId
                  ? 'No available vehicles are in the selected fleet.'
                  : 'Select a fleet to see available vehicles.'}
              </Text>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Morning dispatch rotation" />
          </div>

          <div className="flex items-end">
            <Button
              disabled={
                isPending ||
                selectableFleets.length === 0 ||
                !fleetId ||
                !driverId ||
                !vehicleId ||
                Boolean(selectedDriver && !selectedDriver.hasApprovedLicence)
              }
              type="submit"
            >
              {isPending ? 'Creating...' : 'Create assignment'}
            </Button>
          </div>
        </form>

        {state.error ? (
          <Text className="mt-4" tone="danger">{state.error}</Text>
        ) : null}

        {state.success ? (
          <Text className="mt-4" tone="success">{state.success}</Text>
        ) : null}

        {helperNote ? (
          <Text className="mt-4" tone="muted">
            {helperNote}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
