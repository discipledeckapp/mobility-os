import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberPushDeviceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['ios', 'android', 'web'] })
  platform!: 'ios' | 'android' | 'web';

  @ApiProperty()
  tokenPreview!: string;

  @ApiProperty()
  lastSeenAt!: string;

  @ApiProperty()
  registeredAt!: string;

  @ApiProperty({ nullable: true })
  disabledAt!: string | null;
}
