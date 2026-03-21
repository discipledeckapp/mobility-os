import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OperatingUnitsController } from './operating-units.controller';
import { OperatingUnitsService } from './operating-units.service';

@Module({
  imports: [AuthModule],
  controllers: [OperatingUnitsController],
  providers: [OperatingUnitsService],
  exports: [OperatingUnitsService],
})
export class OperatingUnitsModule {}
