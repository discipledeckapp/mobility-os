import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IntelligenceClient } from '../intelligence/intelligence.client';
import { TenantBillingModule } from '../tenant-billing/tenant-billing.module';
import { DocumentStorageService } from './document-storage.service';
import { DriverSelfServiceController, DriversController, GuarantorSelfServiceController } from './drivers.controller';
import { DriversService } from './drivers.service';

@Module({
  imports: [AuthModule, TenantBillingModule],
  controllers: [DriversController, DriverSelfServiceController, GuarantorSelfServiceController],
  providers: [DriversService, IntelligenceClient, DocumentStorageService],
  exports: [DriversService, IntelligenceClient, DocumentStorageService],
})
export class DriversModule {}
