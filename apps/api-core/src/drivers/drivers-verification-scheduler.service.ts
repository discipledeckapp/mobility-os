import { randomUUID } from 'node:crypto';
import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { CronJob } from 'cron';
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
export class DriversVerificationSchedulerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(DriversVerificationSchedulerService.name);
  private readonly jobs: CronJob[] = [];

  constructor(private readonly driversService: DriversService) {}

  onApplicationBootstrap(): void {
    if (process.env.DISABLE_SCHEDULER === 'true') {
      this.logger.log('Driver verification scheduler disabled by environment flag.');
      return;
    }

    this.jobs.push(
      CronJob.from({
        cronTime: '*/10 * * * *',
        onTick: () => void this.retryPendingProviderVerifications(),
        start: true,
        name: `driver-verification-retry-${randomUUID()}`,
      }),
      CronJob.from({
        cronTime: '0 */6 * * *',
        onTick: () => void this.sendPendingGuarantorOnboardingReminders(),
        start: true,
        name: `driver-guarantor-reminder-${randomUUID()}`,
      }),
    );
  }

  onApplicationShutdown(): void {
    for (const job of this.jobs) {
      job.stop();
    }
    this.jobs.length = 0;
  }

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

  async sendPendingGuarantorOnboardingReminders(): Promise<void> {
    let pending: Awaited<ReturnType<DriversService['findDriversPendingGuarantorReminders']>>;
    try {
      pending = await this.driversService.findDriversPendingGuarantorReminders();
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'guarantor_reminder_scheduler_query_failed',
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
        event: 'guarantor_reminder_scheduler_started',
        pendingCount: pending.length,
      }),
    );

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        const result = await this.driversService.sendPendingGuarantorReminder(
          item.tenantId,
          item.driverId,
        );
        if (result.status === 'sent') {
          sent += 1;
        } else {
          skipped += 1;
        }
      } catch {
        failed += 1;
      }
    }

    this.logger.log(
      JSON.stringify({
        event: 'guarantor_reminder_scheduler_completed',
        total: pending.length,
        sent,
        skipped,
        failed,
      }),
    );
  }
}
