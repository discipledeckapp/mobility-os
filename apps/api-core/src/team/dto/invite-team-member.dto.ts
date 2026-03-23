import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const ALLOWED_ROLES = ['FLEET_MANAGER', 'FINANCE_OFFICER', 'FIELD_OFFICER', 'READ_ONLY'];

export class InviteTeamMemberDto {
  @ApiProperty({ example: 'Amaka Obi' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'amaka@acme-transport.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'FLEET_MANAGER',
    description: 'Role to assign. TENANT_OWNER cannot be granted via invite.',
    enum: ALLOWED_ROLES,
  })
  @IsIn(ALLOWED_ROLES)
  role!: string;

  @ApiProperty({ example: '+2348012345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
