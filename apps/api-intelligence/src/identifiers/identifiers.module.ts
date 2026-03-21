import { Module } from '@nestjs/common';
import { PersonsModule } from '../persons/persons.module';
import { ReviewCasesModule } from '../review-cases/review-cases.module';
import { IdentifiersService } from './identifiers.service';

// No controller yet — identifiers are managed through the matching engine
// in the normal flow. A staff controller will be added alongside the
// MatchingModule in a later batch.

@Module({
  imports: [PersonsModule, ReviewCasesModule],
  providers: [IdentifiersService],
  exports: [IdentifiersService],
})
export class IdentifiersModule {}
