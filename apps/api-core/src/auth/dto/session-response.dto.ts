import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationPreferencesDto } from '../../notifications/dto/notification-preferences.dto';

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

  @ApiPropertyOptional()
  organisationDisplayName?: string | null;

  @ApiPropertyOptional()
  organisationLogoUrl?: string | null;

  @ApiPropertyOptional()
  defaultLanguage?: 'en' | 'fr';

  @ApiPropertyOptional()
  preferredLanguage?: 'en' | 'fr';

  @ApiPropertyOptional()
  guarantorMaxActiveDrivers?: number;

  @ApiPropertyOptional({ type: NotificationPreferencesDto })
  notificationPreferences?: NotificationPreferencesDto;

  @ApiProperty({ type: [String] })
  permissions!: string[];

  @ApiProperty({ type: [String] })
  assignedFleetIds!: string[];

  @ApiProperty({ type: [String] })
  customPermissions!: string[];

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
