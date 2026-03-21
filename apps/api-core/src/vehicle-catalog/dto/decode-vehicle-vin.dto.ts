import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class DecodeVehicleVinDto {
  @ApiProperty({ description: 'Vehicle identification number to decode' })
  @IsString()
  @Length(11, 17)
  vin!: string;

  @ApiPropertyOptional({
    description: 'Optional model year hint for vPIC decode',
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  modelYear?: number;
}
