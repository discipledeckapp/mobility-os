import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, VehicleCatalogModel, VehicleMaker, VehicleVinDecode } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CreateVehicleMakerDto } from './dto/create-vehicle-maker.dto';
import type { CreateVehicleModelDto } from './dto/create-vehicle-model.dto';
import type { DecodeVehicleVinDto } from './dto/decode-vehicle-vin.dto';
import { mapVehicleTypeSlugToCategory, normalizeVehicleCatalogName } from './vehicle-catalog.utils';
import { VPIC_IMPORT_SOURCE, decodeVinWithVpic } from './vpic.client';

type VehicleModelWithMaker = VehicleCatalogModel & {
  maker: Pick<VehicleMaker, 'id' | 'name'>;
};

type VehicleVinDecodeWithRelations = VehicleVinDecode & {
  maker: Pick<VehicleMaker, 'id' | 'name'> | null;
  model:
    | (Pick<VehicleCatalogModel, 'id' | 'name' | 'makerId'> & {
        maker: Pick<VehicleMaker, 'id' | 'name'>;
      })
    | null;
};

export interface VehicleCatalogModelRecord extends VehicleCatalogModel {
  makerName: string;
}

export interface VehicleVinDecodeRecord extends VehicleVinDecode {
  makerName: string | null;
  modelName: string | null;
}

function toVehicleCatalogModelRecord(model: VehicleModelWithMaker): VehicleCatalogModelRecord {
  return {
    ...model,
    makerName: model.maker.name,
  };
}

function toVehicleVinDecodeRecord(decode: VehicleVinDecodeWithRelations): VehicleVinDecodeRecord {
  return {
    ...decode,
    makerName: decode.maker?.name ?? null,
    modelName: decode.model?.name ?? null,
  };
}

