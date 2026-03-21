import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

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

  @ApiProperty({ example: 'hire-purchase' })
  @IsString()
  @IsNotEmpty()
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

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @Length(8, 200)
  operatorPassword!: string;

  @ApiProperty({ example: 'plan_cuid' })
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialPlatformWalletCreditMinorUnits?: number;
}
