import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
