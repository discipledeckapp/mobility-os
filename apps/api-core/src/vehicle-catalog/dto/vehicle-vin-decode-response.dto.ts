import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleVinDecodeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  vin!: string;

  @ApiPropertyOptional()
  requestedModelYear?: number | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  source!: string;

  @ApiPropertyOptional()
  sourceVersion?: string | null;

  @ApiPropertyOptional()
  errorCode?: string | null;

  @ApiPropertyOptional()
  errorText?: string | null;

  @ApiPropertyOptional()
  decodedMake?: string | null;

  @ApiPropertyOptional()
  decodedModel?: string | null;

  @ApiPropertyOptional()
  decodedModelYear?: number | null;

  @ApiPropertyOptional()
  vehicleType?: string | null;

  @ApiPropertyOptional()
  bodyClass?: string | null;

  @ApiPropertyOptional()
  manufacturerName?: string | null;

  @ApiPropertyOptional()
  makerId?: string | null;

  @ApiPropertyOptional()
  makerName?: string | null;

  @ApiPropertyOptional()
  modelId?: string | null;

  @ApiPropertyOptional()
  modelName?: string | null;

  @ApiProperty({
    description: 'Raw vPIC decode payload for audit and debugging',
    type: Object,
  })
  rawPayload!: unknown;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
