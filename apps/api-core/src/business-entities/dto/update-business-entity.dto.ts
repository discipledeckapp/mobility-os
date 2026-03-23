import { getAllBusinessModelSlugs } from '@mobility-os/domain-config';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class UpdateBusinessEntityDto {
  @ApiPropertyOptional({ example: 'Lagos North Operations' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @ApiPropertyOptional({
    description: 'ISO 3166-1 alpha-2. May differ from tenant country for multi-country operators.',
    example: 'NG',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @ApiPropertyOptional({
    description: 'Business model slug from domain-config BUSINESS_MODELS registry.',
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
