import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { VehicleRiskModule } from '../vehicle-risk/vehicle-risk.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { InspectionsController } from './inspections.controller';
import { InspectionRepository } from './repositories/inspection.repository';
import { InspectionAiService } from './services/inspection-ai.service';
import { InspectionService } from './services/inspection-service';

@Module({
  imports: [AuthModule, AuditModule, VehiclesModule, VehicleRiskModule],
  controllers: [InspectionsController],
  providers: [InspectionRepository, InspectionAiService, InspectionService],
  exports: [InspectionService],
})
export class InspectionsModule {}
