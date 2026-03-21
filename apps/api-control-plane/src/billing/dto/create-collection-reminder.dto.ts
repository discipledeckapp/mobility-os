import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const COLLECTION_REMINDER_CHANNELS = ['email', 'sms'] as const;

export class CreateCollectionReminderDto {
  @ApiProperty({ enum: COLLECTION_REMINDER_CHANNELS })
  @IsIn(COLLECTION_REMINDER_CHANNELS)
  channel!: (typeof COLLECTION_REMINDER_CHANNELS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
