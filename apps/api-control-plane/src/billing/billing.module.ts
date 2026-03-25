import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PaymentsModule } from '../payments/payments.module';
import { PlatformWalletsModule } from '../platform-wallets/platform-wallets.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TenantLifecycleModule } from '../tenant-lifecycle/tenant-lifecycle.module';
import { BillingCollectionsController } from './billing-collections.controller';
import { BillingCollectionsService } from './billing-collections.service';
import { BillingInternalController } from './billing-internal.controller';
import { BillingRunsController } from './billing-runs.controller';
import { BillingRunsService } from './billing-runs.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingSchedulerService } from './billing-scheduler.service';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  imports: [
    AuthModule,
    SubscriptionsModule,
    PlatformWalletsModule,
    TenantLifecycleModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [
    BillingController,
    BillingInternalController,
    BillingRunsController,
    BillingCollectionsController,
  ],
  providers: [BillingService, BillingRunsService, BillingCollectionsService, BillingSchedulerService],
  exports: [BillingService, BillingRunsService, BillingCollectionsService],
})
export class BillingModule {}
