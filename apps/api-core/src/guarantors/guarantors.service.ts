import { normalizePhoneNumberForCountry } from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Guarantor, GuarantorDriverLink } from '@prisma/client';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CreateGuarantorDto } from './dto/create-guarantor.dto';
import type { UpdateGuarantorDto } from './dto/update-guarantor.dto';

type GuarantorRecord = Guarantor & {
  activeDriverCount: number;
  linkedDriverIds: string[];
};

@Injectable()
export class GuarantorsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizePhone(phone: string, countryCode?: string): string {
    const trimmedPhone = phone.trim();

    if (countryCode) {
      return normalizePhoneNumberForCountry(trimmedPhone, countryCode);
    }

    if (!/^\+\d{10,15}$/.test(trimmedPhone)) {
      throw new BadRequestException(
        'phone must be in E.164 format when countryCode is not provided.',
      );
    }

    return trimmedPhone;
  }

  private async ensureFleetBelongsToTenant(tenantId: string, fleetId: string): Promise<void> {
    const fleet = await this.prisma.fleet.findUnique({
      where: { id: fleetId },
      select: { id: true, tenantId: true },
    });

    if (!fleet) {
      throw new NotFoundException(`Fleet '${fleetId}' not found`);
    }

    assertTenantOwnership(asTenantId(fleet.tenantId), asTenantId(tenantId));
  }

  private async ensurePhoneUnique(
    tenantId: string,
    phone: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.guarantor.findFirst({
      where: {
        tenantId,
        phone,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        'A guarantor with this phone number already exists for this tenant.',
      );
    }
  }

  private async getActiveLinksByGuarantorIds(
    tenantId: string,
    guarantorIds: string[],
  ): Promise<Map<string, GuarantorDriverLink[]>> {
    if (guarantorIds.length === 0) {
      return new Map();
    }

    const links = await this.prisma.guarantorDriverLink.findMany({
      where: {
        tenantId,
        guarantorId: { in: guarantorIds },
        status: 'active',
      },
      orderBy: { linkedAt: 'desc' },
    });

    const linksByGuarantorId = new Map<string, GuarantorDriverLink[]>();
    for (const link of links) {
      const existing = linksByGuarantorId.get(link.guarantorId) ?? [];
      existing.push(link);
      linksByGuarantorId.set(link.guarantorId, existing);
    }

    return linksByGuarantorId;
  }

  private async enrichGuarantors(
    tenantId: string,
    guarantors: Guarantor[],
  ): Promise<GuarantorRecord[]> {
    const linksByGuarantorId = await this.getActiveLinksByGuarantorIds(
      tenantId,
      guarantors.map((guarantor) => guarantor.id),
    );

    return guarantors.map((guarantor) => {
      const links = linksByGuarantorId.get(guarantor.id) ?? [];
      return {
        ...guarantor,
        activeDriverCount: links.length,
        linkedDriverIds: links.map((link) => link.driverId),
      };
    });
  }

  async create(tenantId: string, dto: CreateGuarantorDto): Promise<GuarantorRecord> {
    await this.ensureFleetBelongsToTenant(tenantId, dto.fleetId);
    const normalizedPhone = this.normalizePhone(dto.phone, dto.countryCode);
    await this.ensurePhoneUnique(tenantId, normalizedPhone);

    const guarantor = await this.prisma.guarantor.create({
      data: {
        tenantId,
        fleetId: dto.fleetId,
        name: dto.name.trim(),
        phone: normalizedPhone,
        countryCode: dto.countryCode?.toUpperCase() ?? null,
        relationship: dto.relationship?.trim() || null,
      },
    });

    const [record] = await this.enrichGuarantors(tenantId, [guarantor]);
    if (!record) {
      throw new NotFoundException('Created guarantor could not be loaded.');
    }
    return record;
  }

  async list(
    tenantId: string,
    input: { fleetId?: string; page?: number; limit?: number } = {},
  ): Promise<PaginatedResponse<GuarantorRecord>> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const where = {
      tenantId,
      ...(input.fleetId ? { fleetId: input.fleetId } : {}),
    };

    const [guarantors, total] = await Promise.all([
      this.prisma.guarantor.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.guarantor.count({ where }),
    ]);

    return {
      data: await this.enrichGuarantors(tenantId, guarantors),
      total,
      page,
      limit,
    };
  }

  async findOne(tenantId: string, id: string): Promise<GuarantorRecord> {
    const guarantor = await this.prisma.guarantor.findUnique({
      where: { id },
    });

    if (!guarantor) {
      throw new NotFoundException(`Guarantor '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(guarantor.tenantId), asTenantId(tenantId));

    const [record] = await this.enrichGuarantors(tenantId, [guarantor]);
    if (!record) {
      throw new NotFoundException(`Guarantor '${id}' not found`);
    }
    return record;
  }

  async update(tenantId: string, id: string, dto: UpdateGuarantorDto): Promise<GuarantorRecord> {
    const existing = await this.findOne(tenantId, id);
    const nextFleetId = dto.fleetId ?? existing.fleetId;

    if (dto.fleetId && dto.fleetId !== existing.fleetId) {
      await this.ensureFleetBelongsToTenant(tenantId, dto.fleetId);

      if (existing.activeDriverCount > 0) {
        const mismatchedDriver = await this.prisma.driver.findFirst({
          where: {
            tenantId,
            id: { in: existing.linkedDriverIds },
            fleetId: { not: dto.fleetId },
          },
          select: { id: true },
        });

        if (mismatchedDriver) {
          throw new BadRequestException(
            'Cannot move a guarantor to a different fleet while linked drivers remain in the current fleet.',
          );
        }
      }
    }

    const nextCountryCode = dto.countryCode ?? existing.countryCode ?? undefined;
    const nextPhone =
      dto.phone !== undefined ? this.normalizePhone(dto.phone, nextCountryCode) : existing.phone;

    if (nextPhone !== existing.phone) {
      await this.ensurePhoneUnique(tenantId, nextPhone, existing.id);
    }

    const guarantor = await this.prisma.guarantor.update({
      where: { id },
      data: {
        fleetId: nextFleetId,
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.countryCode !== undefined
          ? { countryCode: dto.countryCode?.toUpperCase() || null }
          : {}),
        ...(dto.relationship !== undefined
          ? { relationship: dto.relationship.trim() || null }
          : {}),
        ...(dto.phone !== undefined ? { phone: nextPhone } : {}),
      },
    });

    const [record] = await this.enrichGuarantors(tenantId, [guarantor]);
    if (!record) {
      throw new NotFoundException(`Guarantor '${id}' not found`);
    }
    return record;
  }

  async remove(tenantId: string, id: string): Promise<GuarantorRecord> {
    await this.findOne(tenantId, id);

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.guarantor.update({
        where: { id },
        data: { status: 'inactive' },
      }),
      this.prisma.guarantorDriverLink.updateMany({
        where: {
          tenantId,
          guarantorId: id,
          status: 'active',
        },
        data: {
          status: 'inactive',
          unlinkedAt: now,
        },
      }),
    ]);

    return this.findOne(tenantId, id);
  }

  async linkDriver(
    tenantId: string,
    guarantorId: string,
    driverId: string,
  ): Promise<GuarantorRecord> {
    const [guarantor, driver] = await Promise.all([
      this.findOne(tenantId, guarantorId),
      this.prisma.driver.findUnique({
        where: { id: driverId },
        select: { id: true, tenantId: true, fleetId: true },
      }),
    ]);

    if (!driver) {
      throw new NotFoundException(`Driver '${driverId}' not found`);
    }

    assertTenantOwnership(asTenantId(driver.tenantId), asTenantId(tenantId));

    if (guarantor.status !== 'active') {
      throw new BadRequestException('Only active guarantors can be linked to drivers.');
    }

    if (driver.fleetId !== guarantor.fleetId) {
      throw new BadRequestException('Guarantor and driver must belong to the same fleet.');
    }

    const existingLink = await this.prisma.guarantorDriverLink.findUnique({
      where: {
        guarantorId_driverId: {
          guarantorId,
          driverId,
        },
      },
    });

    if (!existingLink && guarantor.activeDriverCount >= 3) {
      throw new ConflictException('A guarantor cannot be linked to more than 3 active drivers.');
    }

    await this.prisma.guarantorDriverLink.upsert({
      where: {
        guarantorId_driverId: {
          guarantorId,
          driverId,
        },
      },
      create: {
        tenantId,
        guarantorId,
        driverId,
        fleetId: guarantor.fleetId,
        status: 'active',
      },
      update: {
        fleetId: guarantor.fleetId,
        status: 'active',
        linkedAt: new Date(),
        unlinkedAt: null,
      },
    });

    return this.findOne(tenantId, guarantorId);
  }
}
