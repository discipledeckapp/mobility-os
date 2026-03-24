import { ApiProperty } from '@nestjs/swagger';

class NotificationChannelPreferenceDto {
  @ApiProperty()
  email!: boolean;

  @ApiProperty()
  inApp!: boolean;

  @ApiProperty()
  push!: boolean;
}

export class NotificationPreferencesDto {
  @ApiProperty({ type: NotificationChannelPreferenceDto })
  remittance_due!: NotificationChannelPreferenceDto;

  @ApiProperty({ type: NotificationChannelPreferenceDto })
  remittance_overdue!: NotificationChannelPreferenceDto;

  @ApiProperty({ type: NotificationChannelPreferenceDto })
  remittance_reconciled!: NotificationChannelPreferenceDto;

  @ApiProperty({ type: NotificationChannelPreferenceDto })
  late_remittance_risk!: NotificationChannelPreferenceDto;

  @ApiProperty({ type: NotificationChannelPreferenceDto })
  compliance_risk!: NotificationChannelPreferenceDto;

  @ApiProperty({ type: NotificationChannelPreferenceDto })
  self_service_invite!: NotificationChannelPreferenceDto;
}
