'use client';

import {
  getAllBusinessModelSlugs,
  getCountryConfig,
  getSupportedCountryCodes,
} from '@mobility-os/domain-config';
import {
  Badge,
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
import { SelectField } from '../../features/shared/select-field';
import type { PlanRecord } from '../../lib/api-control-plane';
import { type ProvisionTenantActionState, provisionTenantAction } from './actions';

const initialState: ProvisionTenantActionState = {};

interface ProvisionTenantFormProps {
  plans: PlanRecord[];
}

export function ProvisionTenantForm({ plans }: ProvisionTenantFormProps) {
  const [state, formAction, isPending] = useActionState(provisionTenantAction, initialState);

  const businessModels = getAllBusinessModelSlugs();
  const supportedCountries = getSupportedCountryCodes().map((countryCode) => ({
    code: countryCode,
    label: getCountryConfig(countryCode).name,
  }));

  return (
    <Card className="border-slate-200/80">
      <CardHeader>
        <Badge tone="neutral">Provisioning</Badge>
        <CardTitle>Provision organisation</CardTitle>
        <CardDescription>
          Create the organisation account, default business hierarchy, first operator, subscription,
          and opening wallet balance without direct database access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <Text>
            No active plans are available. Seed at least one plan before onboarding a tenant.
          </Text>
        ) : (
          <form action={formAction} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenantName">Organisation name</Label>
              <Input id="tenantName" name="tenantName" required type="text" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantSlug">Organisation slug</Label>
              <Input id="tenantSlug" name="tenantSlug" required type="text" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantCountry">Country</Label>
              <SelectField defaultValue="NG" id="tenantCountry" name="tenantCountry" required>
                {supportedCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.label} ({country.code})
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planId">Default plan</Label>
              <SelectField defaultValue="" id="planId" name="planId" required>
                <option disabled value="">
                  Select a plan
                </option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · {plan.currency} · {plan.billingInterval}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessEntityName">Business entity name</Label>
              <Input id="businessEntityName" name="businessEntityName" required type="text" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessModel">Business model</Label>
              <SelectField
                defaultValue={businessModels[0] ?? ''}
                id="businessModel"
                name="businessModel"
                required
              >
                {businessModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingUnitName">Operating unit name</Label>
              <Input id="operatingUnitName" name="operatingUnitName" type="text" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fleetName">Fleet name</Label>
              <Input id="fleetName" name="fleetName" type="text" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatorName">Operator name</Label>
              <Input id="operatorName" name="operatorName" required type="text" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatorEmail">Operator email</Label>
              <Input id="operatorEmail" name="operatorEmail" required type="email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatorPhone">Operator phone</Label>
              <Input id="operatorPhone" name="operatorPhone" type="text" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatorPassword">Operator password</Label>
              <Input id="operatorPassword" name="operatorPassword" required type="password" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="initialPlatformWalletCreditMinorUnits">
                Opening platform wallet credit
              </Label>
              <Input
                defaultValue="0"
                id="initialPlatformWalletCreditMinorUnits"
                min={0}
                name="initialPlatformWalletCreditMinorUnits"
                type="number"
              />
            </div>

            <div className="md:col-span-2">
              <Button disabled={isPending} type="submit">
                {isPending ? 'Provisioning...' : 'Provision tenant'}
              </Button>
            </div>
          </form>
        )}

        {state.error ? <Text className="mt-4">{state.error}</Text> : null}
        {state.success ? (
          <div className="mt-4 rounded-[var(--mobiris-radius-card)] border border-emerald-200 bg-emerald-50 p-4">
            <Text className="font-medium text-emerald-800">{state.success}</Text>
            {state.result ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <Text>Organisation ID: {state.result.tenantId}</Text>
                <Text>Business entity ID: {state.result.businessEntityId}</Text>
                <Text>Fleet ID: {state.result.fleetId}</Text>
                <Text>Subscription ID: {state.result.subscriptionId}</Text>
                <Text>Operator email: {state.result.operatorEmail}</Text>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
