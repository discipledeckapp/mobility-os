import { WatchlistEntryType } from '@mobility-os/intelligence-domain';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const WATCHLIST_TYPES = Object.values(WatchlistEntryType);

export class CreateWatchlistEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  personId!: string;

  @ApiProperty({ enum: WATCHLIST_TYPES })
  @IsIn(WATCHLIST_TYPES)
  type!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({
    description: 'Optional expiry timestamp for temporary watchlist entries',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
