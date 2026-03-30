import { ApiProperty } from '@nestjs/swagger';
import { TeamMemberPushDeviceResponseDto } from './team-member-push-device-response.dto';

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

  @ApiProperty({ type: [String] })
  assignedFleetIds!: string[];

  @ApiProperty({ type: [String] })
  assignedVehicleIds!: string[];

  @ApiProperty({ type: [String] })
  customPermissions!: string[];

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isEmailVerified!: boolean;

  @ApiProperty()
  mobileAccessRevoked!: boolean;

  @ApiProperty()
  activePushDeviceCount!: number;

  @ApiProperty({ nullable: true })
  lastPushDeviceSeenAt!: string | null;

  @ApiProperty({ type: [TeamMemberPushDeviceResponseDto] })
  pushDevices!: TeamMemberPushDeviceResponseDto[];

  @ApiProperty()
  createdAt!: string;
}
