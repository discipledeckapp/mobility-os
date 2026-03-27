import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IdentifierResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  personId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  value!: string;

  @ApiPropertyOptional()
  countryCode?: string | null;

  @ApiProperty()
  isVerified!: boolean;

  @ApiProperty()
  createdAt!: Date;
}
