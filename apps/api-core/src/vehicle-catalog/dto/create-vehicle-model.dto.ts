import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateVehicleModelDto {
  @ApiProperty({ example: 'maker_123' })
  @IsString()
  @IsNotEmpty()
  makerId!: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name!: string;

  @ApiPropertyOptional({ example: 'saloon' })
  @IsOptional()
  @IsString()
  vehicleType?: string;
}
