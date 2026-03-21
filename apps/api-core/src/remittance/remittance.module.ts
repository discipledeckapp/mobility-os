import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OperationalWalletsModule } from '../operational-wallets/operational-wallets.module';
import { RemittanceController } from './remittance.controller';
import { RemittanceService } from './remittance.service';

@Module({
  imports: [AuthModule, OperationalWalletsModule],
  controllers: [RemittanceController],
  providers: [RemittanceService],
  exports: [RemittanceService],
})
export class RemittanceModule {}
