import { getAllBusinessModelSlugs } from '@mobility-os/domain-config';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class UpdateFleetDto {
  @ApiPropertyOptional({ description: 'ID of the parent OperatingUnit' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  operatingUnitId?: string;

  @ApiPropertyOptional({ example: 'Okada Fleet A' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @ApiPropertyOptional({
    description:
      'Business model slug. May differ from the parent BusinessEntity model ' +
      '(e.g. a mixed hire-purchase + lease fleet within one entity).',
    example: 'hire-purchase',
    enum: getAllBusinessModelSlugs(),
  })
  @IsOptional()
  @IsString()
  @IsIn(getAllBusinessModelSlugs(), {
    message: `businessModel must be one of: ${getAllBusinessModelSlugs().join(', ')}`,
  })
  businessModel?: string;
}
