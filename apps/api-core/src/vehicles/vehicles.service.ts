import { VEHICLE_STATUS_CODES, getCountryConfig, getVehicleType } from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Vehicle, type VehicleValuation } from '@prisma/client';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CreateVehicleDto } from './dto/create-vehicle.dto';
import type { UpdateVehicleDto } from './dto/update-vehicle.dto';

const VEHICLE_CODE_RETRY_LIMIT = 5;

type VehicleDetail = Vehicle & {
  fleetName: string;
  operatingUnitName: string;
  businessEntityName: string;
  valuations: VehicleValuation[];
  assignmentSummary: {
    totalAssignments: number;
    activeAssignments: number;
    latestAssignmentId?: string | null;
    latestAssignmentStatus?: string | null;
    latestAssignmentStartedAt?: Date | null;
  };
  maintenanceSummary: string;
  latestVinDecode?: {
    id: string;
    decodedMake?: string | null;
    decodedModel?: string | null;
    decodedModelYear?: number | null;
    vehicleType?: string | null;
    bodyClass?: string | null;
    createdAt: Date;
  } | null;
};

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    tenantId: string,
    input: { fleetId?: string; page?: number; limit?: number } = {},
  ): Promise<PaginatedResponse<Vehicle>> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const where = {
      tenantId,
      ...(input.fleetId ? { fleetId: input.fleetId } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(tenantId: string, id: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(vehicle.tenantId), asTenantId(tenantId));

    return vehicle;
  }

  async findOneDetailed(tenantId: string, id: string): Promise<VehicleDetail> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        fleet: {
          include: {
            operatingUnit: {
              include: {
                businessEntity: true,
              },
            },
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(vehicle.tenantId), asTenantId(tenantId));

    const [valuations, latestAssignment, totalAssignments, activeAssignments, latestVinDecode] =
      await Promise.all([
        this.prisma.vehicleValuation.findMany({
          where: { vehicleId: vehicle.id },
          orderBy: [{ valuationDate: 'desc' }, { createdAt: 'desc' }],
        }),
        this.prisma.assignment.findFirst({
          where: { tenantId, vehicleId: vehicle.id },
          orderBy: { startedAt: 'desc' },
          select: { id: true, status: true, startedAt: true },
        }),
        this.prisma.assignment.count({
          where: { tenantId, vehicleId: vehicle.id },
        }),
        this.prisma.assignment.count({
          where: {
            tenantId,
            vehicleId: vehicle.id,
            status: { in: ['assigned', 'active'] },
          },
        }),
        vehicle.vin
          ? this.prisma.vehicleVinDecode.findFirst({
              where: {
                normalizedVin: this.normalizeVin(vehicle.vin),
              },
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                decodedMake: true,
                decodedModel: true,
                decodedModelYear: true,
                vehicleType: true,
                bodyClass: true,
                createdAt: true,
              },
            })
          : Promise.resolve(null),
      ]);

    return {
      ...vehicle,
      fleetName: vehicle.fleet.name,
      operatingUnitName: vehicle.fleet.operatingUnit.name,
      businessEntityName: vehicle.fleet.operatingUnit.businessEntity.name,
      valuations,
      assignmentSummary: {
        totalAssignments,
        activeAssignments,
        latestAssignmentId: latestAssignment?.id ?? null,
        latestAssignmentStatus: latestAssignment?.status ?? null,
        latestAssignmentStartedAt: latestAssignment?.startedAt ?? null,
      },
      maintenanceSummary:
        'Maintenance timeline will be surfaced here once inspections and work orders are wired into the vehicle domain.',
      latestVinDecode,
    };
  }

  async suggestTenantVehicleCode(
    tenantId: string,
    fleetId: string,
  ): Promise<{ suggestedTenantVehicleCode: string; prefix: string }> {
    const context = await this.getVehicleCodeContext(tenantId, fleetId);
    const prefix = this.buildVehicleCodePrefix(context.fleet.name || context.businessEntity.name);
    const nextSerial = await this.getNextVehicleCodeSerial(tenantId, prefix, 'tenant');

    return {
      suggestedTenantVehicleCode: this.formatVehicleCode(prefix, nextSerial),
      prefix,
    };
  }

  async create(tenantId: string, dto: CreateVehicleDto): Promise<Vehicle> {
    getVehicleType(dto.vehicleType);

    this.assertValuationInputConsistency(dto);

    const fleetContext = await this.getVehicleCodeContext(tenantId, dto.fleetId);
    const normalizedPlate = this.normalizeOptionalPlate(dto.plate);
    const normalizedVin = this.normalizeOptionalVin(dto.vin);
    const normalizedTenantVehicleCode = this.normalizeTenantVehicleCode(dto.tenantVehicleCode);

    await this.assertVehicleUniqueness({
      tenantId,
      ...(normalizedTenantVehicleCode ? { tenantVehicleCode: normalizedTenantVehicleCode } : {}),
      ...(normalizedPlate !== undefined ? { plate: normalizedPlate } : {}),
      ...(normalizedVin !== undefined ? { vin: normalizedVin } : {}),
    });

    const systemPrefix = this.buildSystemVehicleCodePrefix(fleetContext.businessEntity.name);
    const tenantPrefix = this.buildVehicleCodePrefix(fleetContext.fleet.name);

    for (let attempt = 0; attempt < VEHICLE_CODE_RETRY_LIMIT; attempt += 1) {
      const generatedTenantVehicleCode =
        normalizedTenantVehicleCode ??
        this.formatVehicleCode(
          tenantPrefix,
          await this.getNextVehicleCodeSerial(tenantId, tenantPrefix, 'tenant'),
        );
      const generatedSystemVehicleCode = this.formatVehicleCode(
        systemPrefix,
        await this.getNextVehicleCodeSerial(tenantId, systemPrefix, 'system'),
      );

      try {
        return await this.prisma.$transaction(async (tx) => {
          const tenant = await tx.tenant.findUnique({
            where: { id: tenantId },
            select: { country: true },
          });
          const tenantCurrency = tenant ? getCountryConfig(tenant.country).currency : null;

          const vehicle = await tx.vehicle.create({
            data: {
              tenantId,
              fleetId: dto.fleetId,
              operatingUnitId: fleetContext.operatingUnit.id,
              businessEntityId: fleetContext.businessEntity.id,
              systemVehicleCode: generatedSystemVehicleCode,
              tenantVehicleCode: generatedTenantVehicleCode,
              vehicleType: dto.vehicleType,
              make: dto.make.trim(),
              model: dto.model.trim(),
              trim: this.normalizeOptionalText(dto.trim),
              year: dto.year,
              plate: normalizedPlate ?? null,
              color: this.normalizeOptionalText(dto.color),
              vin: normalizedVin ?? null,
              status: 'available',
            },
          });

          await this.createVehicleValuations(tx, {
            tenantId,
            vehicleId: vehicle.id,
            businessEntityCurrency: tenantCurrency,
            ...(dto.acquisitionCostMinorUnits !== undefined
              ? { acquisitionCostMinorUnits: dto.acquisitionCostMinorUnits }
              : {}),
            ...(dto.acquisitionDate !== undefined ? { acquisitionDate: dto.acquisitionDate } : {}),
            ...(dto.currentEstimatedValueMinorUnits !== undefined
              ? {
                  currentEstimatedValueMinorUnits: dto.currentEstimatedValueMinorUnits,
                }
              : {}),
            ...(dto.valuationSource !== undefined ? { valuationSource: dto.valuationSource } : {}),
          });

          return vehicle;
        });
      } catch (error) {
        if (this.isPrismaUniqueError(error)) {
          const target = this.getPrismaErrorTarget(error);
          if (target.includes('tenantVehicleCode') && normalizedTenantVehicleCode) {
            throw new ConflictException(
              `Vehicle code '${generatedTenantVehicleCode}' is already in use in this organisation.`,
            );
          }

          if (target.includes('plate') && normalizedPlate) {
            throw new ConflictException(
              `Plate number '${normalizedPlate}' is already linked to another vehicle in this organisation.`,
            );
          }

          if (target.includes('vin') && normalizedVin) {
            throw new ConflictException(
              `VIN '${normalizedVin}' is already linked to another vehicle in this organisation.`,
            );
          }

          if (target.includes('systemVehicleCode') || target.includes('tenantVehicleCode')) {
            continue;
          }
        }

        throw error;
      }
    }

    throw new ConflictException(
      'Unable to allocate a unique vehicle code after multiple attempts. Retry the request.',
    );
  }

  async update(tenantId: string, id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(tenantId, id);
    this.assertValuationInputConsistency(dto);

    const nextTenantVehicleCode = this.normalizeTenantVehicleCode(dto.tenantVehicleCode);
    const nextPlate = this.normalizeOptionalPlate(dto.plate);
    const nextVin = this.normalizeOptionalVin(dto.vin);

    if (nextTenantVehicleCode && nextTenantVehicleCode !== vehicle.tenantVehicleCode) {
      await this.assertVehicleUniqueness({
        tenantId,
        tenantVehicleCode: nextTenantVehicleCode,
      });
    }

    if (nextPlate !== undefined && nextPlate !== vehicle.plate) {
      await this.assertVehicleUniqueness({
        tenantId,
        plate: nextPlate,
      });
    }

    if (nextVin !== undefined && nextVin !== vehicle.vin) {
      await this.assertVehicleUniqueness({
        tenantId,
        vin: nextVin,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedVehicle = await tx.vehicle.update({
        where: { id: vehicle.id },
        data: {
          tenantVehicleCode: nextTenantVehicleCode ?? vehicle.tenantVehicleCode,
          plate: nextPlate === undefined ? vehicle.plate : nextPlate,
          vin: nextVin === undefined ? vehicle.vin : nextVin,
          color: dto.color === undefined ? vehicle.color : this.normalizeOptionalText(dto.color),
          year: dto.year ?? vehicle.year,
        },
      });

      const hasValuationUpdate =
        dto.acquisitionCostMinorUnits !== undefined ||
        dto.acquisitionDate !== undefined ||
        dto.currentEstimatedValueMinorUnits !== undefined ||
        dto.valuationSource !== undefined;

      if (hasValuationUpdate) {
        const tenant = await tx.tenant.findUnique({
          where: { id: tenantId },
          select: { country: true },
        });
        const tenantCurrency = tenant ? getCountryConfig(tenant.country).currency : null;

        await this.updateVehicleValuations(tx, {
          tenantId,
          vehicleId: vehicle.id,
          businessEntityCurrency: tenantCurrency,
          ...(dto.acquisitionCostMinorUnits !== undefined
            ? { acquisitionCostMinorUnits: dto.acquisitionCostMinorUnits }
            : {}),
          ...(dto.acquisitionDate !== undefined ? { acquisitionDate: dto.acquisitionDate } : {}),
          ...(dto.currentEstimatedValueMinorUnits !== undefined
            ? {
                currentEstimatedValueMinorUnits: dto.currentEstimatedValueMinorUnits,
              }
            : {}),
          ...(dto.valuationSource !== undefined ? { valuationSource: dto.valuationSource } : {}),
        });
      }

      return updatedVehicle;
    });
  }

  async updateStatus(tenantId: string, id: string, newStatus: string): Promise<Vehicle> {
    const vehicle = await this.findOne(tenantId, id);

    const statusKey = newStatus as keyof typeof VEHICLE_STATUS_CODES;
    const statusConfig = VEHICLE_STATUS_CODES[statusKey];
    if (!statusConfig) {
      const valid = Object.keys(VEHICLE_STATUS_CODES).join(', ');
      throw new BadRequestException(
        `Invalid vehicle status '${newStatus}'. Valid values: ${valid}`,
      );
    }

    const currentConfig = VEHICLE_STATUS_CODES[vehicle.status as keyof typeof VEHICLE_STATUS_CODES];
    if (currentConfig?.terminal) {
      throw new BadRequestException(
        `Vehicle '${id}' is in terminal status '${vehicle.status}' and cannot be transitioned`,
      );
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  private async getVehicleCodeContext(tenantId: string, fleetId: string) {
    const fleet = await this.prisma.fleet.findUnique({
      where: { id: fleetId },
      include: {
        operatingUnit: {
          include: {
            businessEntity: true,
          },
        },
      },
    });

    if (!fleet) {
      throw new NotFoundException(`Fleet '${fleetId}' not found`);
    }

    assertTenantOwnership(asTenantId(fleet.tenantId), asTenantId(tenantId));

    if (fleet.status !== 'active') {
      throw new BadRequestException(
        `Cannot add a vehicle to fleet '${fleetId}' with status '${fleet.status}'`,
      );
    }

    return {
      fleet,
      operatingUnit: fleet.operatingUnit,
      businessEntity: fleet.operatingUnit.businessEntity,
    };
  }

  private async getNextVehicleCodeSerial(
    tenantId: string,
    prefix: string,
    codeKind: 'tenant' | 'system',
  ): Promise<number> {
    const field = codeKind === 'tenant' ? 'tenantVehicleCode' : 'systemVehicleCode';
    const records = await this.prisma.vehicle.findMany({
      where: {
        tenantId,
        [field]: {
          startsWith: `${prefix}-`,
        },
      },
      select: {
        tenantVehicleCode: true,
        systemVehicleCode: true,
      },
    });

    const highest = records.reduce((maxValue, record) => {
      const rawCode = codeKind === 'tenant' ? record.tenantVehicleCode : record.systemVehicleCode;
      if (!rawCode) {
        return maxValue;
      }

      const match = rawCode.match(/-(\d{1,})$/);
      if (!match) {
        return maxValue;
      }

      const serial = Number(match[1]);
      return Number.isFinite(serial) ? Math.max(maxValue, serial) : maxValue;
    }, 0);

    return highest + 1;
  }

  private buildVehicleCodePrefix(name: string): string {
    const tokens = name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (tokens.length === 0) {
      return 'ASSET';
    }

    if (tokens[0] === 'FLEET' && tokens[1]) {
      return ['FLEET', tokens[1]].join('-').slice(0, 16);
    }

    const [firstToken] = tokens;
    return firstToken ? firstToken.slice(0, 16) : 'ASSET';
  }

  private buildSystemVehicleCodePrefix(name: string): string {
    const base = this.buildVehicleCodePrefix(name);
    return `VEH-${base}`.slice(0, 20);
  }

  private formatVehicleCode(prefix: string, serial: number): string {
    return `${prefix}-${String(serial).padStart(4, '0')}`;
  }

  private normalizeTenantVehicleCode(value?: string | null): string | undefined {
    const normalized = value
      ?.trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]+/g, '-');
    return normalized ? normalized.replace(/-+/g, '-').replace(/^-|-$/g, '') : undefined;
  }

  private normalizeOptionalText(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeOptionalPlate(value?: string | null): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const normalized = value.trim().toUpperCase();
    return normalized || null;
  }

  private normalizeOptionalVin(value?: string | null): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const normalized = this.normalizeVin(value);
    return normalized || null;
  }

  private normalizeVin(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  private async assertVehicleUniqueness(input: {
    tenantId: string;
    tenantVehicleCode?: string | undefined;
    plate?: string | null | undefined;
    vin?: string | null | undefined;
  }): Promise<void> {
    if (input.tenantVehicleCode) {
      const existing = await this.prisma.vehicle.findFirst({
        where: {
          tenantId: input.tenantId,
          tenantVehicleCode: input.tenantVehicleCode,
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException(
          `Vehicle code '${input.tenantVehicleCode}' is already in use in this organisation.`,
        );
      }
    }

    if (input.plate) {
      const existing = await this.prisma.vehicle.findFirst({
        where: {
          tenantId: input.tenantId,
          plate: input.plate,
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException(
          `Plate number '${input.plate}' is already linked to another vehicle in this organisation.`,
        );
      }
    }

    if (input.vin) {
      const existing = await this.prisma.vehicle.findFirst({
        where: {
          tenantId: input.tenantId,
          vin: input.vin,
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException(
          `VIN '${input.vin}' is already linked to another vehicle in this organisation.`,
        );
      }
    }
  }

  private assertValuationInputConsistency(
    input: Pick<
      CreateVehicleDto | UpdateVehicleDto,
      | 'acquisitionCostMinorUnits'
      | 'acquisitionDate'
      | 'currentEstimatedValueMinorUnits'
      | 'valuationSource'
    >,
  ): void {
    const hasAcquisitionAmount = input.acquisitionCostMinorUnits !== undefined;
    const hasAcquisitionDate = input.acquisitionDate !== undefined;

    if (hasAcquisitionAmount !== hasAcquisitionDate) {
      throw new BadRequestException(
        'Acquisition cost and acquisition date must be provided together.',
      );
    }
  }

  private async createVehicleValuations(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      vehicleId: string;
      businessEntityCurrency: string | null;
      acquisitionCostMinorUnits?: number | undefined;
      acquisitionDate?: string | undefined;
      currentEstimatedValueMinorUnits?: number | undefined;
      valuationSource?: string | undefined;
    },
  ): Promise<void> {
    const creations: Prisma.VehicleValuationCreateManyInput[] = [];

    if (input.acquisitionCostMinorUnits !== undefined && input.acquisitionDate !== undefined) {
      creations.push({
        tenantId: input.tenantId,
        vehicleId: input.vehicleId,
        valuationKind: 'acquisition',
        amountMinorUnits: input.acquisitionCostMinorUnits,
        currency: input.businessEntityCurrency,
        valuationDate: input.acquisitionDate,
        source: input.valuationSource ?? null,
        isCurrent: true,
      });
    }

    if (input.currentEstimatedValueMinorUnits !== undefined) {
      creations.push({
        tenantId: input.tenantId,
        vehicleId: input.vehicleId,
        valuationKind: 'estimate',
        amountMinorUnits: input.currentEstimatedValueMinorUnits,
        currency: input.businessEntityCurrency,
        valuationDate: this.getTodayIsoDate(),
        source: input.valuationSource ?? null,
        isCurrent: true,
      });
    }

    if (creations.length > 0) {
      await tx.vehicleValuation.createMany({
        data: creations,
      });
    }
  }

  private async updateVehicleValuations(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      vehicleId: string;
      businessEntityCurrency: string | null;
      acquisitionCostMinorUnits?: number | undefined;
      acquisitionDate?: string | undefined;
      currentEstimatedValueMinorUnits?: number | undefined;
      valuationSource?: string | undefined;
    },
  ): Promise<void> {
    if (input.acquisitionCostMinorUnits !== undefined && input.acquisitionDate !== undefined) {
      const existingAcquisition = await tx.vehicleValuation.findFirst({
        where: {
          vehicleId: input.vehicleId,
          valuationKind: 'acquisition',
          isCurrent: true,
        },
      });

      if (existingAcquisition) {
        await tx.vehicleValuation.update({
          where: { id: existingAcquisition.id },
          data: {
            amountMinorUnits: input.acquisitionCostMinorUnits,
            currency: input.businessEntityCurrency,
            valuationDate: input.acquisitionDate,
            source: input.valuationSource ?? existingAcquisition.source,
          },
        });
      } else {
        await tx.vehicleValuation.create({
          data: {
            tenantId: input.tenantId,
            vehicleId: input.vehicleId,
            valuationKind: 'acquisition',
            amountMinorUnits: input.acquisitionCostMinorUnits,
            currency: input.businessEntityCurrency,
            valuationDate: input.acquisitionDate,
            source: input.valuationSource ?? null,
            isCurrent: true,
          },
        });
      }
    }

    if (input.currentEstimatedValueMinorUnits !== undefined) {
      await tx.vehicleValuation.updateMany({
        where: {
          vehicleId: input.vehicleId,
          valuationKind: 'estimate',
          isCurrent: true,
        },
        data: { isCurrent: false },
      });

      await tx.vehicleValuation.create({
        data: {
          tenantId: input.tenantId,
          vehicleId: input.vehicleId,
          valuationKind: 'estimate',
          amountMinorUnits: input.currentEstimatedValueMinorUnits,
          currency: input.businessEntityCurrency,
          valuationDate: this.getTodayIsoDate(),
          source: input.valuationSource ?? null,
          isCurrent: true,
        },
      });
    }
  }

  private getTodayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private isPrismaUniqueError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private getPrismaErrorTarget(error: Prisma.PrismaClientKnownRequestError): string[] {
    const target = error.meta?.target;
    return Array.isArray(target)
      ? target.map((value) => String(value))
      : typeof target === 'string'
        ? [target]
        : [];
  }
}
