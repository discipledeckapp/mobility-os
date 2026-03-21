import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IntelligenceClient } from '../intelligence/intelligence.client';
import { DocumentStorageService } from './document-storage.service';
import { DriverSelfServiceController, DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

@Module({
  imports: [AuthModule],
  controllers: [DriversController, DriverSelfServiceController],
  providers: [DriversService, IntelligenceClient, DocumentStorageService],
  exports: [DriversService],
})
export class DriversModule {}
