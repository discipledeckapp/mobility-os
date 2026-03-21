import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const HASH_PREFIX = 'scrypt';
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('base64');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('base64');
  return `${HASH_PREFIX}$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const [prefix, salt, expectedKey] = passwordHash.split('$');

  if (prefix !== HASH_PREFIX || !salt || !expectedKey) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  const expectedBuffer = Buffer.from(expectedKey, 'base64');

  if (derivedKey.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, expectedBuffer);
}
