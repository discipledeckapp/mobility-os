import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateNotificationChannelPreferenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inApp?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  push?: boolean;
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ type: UpdateNotificationChannelPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationChannelPreferenceDto)
  remittance_due?: UpdateNotificationChannelPreferenceDto;

  @ApiPropertyOptional({ type: UpdateNotificationChannelPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationChannelPreferenceDto)
  remittance_overdue?: UpdateNotificationChannelPreferenceDto;

  @ApiPropertyOptional({ type: UpdateNotificationChannelPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationChannelPreferenceDto)
  remittance_reconciled?: UpdateNotificationChannelPreferenceDto;

  @ApiPropertyOptional({ type: UpdateNotificationChannelPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationChannelPreferenceDto)
  late_remittance_risk?: UpdateNotificationChannelPreferenceDto;

  @ApiPropertyOptional({ type: UpdateNotificationChannelPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationChannelPreferenceDto)
  compliance_risk?: UpdateNotificationChannelPreferenceDto;

  @ApiPropertyOptional({ type: UpdateNotificationChannelPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationChannelPreferenceDto)
  maintenance_due?: UpdateNotificationChannelPreferenceDto;

  @ApiPropertyOptional({ type: UpdateNotificationChannelPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationChannelPreferenceDto)
  maintenance_overdue?: UpdateNotificationChannelPreferenceDto;

  @ApiPropertyOptional({ type: UpdateNotificationChannelPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationChannelPreferenceDto)
  vehicle_incident_reported?: UpdateNotificationChannelPreferenceDto;

  @ApiPropertyOptional({ type: UpdateNotificationChannelPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationChannelPreferenceDto)
  self_service_invite?: UpdateNotificationChannelPreferenceDto;
}
