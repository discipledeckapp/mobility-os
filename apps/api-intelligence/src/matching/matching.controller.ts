import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import type { InitLivenessSessionDto } from './dto/init-liveness-session.dto';
import { LivenessReadinessResponseDto } from './dto/liveness-readiness-response.dto';
import type { LivenessReadinessDto } from './dto/liveness-readiness.dto';
import { LivenessSessionResponseDto } from './dto/liveness-session-response.dto';
import { MatchingResultDto } from './dto/matching-result.dto';
import type { ResolveEnrollmentDto } from './dto/resolve-enrollment.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { MatchingService } from './matching.service';

@ApiTags('Matching (Staff)')
@ApiBearerAuth('platform-staff')
@UseGuards(PlatformAuthGuard)
@Controller('staff/matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('liveness-sessions')
  @ApiCreatedResponse({ type: LivenessSessionResponseDto })
  initializeLivenessSession(
    @Body() dto: InitLivenessSessionDto,
  ): Promise<LivenessSessionResponseDto> {
    return this.matchingService.initializeLivenessSession(dto);
  }

  @Post('liveness-readiness')
  @ApiCreatedResponse({ type: LivenessReadinessResponseDto })
  getLivenessReadiness(@Body() dto: LivenessReadinessDto): Promise<LivenessReadinessResponseDto> {
    return this.matchingService.getLivenessReadiness(dto);
  }

  @Post('enrollments')
  @ApiCreatedResponse({ type: MatchingResultDto })
  resolveEnrollment(@Body() dto: ResolveEnrollmentDto): Promise<MatchingResultDto> {
    return this.matchingService.resolveEnrollment(dto);
  }
}
