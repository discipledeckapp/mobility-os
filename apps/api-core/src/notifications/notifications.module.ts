import { Global, Module } from '@nestjs/common';
import { AuthEmailService } from './auth-email.service';
import { ZeptoMailService } from './zeptomail.service';

@Global()
@Module({
  providers: [ZeptoMailService, AuthEmailService],
  exports: [ZeptoMailService, AuthEmailService],
})
export class NotificationsModule {}
