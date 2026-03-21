import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'owner@tenant.com or +2348012345678' })
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}
