import { ReviewCaseStatus } from '@mobility-os/intelligence-domain';
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { PlatformAuthGuard, type PlatformPrincipal } from '../auth/guards/platform-auth.guard';
import type { IntelReviewCase, Prisma } from '../generated/prisma';
import type { CreateReviewCaseDto } from './dto/create-review-case.dto';
import type { ResolveReviewCaseDto } from './dto/resolve-review-case.dto';
import { ReviewCaseResponseDto } from './dto/review-case-response.dto';
import type { UpdateReviewCaseStatusDto } from './dto/update-review-case-status.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ReviewCasesService } from './review-cases.service';

@ApiTags('Review Cases (Staff)')
@ApiBearerAuth('platform-staff')
@UseGuards(PlatformAuthGuard)
@Controller('staff/review-cases')
export class ReviewCasesController {
  constructor(private readonly reviewCasesService: ReviewCasesService) {}

  private toResponseDto(reviewCase: IntelReviewCase): ReviewCaseResponseDto {
    const evidence =
      reviewCase.evidence &&
      typeof reviewCase.evidence === 'object' &&
      !Array.isArray(reviewCase.evidence)
        ? (reviewCase.evidence as Prisma.JsonObject)
        : {};

    return {
      ...reviewCase,
      evidence: evidence as Record<string, unknown>,
    };
  }

  @Post()
  @ApiCreatedResponse({ type: ReviewCaseResponseDto })
  async create(@Body() dto: CreateReviewCaseDto): Promise<ReviewCaseResponseDto> {
    return this.toResponseDto(await this.reviewCasesService.create(dto));
  }

  @Get()
  @ApiOkResponse({ type: ReviewCaseResponseDto, isArray: true })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Object.values(ReviewCaseStatus),
  })
  async list(@Query('status') status?: string): Promise<ReviewCaseResponseDto[]> {
    return (await this.reviewCasesService.list(status)).map((reviewCase) =>
      this.toResponseDto(reviewCase),
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: ReviewCaseResponseDto })
  async findById(@Param('id') id: string): Promise<ReviewCaseResponseDto> {
    return this.toResponseDto(await this.reviewCasesService.findById(id));
  }

  @Patch(':id/status')
  @ApiOkResponse({ type: ReviewCaseResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReviewCaseStatusDto,
    @Req() request: FastifyRequest & { platformPrincipal: PlatformPrincipal },
  ): Promise<ReviewCaseResponseDto> {
    const status =
      dto.status === ReviewCaseStatus.Escalated
        ? ReviewCaseStatus.Escalated
        : ReviewCaseStatus.InReview;

    return this.toResponseDto(
      await this.reviewCasesService.updateStatus(
        id,
        status,
        request.platformPrincipal.userId,
        dto.notes,
      ),
    );
  }

  @Patch(':id/resolve')
  @ApiOkResponse({ type: ReviewCaseResponseDto })
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveReviewCaseDto,
    @Req() request: FastifyRequest & { platformPrincipal: PlatformPrincipal },
  ): Promise<ReviewCaseResponseDto> {
    return this.toResponseDto(
      await this.reviewCasesService.resolve(
        id,
        dto.resolution,
        request.platformPrincipal.userId,
        dto.notes,
      ),
    );
  }
}
