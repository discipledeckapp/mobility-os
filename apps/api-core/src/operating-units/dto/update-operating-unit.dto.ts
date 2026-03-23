import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateOperatingUnitDto {
  @ApiPropertyOptional({ description: 'ID of the parent BusinessEntity' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  businessEntityId?: string;

  @ApiPropertyOptional({ example: 'Ikeja Depot' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;
}
