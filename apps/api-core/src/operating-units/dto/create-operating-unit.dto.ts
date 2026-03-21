import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateOperatingUnitDto {
  @ApiProperty({ description: 'ID of the parent BusinessEntity' })
  @IsString()
  @IsNotEmpty()
  businessEntityId!: string;

  @ApiProperty({ example: 'Ikeja Depot' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name!: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
