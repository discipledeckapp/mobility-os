import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateTeamMemberMobileAccessDto {
  @ApiProperty()
  @IsBoolean()
  revoked!: boolean;
}
