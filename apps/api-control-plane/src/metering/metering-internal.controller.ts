import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
import type { CpUsageEvent } from '../generated/prisma';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { RecordUsageEventDto } from './dto/record-usage-event.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { MeteringService } from './metering.service';

@ApiExcludeController()
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/metering')
export class MeteringInternalController {
  constructor(private readonly meteringService: MeteringService) {}

  @Post('usage-events')
  recordUsageEvent(@Body() dto: RecordUsageEventDto): Promise<CpUsageEvent> {
    return this.meteringService.recordUsageEvent(dto);
  }
}
