import { mapExternalTypeLabelToVehicleCategory } from './vehicle-catalog.utils';

export const DEFAULT_VPIC_API_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';
export const VPIC_IMPORT_SOURCE = 'nhtsa-vpic';
export const DEFAULT_VPIC_IMPORT_VEHICLE_TYPES = [
  'car',
  'multipurpose passenger vehicle (mpv)',
  'truck',
  'bus',
  'motorcycle',
] as const;

interface VpicResponseEnvelope<T> {
  Count: number;
  Message: string;
  SearchCriteria: string | null;
  Results: T[];
}

export interface VpicMakeRecord {
  Make_ID?: number;
  Make_Name?: string;
  MakeId?: number;
  MakeName?: string;
  VehicleTypeId?: number;
  VehicleTypeName?: string;
}

export interface VpicModelRecord {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}

export interface VpicDecodeResult {
  Make?: string;
  Model?: string;
  ModelYear?: string;
  ErrorCode?: string;
  ErrorText?: string;
  VehicleType?: string;
  BodyClass?: string;
  Manufacturer?: string;
  ManufacturerName?: string;
  [key: string]: string | undefined;
}

export interface DecodedVpicVinRecord {
  raw: VpicDecodeResult;
  sourceVersion: string | null;
  makeName: string | null;
  modelName: string | null;
  modelYear: number | null;
  errorCode: string | null;
  errorText: string | null;
  vehicleTypeLabel: string | null;
  vehicleCategory: string | null;
  bodyClass: string | null;
  manufacturerName: string | null;
}

function getBaseUrl(): string {
  return process.env.VPIC_API_BASE_URL ?? DEFAULT_VPIC_API_BASE_URL;
}

async function fetchVpicEnvelope<T>(path: string): Promise<VpicResponseEnvelope<T>> {
  const response = await fetch(`${getBaseUrl()}${path}`);

  if (!response.ok) {
    throw new Error(
      `vPIC request failed for '${path}' from '${getBaseUrl()}' with status ${response.status}`,
    );
  }

  return (await response.json()) as VpicResponseEnvelope<T>;
}

export async function fetchVpicMakesForVehicleType(vehicleType: string): Promise<VpicMakeRecord[]> {
  const envelope = await fetchVpicEnvelope<VpicMakeRecord>(
    `/GetMakesForVehicleType/${encodeURIComponent(vehicleType)}?format=json`,
  );
  return envelope.Results;
}

export async function fetchAllVpicMakes(): Promise<VpicMakeRecord[]> {
  const envelope = await fetchVpicEnvelope<VpicMakeRecord>('/GetAllMakes?format=json');
  return envelope.Results;
}

export async function fetchVpicModelsForMakeId(
  makeId: number,
  modelYear?: number,
): Promise<VpicModelRecord[]> {
  const path = modelYear
    ? `/GetModelsForMakeIdYear/makeId/${encodeURIComponent(String(makeId))}/modelyear/${encodeURIComponent(String(modelYear))}?format=json`
    : `/GetModelsForMakeId/${encodeURIComponent(String(makeId))}?format=json`;
  const envelope = await fetchVpicEnvelope<VpicModelRecord>(path);
  return envelope.Results;
}

export async function decodeVinWithVpic(
  vin: string,
  modelYear?: number,
): Promise<DecodedVpicVinRecord> {
  const yearSegment = modelYear ? `/${encodeURIComponent(String(modelYear))}` : '';
  const envelope = await fetchVpicEnvelope<VpicDecodeResult>(
    `/DecodeVinValues/${encodeURIComponent(vin)}${yearSegment}?format=json`,
  );
  const result = envelope.Results[0] ?? {};
  const modelYearValue = Number(result.ModelYear);

  return {
    raw: result,
    sourceVersion: envelope.Message ?? null,
    makeName: normalizeExternalName(result.Make),
    modelName: normalizeExternalName(result.Model),
    modelYear: Number.isInteger(modelYearValue) ? modelYearValue : null,
    errorCode: normalizeExternalName(result.ErrorCode),
    errorText: normalizeExternalName(result.ErrorText),
    vehicleTypeLabel: normalizeExternalName(result.VehicleType),
    vehicleCategory: mapExternalTypeLabelToVehicleCategory(result.VehicleType),
    bodyClass: normalizeExternalName(result.BodyClass),
    manufacturerName: normalizeExternalName(result.ManufacturerName ?? result.Manufacturer),
  };
}

export function normalizeExternalName(value?: string | null): string | null {
  const next = value?.trim().replace(/\s+/g, ' ');
  return next ? next : null;
}

export function normalizeVpicMakeRecord(make: VpicMakeRecord): {
  makeId: number | null;
  makeName: string | null;
  vehicleTypeName: string | null;
} {
  return {
    makeId: make.Make_ID ?? make.MakeId ?? null,
    makeName: normalizeExternalName(make.Make_Name ?? make.MakeName),
    vehicleTypeName: normalizeExternalName(make.VehicleTypeName),
  };
}
