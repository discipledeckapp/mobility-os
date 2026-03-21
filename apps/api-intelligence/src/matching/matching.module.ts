import { Module } from '@nestjs/common';
import { IntelligenceApiKeyGuard } from '../auth/guards/intelligence-api-key.guard';
import { BiometricsModule } from '../biometrics/biometrics.module';
import { IdentifiersModule } from '../identifiers/identifiers.module';
import { LinkageEventsModule } from '../linkage-events/linkage-events.module';
import { PersonsModule } from '../persons/persons.module';
import { ProvidersModule } from '../providers/providers.module';
import { ReviewCasesModule } from '../review-cases/review-cases.module';
import { MatchingInternalController } from './matching-internal.controller';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [
    PersonsModule,
    IdentifiersModule,
    BiometricsModule,
    LinkageEventsModule,
    ProvidersModule,
    ReviewCasesModule,
  ],
  controllers: [MatchingController, MatchingInternalController],
  providers: [MatchingService, IntelligenceApiKeyGuard],
  exports: [MatchingService],
})
export class MatchingModule {}
