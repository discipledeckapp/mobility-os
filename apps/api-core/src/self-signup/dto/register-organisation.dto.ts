import { getAllBusinessModelSlugs, getSupportedCountryCodes } from '@mobility-os/domain-config';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class RegisterOrganisationDto {
  // ── Organisation ────────────────────────────────────────────────────────────

  @ApiProperty({ example: 'Acme Transport Ltd' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  orgName!: string;

  @ApiProperty({
    example: 'acme-transport',
    description: 'Lowercase, URL-safe, hyphen-delimited identifier. Must be globally unique.',
  })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, numbers, and hyphens only',
  })
  @Length(3, 60)
  slug!: string;

  @ApiProperty({
    example: 'NG',
    description: 'ISO 3166-1 alpha-2 country code.',
  })
  @IsString()
  @IsIn(getSupportedCountryCodes(), {
    message: `country must be one of the supported countries: ${getSupportedCountryCodes().join(', ')}`,
  })
  country!: string;

  @ApiProperty({
    example: 'hire-purchase',
    enum: getAllBusinessModelSlugs(),
  })
  @IsString()
  @IsIn(getAllBusinessModelSlugs(), {
    message: `businessModel must be one of: ${getAllBusinessModelSlugs().join(', ')}`,
  })
  businessModel!: string;

  // ── Administrator ────────────────────────────────────────────────────────────

  @ApiProperty({ example: 'Adaeze Okonkwo' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  adminName!: string;

  @ApiProperty({ example: 'adaeze@acmetransport.ng' })
  @IsEmail()
  adminEmail!: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  @Length(5, 32)
  adminPhone?: string;

  @ApiProperty({ minLength: 8, example: 'FleetPass123!' })
  @IsString()
  @Length(8, 200)
  adminPassword!: string;
}
