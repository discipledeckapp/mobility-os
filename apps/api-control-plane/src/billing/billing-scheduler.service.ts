import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingCollectionsService } from './billing-collections.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingRunsService } from './billing-runs.service';

@Injectable()
export class BillingSchedulerService {
  private readonly logger = new Logger(BillingSchedulerService.name);

  constructor(
    private readonly billingRunsService: BillingRunsService,
    private readonly billingCollectionsService: BillingCollectionsService,
  ) {}

  /**
   * Generate invoices and advance subscription periods for all due subscriptions.
   * Runs at 02:00 UTC on the 2nd of every month.
   * The 2nd gives Paystack/Flutterwave time to process any pending payments before
   * we roll forward and settle from the platform wallet.
   */
  @Cron('0 2 2 * *')
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
  @Cron('0 3 * * *')
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
