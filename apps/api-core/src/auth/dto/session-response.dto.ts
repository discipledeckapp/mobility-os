import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthSessionResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  role!: string;

  @ApiPropertyOptional()
  businessEntityId?: string | null;

  @ApiPropertyOptional()
  operatingUnitId?: string | null;

  @ApiPropertyOptional()
  tenantName?: string | null;

  @ApiPropertyOptional()
  tenantCountry?: string | null;

  @ApiPropertyOptional()
  defaultCurrency?: string | null;

  @ApiPropertyOptional()
  currencyMinorUnit?: number | null;

  @ApiPropertyOptional()
  formattingLocale?: string | null;

  @ApiProperty({ type: [String] })
  permissions!: string[];

  @ApiPropertyOptional()
  linkedDriverId?: string | null;

  @ApiPropertyOptional()
  linkedDriverStatus?: string | null;

  @ApiPropertyOptional()
  linkedDriverIdentityStatus?: string | null;

  @ApiPropertyOptional()
  mobileRole?: 'driver' | 'field_officer' | null;

  @ApiPropertyOptional()
  mobileAccessRevoked?: boolean | null;
}
