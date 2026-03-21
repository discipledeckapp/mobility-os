import { Module } from '@nestjs/common';
import { PersonsModule } from '../persons/persons.module';
import { ReviewCasesModule } from '../review-cases/review-cases.module';
import { BiometricsService } from './biometrics.service';

// No HTTP controller — biometric enrollment is triggered internally by the
// matching engine, not directly by tenant API callers. BiometricsService is
// exported for use by MatchingModule.

@Module({
  imports: [PersonsModule, ReviewCasesModule],
  providers: [BiometricsService],
  exports: [BiometricsService],
})
export class BiometricsModule {}
