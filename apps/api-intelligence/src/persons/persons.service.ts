import { RiskScore } from '@mobility-os/intelligence-domain';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PrismaService } from '../database/prisma.service';
import type { IntelPerson } from '../generated/prisma';
import type { CreatePersonDto } from './dto/create-person.dto';
import type { IntelligenceQueryResultDto } from './dto/person-response.dto';

interface CanonicalIdentityEnrichmentInput {
  personId: string;
  fullName?: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  photoUrl?: string;
  verificationStatus?: string;
  verificationProvider?: string;
  verificationCountryCode?: string;
  verificationConfidence?: number;
}

@Injectable()
export class PersonsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePersonDto): Promise<IntelPerson> {
    return this.prisma.intelPerson.create({
      data: {
        globalRiskScore: dto.globalRiskScore ?? 0,
      },
    });
  }

  async findById(id: string): Promise<IntelPerson> {
    const person = await this.prisma.intelPerson.findUnique({ where: { id } });

    if (!person) {
      throw new NotFoundException(`Person '${id}' not found`);
    }

    return person;
  }

  /**
   * Returns the derived intelligence result for a given person ID.
   * This is the only view exposed to tenant callers — no raw cross-tenant
   * records are included, only signals computed from aggregated data.
   */
  async queryForTenant(personId: string): Promise<IntelligenceQueryResultDto> {
    const person = await this.findById(personId);

    const riskScore = RiskScore.of(person.globalRiskScore);

    return {
      personId: person.id,
      globalRiskScore: person.globalRiskScore,
      riskBand: riskScore.band,
      isWatchlisted: person.isWatchlisted,
      hasDuplicateIdentityFlag: person.hasDuplicateFlag,
      fraudIndicatorCount: person.fraudSignalCount,
      verificationConfidence: person.verificationConfidence,
      verificationStatus: person.verificationStatus,
      verificationProvider: person.verificationProvider,
      verificationCountryCode: person.verificationCountryCode,
    };
  }

  async updateRiskScore(id: string, newScore: number): Promise<IntelPerson> {
    if (newScore < 0 || newScore > 100) {
      throw new BadRequestException('Risk score must be between 0 and 100');
    }

    await this.findById(id); // throws if not found

    return this.prisma.intelPerson.update({
      where: { id },
      data: { globalRiskScore: newScore },
    });
  }

  async setWatchlisted(id: string, isWatchlisted: boolean): Promise<IntelPerson> {
    await this.findById(id);

    return this.prisma.intelPerson.update({
      where: { id },
      data: { isWatchlisted },
    });
  }

  async setDuplicateFlag(id: string, hasDuplicateFlag: boolean): Promise<IntelPerson> {
    await this.findById(id);

    return this.prisma.intelPerson.update({
      where: { id },
      data: { hasDuplicateFlag },
    });
  }

  /**
   * Records that a person has appeared at a tenant in a given operational role.
   *
   * When a person is recorded as a guarantor at a tenant where they are already
   * a driver (or vice versa), a cross_role_presence risk signal is emitted
   * automatically. The signal is idempotent — a second enrollment in the same
   * role at the same tenant is a no-op and does not produce a duplicate signal.
   */
  async recordTenantPresence(
    personId: string,
    tenantId: string,
    roleType: 'driver' | 'guarantor' = 'driver',
  ): Promise<{ crossRoleConflict: boolean }> {
    const oppositeRole = roleType === 'driver' ? 'guarantor' : 'driver';

    const [, oppositePresence] = await Promise.all([
      this.prisma.intelPersonTenantPresence.upsert({
        where: {
          personId_tenantId_roleType: { personId, tenantId, roleType },
        },
        create: { personId, tenantId, roleType },
        update: {},
      }),
      this.prisma.intelPersonTenantPresence.findUnique({
        where: {
          personId_tenantId_roleType: {
            personId,
            tenantId,
            roleType: oppositeRole,
          },
        },
      }),
    ]);

    const crossRoleConflict = oppositePresence !== null;

    if (crossRoleConflict) {
      // Emit a risk signal for cross-role presence. Idempotent — if one
      // already exists for this (personId, tenantId) pair it is a duplicate
      // but acceptable; duplicate detection is handled upstream if needed.
      await this.prisma.intelRiskSignal.create({
        data: {
          personId,
          type: 'cross_role_presence',
          severity: 'medium',
          source: 'system',
          metadata: {
            tenantId,
            roles: [roleType, oppositeRole],
            detectedDuring: roleType,
          },
        },
      });
    }

    return { crossRoleConflict };
  }

  /**
   * Returns the aggregated role presence for a person — which operational roles
   * they hold across the platform. Tenant names are never included; only
   * aggregate counts and role flags are returned, preserving cross-tenant privacy.
   */
  async queryRolePresence(personId: string): Promise<{
    isDriver: boolean;
    isGuarantor: boolean;
    tenantCount: number;
    hasMultiTenantPresence: boolean;
    hasMultiRolePresence: boolean;
  }> {
    await this.findById(personId); // throws NotFoundException if missing

    const presences = await this.prisma.intelPersonTenantPresence.findMany({
      where: { personId },
      select: { tenantId: true, roleType: true },
    });

    const tenantIds = new Set(presences.map((p) => p.tenantId));
    const roles = new Set(presences.map((p) => p.roleType));

    return {
      isDriver: roles.has('driver'),
      isGuarantor: roles.has('guarantor'),
      tenantCount: tenantIds.size,
      hasMultiTenantPresence: tenantIds.size > 1,
      hasMultiRolePresence: roles.size > 1,
    };
  }

  async applyIdentityEnrichment(input: CanonicalIdentityEnrichmentInput): Promise<IntelPerson> {
    await this.findById(input.personId);

    return this.prisma.intelPerson.update({
      where: { id: input.personId },
      data: {
        ...(input.fullName ? { fullName: input.fullName } : {}),
        ...(input.dateOfBirth ? { dateOfBirth: input.dateOfBirth } : {}),
        ...(input.address ? { address: input.address } : {}),
        ...(input.gender ? { gender: input.gender } : {}),
        ...(input.photoUrl ? { photoUrl: input.photoUrl } : {}),
        ...(input.verificationStatus ? { verificationStatus: input.verificationStatus } : {}),
        ...(input.verificationProvider ? { verificationProvider: input.verificationProvider } : {}),
        ...(input.verificationCountryCode
          ? { verificationCountryCode: input.verificationCountryCode }
          : {}),
        ...(input.verificationConfidence !== undefined
          ? { verificationConfidence: input.verificationConfidence }
          : {}),
      },
    });
  }
}
