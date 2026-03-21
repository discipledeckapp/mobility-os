import { Module } from '@nestjs/common';
import { PersonsQueryController, PersonsStaffController } from './persons.controller';
import { PersonsService } from './persons.service';

@Module({
  controllers: [PersonsStaffController, PersonsQueryController],
  providers: [PersonsService],
  exports: [PersonsService],
})
export class PersonsModule {}
