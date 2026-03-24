import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DriversModule } from '../drivers/drivers.module';
import { VehicleRiskModule } from '../vehicle-risk/vehicle-risk.module';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

@Module({
  imports: [AuthModule, DriversModule, VehicleRiskModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
