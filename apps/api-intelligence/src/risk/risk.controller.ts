import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import type { Prisma } from '../generated/prisma';
import { AddRiskSignalDto } from './dto/add-risk-signal.dto';
import { RiskSignalResponseDto } from './dto/risk-signal-response.dto';
import { RiskService } from './risk.service';

@ApiTags('Risk Signals (Staff)')
@ApiBearerAuth('platform-staff')
@UseGuards(PlatformAuthGuard)
@Controller('staff/risk-signals')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  private mapSignal(signal: {
    id: string;
    personId: string;
    type: string;
    severity: string;
    source: string;
    isActive: boolean;
    metadata: Prisma.JsonValue;
    createdAt: Date;
  }): RiskSignalResponseDto {
    return {
      ...signal,
      metadata:
        signal.metadata &&
        typeof signal.metadata === 'object' &&
        !Array.isArray(signal.metadata)
          ? (signal.metadata as Record<string, unknown>)
          : null,
    };
  }

  @Get('persons/:personId')
  @ApiOkResponse({ type: RiskSignalResponseDto, isArray: true })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  listByPerson(
    @Param('personId') personId: string,
    @Query('activeOnly') activeOnly?: string,
  ): Promise<RiskSignalResponseDto[]> {
    return this.riskService
      .listSignals(personId, activeOnly !== 'false')
      .then((signals) => signals.map((signal) => this.mapSignal(signal)));
  }

  @Post()
  @ApiCreatedResponse({ type: RiskSignalResponseDto })
  add(@Body() dto: AddRiskSignalDto): Promise<RiskSignalResponseDto> {
    return this.riskService.addSignal(dto).then((signal) => this.mapSignal(signal));
  }

  @Patch(':id/deactivate')
  @ApiOkResponse({ type: RiskSignalResponseDto })
  deactivate(@Param('id') id: string): Promise<RiskSignalResponseDto> {
    return this.riskService.deactivateSignal(id).then((signal) => this.mapSignal(signal));
  }
}
