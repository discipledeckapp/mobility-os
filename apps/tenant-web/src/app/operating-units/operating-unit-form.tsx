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
import { useActionState, type ReactNode } from 'react';
import { SelectField } from '../../features/shared/select-field';
import type { BusinessEntityRecord, OperatingUnitRecord } from '../../lib/api-core';
import type { OperatingUnitActionState } from './actions';

const initialState: OperatingUnitActionState = {};

interface OperatingUnitFormProps {
  action: (
    prevState: OperatingUnitActionState,
    formData: FormData,
  ) => Promise<OperatingUnitActionState>;
  businessEntities: BusinessEntityRecord[];
  description: ReactNode;
  operatingUnit?: OperatingUnitRecord;
  submitLabel: string;
  title: string;
}

export function OperatingUnitForm({
  action,
  businessEntities,
  description,
  operatingUnit,
  submitLabel,
  title,
}: OperatingUnitFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          {operatingUnit ? (
            <input name="operatingUnitId" type="hidden" value={operatingUnit.id} />
          ) : null}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              defaultValue={operatingUnit?.name ?? ''}
              id="name"
              name="name"
              placeholder="Ikeja Depot"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="businessEntityId">Business entity</Label>
            <SelectField
              defaultValue={operatingUnit?.businessEntityId ?? ''}
              id="businessEntityId"
              name="businessEntityId"
              required
            >
              <option value="">Select a business entity…</option>
              {businessEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </SelectField>
            <Text tone="muted">
              Operating units remain attached to a tenant business entity in the existing hierarchy.
            </Text>
          </div>

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

        {state.success ? (
          <Text className="mt-4" tone="success">
            {state.success}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
