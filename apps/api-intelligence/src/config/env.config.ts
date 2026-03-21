import { z } from 'zod';

/**
 * Environment variable schema for api-intelligence (intelligence plane).
 *
 * Notable additions over other API services:
 *  - BIOMETRIC_ENCRYPTION_KEY: AES-256 key (base64) for encrypting embeddings at rest
 *  - BIOMETRIC_AUTO_LINK_THRESHOLD: cosine similarity threshold for auto-linking
 *  - BIOMETRIC_MIN_QUALITY_SCORE: minimum quality score to accept an enrollment
 *
 * The biometric key must be rotated through a key-management procedure —
 * changing it without re-encrypting stored embeddings will break decryption.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  PORT: z.coerce.number().int().positive().default(3002),
  LOG_LEVEL: z.string().default('info'),

  // ── Database ───────────────────────────────────────────────────────────────
  // Must point to a Postgres instance with the pgvector extension enabled.
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),

  // ── Platform staff auth ────────────────────────────────────────────────────
  PLATFORM_JWT_SECRET: z.string().min(32, 'PLATFORM_JWT_SECRET must be at least 32 characters'),

  // ── Tenant API key auth ────────────────────────────────────────────────────
  // Tenant callers use a pre-shared API key. In production this should be
  // validated against a key store (e.g. database or secrets manager), not
  // a single shared secret.
  INTELLIGENCE_API_KEY: z.string().min(16, 'INTELLIGENCE_API_KEY must be at least 16 characters'),

  // ── Control-plane settings consumption ─────────────────────────────────────
  CONTROL_PLANE_BASE_URL: z.string().url().optional(),
  INTERNAL_SERVICE_TOKEN: z.string().min(16).optional(),
  VERIFICATION_FEE_AMOUNT_MINOR_UNITS: z.coerce.number().int().min(0).default(0),

  // ── Country identity providers ─────────────────────────────────────────────
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REKOGNITION_LIVENESS_MIN_CONFIDENCE: z.coerce.number().min(0).max(100).default(90),
  AWS_REKOGNITION_MOCK_LIVENESS_RESPONSE: z.string().optional(),

  YOUVERIFY_API_KEY: z.string().optional(),
  YOUVERIFY_BASE_URL: z.string().url().optional(),
  YOUVERIFY_MOCK_RESPONSE: z.string().optional(),
  YOUVERIFY_LIVENESS_MOCK_RESPONSE: z.string().optional(),

  SMILE_IDENTITY_API_KEY: z.string().optional(),
  SMILE_IDENTITY_BASE_URL: z.string().url().optional(),
  SMILE_IDENTITY_MOCK_RESPONSE: z.string().optional(),
  SMILE_IDENTITY_LIVENESS_MOCK_RESPONSE: z.string().optional(),

  // ── Azure AI Face (liveness) ────────────────────────────────────────────────
  AZURE_FACE_ENDPOINT: z.string().url().optional(),
  AZURE_FACE_API_KEY: z.string().optional(),
  // Minimum confidence score (0.0–1.0) to accept liveness as passed
  AZURE_FACE_LIVENESS_MIN_CONFIDENCE: z.coerce.number().min(0).max(1).default(0.7),
  AZURE_FACE_LIVENESS_MOCK_RESPONSE: z.string().optional(),

  // ── Biometrics ─────────────────────────────────────────────────────────────
  // AES-256 key encoded as base64 (32 raw bytes → 44 base64 chars).
  // Generate: openssl rand -base64 32
  BIOMETRIC_ENCRYPTION_KEY: z
    .string()
    .min(44, 'BIOMETRIC_ENCRYPTION_KEY must be a base64-encoded 32-byte key'),

  // Cosine similarity score above which two embeddings are auto-linked (0–1).
  BIOMETRIC_AUTO_LINK_THRESHOLD: z.coerce.number().min(0).max(1).default(0.95),

  // Minimum quality score to accept a biometric enrollment (0–1).
  BIOMETRIC_MIN_QUALITY_SCORE: z.coerce.number().min(0).max(1).default(0.7),
});

export type IntelligenceEnv = z.infer<typeof schema>;

/**
 * Validate and parse environment variables at startup.
 * Passed directly to NestJS ConfigModule.forRoot({ validate }).
 * Throws a descriptive error on any missing or malformed variable.
 */
export function intelligenceEnvConfig(config: Record<string, unknown>): IntelligenceEnv {
  const result = schema.safeParse(config);
  if (!result.success) {
    const lines = result.error.errors.map((e) => `  ${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`[api-intelligence] Environment validation failed:\n${lines}`);
  }
  return result.data;
}
