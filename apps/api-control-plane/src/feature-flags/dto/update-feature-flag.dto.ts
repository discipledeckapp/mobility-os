import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateFeatureFlagDto {
  @ApiProperty()
  @IsBoolean()
  isEnabled!: boolean;
}
