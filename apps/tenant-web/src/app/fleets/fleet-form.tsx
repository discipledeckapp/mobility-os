'use client';

import { getAllBusinessModelSlugs, getBusinessModel } from '@mobility-os/domain-config';
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
import type { SearchableSelectOption } from '@mobility-os/ui';
import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  BusinessEntityRecord,
  FleetRecord,
  OperatingUnitRecord,
} from '../../lib/api-core';
import type { FleetActionState } from './actions';

const initialState: FleetActionState = {};

const businessModelOptions: SearchableSelectOption[] = getAllBusinessModelSlugs().map((slug) => ({
  value: slug,
  label: getBusinessModel(slug).name,
}));

interface FleetFormProps {
  action: (prevState: FleetActionState, formData: FormData) => Promise<FleetActionState>;
  businessEntities: BusinessEntityRecord[];
  description: ReactNode;
  operatingUnits: OperatingUnitRecord[];
  submitLabel: string;
  title: string;
  fleet?: FleetRecord;
}

export function FleetForm({
  action,
  businessEntities,
  description,
  operatingUnits,
  submitLabel,
  title,
  fleet,
}: FleetFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const initialBusinessEntityId =
    operatingUnits.find((unit) => unit.id === fleet?.operatingUnitId)?.businessEntityId ?? '';
  const [businessEntityId, setBusinessEntityId] = useState(initialBusinessEntityId);
  const [operatingUnitId, setOperatingUnitId] = useState(fleet?.operatingUnitId ?? '');
  const [businessModel, setBusinessModel] = useState(fleet?.businessModel ?? '');

  const businessEntityOptions = useMemo<SearchableSelectOption[]>(
    () =>
      businessEntities.map((entity) => ({
        value: entity.id,
        label: entity.name,
      })),
    [businessEntities],
  );

  const filteredOperatingUnits = useMemo(
    () =>
      operatingUnits.filter((unit) =>
        businessEntityId ? unit.businessEntityId === businessEntityId : true,
      ),
    [businessEntityId, operatingUnits],
  );

  const operatingUnitOptions = useMemo<SearchableSelectOption[]>(
    () =>
      filteredOperatingUnits.map((unit) => ({
        value: unit.id,
        label: unit.name,
      })),
    [filteredOperatingUnits],
  );

  useEffect(() => {
    if (!operatingUnitId) {
      return;
    }

    const operatingUnitStillVisible = filteredOperatingUnits.some((unit) => unit.id === operatingUnitId);
    if (!operatingUnitStillVisible) {
      setOperatingUnitId('');
    }
  }, [filteredOperatingUnits, operatingUnitId]);

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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          {fleet ? <input name="fleetId" type="hidden" value={fleet.id} /> : null}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Fleet name <span aria-hidden="true" className="text-red-500">*</span></Label>
            <Input
              defaultValue={fleet?.name ?? ''}
              id="name"
              name="name"
              placeholder="Lagos Mainland Fleet"
              required
            />
          </div>

          <SearchableSelect
            emptyText="No business entities are available yet."
            helperText="Pick the parent entity first to scope the operating-unit choices."
            inputId="businessEntityId"
            label="Business entity"
            name="businessEntityId"
            onChange={setBusinessEntityId}
            options={businessEntityOptions}
            placeholder="Select business entity"
            required
            value={businessEntityId}
          />

          <SearchableSelect
            disabled={!businessEntityId}
            emptyText={
              businessEntityId
                ? 'No operating units are available for this entity.'
                : 'Select a business entity first.'
            }
            helperText="Fleets remain attached to an operating unit in the existing tenant hierarchy."
            inputId="operatingUnitId"
            label="Operating unit"
            name="operatingUnitId"
            onChange={setOperatingUnitId}
            options={operatingUnitOptions}
            placeholder="Select operating unit"
            required
            value={operatingUnitId}
          />

          <SearchableSelect
            helperText="This required backend field keeps the fleet aligned with the configured operating model."
            inputId="businessModel"
            label="Business model"
            name="businessModel"
            onChange={setBusinessModel}
            options={businessModelOptions}
            placeholder="Select business model"
            required
            value={businessModel}
          />

          <div className="md:col-span-2 flex items-end">
            <Button disabled={isPending} type="submit">
              {isPending ? 'Saving...' : submitLabel}
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
