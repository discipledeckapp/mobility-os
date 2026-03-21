import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InternalProvisioningController } from './internal-provisioning.controller';
import { InternalProvisioningService } from './internal-provisioning.service';

@Module({
  imports: [AuthModule],
  controllers: [InternalProvisioningController],
  providers: [InternalProvisioningService],
})
export class InternalProvisioningModule {}
