import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { type HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async check(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      return indicator.up();
    } catch (error) {
      return indicator.down(
        error instanceof Error ? error.message : 'Database connectivity failed.',
      );
    }
  }
}
