import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestPlatformPasswordResetDto {
  @ApiProperty({ example: 'ops@mobiris.io' })
  @IsEmail()
  email!: string;
}
