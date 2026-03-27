import { ApiProperty } from '@nestjs/swagger';

export class StaffMemberResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ required: false, nullable: true })
  invitationToken?: string | null;

  @ApiProperty({ required: false, nullable: true })
  invitationUrl?: string | null;

  @ApiProperty({ required: false, nullable: true })
  invitationExpiresAt?: string | null;
}
