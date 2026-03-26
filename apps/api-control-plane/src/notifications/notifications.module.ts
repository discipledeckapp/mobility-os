import { Module } from '@nestjs/common';
import { StaffNotificationService } from './staff-notification.service';

@Module({
  providers: [StaffNotificationService],
  exports: [StaffNotificationService],
})
export class NotificationsModule {}
