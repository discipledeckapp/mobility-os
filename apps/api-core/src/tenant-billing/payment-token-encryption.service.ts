import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentTokenEncryptionService {
  constructor(private readonly configService: ConfigService) {}

  encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  decrypt(ciphertext: string): string {
    const [ivRaw, tagRaw, payloadRaw] = ciphertext.split(':');
    if (!ivRaw || !tagRaw || !payloadRaw) {
      throw new Error('Invalid encrypted token payload.');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.getKey(),
      Buffer.from(ivRaw, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(tagRaw, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payloadRaw, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  private getKey(): Buffer {
    const secret =
      this.configService.get<string>('PAYMENT_TOKEN_ENCRYPTION_SECRET') ??
      this.configService.getOrThrow<string>('JWT_SECRET');
    return createHash('sha256').update(secret, 'utf8').digest();
  }
}
