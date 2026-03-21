import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { PlatformWalletsModule } from '../platform-wallets/platform-wallets.module';
import { TenantLifecycleModule } from '../tenant-lifecycle/tenant-lifecycle.module';
import { PaymentProvidersService } from './payment-providers.service';
import { PaymentsInternalController } from './payments-internal.controller';
import { PaymentsWebhooksController } from './payments-webhooks.controller';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => BillingModule),
    PlatformWalletsModule,
    TenantLifecycleModule,
  ],
  controllers: [PaymentsController, PaymentsInternalController, PaymentsWebhooksController],
  providers: [PaymentProvidersService, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
