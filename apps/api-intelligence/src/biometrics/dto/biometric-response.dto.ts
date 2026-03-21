import { ApiProperty } from '@nestjs/swagger';

// embeddingCiphertext is intentionally excluded from this DTO.
// Encrypted bytes are never returned to API callers — they are only
// read within the matching service for in-process decryption.

export class BiometricResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  personId!: string;

  @ApiProperty({ description: 'BiometricModality: face | fingerprint' })
  modality!: string;

  @ApiProperty({ description: 'Quality score of the source image at enrollment (0.0–1.0)' })
  qualityScore!: number;

  @ApiProperty({ description: 'False after a superseding enrollment or erasure request' })
  isActive!: boolean;

  @ApiProperty()
  enrolledAt!: Date;
}
