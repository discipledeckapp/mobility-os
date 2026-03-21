import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WatchlistEntryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  personId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  reason!: string;

  @ApiProperty()
  addedBy!: string;

  @ApiPropertyOptional()
  expiresAt!: Date | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
