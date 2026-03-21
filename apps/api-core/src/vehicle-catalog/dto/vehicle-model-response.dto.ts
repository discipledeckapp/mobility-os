import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleModelResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  makerId!: string;

  @ApiProperty()
  makerName!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  vehicleCategory?: string | null;

  @ApiPropertyOptional()
  sourceTypeLabel?: string | null;

  @ApiPropertyOptional()
  externalSource?: string | null;

  @ApiPropertyOptional()
  externalId?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
