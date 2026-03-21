import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlatformSettingsInternalController } from './platform-settings-internal.controller';
import { PlatformSettingsBootstrap } from './platform-settings.bootstrap';
import { PlatformSettingsController } from './platform-settings.controller';
import { PlatformSettingsService } from './platform-settings.service';

@Module({
  imports: [AuthModule],
  controllers: [PlatformSettingsController, PlatformSettingsInternalController],
  providers: [PlatformSettingsService, PlatformSettingsBootstrap],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
