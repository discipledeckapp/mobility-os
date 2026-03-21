import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GuarantorsController } from './guarantors.controller';
import { GuarantorsService } from './guarantors.service';

@Module({
  imports: [AuthModule],
  controllers: [GuarantorsController],
  providers: [GuarantorsService],
  exports: [GuarantorsService],
})
export class GuarantorsModule {}
