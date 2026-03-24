import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DriversModule } from '../drivers/drivers.module';
import { VehicleRiskModule } from '../vehicle-risk/vehicle-risk.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [AuthModule, DriversModule, VehiclesModule, VehicleRiskModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
