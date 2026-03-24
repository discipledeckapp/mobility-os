import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { VehicleRiskModule } from '../vehicle-risk/vehicle-risk.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceRepository } from './repositories/maintenance.repository';
import { MaintenanceService } from './services/maintenance-service';

@Module({
  imports: [AuthModule, AuditModule, VehiclesModule, VehicleRiskModule],
  controllers: [MaintenanceController],
  providers: [MaintenanceRepository, MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
