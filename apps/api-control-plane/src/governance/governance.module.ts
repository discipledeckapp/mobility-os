import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ApiCoreGovernanceClient } from './api-core-governance.client';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';

@Module({
  imports: [AuthModule],
  controllers: [GovernanceController],
  providers: [ApiCoreGovernanceClient, GovernanceService],
  exports: [GovernanceService],
})
export class GovernanceModule {}
