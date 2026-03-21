import { PrismaClient } from '@prisma/client';
import {
  mapExternalTypeLabelToVehicleCategory,
  normalizeVehicleCatalogName,
} from '../vehicle-catalog/vehicle-catalog.utils';
import {
  DEFAULT_VPIC_API_BASE_URL,
  DEFAULT_VPIC_IMPORT_VEHICLE_TYPES,
  VPIC_IMPORT_SOURCE,
  fetchAllVpicMakes,
  fetchVpicMakesForVehicleType,
  fetchVpicModelsForMakeId,
  normalizeExternalName,
  normalizeVpicMakeRecord,
} from '../vehicle-catalog/vpic.client';

interface ImportableMakeRecord {
  makeId: number;
  makeName: string;
  vehicleTypeLabels: Set<string>;
}

function parseVehicleTypes(): string[] {
  const raw = process.env.VPIC_IMPORT_VEHICLE_TYPES;
  if (!raw) {
    return [...DEFAULT_VPIC_IMPORT_VEHICLE_TYPES];
  }

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseOptionalInteger(name: string): number | undefined {
  const raw = process.env[name];
  if (!raw) {
    return undefined;
  }

  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new Error(`Environment variable '${name}' must be an integer.`);
  }

  return value;
}

async function collectScopedMakes(): Promise<ImportableMakeRecord[]> {
  if (process.env.VPIC_IMPORT_ALL_MAKES === 'true') {
    const makes = await fetchAllVpicMakes();
    return makes
      .map(normalizeVpicMakeRecord)
      .filter(
        (
          make,
        ): make is {
          makeId: number;
          makeName: string;
          vehicleTypeName: string | null;
        } => make.makeId !== null && make.makeName !== null,
      )
      .map((make) => ({
        makeId: make.makeId,
        makeName: make.makeName,
        vehicleTypeLabels: new Set<string>(make.vehicleTypeName ? [make.vehicleTypeName] : []),
      }));
  }

  const scopedMakes = new Map<number, ImportableMakeRecord>();
  for (const vehicleType of parseVehicleTypes()) {
    const makes = await fetchVpicMakesForVehicleType(vehicleType);
    for (const record of makes) {
      const normalized = normalizeVpicMakeRecord(record);
      if (normalized.makeId === null || normalized.makeName === null) {
        continue;
      }

      const existing = scopedMakes.get(normalized.makeId);
      if (existing) {
        if (normalized.vehicleTypeName) {
          existing.vehicleTypeLabels.add(normalized.vehicleTypeName);
        }
        continue;
      }

      scopedMakes.set(normalized.makeId, {
        makeId: normalized.makeId,
        makeName: normalized.makeName,
        vehicleTypeLabels: new Set<string>(
          normalized.vehicleTypeName ? [normalized.vehicleTypeName] : [],
        ),
      });
    }
  }

  return [...scopedMakes.values()].sort((left, right) =>
    left.makeName.localeCompare(right.makeName),
  );
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }

  const prisma = new PrismaClient();
  const modelYear = parseOptionalInteger('VPIC_MODEL_YEAR');
  const limitMakes = parseOptionalInteger('VPIC_LIMIT_MAKES');
  let importedMakers = 0;
  let importedModels = 0;

  try {
    const collectedMakes = await collectScopedMakes();
    const makes =
      typeof limitMakes === 'number' ? collectedMakes.slice(0, limitMakes) : collectedMakes;

    for (const make of makes) {
      const maker = await prisma.vehicleMaker.upsert({
        where: {
          normalizedName: normalizeVehicleCatalogName(make.makeName),
        },
        update: {
          name: make.makeName,
          status: 'active',
          externalSource: VPIC_IMPORT_SOURCE,
          externalId: String(make.makeId),
        },
        create: {
          name: make.makeName,
          normalizedName: normalizeVehicleCatalogName(make.makeName),
          status: 'active',
          externalSource: VPIC_IMPORT_SOURCE,
          externalId: String(make.makeId),
        },
      });
      importedMakers += 1;

      const models = await fetchVpicModelsForMakeId(make.makeId, modelYear);
      const categoryHints = [...make.vehicleTypeLabels]
        .map((label) => mapExternalTypeLabelToVehicleCategory(label))
        .filter((value): value is string => Boolean(value));
      const resolvedVehicleCategory = new Set(categoryHints).size === 1 ? categoryHints[0] : null;
      const sourceTypeLabel =
        make.vehicleTypeLabels.size > 0 ? [...make.vehicleTypeLabels].sort().join(' | ') : null;

      for (const model of models) {
        const modelName = normalizeExternalName(model.Model_Name);
        if (!modelName) {
          continue;
        }

        const normalizedName = normalizeVehicleCatalogName(modelName);
        const existing = await prisma.vehicleCatalogModel.findUnique({
          where: {
            makerId_normalizedName: {
              makerId: maker.id,
              normalizedName,
            },
          },
        });

        if (existing) {
          await prisma.vehicleCatalogModel.update({
            where: { id: existing.id },
            data: {
              name: modelName,
              status: 'active',
              externalSource: VPIC_IMPORT_SOURCE,
              externalId: String(model.Model_ID),
              sourceTypeLabel: sourceTypeLabel ?? existing.sourceTypeLabel,
              vehicleCategory: resolvedVehicleCategory ?? existing.vehicleCategory ?? null,
            },
          });
        } else {
          await prisma.vehicleCatalogModel.create({
            data: {
              makerId: maker.id,
              name: modelName,
              normalizedName,
              status: 'active',
              externalSource: VPIC_IMPORT_SOURCE,
              externalId: String(model.Model_ID),
              sourceTypeLabel,
              vehicleCategory: resolvedVehicleCategory ?? null,
            },
          });
        }

        importedModels += 1;
      }
    }

    console.log(
      JSON.stringify(
        {
          message: 'Vehicle catalog import completed.',
          importedMakers,
          importedModels,
          source: process.env.VPIC_API_BASE_URL ?? DEFAULT_VPIC_API_BASE_URL,
          importVehicleTypes:
            process.env.VPIC_IMPORT_ALL_MAKES === 'true' ? ['all'] : parseVehicleTypes(),
          modelYear: modelYear ?? null,
          limitMakes: limitMakes ?? null,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`import-vehicle-catalog failed: ${message}`);
  process.exit(1);
});
