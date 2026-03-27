import { Module } from '@nestjs/common';
import { PersonsModule } from '../persons/persons.module';
import { ReviewCasesModule } from '../review-cases/review-cases.module';
import { IdentifiersController } from './identifiers.controller';
import { IdentifiersService } from './identifiers.service';

@Module({
  imports: [PersonsModule, ReviewCasesModule],
  controllers: [IdentifiersController],
  providers: [IdentifiersService],
  exports: [IdentifiersService],
})
export class IdentifiersModule {}
