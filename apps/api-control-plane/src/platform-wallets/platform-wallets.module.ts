import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlatformWalletsInternalController } from './platform-wallets-internal.controller';
import { PlatformWalletsController } from './platform-wallets.controller';
import { PlatformWalletsService } from './platform-wallets.service';

@Module({
  imports: [AuthModule],
  controllers: [PlatformWalletsController, PlatformWalletsInternalController],
  providers: [PlatformWalletsService],
  exports: [PlatformWalletsService],
})
export class PlatformWalletsModule {}
