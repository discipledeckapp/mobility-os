import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthEmailService } from './auth-email.service';
import { NotificationsService } from './notifications.service';
import { ZeptoMailService } from './zeptomail.service';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [ZeptoMailService, AuthEmailService, NotificationsService],
  exports: [ZeptoMailService, AuthEmailService, NotificationsService],
})
export class NotificationsModule {}
