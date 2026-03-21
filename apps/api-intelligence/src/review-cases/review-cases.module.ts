import { Module } from '@nestjs/common';
import { PersonsModule } from '../persons/persons.module';
import { ReviewCasesController } from './review-cases.controller';
import { ReviewCasesService } from './review-cases.service';

@Module({
  imports: [PersonsModule],
  controllers: [ReviewCasesController],
  providers: [ReviewCasesService],
  exports: [ReviewCasesService],
})
export class ReviewCasesModule {}
