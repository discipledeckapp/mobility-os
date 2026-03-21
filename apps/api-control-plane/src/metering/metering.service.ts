import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CpUsageEvent } from '../generated/prisma';
import type { RecordUsageEventDto } from './dto/record-usage-event.dto';

@Injectable()
export class MeteringService {
  constructor(private readonly prisma: PrismaService) {}

  async recordUsageEvent(dto: RecordUsageEventDto): Promise<CpUsageEvent> {
    return this.prisma.cpUsageEvent.upsert({
      where: { idempotencyKey: dto.idempotencyKey },
      create: {
        tenantId: dto.tenantId,
        eventType: dto.eventType,
        quantity: dto.quantity,
        countryCode: dto.countryCode ?? null,
        idempotencyKey: dto.idempotencyKey,
        occurredAt: new Date(dto.occurredAt),
      },
      update: {},
    });
  }
}
