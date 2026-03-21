import { Module } from '@nestjs/common';
import { PersonsModule } from '../persons/persons.module';
import { RiskService } from './risk.service';

// No HTTP controller yet — risk signals are written by the matching engine
// and read through the persons query endpoint. A staff controller exposing
// manual signal management is added alongside the MatchingModule.

@Module({
  imports: [PersonsModule],
  providers: [RiskService],
  exports: [RiskService],
})
export class RiskModule {}
