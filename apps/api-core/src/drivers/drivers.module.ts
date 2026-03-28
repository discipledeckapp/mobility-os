import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { IntelligenceClient } from '../intelligence/intelligence.client';
import { PolicyModule } from '../policy/policy.module';
import { TenantBillingModule } from '../tenant-billing/tenant-billing.module';
import { DocumentStorageService } from './document-storage.service';
import { DriversVerificationSchedulerService } from './drivers-verification-scheduler.service';
import { DriverSelfServiceController, DriversController, GuarantorSelfServiceController } from './drivers.controller';
import { DriversService } from './drivers.service';

@Module({
  imports: [AuthModule, TenantBillingModule, PolicyModule, AuditModule],
  controllers: [DriversController, DriverSelfServiceController, GuarantorSelfServiceController],
  providers: [DriversService, IntelligenceClient, DocumentStorageService, DriversVerificationSchedulerService],
  exports: [DriversService, IntelligenceClient, DocumentStorageService],
})
export class DriversModule {}
