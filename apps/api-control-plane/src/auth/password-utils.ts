import { createHash, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password, 'utf8').digest('hex');
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const expected = Buffer.from(passwordHash, 'hex');
  const actual = Buffer.from(hashPassword(password), 'hex');

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
