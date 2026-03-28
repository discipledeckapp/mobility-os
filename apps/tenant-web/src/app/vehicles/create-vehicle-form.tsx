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
  SearchableSelect,
  Text,
} from '@mobility-os/ui';
import type { SearchableSelectOption } from '@mobility-os/ui';
import { useActionState, useEffect, useMemo, useState } from 'react';
import type {
  FleetRecord,
  VehicleMakerRecord,
  VehicleModelCatalogRecord,
  VehicleVinDecodeRecord,
} from '../../lib/api-core';
import { type CreateVehicleActionState, createVehicleAction } from './actions';
import { normalizeVehicleValuationInput } from './valuation-input';

const initialState: CreateVehicleActionState = {};

const VEHICLE_TYPE_OPTIONS: SearchableSelectOption[] = [
  { value: 'bus-32', label: 'Bus (32-seater)' },
  { value: 'bus-45', label: 'Coach Bus (45-seater)' },
  { value: 'flatbed-truck', label: 'Flatbed Truck' },
  { value: 'minibus-14', label: 'Minibus (14-seater)' },
  { value: 'minibus-18', label: 'Minibus (18-seater)' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'pickup-truck', label: 'Pickup Truck' },
  { value: 'saloon', label: 'Saloon Car' },
  { value: 'suv', label: 'SUV' },
  { value: 'tricycle', label: 'Tricycle' },
].sort((left, right) => left.label.localeCompare(right.label));

const COLOR_OPTIONS: SearchableSelectOption[] = [
  'Black',
  'Blue',
  'Brown',
  'Gold',
  'Gray',
  'Green',
  'Orange',
  'Purple',
  'Red',
  'Silver',
  'White',
  'Yellow',
].map((color) => ({ value: color, label: color }));

function HelperDisclosure({
  children,
  summary = 'Read help',
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

function toAlphabeticalOptions<T extends { id: string; name: string }>(
  records: T[],
): SearchableSelectOption[] {
  return [...records]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((record) => ({
      value: record.id,
      label: record.name,
    }));
}

interface CreateVehicleFormProps {
  fleets: FleetRecord[];
  fleetError?: string | null;
  makers: VehicleMakerRecord[];
  tenantCurrencyCode?: string | null;
  vehicleCatalogError?: string | null;
}

function getFriendlyVehicleCodeSuggestionMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'We could not suggest a vehicle code right now. You can still enter your own asset code or leave the field blank and Mobiris will generate one on save.';
  }

  const message = error.message.trim();
  if (message === 'Internal server error' || message === 'api-core returned status 500') {
    return 'We could not suggest a vehicle code right now. You can still enter your own asset code or leave the field blank and Mobiris will generate one on save.';
  }

  return message;
}

async function parseJsonResponse<T>(response: Response): Promise<T | { message?: string } | null> {
  const text = await response.text().catch(() => '');
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as T | { message?: string };
  } catch {
    return null;
  }
}

function sanitizeVehicleCatalogMessage(message: string, fallback: string): string {
  const normalized = message.toLowerCase();
  if (
    normalized.includes('unexpected end of json input') ||
    normalized.includes('returned an unreadable response') ||
    normalized.includes('returned no data')
  ) {
    return fallback;
  }
  return message;
}

