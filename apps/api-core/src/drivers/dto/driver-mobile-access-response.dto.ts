import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty()
  isActive!: boolean;

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
