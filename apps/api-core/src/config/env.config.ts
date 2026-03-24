import { z } from 'zod';

/**
 * Environment variable schema for api-core (tenant operations plane).
 *
 * Validated at startup via NestJS ConfigModule.forRoot({ validate }).
 * All required variables must be present or the process exits immediately.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.string().default('info'),

  // ── Database ───────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),

  // ── Auth ───────────────────────────────────────────────────────────────────
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  TENANT_WEB_URL: z
    .string()
    .url('TENANT_WEB_URL must be a valid URL')
    .default('http://localhost:3000'),
  CORS_ALLOWED_ORIGINS: z.string().optional(),

  // ── Email delivery ─────────────────────────────────────────────────────────
  ZEPTOMAIL_API_URL: z
    .string()
    .url('ZEPTOMAIL_API_URL must be a valid URL')
    .default('https://api.zeptomail.com/v1.1/email'),
  ZEPTOMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM_ADDRESS: z
    .string()
    .email('EMAIL_FROM_ADDRESS must be a valid email')
    .default('noreply@mobiris.ng'),
  EMAIL_FROM_NAME: z.string().default('Mobiris'),
  SUPPORT_EMAIL: z
    .string()
    .email('SUPPORT_EMAIL must be a valid email')
    .default('support@mobiris.ng'),
  SUPPORT_PHONE_PRIMARY: z.string().default('08053108039'),
  SUPPORT_PHONE_SECONDARY: z.string().default('09135947155'),
  WEBSITE_URL: z.string().url('WEBSITE_URL must be a valid URL').default('https://mobiris.ng'),
  SOCIAL_HANDLE: z.string().default('@getmobiris'),

  // ── Internal service URLs ──────────────────────────────────────────────────
  CONTROL_PLANE_API_URL: z.string().url('CONTROL_PLANE_API_URL must be a valid URL').optional(),
  INTERNAL_SERVICE_TOKEN: z.string().min(16, 'INTERNAL_SERVICE_TOKEN is required').optional(),
  INTELLIGENCE_API_URL: z
    .string()
    .url('INTELLIGENCE_API_URL must be a valid URL')
    .optional(),
  INTELLIGENCE_API_KEY: z.string().min(1, 'INTELLIGENCE_API_KEY is required').optional(),
  DOCUMENT_STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  DOCUMENT_STORAGE_LOCAL_ROOT: z.string().optional(),
  DOCUMENT_STORAGE_MAX_FILE_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  DOCUMENT_STORAGE_S3_BUCKET: z.string().optional(),
  DOCUMENT_STORAGE_S3_REGION: z.string().default('auto'),
  DOCUMENT_STORAGE_S3_ENDPOINT: z.string().url('DOCUMENT_STORAGE_S3_ENDPOINT must be a valid URL').optional(),
  DOCUMENT_STORAGE_S3_ACCESS_KEY_ID: z.string().optional(),
  DOCUMENT_STORAGE_S3_SECRET_ACCESS_KEY: z.string().optional(),
  DOCUMENT_STORAGE_S3_PUBLIC_BASE_URL: z
    .string()
    .url('DOCUMENT_STORAGE_S3_PUBLIC_BASE_URL must be a valid URL')
    .optional(),
  DOCUMENT_STORAGE_S3_FORCE_PATH_STYLE: z
    .union([z.boolean(), z.string()])
    .transform((value) => {
      if (typeof value === 'boolean') return value;
      return value === 'true';
    })
    .default(true),
});

export type ApiCoreEnv = z.infer<typeof schema>;

/**
 * Validate and parse environment variables at startup.
 * Passed directly to NestJS ConfigModule.forRoot({ validate }).
 * Throws a descriptive error on any missing or malformed variable.
 */
export function apiCoreEnvConfig(config: Record<string, unknown>): ApiCoreEnv {
  const result = schema.safeParse(config);
  if (!result.success) {
    const lines = result.error.errors.map((e) => `  ${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`[api-core] Environment validation failed:\n${lines}`);
  }
  const data = result.data;

  if (data.NODE_ENV === 'production' && data.DOCUMENT_STORAGE_PROVIDER !== 's3') {
    throw new Error(
      '[api-core] Environment validation failed:\n  DOCUMENT_STORAGE_PROVIDER: production requires s3-backed document storage.',
    );
  }

  const hasIntelligenceUrl = Boolean(data.INTELLIGENCE_API_URL);
  const hasIntelligenceKey = Boolean(data.INTELLIGENCE_API_KEY);
  if (hasIntelligenceUrl !== hasIntelligenceKey) {
    throw new Error(
      '[api-core] Environment validation failed:\n  INTELLIGENCE_API_URL/INTELLIGENCE_API_KEY: both must be set together when intelligence integration is enabled.',
    );
  }

  if (data.DOCUMENT_STORAGE_PROVIDER === 's3') {
    const missing = [
      ['DOCUMENT_STORAGE_S3_BUCKET', data.DOCUMENT_STORAGE_S3_BUCKET],
      ['DOCUMENT_STORAGE_S3_ENDPOINT', data.DOCUMENT_STORAGE_S3_ENDPOINT],
      ['DOCUMENT_STORAGE_S3_ACCESS_KEY_ID', data.DOCUMENT_STORAGE_S3_ACCESS_KEY_ID],
      ['DOCUMENT_STORAGE_S3_SECRET_ACCESS_KEY', data.DOCUMENT_STORAGE_S3_SECRET_ACCESS_KEY],
    ].filter(([, value]) => !value);

    if (missing.length > 0) {
      const lines = missing.map(([key]) => `  ${key}: is required when DOCUMENT_STORAGE_PROVIDER=s3`);
      throw new Error(`[api-core] Environment validation failed:\n${lines.join('\n')}`);
    }
  }

  return data;
}