export function CreateVehicleForm({
  fleets,
  fleetError,
  makers,
  tenantCurrencyCode,
  vehicleCatalogError,
}: CreateVehicleFormProps) {
  const [state, formAction, isPending] = useActionState(createVehicleAction, initialState);
  const [fleetId, setFleetId] = useState('');
  const [tenantVehicleCode, setTenantVehicleCode] = useState('');
  const [vehicleCodeTouched, setVehicleCodeTouched] = useState(false);
  const [vehicleCodeSuggestionMessage, setVehicleCodeSuggestionMessage] = useState<string | null>(
    null,
  );
  const [isLoadingVehicleCodeSuggestion, setIsLoadingVehicleCodeSuggestion] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [color, setColor] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [year, setYear] = useState('');
  const [trim, setTrim] = useState('');
  const [vin, setVin] = useState('');
  const [plate, setPlate] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [currentEstimatedValue, setCurrentEstimatedValue] = useState('');
  const [valuationSource, setValuationSource] = useState('');
  const [makerOptions, setMakerOptions] = useState(makers);
  const [selectedMakerId, setSelectedMakerId] = useState('');
  const [modelOptions, setModelOptions] = useState<VehicleModelCatalogRecord[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [manualModelName, setManualModelName] = useState('');
  const [useManualModel, setUseManualModel] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [showAddMaker, setShowAddMaker] = useState(makers.length === 0);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newMakerName, setNewMakerName] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [catalogActionError, setCatalogActionError] = useState<string | null>(null);
  const [catalogActionSuccess, setCatalogActionSuccess] = useState<string | null>(null);
  const [isSavingMaker, setIsSavingMaker] = useState(false);
  const [isSavingModel, setIsSavingModel] = useState(false);
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [vinDecodeMessage, setVinDecodeMessage] = useState<string | null>(null);
  const [vinDecodeError, setVinDecodeError] = useState<string | null>(null);
  const [decodedMakerDisplay, setDecodedMakerDisplay] = useState<string | null>(null);
  const [decodedModelDisplay, setDecodedModelDisplay] = useState<string | null>(null);
  const [pendingDecodedModelId, setPendingDecodedModelId] = useState<string | null>(null);

  const hasFleetOptions = useMemo(
    () => fleets.some((fleet) => fleet.status !== 'inactive'),
    [fleets],
  );
  const selectableFleetOptions = useMemo(
    () => toAlphabeticalOptions(fleets.filter((fleet) => fleet.status !== 'inactive')),
    [fleets],
  );
  const selectableMakerOptions = useMemo(
    () => toAlphabeticalOptions(makerOptions.filter((maker) => maker.status !== 'inactive')),
    [makerOptions],
  );
  const selectableModelOptions = useMemo(
    () => toAlphabeticalOptions(modelOptions.filter((model) => model.status !== 'inactive')),
    [modelOptions],
  );
  const hasMakerOptions = makerOptions.some((maker) => maker.status !== 'inactive');
  const hasModelOptions = modelOptions.some((model) => model.status !== 'inactive');
  const selectedMaker = makerOptions.find((maker) => maker.id === selectedMakerId);
  const selectedModel = modelOptions.find((model) => model.id === selectedModelId);
  const resolvedModelName = useManualModel
    ? manualModelName.trim()
    : (selectedModel?.name ?? decodedModelDisplay ?? '');
  const valuationInput = normalizeVehicleValuationInput({
    acquisitionCost,
    acquisitionDate,
    currentEstimatedValue,
  });
  const saveBlockingReasons = [
    !hasFleetOptions ? 'No active fleet is available.' : null,
    hasFleetOptions && !fleetId ? 'Select a fleet.' : null,
    !selectedMaker ? 'Select a maker.' : null,
    modelsLoading ? 'Vehicle models are still loading.' : null,
    isPending ? 'Vehicle save is already in progress.' : null,
    ...valuationInput.validationErrors,
  ].filter(Boolean) as string[];
  const isSaveDisabled = saveBlockingReasons.length > 0;
  const canShowReadyToSave = !isSaveDisabled && !state.error;

  useEffect(() => {
    setMakerOptions(makers);
  }, [makers]);

  useEffect(() => {
    if (!fleetId && selectableFleetOptions.length === 1) {
      setFleetId(selectableFleetOptions[0]?.value ?? '');
    }
  }, [fleetId, selectableFleetOptions]);

  useEffect(() => {
    if (!fleetId) {
      if (!vehicleCodeTouched) {
        setTenantVehicleCode('');
      }
      setVehicleCodeSuggestionMessage(null);
      return;
    }

    let cancelled = false;

    async function loadVehicleCodeSuggestion() {
      setIsLoadingVehicleCodeSuggestion(true);

      try {
        const response = await fetch(
          `/api/vehicles/code-suggestion?fleetId=${encodeURIComponent(fleetId)}`,
          { cache: 'no-store' },
        );
        const payload = (await response.json()) as
          | { suggestedTenantVehicleCode: string; prefix: string }
          | { message?: string };

        if (!response.ok || !('suggestedTenantVehicleCode' in payload)) {
          throw new Error(
            !('suggestedTenantVehicleCode' in payload) && payload.message
              ? payload.message
              : 'Unable to load a vehicle code suggestion.',
          );
        }

        if (cancelled) {
          return;
        }

        if (!vehicleCodeTouched || !tenantVehicleCode.trim()) {
          setTenantVehicleCode(payload.suggestedTenantVehicleCode);
        }
        setVehicleCodeSuggestionMessage(
          `Suggested from fleet/business context: ${payload.suggestedTenantVehicleCode}. You can edit it before saving.`,
        );
      } catch (error) {
        if (!cancelled) {
          setVehicleCodeSuggestionMessage(getFriendlyVehicleCodeSuggestionMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVehicleCodeSuggestion(false);
        }
      }
    }

    void loadVehicleCodeSuggestion();

    return () => {
      cancelled = true;
    };
  }, [fleetId, tenantVehicleCode, vehicleCodeTouched]);

  useEffect(() => {
    if (!selectedMakerId) {
      setModelOptions([]);
      setModelsError(null);
      setPendingDecodedModelId(null);
      return;
    }

    let cancelled = false;

    async function loadModels() {
      setModelsLoading(true);
      setModelsError(null);

      try {
        const params = new URLSearchParams({ makerId: selectedMakerId });

        const response = await fetch(`/api/vehicle-catalog/models?${params.toString()}`, {
          cache: 'no-store',
        });
        const payload = await parseJsonResponse<VehicleModelCatalogRecord[]>(response);

        if (!response.ok) {
          throw new Error(
            payload && !Array.isArray(payload) && payload.message
              ? payload.message
              : 'Unable to load vehicle models.',
          );
        }

        if (!cancelled) {
          const nextOptions = Array.isArray(payload) ? payload : [];
          setModelOptions(nextOptions);
          if (
            pendingDecodedModelId &&
            nextOptions.some((model) => model.id === pendingDecodedModelId)
          ) {
            setSelectedModelId(pendingDecodedModelId);
            setPendingDecodedModelId(null);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setModelOptions([]);
          setModelsError(
            sanitizeVehicleCatalogMessage(
              error instanceof Error ? error.message : 'Unable to load vehicle models.',
              'Vehicle models are unavailable right now. Enter the model manually to continue.',
            ),
          );
          setUseManualModel(true);
        }
      } finally {
        if (!cancelled) {
          setModelsLoading(false);
        }
      }
    }

    void loadModels();

    return () => {
      cancelled = true;
    };
  }, [pendingDecodedModelId, selectedMakerId]);

  async function handleAddMaker(): Promise<void> {
    const name = newMakerName.trim();
    if (!name) {
      setCatalogActionError('Maker name is required.');
      setCatalogActionSuccess(null);
      return;
    }

    setIsSavingMaker(true);
    setCatalogActionError(null);
    setCatalogActionSuccess(null);

    try {
      const response = await fetch('/api/vehicle-catalog/makers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const payload = (await response.json()) as VehicleMakerRecord | { message?: string };

      if (!response.ok || !('id' in payload)) {
        throw new Error(
          !('id' in payload) && payload.message
            ? payload.message
            : 'Unable to create vehicle maker.',
        );
      }

      setMakerOptions((current) => {
        const next = current.filter((maker) => maker.id !== payload.id);
        return [...next, payload].sort((left, right) => left.name.localeCompare(right.name));
      });
      setSelectedMakerId(payload.id);
      setShowAddMaker(false);
      setShowAddModel(false);
      setNewMakerName('');
      setCatalogActionSuccess(`${payload.name} is now available.`);
    } catch (error) {
      setCatalogActionError(
        error instanceof Error ? error.message : 'Unable to create vehicle maker.',
      );
    } finally {
      setIsSavingMaker(false);
    }
  }

  async function handleAddModel(): Promise<void> {
    const name = newModelName.trim();
    if (!selectedMakerId) {
      setCatalogActionError('Select a maker before adding a model.');
      setCatalogActionSuccess(null);
      return;
    }

    if (!name) {
      setCatalogActionError('Model name is required.');
      setCatalogActionSuccess(null);
      return;
    }

    setIsSavingModel(true);
    setCatalogActionError(null);
    setCatalogActionSuccess(null);

    try {
      const response = await fetch('/api/vehicle-catalog/models', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          makerId: selectedMakerId,
          name,
          vehicleType: vehicleType.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as VehicleModelCatalogRecord | { message?: string };

      if (!response.ok || !('id' in payload)) {
        throw new Error(
          !('id' in payload) && payload.message
            ? payload.message
            : 'Unable to create vehicle model.',
        );
      }

      setModelOptions((current) => {
        const next = current.filter((model) => model.id !== payload.id);
        return [...next, payload].sort((left, right) => left.name.localeCompare(right.name));
      });
      setSelectedModelId(payload.id);
      setShowAddModel(false);
      setNewModelName('');
      setCatalogActionSuccess(`${payload.name} is now available.`);
    } catch (error) {
      setCatalogActionError(
        error instanceof Error ? error.message : 'Unable to create vehicle model.',
      );
    } finally {
      setIsSavingModel(false);
    }
  }

  async function handleDecodeVin(): Promise<void> {
    const normalizedVin = vin.trim().toUpperCase();
    if (!normalizedVin) {
      setVinDecodeError('Enter a VIN before decoding.');
      setVinDecodeMessage(null);
      return;
    }

    setIsDecodingVin(true);
    setVinDecodeError(null);
    setVinDecodeMessage(null);
    setCatalogActionError(null);
    setCatalogActionSuccess(null);

    try {
      const response = await fetch('/api/vehicle-catalog/decode-vin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          vin: normalizedVin,
          ...(year.trim() ? { modelYear: Number(year.trim()) } : {}),
        }),
      });
      const payload = await parseJsonResponse<VehicleVinDecodeRecord>(response);

      if (!response.ok || !payload || !('id' in payload)) {
        throw new Error(
          payload && !('id' in payload) && payload.message
            ? payload.message
            : 'Unable to decode VIN.',
        );
      }

      setVin(normalizedVin);

      if (payload.decodedModelYear) {
        setYear(String(payload.decodedModelYear));
      }

      const decodedMakerId = payload.makerId ?? null;
      const decodedMakerName = payload.makerName ?? null;
      const decodedModelId = payload.modelId ?? null;
      const decodedModelName = payload.modelName ?? null;
      const decodedTrim =
        payload.rawPayload &&
        typeof payload.rawPayload === 'object' &&
        'Trim' in payload.rawPayload &&
        typeof payload.rawPayload.Trim === 'string'
          ? payload.rawPayload.Trim.trim()
          : '';

      if (decodedTrim) {
        setTrim(decodedTrim);
      }

      setDecodedMakerDisplay(decodedMakerName ?? payload.decodedMake ?? null);
      setDecodedModelDisplay(decodedModelName ?? payload.decodedModel ?? null);

      if (decodedMakerId && decodedMakerName) {
        setMakerOptions((current) => {
          const next = current.filter((maker) => maker.id !== decodedMakerId);
          const decodedMaker: VehicleMakerRecord = {
            id: decodedMakerId,
            name: decodedMakerName,
            status: 'active',
            externalSource: payload.source,
            externalId: null,
            createdAt: payload.createdAt,
            updatedAt: payload.updatedAt,
          };
          return [...next, decodedMaker].sort((left, right) => left.name.localeCompare(right.name));
        });
        setSelectedMakerId(decodedMakerId);
      }

      if (decodedModelId && decodedModelName && decodedMakerId) {
        setUseManualModel(false);
        setManualModelName('');
        setSelectedModelId(decodedModelId);
        setPendingDecodedModelId(decodedModelId);
        setModelOptions((current) => {
          const next = current.filter((model) => model.id !== decodedModelId);
          const decodedModel: VehicleModelCatalogRecord = {
            id: decodedModelId,
            makerId: decodedMakerId,
            makerName: decodedMakerName ?? selectedMaker?.name ?? '',
            name: decodedModelName,
            status: 'active',
            externalSource: payload.source,
            externalId: null,
            sourceTypeLabel: payload.vehicleType ?? null,
            vehicleCategory: null,
            createdAt: payload.createdAt,
            updatedAt: payload.updatedAt,
          };
          return [...next, decodedModel].sort((left, right) => left.name.localeCompare(right.name));
        });
      } else if (decodedModelName) {
        setUseManualModel(true);
        setManualModelName(decodedModelName);
      }

      const summary = [
        payload.decodedMake,
        payload.decodedModel,
        payload.decodedModelYear ? String(payload.decodedModelYear) : null,
      ]
        .filter(Boolean)
        .join(' ');

      setVinDecodeMessage(
        summary ? `VIN decoded and applied: ${summary}` : 'VIN decoded successfully.',
      );
    } catch (error) {
      setUseManualModel(true);
      setVinDecodeError(
        sanitizeVehicleCatalogMessage(
          error instanceof Error ? error.message : 'Unable to decode VIN.',
          'VIN decoding is unavailable right now. Enter the make, model, and year manually.',
        ),
      );
    } finally {
      setIsDecodingVin(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add vehicle</CardTitle>
        <CardDescription>
          Start with the fleet and VIN if you have it. Mobiris will help you fill the catalog
          fields, suggest an operator-facing asset code, and keep plate number secondary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Text tone="strong">Identity and ownership</Text>
            <HelperDisclosure summary="Why choose fleet first?">
              Choose the fleet first. VIN decode can then help prefill the core vehicle identity
              fields.
            </HelperDisclosure>
          </div>

          <SearchableSelect
            disabled={!hasFleetOptions || Boolean(fleetError)}
            emptyText="No fleets are available for this organisation yet. Create a fleet first, then return here to assign the vehicle."
            errorText={fleetError}
            inputId="fleetId"
            label="Fleet"
            name="fleetId"
            onChange={setFleetId}
            options={selectableFleetOptions}
            placeholder={
              fleetError
                ? 'Unable to load fleets'
                : hasFleetOptions
                  ? 'Search fleets'
                  : 'No fleets available'
            }
            required
            value={fleetId}
          />
          <div className="-mt-2">
            <HelperDisclosure summary="Fleet selection help">
              {selectableFleetOptions.length === 1
                ? `${selectableFleetOptions[0]?.label ?? 'The only fleet'} has been preselected.`
                : 'Search and select the fleet this record belongs to.'}
            </HelperDisclosure>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantVehicleCode">Organisation vehicle code</Label>
            <Input
              id="tenantVehicleCode"
              name="tenantVehicleCode"
              onChange={(event) => {
                setTenantVehicleCode(event.target.value.toUpperCase());
                setVehicleCodeTouched(true);
              }}
              placeholder="Leave blank to auto-generate, or enter your own code"
              value={tenantVehicleCode}
            />
            <HelperDisclosure summary="Vehicle code help">
              {isLoadingVehicleCodeSuggestion
                ? 'Generating a safe suggested asset code from the selected fleet...'
                : (vehicleCodeSuggestionMessage ??
                  'Mobiris will suggest an operator-facing asset code. You can accept it, edit it, or leave the field blank and let the backend generate one on save.')}
            </HelperDisclosure>
            <Button
              disabled={!fleetId || isLoadingVehicleCodeSuggestion}
              onClick={() => {
                setVehicleCodeTouched(false);
                setTenantVehicleCode('');
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              Use fresh suggestion
            </Button>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="vin">VIN</Label>
            <div className="flex gap-2">
              <Input
                id="vin"
                name="vin"
                onChange={(event) => setVin(event.target.value.toUpperCase())}
                placeholder="JH2KC08108M000001"
                value={vin}
              />
              <Button
                disabled={isDecodingVin || !vin.trim()}
                onClick={() => void handleDecodeVin()}
                type="button"
                variant="secondary"
              >
                {isDecodingVin ? 'Decoding...' : 'Decode VIN'}
              </Button>
            </div>
            {vinDecodeError ? (
              <Text tone="danger">{vinDecodeError}</Text>
            ) : vinDecodeMessage ? (
              <Text tone="success">{vinDecodeMessage}</Text>
            ) : (
              <HelperDisclosure summary="VIN decode help">
                Decode VIN to prefill make, model, year, and trim when vPIC returns them. You can
                still continue manually if VIN is missing or incomplete.
              </HelperDisclosure>
            )}
          </div>

          <div className="space-y-1 md:col-span-2 pt-2">
            <Text tone="strong">Catalog and profile</Text>
            <HelperDisclosure summary="Catalog help">
              Use the local Mobiris catalog as the source of truth. If a maker or model is missing,
              add it inline and continue.
            </HelperDisclosure>
          </div>

          <div className="space-y-2">
            <SearchableSelect
              disabled={!hasMakerOptions || Boolean(vehicleCatalogError)}
              emptyText="No makers are available for this organisation yet. Add one manually or import the vehicle catalog first."
              errorText={vehicleCatalogError}
              inputId="makerId"
              label="Maker"
              onChange={(value) => {
                setSelectedMakerId(value);
                setDecodedMakerDisplay(null);
                setDecodedModelDisplay(null);
                setSelectedModelId('');
                setManualModelName('');
                setUseManualModel(false);
                setPendingDecodedModelId(null);
                setCatalogActionError(null);
                setCatalogActionSuccess(null);
              }}
              options={selectableMakerOptions}
              placeholder={
                vehicleCatalogError
                  ? 'Unable to load makers'
                  : hasMakerOptions
                    ? 'Search makers'
                    : 'No makers available yet'
              }
              required
              displayValue={decodedMakerDisplay ?? undefined}
              value={selectedMakerId}
            />
            {hasMakerOptions ? (
              <HelperDisclosure summary="Maker help">
                Search the local Mobiris maker catalog.
              </HelperDisclosure>
            ) : null}
            <input
              name="make"
              type="hidden"
              value={selectedMaker?.name ?? decodedMakerDisplay ?? ''}
            />
            <Button
              onClick={() => {
                setShowAddMaker((current) => !current);
                setCatalogActionError(null);
                setCatalogActionSuccess(null);
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              Add new maker
            </Button>
            {showAddMaker ? (
              <div className="space-y-2 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-[var(--mobiris-primary-tint)] p-4">
                <Label htmlFor="newMakerName">New maker name</Label>
                <Input
                  id="newMakerName"
                  onChange={(event) => setNewMakerName(event.target.value)}
                  placeholder="Honda"
                  value={newMakerName}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={isSavingMaker}
                    onClick={() => void handleAddMaker()}
                    size="sm"
                    type="button"
                  >
                    {isSavingMaker ? 'Saving...' : 'Save maker'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddMaker(false);
                      setNewMakerName('');
                    }}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <SearchableSelect
              disabled={useManualModel || !selectedMakerId || modelsLoading || !hasModelOptions}
              emptyText="No models are available for this maker yet. Add one manually if the import has not covered it."
              errorText={!selectedMakerId ? null : modelsError}
              inputId="modelId"
              label="Model"
              onChange={(value) => {
                setSelectedModelId(value);
                setDecodedModelDisplay(null);
              }}
              options={selectableModelOptions}
              placeholder={
                !selectedMakerId
                  ? 'Select a maker first'
                  : modelsLoading
                    ? 'Loading models...'
                    : hasModelOptions
                      ? 'Search models'
                      : 'No models available yet'
              }
              required={!useManualModel}
              isLoading={modelsLoading}
              loadingText="Loading models..."
              displayValue={decodedModelDisplay ?? undefined}
              value={selectedModelId}
            />
            <HelperDisclosure summary="Model help">
              {!selectedMakerId
                ? 'Select a maker first to load matching models.'
                : useManualModel
                  ? 'Manual model entry is enabled for this save.'
                  : hasModelOptions
                    ? 'Search models for the selected maker. You can still save now and update the model later.'
                    : 'No models are available for the selected maker yet. Enter one manually, add it to the catalog, or continue and update the model later.'}
            </HelperDisclosure>
            {useManualModel ? (
              <div className="space-y-2">
                <Label htmlFor="manualModelName">Manual model entry</Label>
                <Input
                  id="manualModelName"
                  onChange={(event) => setManualModelName(event.target.value)}
                  placeholder="Enter the vehicle model"
                  value={manualModelName}
                />
              </div>
            ) : null}
            <input name="model" type="hidden" value={resolvedModelName} />
            <Button
              disabled={!selectedMakerId}
              onClick={() => {
                setUseManualModel((current) => !current);
                setCatalogActionError(null);
                setCatalogActionSuccess(null);
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              {useManualModel ? 'Use catalog model' : 'Enter model manually'}
            </Button>
            <Button
              disabled={!selectedMakerId}
              onClick={() => {
                setShowAddModel((current) => !current);
                setCatalogActionError(null);
                setCatalogActionSuccess(null);
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              Add new model to catalog
            </Button>
            {showAddModel ? (
              <div className="space-y-2 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-[var(--mobiris-primary-tint)] p-4">
                <Label htmlFor="newModelName">New model name</Label>
                <Input
                  id="newModelName"
                  onChange={(event) => setNewModelName(event.target.value)}
                  placeholder="CB150R"
                  value={newModelName}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={isSavingModel || !selectedMakerId}
                    onClick={() => void handleAddModel()}
                    size="sm"
                    type="button"
                  >
                    {isSavingModel ? 'Saving...' : 'Save model'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddModel(false);
                      setNewModelName('');
                    }}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trim">Trim</Label>
            <Input
              id="trim"
              name="trim"
              onChange={(event) => setTrim(event.target.value)}
              placeholder="EX-V6"
              value={trim}
            />
            <HelperDisclosure summary="Trim help">
              Optional. The trim is the sub-variant of the model (e.g. EX-L, XLT, base). VIN decode
              will fill it when available.
            </HelperDisclosure>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              max={new Date().getFullYear() + 1}
              min={1980}
              name="year"
              onChange={(event) => setYear(event.target.value)}
              placeholder="2024"
              required
              type="number"
              value={year}
            />
          </div>

          <SearchableSelect
            inputId="vehicleType"
            label="Vehicle type"
            name="vehicleType"
            onChange={setVehicleType}
            options={VEHICLE_TYPE_OPTIONS}
            placeholder="Search vehicle types"
            required
            value={vehicleType}
          />
          <div className="-mt-2">
            <HelperDisclosure summary="Vehicle type help">
              Vehicle type is tracked independently from the selected maker and model.
            </HelperDisclosure>
          </div>

          <div className="space-y-2">
            {useCustomColor ? (
              <>
                <Label htmlFor="customColor">Color</Label>
                <Input
                  id="customColor"
                  name="color"
                  onChange={(event) => setCustomColor(event.target.value)}
                  placeholder="Magenta"
                  value={customColor}
                />
                <HelperDisclosure summary="Custom color help">
                  This is a one-off vehicle color entry. It will not be added to the shared color
                  dropdown list automatically.
                </HelperDisclosure>
              </>
            ) : (
              <SearchableSelect
                inputId="color"
                label="Color"
                name="color"
                onChange={setColor}
                options={COLOR_OPTIONS}
                placeholder="Search colours"
                value={color}
              />
            )}
            {!useCustomColor ? (
              <HelperDisclosure summary="Color help">
                Search common vehicle colours, or switch to a one-off custom color if the list does
                not contain it.
              </HelperDisclosure>
            ) : null}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setUseCustomColor((current) => !current);
                  setColor('');
                  setCustomColor('');
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                {useCustomColor ? 'Use dropdown color' : 'Add one-off custom color'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plate">Plate</Label>
            <Input
              id="plate"
              name="plate"
              onChange={(event) => setPlate(event.target.value.toUpperCase())}
              placeholder="LAG-123-XY"
              value={plate}
            />
            <HelperDisclosure summary="Plate help">
              Optional and secondary. Plate can change over time; Mobiris uses the tenant or system
              vehicle code as the primary identity.
            </HelperDisclosure>
          </div>

          <div className="space-y-1 md:col-span-2 pt-2">
            <Text tone="strong">Commercial and secondary information</Text>
            <HelperDisclosure summary="Commercial fields help">
              Valuation is recorded in the tenant country currency
              {tenantCurrencyCode ? ` (${tenantCurrencyCode})` : ''}. Plate remains optional and
              secondary.
            </HelperDisclosure>
          </div>

          <div className="space-y-2">
            <Label htmlFor="acquisitionCost">
              Acquisition cost{tenantCurrencyCode ? ` (${tenantCurrencyCode})` : ''}
            </Label>
            <Input
              id="acquisitionCost"
              inputMode="decimal"
              name="acquisitionCost"
              onChange={(event) => setAcquisitionCost(event.target.value)}
              placeholder="2,450,000.00"
              value={acquisitionCost}
            />
            {(() => {
              const v = Number.parseFloat(acquisitionCost.replace(/,/g, ''));
              return Number.isFinite(v) && v > 0 ? (
                <Text tone="muted">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: tenantCurrencyCode || 'NGN',
                    minimumFractionDigits: 2,
                  }).format(v)}
                </Text>
              ) : null;
            })()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="acquisitionDate">Acquisition date</Label>
            <Input
              id="acquisitionDate"
              name="acquisitionDate"
              onChange={(event) => setAcquisitionDate(event.target.value)}
              type="date"
              value={acquisitionDate}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentEstimatedValue">
              Current estimated value{tenantCurrencyCode ? ` (${tenantCurrencyCode})` : ''}
            </Label>
            <Input
              id="currentEstimatedValue"
              inputMode="decimal"
              name="currentEstimatedValue"
              onChange={(event) => setCurrentEstimatedValue(event.target.value)}
              placeholder="2,200,000.00"
              value={currentEstimatedValue}
            />
            {(() => {
              const v = Number.parseFloat(currentEstimatedValue.replace(/,/g, ''));
              return Number.isFinite(v) && v > 0 ? (
                <Text tone="muted">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: tenantCurrencyCode || 'NGN',
                    minimumFractionDigits: 2,
                  }).format(v)}
                </Text>
              ) : null;
            })()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="valuationSource">Valuation source</Label>
            <Input
              id="valuationSource"
              name="valuationSource"
              onChange={(event) => setValuationSource(event.target.value)}
              placeholder="operator-estimate"
              value={valuationSource}
            />
            <HelperDisclosure summary="Valuation source help">
              Optional source label for acquisition and estimated value records.
            </HelperDisclosure>
          </div>

          <div className="flex items-end">
            <Button disabled={isSaveDisabled} type="submit">
              {isPending ? 'Saving vehicle...' : 'Save vehicle'}
            </Button>
          </div>
        </form>

        {isSaveDisabled ? (
          <Text className="mt-4" tone="muted">
            Save vehicle is unavailable: {saveBlockingReasons.join(' ')}
          </Text>
        ) : canShowReadyToSave ? (
          <Text className="mt-4" tone="success">
            Vehicle record is ready to save.
          </Text>
        ) : null}

        {catalogActionError ? (
          <Text className="mt-4" tone="danger">
            {catalogActionError}
          </Text>
        ) : null}

        {catalogActionSuccess ? (
          <Text className="mt-4" tone="success">
            {catalogActionSuccess}
          </Text>
        ) : null}

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
