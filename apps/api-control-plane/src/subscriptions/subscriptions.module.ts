import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PlansModule } from '../plans/plans.module';
import { ApiCoreTenantsClient } from '../tenants/api-core-tenants.client';
import { SubscriptionsInternalController } from './subscriptions-internal.controller';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [AuthModule, PlansModule, NotificationsModule],
  controllers: [SubscriptionsController, SubscriptionsInternalController],
  providers: [ApiCoreTenantsClient, SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
