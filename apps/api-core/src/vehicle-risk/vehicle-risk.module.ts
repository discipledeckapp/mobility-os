import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { VehicleRiskController } from './vehicle-risk.controller';
import { VehicleRiskService } from './services/vehicle-risk.service';

@Module({
  imports: [AuthModule, VehiclesModule],
  controllers: [VehicleRiskController],
  providers: [VehicleRiskService],
  exports: [VehicleRiskService],
})
export class VehicleRiskModule {}
