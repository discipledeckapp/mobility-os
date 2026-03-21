import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverGuarantorResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  driverId!: string;

  @ApiPropertyOptional()
  personId?: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  phone!: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2' })
  countryCode?: string | null;

  @ApiPropertyOptional()
  relationship?: string | null;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  disconnectedAt?: Date | null;

  @ApiPropertyOptional()
  disconnectedReason?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
