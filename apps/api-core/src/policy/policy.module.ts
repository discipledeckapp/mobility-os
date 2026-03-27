import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { IntelligenceClient } from '../intelligence/intelligence.client';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [PolicyController],
  providers: [PolicyService, IntelligenceClient],
  exports: [PolicyService],
})
export class PolicyModule {}
