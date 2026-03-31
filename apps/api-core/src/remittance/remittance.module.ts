import { forwardRef, Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AssignmentsModule } from '../assignments/assignments.module';
import { AuthModule } from '../auth/auth.module';
import { OperationalWalletsModule } from '../operational-wallets/operational-wallets.module';
import { PolicyModule } from '../policy/policy.module';
import { RecordsModule } from '../records/records.module';
import { RemittanceController } from './remittance.controller';
import { RemittanceService } from './remittance.service';

@Module({
  imports: [
    AuditModule,
    forwardRef(() => AssignmentsModule),
    AuthModule,
    OperationalWalletsModule,
    PolicyModule,
    RecordsModule,
  ],
  controllers: [RemittanceController],
  providers: [RemittanceService],
  exports: [RemittanceService],
})
export class RemittanceModule {}