@Injectable()
export class VehicleCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listMakers(q?: string): Promise<VehicleMaker[]> {
    return this.prisma.vehicleMaker.findMany({
      where: {
        status: 'active',
        ...(q
          ? {
              name: {
                contains: q.trim(),
                mode: 'insensitive',
              },
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async listModels(input: {
    makerId?: string;
    q?: string;
    vehicleType?: string;
  }): Promise<VehicleCatalogModelRecord[]> {
    const vehicleCategory = mapVehicleTypeSlugToCategory(input.vehicleType);
    const where: Prisma.VehicleCatalogModelWhereInput = {
      status: 'active',
      ...(input.makerId ? { makerId: input.makerId } : {}),
      ...(input.q
        ? {
            name: {
              contains: input.q.trim(),
              mode: 'insensitive',
            },
          }
        : {}),
      ...(vehicleCategory
        ? {
            OR: [{ vehicleCategory }, { vehicleCategory: null }],
          }
        : {}),
    };

    const models = await this.prisma.vehicleCatalogModel.findMany({
      where,
      include: {
        maker: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ maker: { name: 'asc' } }, { name: 'asc' }],
    });

    return models.map(toVehicleCatalogModelRecord);
  }

  async createMaker(dto: CreateVehicleMakerDto): Promise<VehicleMaker> {
    return this.upsertMaker({
      name: dto.name,
      status: 'active',
    });
  }

  async createModel(dto: CreateVehicleModelDto): Promise<VehicleCatalogModelRecord> {
    const maker = await this.prisma.vehicleMaker.findUnique({
      where: { id: dto.makerId },
      select: { id: true, name: true, status: true },
    });

    if (!maker) {
      throw new NotFoundException(`Vehicle maker '${dto.makerId}' not found`);
    }

    if (maker.status !== 'active') {
      throw new ConflictException(`Vehicle maker '${maker.name}' is not active`);
    }

    const name = dto.name.trim().replace(/\s+/g, ' ');
    const normalizedName = normalizeVehicleCatalogName(name);
    const vehicleCategory = dto.vehicleType
      ? mapVehicleTypeSlugToCategory(dto.vehicleType)
      : undefined;

    return this.upsertModel({
      makerId: dto.makerId,
      name,
      normalizedName,
      status: 'active',
      ...(vehicleCategory ? { vehicleCategory } : {}),
    });
  }

  async decodeVin(dto: DecodeVehicleVinDto): Promise<VehicleVinDecodeRecord> {
    const vin = dto.vin.trim().toUpperCase();
    const normalizedVin = vin.replace(/[^A-Z0-9]/g, '');
    const decodeKey = `${normalizedVin}:${dto.modelYear ?? 'none'}`;
    const decoded = await decodeVinWithVpic(vin, dto.modelYear);

    let makerId: string | null = null;
    let modelId: string | null = null;

    if (decoded.makeName) {
      const maker = await this.upsertMaker({
        name: decoded.makeName,
        status: 'active',
        externalSource: VPIC_IMPORT_SOURCE,
      });
      makerId = maker.id;

      if (decoded.modelName) {
        const model = await this.upsertModel({
          makerId: maker.id,
          name: decoded.modelName,
          normalizedName: normalizeVehicleCatalogName(decoded.modelName),
          status: 'active',
          externalSource: VPIC_IMPORT_SOURCE,
          vehicleCategory: decoded.vehicleCategory,
        });
        modelId = model.id;
      }
    }

    const upserted = await this.prisma.vehicleVinDecode.upsert({
      where: {
        decodeKey,
      },
      update: {
        vin,
        decodeKey,
        status: decoded.errorCode === '0' ? 'decoded' : 'partial',
        source: VPIC_IMPORT_SOURCE,
        sourceVersion: decoded.sourceVersion,
        errorCode: decoded.errorCode,
        errorText: decoded.errorText,
        rawPayload: decoded.raw as Prisma.InputJsonValue,
        decodedMake: decoded.makeName,
        decodedModel: decoded.modelName,
        decodedModelYear: decoded.modelYear,
        vehicleType: decoded.vehicleTypeLabel,
        bodyClass: decoded.bodyClass,
        manufacturerName: decoded.manufacturerName,
        makerId,
        modelId,
      },
      create: {
        vin,
        normalizedVin,
        decodeKey,
        requestedModelYear: dto.modelYear ?? null,
        status: decoded.errorCode === '0' ? 'decoded' : 'partial',
        source: VPIC_IMPORT_SOURCE,
        sourceVersion: decoded.sourceVersion,
        errorCode: decoded.errorCode,
        errorText: decoded.errorText,
        rawPayload: decoded.raw as Prisma.InputJsonValue,
        decodedMake: decoded.makeName,
        decodedModel: decoded.modelName,
        decodedModelYear: decoded.modelYear,
        vehicleType: decoded.vehicleTypeLabel,
        bodyClass: decoded.bodyClass,
        manufacturerName: decoded.manufacturerName,
        makerId,
        modelId,
      },
    });
    const hydrated = await this.prisma.vehicleVinDecode.findUniqueOrThrow({
      where: { id: upserted.id },
      include: {
        maker: {
          select: { id: true, name: true },
        },
        model: {
          select: {
            id: true,
            name: true,
            makerId: true,
            maker: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return toVehicleVinDecodeRecord(hydrated);
  }

  async upsertMaker(input: {
    name: string;
    status?: string;
    externalSource?: string | null;
    externalId?: string | null;
  }): Promise<VehicleMaker> {
    const name = input.name.trim().replace(/\s+/g, ' ');
    const normalizedName = normalizeVehicleCatalogName(name);

    const existing = await this.prisma.vehicleMaker.findUnique({
      where: { normalizedName },
    });

    if (existing) {
      return this.prisma.vehicleMaker.update({
        where: { id: existing.id },
        data: {
          name,
          status: input.status ?? 'active',
          ...(input.externalSource !== undefined ? { externalSource: input.externalSource } : {}),
          ...(input.externalId !== undefined ? { externalId: input.externalId } : {}),
        },
      });
    }

    return this.prisma.vehicleMaker.create({
      data: {
        name,
        normalizedName,
        status: input.status ?? 'active',
        externalSource: input.externalSource ?? null,
        externalId: input.externalId ?? null,
      },
    });
  }

  async upsertModel(input: {
    makerId: string;
    name: string;
    normalizedName?: string;
    status?: string;
    externalSource?: string | null;
    externalId?: string | null;
    vehicleCategory?: string | null;
    sourceTypeLabel?: string | null;
  }): Promise<VehicleCatalogModelRecord> {
    const name = input.name.trim().replace(/\s+/g, ' ');
    const normalizedName = input.normalizedName ?? normalizeVehicleCatalogName(name);

    const existing = await this.prisma.vehicleCatalogModel.findUnique({
      where: {
        makerId_normalizedName: {
          makerId: input.makerId,
          normalizedName,
        },
      },
      include: {
        maker: {
          select: { id: true, name: true },
        },
      },
    });

    if (existing) {
      const updated = await this.prisma.vehicleCatalogModel.update({
        where: { id: existing.id },
        data: {
          name,
          status: input.status ?? 'active',
          ...(input.externalSource !== undefined ? { externalSource: input.externalSource } : {}),
          ...(input.externalId !== undefined ? { externalId: input.externalId } : {}),
          ...(input.sourceTypeLabel !== undefined
            ? { sourceTypeLabel: input.sourceTypeLabel }
            : {}),
          vehicleCategory: input.vehicleCategory ?? existing.vehicleCategory ?? null,
        },
        include: {
          maker: {
            select: { id: true, name: true },
          },
        },
      });
      return toVehicleCatalogModelRecord(updated);
    }

    const created = await this.prisma.vehicleCatalogModel.create({
      data: {
        makerId: input.makerId,
        name,
        normalizedName,
        status: input.status ?? 'active',
        externalSource: input.externalSource ?? null,
        externalId: input.externalId ?? null,
        sourceTypeLabel: input.sourceTypeLabel ?? null,
        vehicleCategory: input.vehicleCategory ?? null,
      },
      include: {
        maker: {
          select: { id: true, name: true },
        },
      },
    });
    return toVehicleCatalogModelRecord(created);
  }
}
