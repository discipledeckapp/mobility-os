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
import { useActionState, useState } from 'react';
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
  const [acquisitionCost, setAcquisitionCost] = useState(
    formatMajorUnits(acquisition?.amountMinorUnits),
  );
  const [currentEstimatedValue, setCurrentEstimatedValue] = useState(
    formatMajorUnits(estimate?.amountMinorUnits),
  );

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
              id="acquisitionCost"
              inputMode="decimal"
              name="acquisitionCost"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAcquisitionCost(e.target.value)
              }
              placeholder="2,450,000.00"
              value={acquisitionCost}
            />
            {(() => {
              const v = parseFloat(acquisitionCost.replace(/,/g, ''));
              return Number.isFinite(v) && v > 0 ? (
                <Text tone="muted">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: acquisition?.currency ?? 'NGN',
                    minimumFractionDigits: 2,
                  }).format(v)}
                </Text>
              ) : null;
            })()}
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
              id="currentEstimatedValue"
              inputMode="decimal"
              name="currentEstimatedValue"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCurrentEstimatedValue(e.target.value)
              }
              placeholder="2,200,000.00"
              value={currentEstimatedValue}
            />
            {(() => {
              const v = parseFloat(currentEstimatedValue.replace(/,/g, ''));
              return Number.isFinite(v) && v > 0 ? (
                <Text tone="muted">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: estimate?.currency ?? acquisition?.currency ?? 'NGN',
                    minimumFractionDigits: 2,
                  }).format(v)}
                </Text>
              ) : null;
            })()}
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
