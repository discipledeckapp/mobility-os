import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  phone!: string | null;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isEmailVerified!: boolean;

  @ApiProperty()
  createdAt!: string;
}
