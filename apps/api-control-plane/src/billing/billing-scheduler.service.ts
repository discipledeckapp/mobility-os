import { randomUUID } from 'node:crypto';
import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { CronJob } from 'cron';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingCollectionsService } from './billing-collections.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingRunsService } from './billing-runs.service';

@Injectable()
export class BillingSchedulerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(BillingSchedulerService.name);
  private readonly jobs: CronJob[] = [];

  constructor(
    private readonly billingRunsService: BillingRunsService,
    private readonly billingCollectionsService: BillingCollectionsService,
  ) {}

  onApplicationBootstrap(): void {
    if (process.env.DISABLE_SCHEDULER === 'true') {
      this.logger.log('Billing scheduler disabled by environment flag.');
      return;
    }

    this.jobs.push(
      CronJob.from({
        cronTime: '0 2 2 * *',
        onTick: () => void this.runMonthlyBillingCycle(),
        start: true,
        name: `monthly-billing-run-${randomUUID()}`,
      }),
      CronJob.from({
        cronTime: '0 3 * * *',
        onTick: () => void this.runDailyCollections(),
        start: true,
        name: `daily-billing-collections-${randomUUID()}`,
      }),
    );
  }

  onApplicationShutdown(): void {
    for (const job of this.jobs) {
      job.stop();
    }
    this.jobs.length = 0;
  }

  /**
   * Generate invoices and advance subscription periods for all due subscriptions.
   * Runs at 02:00 UTC on the 2nd of every month.
   * The 2nd gives Paystack/Flutterwave time to process any pending payments before
   * we roll forward and settle from the platform wallet.
   */
  async runMonthlyBillingCycle(): Promise<void> {
    this.logger.log('Starting monthly billing run');
    try {
      const result = await this.billingRunsService.runDueSubscriptions({
        autoSettleFromWallet: true,
      });
      this.logger.log(
        `Monthly billing run complete — ${result.subscriptionCount} subscription(s) processed`,
      );
    } catch (error) {
      this.logger.error(
        `Monthly billing run failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Attempt to collect on all open overdue invoices.
   * Runs daily at 03:00 UTC — after the billing run window, so newly generated
   * invoices are available for same-day settlement attempts.
   */
  async runDailyCollections(): Promise<void> {
    this.logger.log('Starting daily collections run');
    try {
      const result = await this.billingCollectionsService.runOverdueInvoices({
        autoSettleFromWallet: true,
      });
      this.logger.log(
        `Daily collections run complete — ${result.invoiceCount} invoice(s) processed`,
      );
    } catch (error) {
      this.logger.error(
        `Daily collections run failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
