import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BusinessEntitiesController } from './business-entities.controller';
import { BusinessEntitiesService } from './business-entities.service';

@Module({
  imports: [AuthModule],
  controllers: [BusinessEntitiesController],
  providers: [BusinessEntitiesService],
  exports: [BusinessEntitiesService],
})
export class BusinessEntitiesModule {}
