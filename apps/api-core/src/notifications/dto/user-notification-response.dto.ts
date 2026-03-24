import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserNotificationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  topic!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  body!: string;

  @ApiPropertyOptional()
  actionUrl?: string | null;

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, unknown> | null;

  @ApiPropertyOptional()
  readAt?: string | null;

  @ApiProperty()
  createdAt!: string;
}
