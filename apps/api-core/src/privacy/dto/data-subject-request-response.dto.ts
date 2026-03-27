import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DataSubjectRequestResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  subjectType!: string;

  @ApiPropertyOptional()
  subjectId?: string | null;

  @ApiProperty()
  requestType!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  contactEmail?: string | null;

  @ApiPropertyOptional()
  details?: string | null;

  @ApiPropertyOptional()
  resolutionNotes?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
