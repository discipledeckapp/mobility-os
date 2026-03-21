import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiHeader, ApiTags } from '@nestjs/swagger';
import { IntelligenceApiKeyGuard } from '../auth/guards/intelligence-api-key.guard';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { InitLivenessSessionDto } from './dto/init-liveness-session.dto';
import { LivenessSessionResponseDto } from './dto/liveness-session-response.dto';
import { MatchingResultDto } from './dto/matching-result.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ResolveEnrollmentDto } from './dto/resolve-enrollment.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { MatchingService } from './matching.service';

@ApiTags('Matching (Internal)')
@ApiHeader({ name: 'x-api-key', required: true })
@UseGuards(IntelligenceApiKeyGuard)
@Controller('internal/matching')
export class MatchingInternalController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('liveness-sessions')
  @ApiCreatedResponse({ type: LivenessSessionResponseDto })
  initializeLivenessSession(
    @Body() dto: InitLivenessSessionDto,
  ): Promise<LivenessSessionResponseDto> {
    return this.matchingService.initializeLivenessSession(dto);
  }

  @Post('enrollments')
  @ApiCreatedResponse({ type: MatchingResultDto })
  resolveEnrollment(@Body() dto: ResolveEnrollmentDto): Promise<MatchingResultDto> {
    return this.matchingService.resolveEnrollment(dto);
  }
}
