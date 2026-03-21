import { PrismaClient } from '@prisma/client';
import { normalizeVehicleCatalogName } from '../vehicle-catalog/vehicle-catalog.utils';

const SEED_SOURCE = 'nhtsa-vpic';
const SEED_SOURCE_VERSION = 'local-ui-seed-100';

type SeedCatalogItem = {
  makerName: string;
  modelName: string;
  vehicleCategory: string;
  vehicleType: string;
  bodyClass: string;
};

const SEED_CATALOG: SeedCatalogItem[] = [
  {
    makerName: 'Honda',
    modelName: 'Accord',
    vehicleCategory: 'car',
    vehicleType: 'Passenger Car',
    bodyClass: 'Sedan/Saloon',
  },
  {
    makerName: 'Toyota',
    modelName: 'Camry',
    vehicleCategory: 'car',
    vehicleType: 'Passenger Car',
    bodyClass: 'Sedan/Saloon',
  },
  {
    makerName: 'Lexus',
    modelName: 'RX 350',
    vehicleCategory: 'car',
    vehicleType: 'Multipurpose Passenger Vehicle',
    bodyClass: 'Sport Utility Vehicle (SUV)',
  },
  {
    makerName: 'Ford',
    modelName: 'Escape',
    vehicleCategory: 'car',
    vehicleType: 'Multipurpose Passenger Vehicle',
    bodyClass: 'Sport Utility Vehicle (SUV)',
  },
  {
    makerName: 'Hyundai',
    modelName: 'Elantra',
    vehicleCategory: 'car',
    vehicleType: 'Passenger Car',
    bodyClass: 'Sedan/Saloon',
  },
  {
    makerName: 'Kia',
    modelName: 'Sportage',
    vehicleCategory: 'car',
    vehicleType: 'Multipurpose Passenger Vehicle',
    bodyClass: 'Sport Utility Vehicle (SUV)',
  },
  {
    makerName: 'Mercedes-Benz',
    modelName: 'C 300',
    vehicleCategory: 'car',
    vehicleType: 'Passenger Car',
    bodyClass: 'Sedan/Saloon',
  },
  {
    makerName: 'BMW',
    modelName: 'X5',
    vehicleCategory: 'car',
    vehicleType: 'Multipurpose Passenger Vehicle',
    bodyClass: 'Sport Utility Vehicle (SUV)',
  },
  {
    makerName: 'Nissan',
    modelName: 'Altima',
    vehicleCategory: 'car',
    vehicleType: 'Passenger Car',
    bodyClass: 'Sedan/Saloon',
  },
  {
    makerName: 'Chevrolet',
    modelName: 'Equinox',
    vehicleCategory: 'car',
    vehicleType: 'Multipurpose Passenger Vehicle',
    bodyClass: 'Sport Utility Vehicle (SUV)',
  },
];

function buildSeedVin(serial: number): string {
  return `MOB${String(serial).padStart(14, '0')}`;
}

function buildModelYear(serial: number): number {
  return 2015 + (serial % 10);
}

function buildTrim(serial: number): string {
  return ['Base', 'Sport', 'Limited', 'Premium'][serial % 4] ?? 'Base';
}

function buildManufacturerName(makerName: string): string {
  return makerName.toUpperCase();
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }

  const prisma = new PrismaClient();

  try {
    let seededCount = 0;

    for (let serial = 1; serial <= 100; serial += 1) {
      const seed = SEED_CATALOG[(serial - 1) % SEED_CATALOG.length];
      if (!seed) {
        continue;
      }
      const vin = buildSeedVin(serial);
      const normalizedVin = vin;
      const decodeKey = `${normalizedVin}:none`;
      const modelYear = buildModelYear(serial);
      const trim = buildTrim(serial);

      const maker = await prisma.vehicleMaker.upsert({
        where: {
          normalizedName: normalizeVehicleCatalogName(seed.makerName),
        },
        update: {
          name: seed.makerName,
          status: 'active',
          externalSource: SEED_SOURCE,
        },
        create: {
          name: seed.makerName,
          normalizedName: normalizeVehicleCatalogName(seed.makerName),
          status: 'active',
          externalSource: SEED_SOURCE,
        },
      });

      const model = await prisma.vehicleCatalogModel.upsert({
        where: {
          makerId_normalizedName: {
            makerId: maker.id,
            normalizedName: normalizeVehicleCatalogName(seed.modelName),
          },
        },
        update: {
          name: seed.modelName,
          status: 'active',
          vehicleCategory: seed.vehicleCategory,
          externalSource: SEED_SOURCE,
        },
        create: {
          makerId: maker.id,
          name: seed.modelName,
          normalizedName: normalizeVehicleCatalogName(seed.modelName),
          status: 'active',
          vehicleCategory: seed.vehicleCategory,
          externalSource: SEED_SOURCE,
        },
      });

      const rawPayload = {
        VIN: vin,
        Make: seed.makerName.toUpperCase(),
        Model: seed.modelName,
        ModelYear: String(modelYear),
        Trim: trim,
        VehicleType: seed.vehicleType,
        BodyClass: seed.bodyClass,
        ManufacturerName: buildManufacturerName(seed.makerName),
        ErrorCode: '0',
        ErrorText: '0 - Seeded local UI fixture',
      };

      await prisma.vehicleVinDecode.upsert({
        where: { decodeKey },
        update: {
          vin,
          normalizedVin,
          requestedModelYear: null,
          status: 'decoded',
          source: SEED_SOURCE,
          sourceVersion: SEED_SOURCE_VERSION,
          errorCode: '0',
          errorText: '0 - Seeded local UI fixture',
          rawPayload,
          decodedMake: seed.makerName.toUpperCase(),
          decodedModel: seed.modelName,
          decodedModelYear: modelYear,
          vehicleType: seed.vehicleType,
          bodyClass: seed.bodyClass,
          manufacturerName: buildManufacturerName(seed.makerName),
          makerId: maker.id,
          modelId: model.id,
        },
        create: {
          vin,
          normalizedVin,
          decodeKey,
          requestedModelYear: null,
          status: 'decoded',
          source: SEED_SOURCE,
          sourceVersion: SEED_SOURCE_VERSION,
          errorCode: '0',
          errorText: '0 - Seeded local UI fixture',
          rawPayload,
          decodedMake: seed.makerName.toUpperCase(),
          decodedModel: seed.modelName,
          decodedModelYear: modelYear,
          vehicleType: seed.vehicleType,
          bodyClass: seed.bodyClass,
          manufacturerName: buildManufacturerName(seed.makerName),
          makerId: maker.id,
          modelId: model.id,
        },
      });

      seededCount += 1;
    }

    console.log(
      JSON.stringify(
        {
          message: 'Vehicle VIN decode fixtures seeded successfully.',
          seededCount,
          sourceVersion: SEED_SOURCE_VERSION,
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
  console.error(`seed-vehicle-vin-decodes failed: ${message}`);
  process.exit(1);
});
