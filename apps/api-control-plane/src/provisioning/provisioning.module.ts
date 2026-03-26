import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PlansModule } from '../plans/plans.module';
import { PlatformWalletsModule } from '../platform-wallets/platform-wallets.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ApiCoreProvisioningClient } from './api-core-provisioning.client';
import { ProvisioningController } from './provisioning.controller';
import { ProvisioningService } from './provisioning.service';

@Module({
  imports: [AuthModule, PlansModule, SubscriptionsModule, PlatformWalletsModule, NotificationsModule],
  controllers: [ProvisioningController],
  providers: [ProvisioningService, ApiCoreProvisioningClient],
})
export class ProvisioningModule {}
