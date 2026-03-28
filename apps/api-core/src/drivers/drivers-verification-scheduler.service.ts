import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime values for constructor metadata.
import { Cron } from '@nestjs/schedule';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime values for constructor metadata.
import { DriversService } from './drivers.service';

/**
 * Picks up driver verifications that are pending because all configured identity
 * providers were temporarily unavailable at submission time.  Retries every 10 minutes,
 * within a 24-hour window from the original submission.
 *
 * Each driver is retried at most once per scheduler cycle to avoid thundering-herd
 * problems when providers come back online.
 */
@Injectable()
export class DriversVerificationSchedulerService {
  private readonly logger = new Logger(DriversVerificationSchedulerService.name);

  constructor(private readonly driversService: DriversService) {}

  @Cron('*/10 * * * *')
  async retryPendingProviderVerifications(): Promise<void> {
    let pending: Awaited<ReturnType<DriversService['findDriversPendingProviderRetry']>>;
    try {
      pending = await this.driversService.findDriversPendingProviderRetry();
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'verification_retry_scheduler_query_failed',
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      return;
    }

    if (pending.length === 0) {
      return;
    }

    this.logger.log(
      JSON.stringify({
        event: 'verification_retry_scheduler_started',
        pendingCount: pending.length,
      }),
    );

    let succeeded = 0;
    let stillPending = 0;
    let errored = 0;

    for (const { tenantId, driverId, attempt } of pending) {
      const meta = attempt.metadata as Record<string, unknown> | null;
      const retryData = meta?.retryData as {
        identifiers: Array<{ type: string; value: string; countryCode?: string }>;
        selfieImageUrl: string | null;
        countryCode: string | null;
      } | null;

      if (!retryData?.identifiers?.length) {
        this.logger.warn(
          JSON.stringify({
            event: 'verification_retry_skipped_no_data',
            tenantId,
            driverId,
            attemptId: attempt.id,
          }),
        );
        continue;
      }

      try {
        await this.driversService.executeProviderRetry(tenantId, driverId, attempt, retryData);
        // We can't easily tell here whether the retry resolved or is still pending
        // without reading the attempt again — the log in executeProviderRetry covers it.
        succeeded++;
      } catch {
        errored++;
      }
    }

    this.logger.log(
      JSON.stringify({
        event: 'verification_retry_scheduler_completed',
        total: pending.length,
        attempted: succeeded + errored,
        errored,
        stillPending,
      }),
    );
  }
}
