import { DocumentScope, getDocumentTypesByScope } from '@mobility-os/domain-config';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const DRIVER_DOCUMENT_TYPES = getDocumentTypesByScope(DocumentScope.Driver).map(
  (document) => document.slug,
);
export class CreateDriverDocumentDto {
  @ApiProperty({ enum: DRIVER_DOCUMENT_TYPES })
  @IsString()
  @IsIn(DRIVER_DOCUMENT_TYPES)
  documentType!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @ApiProperty({
    description:
      'Base64 representation of the uploaded file payload. The API stores the file through the document storage service instead of inline in the database.',
  })
  @IsString()
  @IsNotEmpty()
  fileBase64!: string;

  @ApiPropertyOptional({
    description: 'Deprecated testing-only fallback. Prefer fileBase64 for all new uploads.',
  })
  @IsOptional()
  @IsString()
  fileDataUrl?: string;

  @ApiProperty({
    description:
      "Actor responsible for the upload. Use a concrete operator user ID for operator uploads, or 'driver_self_service' for self-service submissions.",
    example: 'user_123',
  })
  @IsString()
  @IsNotEmpty()
  uploadedBy!: string;
}
