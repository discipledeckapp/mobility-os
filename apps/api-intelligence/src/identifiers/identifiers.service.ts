import { IdentifierType } from '@mobility-os/intelligence-domain';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { IntelPersonIdentifier } from '../generated/prisma';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PersonsService } from '../persons/persons.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ReviewCasesService } from '../review-cases/review-cases.service';

export interface AddIdentifierParams {
  personId: string;
  type: string;
  value: string;
  countryCode?: string;
}

@Injectable()
export class IdentifiersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly personsService: PersonsService,
    private readonly reviewCasesService: ReviewCasesService,
  ) {}

  async listByPerson(personId: string): Promise<IntelPersonIdentifier[]> {
    await this.personsService.findById(personId); // throws if person not found

    return this.prisma.intelPersonIdentifier.findMany({
      where: { personId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addIdentifier(params: AddIdentifierParams): Promise<IntelPersonIdentifier> {
    await this.personsService.findById(params.personId);

    if (!Object.values(IdentifierType).includes(params.type as IdentifierType)) {
      const valid = Object.values(IdentifierType).join(', ');
      throw new BadRequestException(
        `Invalid identifier type '${params.type}'. Valid types: ${valid}`,
      );
    }

    // NATIONAL_ID requires a countryCode to disambiguate across countries.
    if (params.type === IdentifierType.NationalId && !params.countryCode) {
      throw new BadRequestException('countryCode is required for NATIONAL_ID identifiers');
    }

    const normalizedValue = this.normalize(params.type as IdentifierType, params.value);

    // @@unique([type, value]) in schema catches DB-level duplicates.
    // Check here first to return a clear ConflictException rather than a Prisma error.
    const existing = await this.prisma.intelPersonIdentifier.findUnique({
      where: { type_value: { type: params.type, value: normalizedValue } },
    });

    if (existing) {
      if (existing.personId === params.personId) {
        throw new ConflictException(
          `Identifier (${params.type}, ${normalizedValue}) already exists on this person`,
        );
      }

      const reviewCase = await this.reviewCasesService.create({
        personId: params.personId,
        // Exact identifier collision is a strong signal, but not enough by itself
        // to auto-merge because identifiers can be reused or entered incorrectly.
        confidenceScore: 0.9,
        evidence: {
          conflictType: 'identifier_reuse',
          identifierType: params.type,
          identifierValue: normalizedValue,
          countryCode: params.countryCode ?? null,
          submittedPersonId: params.personId,
          existingPersonId: existing.personId,
          existingIdentifierId: existing.id,
        },
        notes: `Identifier collision detected for ${params.type}. Manual adjudication required before any linkage decision.`,
      });

      await Promise.all([
        this.personsService.setDuplicateFlag(params.personId, true),
        this.personsService.setDuplicateFlag(existing.personId, true),
      ]);

      throw new ConflictException(
        `Identifier (${params.type}, ${normalizedValue}) is already linked to a different person. ` +
          `Review case '${reviewCase.id}' was created for manual adjudication.`,
      );
    }

    return this.prisma.intelPersonIdentifier.create({
      data: {
        personId: params.personId,
        type: params.type,
        value: normalizedValue,
        countryCode: params.countryCode ?? null,
        isVerified: false,
      },
    });
  }

  async verifyIdentifier(id: string): Promise<IntelPersonIdentifier> {
    const identifier = await this.prisma.intelPersonIdentifier.findUnique({
      where: { id },
    });

    if (!identifier) {
      throw new NotFoundException(`Identifier '${id}' not found`);
    }

    if (identifier.isVerified) {
      throw new BadRequestException(`Identifier '${id}' is already verified`);
    }

    return this.prisma.intelPersonIdentifier.update({
      where: { id },
      data: { isVerified: true },
    });
  }

  /**
   * Normalizes an identifier value to a canonical form.
   * Phone → E.164 is handled upstream (validated before storing).
   * Email → lowercase. Everything else → trimmed uppercase.
   */
  private normalize(type: IdentifierType, value: string): string {
    const trimmed = value.trim();
    if (type === IdentifierType.Email) return trimmed.toLowerCase();
    return trimmed.toUpperCase();
  }
}
