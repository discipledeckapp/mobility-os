import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SelfSignupController } from './self-signup.controller';
import { SelfSignupService } from './self-signup.service';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [SelfSignupController],
  providers: [SelfSignupService],
})
export class SelfSignupModule {}
