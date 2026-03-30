import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverMobileAccessPushDeviceDto {
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

  @ApiPropertyOptional()
  disabledAt?: string | null;
}

export class DriverMobileAccessUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  role!: string;

  @ApiPropertyOptional()
  accessMode?: 'tenant_user' | 'driver_mobile' | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional()
  mobileAccessRevoked?: boolean | null;

  @ApiPropertyOptional()
  activePushDeviceCount?: number;

  @ApiPropertyOptional()
  lastPushDeviceSeenAt?: string | null;

  @ApiPropertyOptional({ type: [DriverMobileAccessPushDeviceDto] })
  pushDevices?: DriverMobileAccessPushDeviceDto[];

  @ApiPropertyOptional()
  driverId?: string | null;

  @ApiPropertyOptional()
  matchReason?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class DriverMobileAccessResponseDto {
  @ApiPropertyOptional({ type: DriverMobileAccessUserDto })
  linkedUser?: DriverMobileAccessUserDto | null;

  @ApiProperty({ type: [DriverMobileAccessUserDto] })
  suggestedUsers!: DriverMobileAccessUserDto[];
}
