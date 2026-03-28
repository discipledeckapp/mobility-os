import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ApiCoreTenantsClient } from '../tenants/api-core-tenants.client';
import { ApiCoreReportsClient } from './api-core-reports.client';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';

@Module({
  imports: [AuthModule],
  controllers: [OperationsController],
  providers: [ApiCoreTenantsClient, ApiCoreReportsClient, OperationsService],
  exports: [OperationsService],
})
export class OperationsModule {}
