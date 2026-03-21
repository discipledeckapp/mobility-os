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
  SearchableSelect,
  Text,
} from '@mobility-os/ui';
import { getCountryConfig, getSupportedCountryCodes } from '@mobility-os/domain-config';
import type { FleetRecord } from '../../lib/api-core';
import { FleetSelectField } from '../../features/shared/fleet-select-field';
import {
  createDriverAction,
  type CreateDriverActionState,
} from './actions';

const initialState: CreateDriverActionState = {};

export function CreateDriverForm({
  fleets,
  fleetError,
  tenantCountryCode,
}: {
  fleets: FleetRecord[];
  fleetError?: string | null;
  tenantCountryCode?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    createDriverAction,
    initialState,
  );
  const [fleetId, setFleetId] = useState('');
  const countryOptions = useMemo(
    () =>
      getSupportedCountryCodes().map((countryCode) => ({
        value: countryCode,
        label: getCountryConfig(countryCode).name,
      })),
    [],
  );
  const [countryCode, setCountryCode] = useState(tenantCountryCode ?? countryOptions[0]?.value ?? '');
  const hasFleetOptions = useMemo(
    () => fleets.some((fleet) => fleet.status !== 'inactive'),
    [fleets],
  );

  useEffect(() => {
    if (tenantCountryCode) {
      setCountryCode(tenantCountryCode);
    }
  }, [tenantCountryCode]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create driver</CardTitle>
        <CardDescription>
          Add a new driver to this fleet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <FleetSelectField
            fleetError={fleetError}
            fleets={fleets}
            onChange={setFleetId}
            value={fleetId}
          />

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="08012345678 or +2348012345678"
              required
            />
            <Text tone="muted">
              Enter the driver&apos;s phone number with or without the country code.
            </Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" placeholder="Emeka" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" placeholder="Okonkwo" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" placeholder="emeka@example.com" type="email" />
            <Text tone="muted">
              An email address is required for the driver to use the Mobiris mobile app for self-service remittance and document uploads.
            </Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input id="dateOfBirth" name="dateOfBirth" placeholder="1990-06-15" />
          </div>

          <SearchableSelect
            helperText="Driver country defaults to the organisation country, but you can change it here."
            inputId="nationality"
            label="Country"
            name="nationality"
            onChange={setCountryCode}
            options={countryOptions}
            placeholder="Select country"
            required
            value={countryCode}
          />

          <div className="flex items-end">
            <Button disabled={isPending || !hasFleetOptions || !fleetId} type="submit">
              {isPending ? 'Creating...' : 'Create driver'}
            </Button>
          </div>
        </form>

        {state.error ? (
          <Text className="mt-4" tone="danger">
            {state.error}
          </Text>
        ) : null}

        {state.success ? (
          <Text className="mt-4" tone="success">
            {state.success}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
