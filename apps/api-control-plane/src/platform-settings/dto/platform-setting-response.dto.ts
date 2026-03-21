import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlatformSettingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty({
    type: Object,
    additionalProperties: true,
  })
  value!: unknown;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
