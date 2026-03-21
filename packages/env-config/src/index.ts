// =============================================================================
// env-config
// Shared Zod schema fragments for environment variable validation.
//
// Each app composes these fragments in its own src/config/env.config.ts.
// This package ensures the shared fragments stay in sync across services.
// =============================================================================

import { z } from 'zod';

// ── Shared schema fragments ───────────────────────────────────────────────────

/** Variables required by every API service. */
export const BaseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

/** Tenant-plane JWT variables (api-core). */
export const TenantJwtEnvSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

/**
 * Platform-staff JWT variables (api-control-plane, api-intelligence).
 * Deliberately uses a different secret from the tenant JWT to prevent
 * a compromised tenant token from being usable against platform APIs.
 */
export const PlatformJwtEnvSchema = z.object({
  PLATFORM_JWT_SECRET: z.string().min(32, 'PLATFORM_JWT_SECRET must be at least 32 characters'),
  PLATFORM_JWT_EXPIRES_IN: z.string().default('8h'),
});

/** Variables for services that call api-intelligence as a client (api-core). */
export const IntelligenceClientEnvSchema = z.object({
  INTELLIGENCE_API_URL: z.string().url('INTELLIGENCE_API_URL must be a valid URL'),
  INTELLIGENCE_API_KEY: z.string().min(1, 'INTELLIGENCE_API_KEY is required'),
});

/**
 * Variables for the intelligence service itself.
 * BIOMETRIC_ENCRYPTION_KEY is an AES-256 key encoded as base64 (44 chars).
 * Changing this key requires re-encrypting all stored embeddings.
 */
export const BiometricEnvSchema = z.object({
  BIOMETRIC_ENCRYPTION_KEY: z
    .string()
    .min(44, 'BIOMETRIC_ENCRYPTION_KEY must be a base64-encoded 32-byte key'),
  BIOMETRIC_AUTO_LINK_THRESHOLD: z.coerce.number().min(0).max(1).default(0.95),
  BIOMETRIC_MIN_QUALITY_SCORE: z.coerce.number().min(0).max(1).default(0.7),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type BaseEnv = z.infer<typeof BaseEnvSchema>;
export type TenantJwtEnv = z.infer<typeof TenantJwtEnvSchema>;
export type PlatformJwtEnv = z.infer<typeof PlatformJwtEnvSchema>;
export type IntelligenceClientEnv = z.infer<typeof IntelligenceClientEnvSchema>;
export type BiometricEnv = z.infer<typeof BiometricEnvSchema>;
