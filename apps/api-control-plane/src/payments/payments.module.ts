import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PlatformWalletsModule } from '../platform-wallets/platform-wallets.module';
import { ControlPlaneRecordsModule } from '../records/records.module';
import { TenantLifecycleModule } from '../tenant-lifecycle/tenant-lifecycle.module';
import { BillingPaymentMethodsService } from './billing-payment-methods.service';
import { PaymentTokenEncryptionService } from './payment-token-encryption.service';
import { PaymentProvidersService } from './payment-providers.service';
import { PaymentsInternalController } from './payments-internal.controller';
import { PaymentsWebhooksController } from './payments-webhooks.controller';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => BillingModule),
    NotificationsModule,
    PlatformWalletsModule,
    ControlPlaneRecordsModule,
    TenantLifecycleModule,
  ],
  controllers: [PaymentsController, PaymentsInternalController, PaymentsWebhooksController],
  providers: [
    BillingPaymentMethodsService,
    PaymentProvidersService,
    PaymentsService,
    PaymentTokenEncryptionService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
