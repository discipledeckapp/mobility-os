import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PlatformWalletsModule } from '../platform-wallets/platform-wallets.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TenantLifecycleModule } from '../tenant-lifecycle/tenant-lifecycle.module';
import { ApiCoreTenantsClient } from './api-core-tenants.client';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    SubscriptionsModule,
    PlatformWalletsModule,
    TenantLifecycleModule,
  ],
  controllers: [TenantsController],
  providers: [ApiCoreTenantsClient, TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
