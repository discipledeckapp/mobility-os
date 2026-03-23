import { ApiProperty } from '@nestjs/swagger';

export class DriverDocumentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  driverId!: string;

  @ApiProperty()
  documentType!: string;

  @ApiProperty()
  fileName!: string;

  @ApiProperty()
  contentType!: string;

  @ApiProperty({ required: false })
  storageKey?: string | null;

  @ApiProperty({
    required: false,
    description: 'Canonical backing storage URL for this document object.',
  })
  storageUrl?: string | null;

  @ApiProperty({
    required: false,
    description: 'Tenant-authenticated preview URL for this document.',
  })
  previewUrl?: string | null;

  @ApiProperty()
  uploadedBy!: string;

  @ApiProperty({ description: 'pending | approved | rejected | expired' })
  status!: string;

  @ApiProperty({ required: false })
  expiresAt?: Date | null;

  @ApiProperty({ required: false })
  reviewedBy?: string | null;

  @ApiProperty({ required: false })
  reviewedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
