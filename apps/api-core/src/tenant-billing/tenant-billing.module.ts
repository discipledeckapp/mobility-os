import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ControlPlaneBillingClient } from './control-plane-billing.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneMeteringClient } from './control-plane-metering.client';
import { SubscriptionEntitlementsService } from './subscription-entitlements.service';
import { TenantBillingController } from './tenant-billing.controller';
import { TenantBillingService } from './tenant-billing.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [TenantBillingController],
  providers: [
    ControlPlaneBillingClient,
    ControlPlaneMeteringClient,
    TenantBillingService,
    SubscriptionEntitlementsService,
  ],
  exports: [TenantBillingService, SubscriptionEntitlementsService, ControlPlaneMeteringClient],
})
export class TenantBillingModule {}
