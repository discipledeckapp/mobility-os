import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { RecordsModule } from '../records/records.module';
import { ControlPlaneBillingClient } from './control-plane-billing.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneMeteringClient } from './control-plane-metering.client';
import { PaymentTokenEncryptionService } from './payment-token-encryption.service';
import { SubscriptionEntitlementsService } from './subscription-entitlements.service';
import { TenantBillingController } from './tenant-billing.controller';
import { TenantBillingService } from './tenant-billing.service';
import { VerificationSpendService } from './verification-spend.service';

@Module({
  imports: [AuthModule, DatabaseModule, forwardRef(() => RecordsModule)],
  controllers: [TenantBillingController],
  providers: [
    ControlPlaneBillingClient,
    ControlPlaneMeteringClient,
    PaymentTokenEncryptionService,
    TenantBillingService,
    SubscriptionEntitlementsService,
    VerificationSpendService,
  ],
  exports: [
    TenantBillingService,
    SubscriptionEntitlementsService,
    ControlPlaneMeteringClient,
    ControlPlaneBillingClient,
    VerificationSpendService,
  ],
})
export class TenantBillingModule {}
