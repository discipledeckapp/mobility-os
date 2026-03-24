'use client';

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
import { useActionState } from 'react';
import type { VehicleDetailRecord, VehicleValuationRecord } from '../../../lib/api-core';
import { type UpdateVehicleActionState, updateVehicleAction } from '../actions';

const initialState: UpdateVehicleActionState = {};

function findValuation(
  valuations: VehicleValuationRecord[],
  valuationKind: string,
): VehicleValuationRecord | undefined {
  return valuations.find(
    (valuation) => valuation.valuationKind === valuationKind && valuation.isCurrent,
  );
}

function formatMajorUnits(amountMinorUnits?: number): string {
  if (amountMinorUnits === undefined) {
    return '';
  }

  return (amountMinorUnits / 100).toFixed(2);
}

export function EditVehicleForm({ vehicle }: { vehicle: VehicleDetailRecord }) {
  const [state, formAction, isPending] = useActionState(updateVehicleAction, initialState);
  const acquisition = findValuation(vehicle.valuations, 'acquisition');
  const estimate = findValuation(vehicle.valuations, 'estimate');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit vehicle</CardTitle>
        <CardDescription>
          Update the operator-facing code and secondary identification fields without changing the
          immutable system vehicle code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <input name="vehicleId" type="hidden" value={vehicle.id} />

          <div className="space-y-2">
            <Label htmlFor="tenantVehicleCode">Organisation vehicle code</Label>
            <Input
              defaultValue={vehicle.tenantVehicleCode}
              id="tenantVehicleCode"
              name="tenantVehicleCode"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemVehicleCode">System vehicle code</Label>
            <Input defaultValue={vehicle.systemVehicleCode} disabled id="systemVehicleCode" />
            <Text tone="muted">Immutable internal identifier.</Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plate">Plate number</Label>
            <Input defaultValue={vehicle.plate ?? ''} id="plate" name="plate" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vin">VIN</Label>
            <Input defaultValue={vehicle.vin ?? ''} id="vin" name="vin" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="odometerKm">Current odometer (km)</Label>
            <Input
              defaultValue={vehicle.odometerKm?.toString() ?? ''}
              id="odometerKm"
              min="0"
              name="odometerKm"
              step="1"
              type="number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="acquisitionCost">Acquisition cost</Label>
            <Input
              defaultValue={formatMajorUnits(acquisition?.amountMinorUnits)}
              id="acquisitionCost"
              min="0"
              name="acquisitionCost"
              step="0.01"
              type="number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="acquisitionDate">Acquisition date</Label>
            <Input
              defaultValue={acquisition?.valuationDate ?? ''}
              id="acquisitionDate"
              name="acquisitionDate"
              type="date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentEstimatedValue">Current estimated value</Label>
            <Input
              defaultValue={formatMajorUnits(estimate?.amountMinorUnits)}
              id="currentEstimatedValue"
              min="0"
              name="currentEstimatedValue"
              step="0.01"
              type="number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valuationSource">Valuation source</Label>
            <Input
              defaultValue={estimate?.source ?? acquisition?.source ?? ''}
              id="valuationSource"
              name="valuationSource"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <Button disabled={isPending} type="submit">
              {isPending ? 'Saving...' : 'Save vehicle updates'}
            </Button>
          </div>
        </form>

        {state.error ? <Text className="mt-4">{state.error}</Text> : null}
        {state.success ? <Text className="mt-4">{state.success}</Text> : null}
      </CardContent>
    </Card>
  );
}
