import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverGuarantorResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  driverId!: string;

  @ApiPropertyOptional()
  personId?: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  phone!: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2' })
  countryCode?: string | null;

  @ApiPropertyOptional()
  relationship?: string | null;

  @ApiPropertyOptional({ description: 'ISO 8601 date (YYYY-MM-DD)' })
  dateOfBirth?: string | null;

  @ApiPropertyOptional()
  gender?: string | null;

  @ApiPropertyOptional({ description: 'Stored object URL for the captured live-selfie image.' })
  selfieImageUrl?: string | null;

  @ApiPropertyOptional({ description: 'Stored object URL for the provider or government-record identity image.' })
  providerImageUrl?: string | null;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  inviteStatus?: string | null;

  @ApiPropertyOptional()
  lastInviteSentAt?: Date | null;

  @ApiPropertyOptional()
  inviteExpiresAt?: Date | null;

  @ApiPropertyOptional()
  guarantorReminderCount?: number | null;

  @ApiPropertyOptional()
  lastGuarantorReminderSentAt?: Date | null;

  @ApiPropertyOptional()
  guarantorReminderSuppressed?: boolean | null;

  @ApiPropertyOptional()
  disconnectedAt?: Date | null;

  @ApiPropertyOptional()
  disconnectedReason?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
