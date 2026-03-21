import { Module } from '@nestjs/common';
import { AssignmentsModule } from '../assignments/assignments.module';
import { AuthModule } from '../auth/auth.module';
import { DriversModule } from '../drivers/drivers.module';
import { RemittanceModule } from '../remittance/remittance.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { MobileLogController } from './mobile-log.controller';
import { MobileLogService } from './mobile-log.service';
import { MobileOpsController } from './mobile-ops.controller';

@Module({
  imports: [AuthModule, DriversModule, AssignmentsModule, RemittanceModule, VehiclesModule],
  controllers: [MobileOpsController, MobileLogController],
  providers: [MobileLogService],
})
export class MobileOpsModule {}
