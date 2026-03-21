import { BiometricModality } from '@mobility-os/intelligence-domain';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

const MODALITIES = Object.values(BiometricModality);

export class EnrollBiometricDto {
  @ApiProperty({ description: 'ID of the IntelPerson to enroll the biometric for' })
  @IsString()
  @IsNotEmpty()
  personId!: string;

  @ApiProperty({ enum: MODALITIES, description: 'BiometricModality: face | fingerprint' })
  @IsIn(MODALITIES)
  modality!: string;

  @ApiProperty({
    description:
      'Base64-encoded raw embedding vector (float32 array). ' +
      'Never stored raw — encrypted with AES-256-GCM before persistence.',
  })
  @IsString()
  @IsNotEmpty()
  embeddingBase64!: string;

  @ApiProperty({
    description:
      'Quality score of the source image (0.0–1.0). ' +
      'Enrollments below BIOMETRIC_MIN_QUALITY_SCORE are rejected.',
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  qualityScore!: number;
}
