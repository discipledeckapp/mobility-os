import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TenantsModule } from '../tenants/tenants.module';
import { InternalTenantsController } from './internal-tenants.controller';

@Module({
  imports: [AuthModule, TenantsModule],
  controllers: [InternalTenantsController],
})
export class InternalTenantsModule {}
