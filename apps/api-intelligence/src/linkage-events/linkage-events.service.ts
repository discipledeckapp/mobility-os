import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { Prisma } from '../generated/prisma';

export interface RecordLinkageEventParams {
  personId: string;
  eventType: 'auto_linked' | 'manual_linked' | 'separated' | 'merged' | 'conflict_flagged';
  actor: string;
  confidenceScore?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class LinkageEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: RecordLinkageEventParams): Promise<void> {
    await this.prisma.intelLinkageEvent.create({
      data: {
        personId: params.personId,
        eventType: params.eventType,
        actor: params.actor,
        ...(params.confidenceScore !== undefined
          ? { confidenceScore: params.confidenceScore }
          : {}),
        ...(params.reason !== undefined ? { reason: params.reason } : {}),
        ...(params.metadata ? { metadata: params.metadata as Prisma.InputJsonObject } : {}),
      },
    });
  }
}
