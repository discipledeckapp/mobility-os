import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TenantLifecycleInternalController } from './tenant-lifecycle-internal.controller';
import { TenantLifecycleController } from './tenant-lifecycle.controller';
import { TenantLifecycleService } from './tenant-lifecycle.service';

@Module({
  imports: [AuthModule],
  controllers: [TenantLifecycleController, TenantLifecycleInternalController],
  providers: [TenantLifecycleService],
  exports: [TenantLifecycleService],
})
export class TenantLifecycleModule {}
