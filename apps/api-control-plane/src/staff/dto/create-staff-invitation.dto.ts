import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

const ALLOWED_ROLES = ['PLATFORM_ADMIN', 'SUPPORT_AGENT', 'BILLING_OPS'];

export class CreateStaffInvitationDto {
  @ApiProperty({ example: 'Seun Adeyemi' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'seun@mobiris.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'SUPPORT_AGENT',
    enum: ALLOWED_ROLES,
  })
  @IsIn(ALLOWED_ROLES)
  role!: string;
}
