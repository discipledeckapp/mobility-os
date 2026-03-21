import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ControlPlaneBillingClient } from './control-plane-billing.client';
import { TenantBillingController } from './tenant-billing.controller';
import { TenantBillingService } from './tenant-billing.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [TenantBillingController],
  providers: [ControlPlaneBillingClient, TenantBillingService],
  exports: [TenantBillingService],
})
export class TenantBillingModule {}
