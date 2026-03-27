import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ControlPlaneRecordsController } from './records.controller';
import { ControlPlaneDocumentStorageService } from './document-storage.service';
import { ControlPlaneRecordsService } from './records.service';

@Module({
  imports: [AuthModule],
  controllers: [ControlPlaneRecordsController],
  providers: [ControlPlaneDocumentStorageService, ControlPlaneRecordsService],
  exports: [ControlPlaneRecordsService],
})
export class ControlPlaneRecordsModule {}
