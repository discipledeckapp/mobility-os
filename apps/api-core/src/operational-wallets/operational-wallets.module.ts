import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OperationalWalletsController } from './operational-wallets.controller';
import { OperationalWalletsService } from './operational-wallets.service';

@Module({
  imports: [AuthModule],
  controllers: [OperationalWalletsController],
  providers: [OperationalWalletsService],
  exports: [OperationalWalletsService],
})
export class OperationalWalletsModule {}
