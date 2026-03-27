import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { IntelligenceClient } from '../intelligence/intelligence.client';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';

@Module({
  imports: [AuditModule],
  controllers: [PolicyController],
  providers: [PolicyService, IntelligenceClient],
  exports: [PolicyService],
})
export class PolicyModule {}
