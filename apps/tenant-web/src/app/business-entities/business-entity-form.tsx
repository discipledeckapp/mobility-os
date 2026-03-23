'use client';

import {
  getAllBusinessModelSlugs,
  getBusinessModel,
  getCountryConfig,
  getSupportedCountryCodes,
} from '@mobility-os/domain-config';
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
import { useActionState, useState, type ReactNode } from 'react';
import type { BusinessEntityRecord } from '../../lib/api-core';
import type { BusinessEntityActionState } from './actions';

const initialState: BusinessEntityActionState = {};

const countryOptions: SearchableSelectOption[] = getSupportedCountryCodes().map((countryCode) => ({
  value: countryCode,
  label: getCountryConfig(countryCode).name,
}));

const businessModelOptions: SearchableSelectOption[] = getAllBusinessModelSlugs().map((slug) => ({
  value: slug,
  label: getBusinessModel(slug).name,
}));

interface BusinessEntityFormProps {
  action: (
    prevState: BusinessEntityActionState,
    formData: FormData,
  ) => Promise<BusinessEntityActionState>;
  description: ReactNode;
  submitLabel: string;
  title: string;
  entity?: BusinessEntityRecord;
  defaultCountryCode?: string | null;
}

export function BusinessEntityForm({
  action,
  description,
  submitLabel,
  title,
  entity,
  defaultCountryCode,
}: BusinessEntityFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [country, setCountry] = useState(entity?.country ?? defaultCountryCode ?? '');
  const [businessModel, setBusinessModel] = useState(entity?.businessModel ?? '');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          {entity ? <input name="businessEntityId" type="hidden" value={entity.id} /> : null}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              defaultValue={entity?.name ?? ''}
              id="name"
              name="name"
              placeholder="Lagos North Operations"
              required
            />
          </div>

          <SearchableSelect
            helperText="Choose the legal or operating country for this business entity."
            inputId="country"
            label="Country"
            name="country"
            onChange={setCountry}
            options={countryOptions}
            placeholder="Select country"
            required
            value={country}
          />

          <SearchableSelect
            helperText="This should match the operating model used for this entity."
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

        {state.success ? (
          <Text className="mt-4" tone="success">
            {state.success}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
