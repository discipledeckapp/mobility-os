import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PrivacySupportResponseDto {
  @ApiProperty()
  supportEmail!: string;

  @ApiPropertyOptional()
  supportPhonePrimary?: string | null;

  @ApiPropertyOptional()
  supportPhoneSecondary?: string | null;

  @ApiProperty()
  privacyPolicyVersion!: string;

  @ApiProperty()
  termsVersion!: string;
}
