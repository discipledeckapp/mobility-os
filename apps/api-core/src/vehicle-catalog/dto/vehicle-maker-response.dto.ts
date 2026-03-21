import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleMakerResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  externalSource?: string | null;

  @ApiPropertyOptional()
  externalId?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
