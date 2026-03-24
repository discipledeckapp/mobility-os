import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TenantBillingModule } from '../tenant-billing/tenant-billing.module';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  imports: [AuthModule, TenantBillingModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
