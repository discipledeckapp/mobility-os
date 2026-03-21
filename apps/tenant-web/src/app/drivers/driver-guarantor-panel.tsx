'use client';

import { useActionState, useState } from 'react';
import { getCountryConfig, getSupportedCountryCodes } from '@mobility-os/domain-config';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  SearchableSelect,
  Text,
} from '@mobility-os/ui';
import type { DriverGuarantorRecord } from '../../lib/api-core';
import {
  removeDriverGuarantorAction,
  saveDriverGuarantorAction,
  type DriverGuarantorActionState,
} from './actions';

const initialState: DriverGuarantorActionState = {};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function DriverGuarantorPanel({
  driverId,
  guarantor,
  defaultCountryCode,
}: {
  driverId: string;
  guarantor: DriverGuarantorRecord | null;
  defaultCountryCode?: string | null;
}) {
  const [isEditing, setIsEditing] = useState(!guarantor);
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);
  const countryOptions = getSupportedCountryCodes().map((countryCode) => ({
    value: countryCode,
    label: getCountryConfig(countryCode).name,
  }));
  const [countryCode, setCountryCode] = useState(
    guarantor?.countryCode ?? defaultCountryCode ?? '',
  );
  const [saveState, saveAction, isSaving] = useActionState(
    saveDriverGuarantorAction,
    initialState,
  );
  const [removeState, removeAction, isRemoving] = useActionState(
    removeDriverGuarantorAction,
    initialState,
  );
  const isDisconnected = guarantor?.status === 'disconnected';

  return (
    <Card className={isDisconnected ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-white'}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Guarantor</CardTitle>
            <Badge tone={guarantor ? (isDisconnected ? 'warning' : 'success') : 'danger'}>
              {guarantor ? (isDisconnected ? 'Disconnected' : 'Linked') : 'Missing'}
            </Badge>
          </div>
          <Text tone="muted">
            Guarantors are contacted if a driver defaults on remittance commitments. A guarantor must be linked before the driver can be activated.
          </Text>
        </div>
        <Button
          onClick={() => setIsEditing((current) => !current)}
          size="sm"
          type="button"
          variant="ghost"
        >
          {isEditing ? 'Close' : guarantor ? 'Edit guarantor' : 'Add guarantor'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {guarantor ? (
          <div className="grid gap-4 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)] bg-slate-50 p-4 md:grid-cols-2">
            <div className="space-y-1">
              <Text tone="muted">Name</Text>
              <Text>{guarantor.name}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Phone</Text>
              <Text>{guarantor.phone}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Phone country</Text>
              <Text>{guarantor.countryCode || 'Stored as full international number'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Relationship</Text>
              <Text>{guarantor.relationship || 'Not recorded'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Linked on</Text>
              <Text>{formatDate(guarantor.createdAt)}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Status</Text>
              <Text>{isDisconnected ? 'Disconnected' : 'Active'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Disconnected on</Text>
              <Text>{guarantor.disconnectedAt ? formatDate(guarantor.disconnectedAt) : 'Still linked'}</Text>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Text tone="muted">Disconnect note</Text>
              <Text>{guarantor.disconnectedReason || 'No disconnect note recorded.'}</Text>
            </div>
          </div>
        ) : (
          <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-dashed border-[var(--mobiris-border)] bg-slate-50 p-4">
            <Text tone="muted">No guarantor linked.</Text>
          </div>
        )}

        {isEditing ? (
          <form action={saveAction} className="grid gap-4 md:grid-cols-2">
            <input name="driverId" type="hidden" value={driverId} />
            <div className="space-y-2">
              <Label htmlFor={`guarantor-name-${driverId}`}>Name</Label>
              <Input
                defaultValue={guarantor?.name ?? ''}
                id={`guarantor-name-${driverId}`}
                name="name"
                placeholder="Enter guarantor name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`guarantor-phone-${driverId}`}>Phone</Label>
              <Input
                defaultValue={guarantor?.phone ?? ''}
                id={`guarantor-phone-${driverId}`}
                name="phone"
                placeholder="08012345678"
                required
              />
              <Text tone="muted">
                If you do not choose a country, enter the number in full international format.
              </Text>
            </div>
            <div className="space-y-2">
              <SearchableSelect
                helperText="Optional. Choose the guarantor phone country to allow local-number formatting."
                inputId={`guarantor-country-${driverId}`}
                label="Phone country"
                name="countryCode"
                onChange={setCountryCode}
                options={countryOptions}
                placeholder="Use E.164 instead"
                value={countryCode}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`guarantor-relationship-${driverId}`}>Relationship</Label>
              <Input
                defaultValue={guarantor?.relationship ?? ''}
                id={`guarantor-relationship-${driverId}`}
                name="relationship"
                placeholder="Friend, sibling, spouse, employer"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <Button disabled={isSaving} type="submit">
                {isSaving ? 'Saving...' : 'Save guarantor'}
              </Button>
              {guarantor ? (
                <Button
                  disabled={isSaving}
                  onClick={() => setIsEditing(false)}
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        ) : null}

        {guarantor ? (
          isConfirmingDisconnect ? (
            <div className="flex flex-wrap items-start gap-3">
              <div className="space-y-0.5">
                <Text tone="muted">Disconnect guarantor?</Text>
                <Text tone="danger">This will remove the guarantor link and the driver may no longer be eligible for new assignments.</Text>
              </div>
              <form action={removeAction} className="flex gap-2">
                <input name="driverId" type="hidden" value={driverId} />
                <input name="reason" type="hidden" value="Disconnected by operator request" />
                <Button disabled={isRemoving} size="sm" type="submit" variant="ghost">
                  {isRemoving ? 'Disconnecting...' : 'Confirm disconnect'}
                </Button>
                <Button
                  disabled={isRemoving}
                  onClick={() => setIsConfirmingDisconnect(false)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </form>
            </div>
          ) : (
            <Button
              disabled={isRemoving}
              onClick={() => setIsConfirmingDisconnect(true)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Disconnect guarantor
            </Button>
          )
        ) : null}

        {saveState.error ? <Text tone="danger">{saveState.error}</Text> : null}
        {saveState.success ? <Text tone="success">{saveState.success}</Text> : null}
        {removeState.error ? <Text tone="danger">{removeState.error}</Text> : null}
        {removeState.success ? <Text tone="success">{removeState.success}</Text> : null}
      </CardContent>
    </Card>
  );
}
