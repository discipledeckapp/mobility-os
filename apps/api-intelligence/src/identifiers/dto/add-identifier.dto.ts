import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const identifierTypes = [
  'NATIONAL_ID',
  'BANK_ID',
  'PASSPORT',
  'DRIVERS_LICENSE',
  'PHONE',
  'EMAIL',
  'TAX_ID',
] as const;

export class AddIdentifierDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  personId!: string;

  @ApiProperty({ enum: identifierTypes })
  @IsString()
  @IsIn(identifierTypes)
  type!: (typeof identifierTypes)[number];

  @ApiProperty()
  @IsString()
  @MinLength(1)
  value!: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country code' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  countryCode?: string;
}
