import { Module } from '@nestjs/common';
import { LinkageEventsService } from './linkage-events.service';

@Module({
  providers: [LinkageEventsService],
  exports: [LinkageEventsService],
})
export class LinkageEventsModule {}
