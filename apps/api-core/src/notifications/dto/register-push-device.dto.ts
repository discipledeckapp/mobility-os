import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterPushDeviceDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  deviceToken!: string;

  @ApiProperty({ enum: ['ios', 'android', 'web'] })
  @IsString()
  @IsIn(['ios', 'android', 'web'])
  platform!: 'ios' | 'android' | 'web';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  appVersion?: string;
}
