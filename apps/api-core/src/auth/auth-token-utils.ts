import { createHash, randomBytes, randomInt } from 'node:crypto';

export function hashAuthSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateOtpCode(): string {
  return `${randomInt(100000, 1000000)}`;
}
