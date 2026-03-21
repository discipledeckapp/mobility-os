import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DiskHealthIndicator, HealthCheck, HealthCheckService } from '@nestjs/terminus';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DatabaseHealthIndicator } from './database.health-indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
    private readonly database: DatabaseHealthIndicator,
  ) {}

  @Get()
  @Version(VERSION_NEUTRAL)
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.database.check('database'),
      () =>
        this.disk.checkStorage('storage', {
          path: process.cwd(),
          thresholdPercent: 0.9,
        }),
    ]);
  }
}
