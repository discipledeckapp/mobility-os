import { getAllBusinessModelSlugs } from '@mobility-os/domain-config';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateBusinessEntityDto {
  @ApiProperty({ example: 'Lagos North Operations' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name!: string;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2. May differ from tenant country for multi-country operators.',
    example: 'NG',
  })
  @IsString()
  @Length(2, 2)
  country!: string;

  @ApiProperty({
    description: 'Business model slug from domain-config BUSINESS_MODELS registry.',
    example: 'hire-purchase',
    enum: getAllBusinessModelSlugs(),
  })
  @IsString()
  @IsIn(getAllBusinessModelSlugs(), {
    message: `businessModel must be one of: ${getAllBusinessModelSlugs().join(', ')}`,
  })
  businessModel!: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
