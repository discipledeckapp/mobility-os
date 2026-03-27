import { Module } from '@nestjs/common';
import { LinkageEventsModule } from '../linkage-events/linkage-events.module';
import { PersonsInternalController, PersonsQueryController, PersonsStaffController } from './persons.controller';
import { PersonsService } from './persons.service';

@Module({
  imports: [LinkageEventsModule],
  controllers: [PersonsStaffController, PersonsQueryController, PersonsInternalController],
  providers: [PersonsService],
  exports: [PersonsService],
})
export class PersonsModule {}
