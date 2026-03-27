import { ApiProperty } from '@nestjs/swagger';

export class StaffInvitationPreviewDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  expiresAt!: string;
}
