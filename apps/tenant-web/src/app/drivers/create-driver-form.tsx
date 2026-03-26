'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
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

function HelperDisclosure({
  children,
  summary = 'What should I know?',
}: {
  children: React.ReactNode;
  summary?: string;
}) {
  return (
    <details className="rounded-[var(--mobiris-radius-button)] bg-slate-50 px-3 py-2 text-sm text-slate-500">
      <summary className="cursor-pointer list-none font-medium text-slate-600">{summary}</summary>
      <div className="pt-2">{children}</div>
    </details>
  );
}

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

  const [displaySuccess, setDisplaySuccess] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.success) {
      setDisplaySuccess(state.success);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setDisplaySuccess(null), 4000);
    }
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [state.success]);

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
            <Label htmlFor="phone">Phone <span aria-hidden="true" className="text-red-500">*</span></Label>
            <Input
              id="phone"
              name="phone"
              placeholder="08012345678 or +2348012345678"
              required
            />
            <HelperDisclosure summary="Phone entry help">
              Enter the driver&apos;s phone number with or without the country code.
            </HelperDisclosure>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First name <span aria-hidden="true" className="text-red-500">*</span></Label>
            <Input id="firstName" name="firstName" placeholder="Emeka" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name <span aria-hidden="true" className="text-red-500">*</span></Label>
            <Input id="lastName" name="lastName" placeholder="Okonkwo" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" placeholder="emeka@example.com" type="email" />
            <HelperDisclosure summary="When is email needed?">
              An email address is required for the driver to use the Mobiris mobile app for self-service remittance and document uploads.
            </HelperDisclosure>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" />
          </div>

          <SearchableSelect
            inputId="nationality"
            label="Country"
            name="nationality"
            onChange={setCountryCode}
            options={countryOptions}
            placeholder="Select country"
            required
            value={countryCode}
          />
          <div className="-mt-2 md:col-span-2">
            <HelperDisclosure summary="Country selection help">
              Driver country defaults to the organisation country, but you can change it here when
              the driver should follow a different country profile.
            </HelperDisclosure>
          </div>

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

        {displaySuccess ? (
          <Text className="mt-4" tone="success">
            {displaySuccess}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
