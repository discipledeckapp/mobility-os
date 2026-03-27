import { ReviewCaseStatus } from '@mobility-os/intelligence-domain';
import { Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PrismaService } from '../database/prisma.service';
import type { IntelReviewCase } from '../generated/prisma';
import type { Prisma } from '../generated/prisma';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PersonsService } from '../persons/persons.service';
import type { CreateReviewCaseDto } from './dto/create-review-case.dto';

@Injectable()
export class ReviewCasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly personsService: PersonsService,
  ) {}

  async create(dto: CreateReviewCaseDto): Promise<IntelReviewCase> {
    await this.personsService.findById(dto.personId);

    return this.prisma.intelReviewCase.create({
      data: {
        personId: dto.personId,
        confidenceScore: dto.confidenceScore,
        evidence: dto.evidence as Prisma.InputJsonObject,
        notes: dto.notes ?? null,
        status: ReviewCaseStatus.Open,
      },
    });
  }

  async list(input: { status?: string; personId?: string } = {}): Promise<IntelReviewCase[]> {
    return this.prisma.intelReviewCase.findMany({
      ...((input.status || input.personId)
        ? {
            where: {
              ...(input.status ? { status: input.status } : {}),
              ...(input.personId ? { personId: input.personId } : {}),
            },
          }
        : {}),
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string): Promise<IntelReviewCase> {
    const reviewCase = await this.prisma.intelReviewCase.findUnique({
      where: { id },
    });

    if (!reviewCase) {
      throw new NotFoundException(`ReviewCase '${id}' not found`);
    }

    return reviewCase;
  }

  async updateStatus(
    id: string,
    status: ReviewCaseStatus.InReview | ReviewCaseStatus.Escalated,
    actorId: string,
    notes?: string,
  ): Promise<IntelReviewCase> {
    await this.findById(id);

    return this.prisma.intelReviewCase.update({
      where: { id },
      data: {
        status,
        reviewedBy: actorId,
        ...(notes !== undefined ? { notes } : {}),
      },
    });
  }

  async resolve(
    id: string,
    resolution: string,
    actorId: string,
    notes?: string,
  ): Promise<IntelReviewCase> {
    await this.findById(id);

    return this.prisma.intelReviewCase.update({
      where: { id },
      data: {
        status: ReviewCaseStatus.Resolved,
        resolution,
        reviewedBy: actorId,
        reviewedAt: new Date(),
        ...(notes !== undefined ? { notes } : {}),
      },
    });
  }
}
