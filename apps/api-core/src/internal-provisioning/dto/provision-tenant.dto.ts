import { getAllBusinessModelSlugs } from '@mobility-os/domain-config';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class ProvisionTenantDto {
  @ApiProperty({ example: 'mobiris-demo' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'tenantSlug must be lowercase, URL-safe, and hyphen-delimited only',
  })
  tenantSlug!: string;

  @ApiProperty({ example: 'Mobiris Demo Tenant' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  tenantName!: string;

  @ApiProperty({ example: 'NG' })
  @IsString()
  @Length(2, 2)
  tenantCountry!: string;

  @ApiProperty({ example: 'Mobiris Demo Operations' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  businessEntityName!: string;

  @ApiProperty({
    example: 'hire-purchase',
    enum: getAllBusinessModelSlugs(),
  })
  @IsString()
  @IsIn(getAllBusinessModelSlugs(), {
    message: `businessModel must be one of: ${getAllBusinessModelSlugs().join(', ')}`,
  })
  businessModel!: string;

  @ApiPropertyOptional({ example: 'Main Depot' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  operatingUnitName?: string;

  @ApiPropertyOptional({ example: 'Main Fleet' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  fleetName?: string;

  @ApiProperty({ example: 'NGN' })
  @IsString()
  @Length(3, 3)
  walletCurrency!: string;

  @ApiProperty({ example: 'Operator Admin' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  operatorName!: string;

  @ApiProperty({ example: 'ops@example.com' })
  @IsEmail()
  operatorEmail!: string;

  @ApiPropertyOptional({ example: '+2348000000000' })
  @IsOptional()
  @IsString()
  @Length(5, 32)
  operatorPhone?: string;

  @ApiProperty({ minLength: 8, example: 'StrongPass123!' })
  @IsString()
  @Length(8, 200)
  operatorPassword!: string;
}
