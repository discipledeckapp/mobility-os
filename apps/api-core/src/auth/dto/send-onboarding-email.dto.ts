import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class SendOnboardingEmailDto {
  @ApiProperty({ example: 'owner@tenant.com or +2348012345678' })
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @ApiProperty({ example: 'https://mobiris.ng/login', required: false })
  @IsOptional()
  @IsUrl()
  loginUrl?: string;
}
