'use client';

import { SearchableSelect } from '@mobility-os/ui';
import { useEffect } from 'react';
import type { FleetRecord } from '../../lib/api-core';

function getSelectableFleets(fleets: FleetRecord[]): FleetRecord[] {
  return fleets.filter((fleet) => fleet.status !== 'inactive');
}

interface FleetSelectFieldProps {
  fleets: FleetRecord[];
  fleetError?: string | null | undefined;
  isLoading?: boolean;
  value: string;
  onChange: (fleetId: string) => void;
  selectId?: string;
}

export function FleetSelectField({
  fleets,
  fleetError,
  isLoading = false,
  value,
  onChange,
  selectId = 'fleetId',
}: FleetSelectFieldProps) {
  const selectableFleets = getSelectableFleets(fleets);
  const hasSingleFleet = selectableFleets.length === 1;
  const singleFleetId = hasSingleFleet ? (selectableFleets[0]?.id ?? '') : '';
  const shouldDisable = isLoading || selectableFleets.length === 0 || Boolean(fleetError);
  const placeholderLabel = isLoading
    ? 'Loading fleets...'
    : fleetError
      ? 'Unable to load fleets'
      : selectableFleets.length === 0
        ? 'No fleets available for this organisation'
        : 'Select a fleet';

  useEffect(() => {
    if (!value && hasSingleFleet && singleFleetId) {
      onChange(singleFleetId);
    }
  }, [hasSingleFleet, onChange, singleFleetId, value]);

  return (
    <SearchableSelect
      disabled={shouldDisable}
      emptyText="No fleets are available for this organisation yet. Create a fleet first, then return here to continue."
      errorText={fleetError}
      helperText={
        hasSingleFleet
          ? `${selectableFleets[0]?.name ?? 'The only fleet'} has been preselected.`
          : 'A fleet groups vehicles and drivers under an operating unit. Select the fleet this record belongs to.'
      }
      inputId={selectId}
      label="Fleet"
      name="fleetId"
      onChange={onChange}
      options={selectableFleets.map((fleet) => ({
        value: fleet.id,
        label: fleet.name,
      }))}
      placeholder={placeholderLabel}
      required
      value={hasSingleFleet && !value ? singleFleetId : value}
      isLoading={isLoading}
      loadingText="Loading available fleets..."
    />
  );
}
