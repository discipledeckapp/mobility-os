import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MeteringInternalController } from './metering-internal.controller';
import { MeteringService } from './metering.service';

@Module({
  imports: [AuthModule],
  controllers: [MeteringInternalController],
  providers: [MeteringService],
  exports: [MeteringService],
})
export class MeteringModule {}
