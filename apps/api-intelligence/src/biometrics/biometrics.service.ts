import * as crypto from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { IntelBiometricProfile } from '../generated/prisma';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PersonsService } from '../persons/persons.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ReviewCasesService } from '../review-cases/review-cases.service';
import type { BiometricResponseDto } from './dto/biometric-response.dto';
import type { EnrollBiometricDto } from './dto/enroll-biometric.dto';

export interface ExactBiometricConflict {
  personId: string;
  biometricProfileId: string;
}

// AES-256-GCM constants.
const ALGORITHM = 'aes-256-gcm' as const;
const IV_BYTES = 12; // 96-bit nonce — GCM standard
const TAG_BYTES = 16; // 128-bit auth tag
const KEY_BYTES = 32; // 256-bit key

@Injectable()
export class BiometricsService {
  private readonly encryptionKey: Buffer;
  private readonly minQualityScore: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly personsService: PersonsService,
    private readonly reviewCasesService: ReviewCasesService,
    private readonly configService: ConfigService,
  ) {
    const keyBase64 = this.configService.getOrThrow<string>('BIOMETRIC_ENCRYPTION_KEY');
    const keyBuf = Buffer.from(keyBase64, 'base64');

    if (keyBuf.length !== KEY_BYTES) {
      throw new InternalServerErrorException(
        `BIOMETRIC_ENCRYPTION_KEY must decode to exactly ${KEY_BYTES} bytes (got ${keyBuf.length})`,
      );
    }

    this.encryptionKey = keyBuf;
    this.minQualityScore = this.configService.get<number>('BIOMETRIC_MIN_QUALITY_SCORE', 0.7);
  }

  async enroll(dto: EnrollBiometricDto): Promise<IntelBiometricProfile> {
    await this.personsService.findById(dto.personId);

    if (dto.qualityScore < this.minQualityScore) {
      throw new BadRequestException(
        `Quality score ${dto.qualityScore} is below the minimum threshold ` +
          `${this.minQualityScore}. Re-capture the biometric with better source quality.`,
      );
    }

    const embeddingBytes = Buffer.from(dto.embeddingBase64, 'base64');
    const embeddingHash = crypto.createHash('sha256').update(embeddingBytes).digest('hex');
    await this.detectCrossPersonConflict(dto.personId, dto.modality, embeddingBytes);
    const ciphertext = this.encrypt(embeddingBytes);

    // Deactivate any existing active profile for the same modality before enrolling.
    // Superseded profiles are retained (isActive=false) for audit purposes.
    await this.prisma.intelBiometricProfile.updateMany({
      where: { personId: dto.personId, modality: dto.modality, isActive: true },
      data: { isActive: false },
    });

    const profile = await this.prisma.intelBiometricProfile.create({
      data: {
        personId: dto.personId,
        modality: dto.modality,
        embeddingCiphertext: ciphertext,
        embeddingHash,
        qualityScore: dto.qualityScore,
        isActive: true,
      },
    });

    await this.prisma.intelPerson.update({
      where: { id: dto.personId },
      data: { primaryBiometricProfileId: profile.id },
    });

    return profile;
  }

  async listByPerson(personId: string, activeOnly = true): Promise<BiometricResponseDto[]> {
    await this.personsService.findById(personId);

    return this.prisma.intelBiometricProfile.findMany({
      where: { personId, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: { enrolledAt: 'desc' },
      // Never select embeddingCiphertext — callers never need raw bytes.
      select: {
        id: true,
        personId: true,
        modality: true,
        qualityScore: true,
        isActive: true,
        enrolledAt: true,
        embeddingCiphertext: false,
      },
    });
  }

  async deactivate(id: string): Promise<IntelBiometricProfile> {
    const profile = await this.prisma.intelBiometricProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException(`BiometricProfile '${id}' not found`);
    }

    if (!profile.isActive) {
      throw new BadRequestException(`BiometricProfile '${id}' is already inactive`);
    }

    return this.prisma.intelBiometricProfile.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Decrypts a stored ciphertext and returns the raw embedding bytes.
   * Used exclusively by the MatchingService in-process — never exposed to API callers.
   *
   * Ciphertext layout: [12-byte IV][16-byte GCM tag][N-byte ciphertext]
   */
  decryptEmbedding(ciphertext: Buffer): Buffer {
    const iv = ciphertext.subarray(0, IV_BYTES);
    const tag = ciphertext.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
    const encrypted = ciphertext.subarray(IV_BYTES + TAG_BYTES);

    const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }

  /**
   * Encrypts raw embedding bytes.
   * Output layout: [12-byte IV][16-byte GCM tag][N-byte ciphertext]
   */
  private encrypt(plaintext: Buffer): Buffer {
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]);
  }

  private async detectCrossPersonConflict(
    personId: string,
    modality: string,
    candidateEmbedding: Buffer,
  ): Promise<void> {
    const conflict = await this.findExactConflict(modality, candidateEmbedding, personId);

    if (conflict) {
      const reviewCase = await this.reviewCasesService.create({
        personId,
        // Exact raw embedding equality is treated here as a high-confidence
        // conflict, but still requires human adjudication.
        confidenceScore: 0.99,
        evidence: {
          conflictType: 'biometric_conflict',
          modality,
          submittedPersonId: personId,
          existingPersonId: conflict.personId,
          existingBiometricProfileId: conflict.biometricProfileId,
        },
        notes: `Exact biometric collision detected for modality '${modality}'. Manual review required before enrollment can proceed.`,
      });

      await Promise.all([
        this.personsService.setDuplicateFlag(personId, true),
        this.personsService.setDuplicateFlag(conflict.personId, true),
      ]);

      throw new ConflictException(
        `Biometric conflict detected for modality '${modality}'. ` +
          `Review case '${reviewCase.id}' was created for manual adjudication.`,
      );
    }
  }

  async findExactConflict(
    modality: string,
    candidateEmbedding: Buffer,
    excludedPersonId?: string,
  ): Promise<ExactBiometricConflict | null> {
    const candidateHash = crypto.createHash('sha256').update(candidateEmbedding).digest('hex');
    const existingProfiles = await this.prisma.intelBiometricProfile.findMany({
      where: {
        modality,
        isActive: true,
        embeddingHash: candidateHash,
        ...(excludedPersonId ? { personId: { not: excludedPersonId } } : {}),
      },
      select: {
        id: true,
        personId: true,
        embeddingCiphertext: true,
      },
    });

    for (const profile of existingProfiles) {
      const existingEmbedding = this.decryptEmbedding(profile.embeddingCiphertext);

      if (this.bufferEquals(existingEmbedding, candidateEmbedding)) {
        return {
          personId: profile.personId,
          biometricProfileId: profile.id,
        };
      }
    }

    return null;
  }

  private bufferEquals(left: Buffer, right: Buffer): boolean {
    if (left.length !== right.length) {
      return false;
    }

    return crypto.timingSafeEqual(left, right);
  }
}
