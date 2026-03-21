import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @ApiPropertyOptional({ description: 'Optional fleet context selected by the operator' })
  @IsOptional()
  @IsString()
  fleetId?: string;

  @ApiProperty({ description: 'ID of the Driver to assign' })
  @IsString()
  @IsNotEmpty()
  driverId!: string;

  @ApiProperty({ description: 'ID of the Vehicle to assign' })
  @IsString()
  @IsNotEmpty()
  vehicleId!: string;

  @ApiPropertyOptional({ description: 'Optional notes at assignment start' })
  @IsOptional()
  @IsString()
  notes?: string;
}
