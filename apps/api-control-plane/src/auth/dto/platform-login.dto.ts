import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class PlatformLoginDto {
  @ApiProperty({ example: 'admin@mobiris.ng' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongAdminPassword123!' })
  @IsString()
  @Length(8, 200)
  password!: string;
}
