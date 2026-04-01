import { z } from 'zod';

const envBoolean = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === 'boolean') {
      return value;
    }

    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off', ''].includes(normalized)) {
      return false;
    }

    throw new Error(`Invalid boolean value '${value}'`);
  });

/**
 * Environment variable schema for api-control-plane (SaaS governance plane).
 *
 * Validated at startup via NestJS ConfigModule.forRoot({ validate }).
 * Platform-specific secrets use PLATFORM_ prefix to distinguish them from
 * tenant-plane variables.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.string().default('info'),

  // ── Database ───────────────────────────────────────────────────────────────
  // The control plane uses the same Postgres instance but a separate schema
  // prefix (cp_*). It must never read from tenant operational schemas.
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),

  // ── Platform staff auth ────────────────────────────────────────────────────
  // Separate JWT secret from the tenant-plane secret. This prevents a
  // compromised tenant JWT from being usable against the control-plane API.
  PLATFORM_JWT_SECRET: z.string().min(32, 'PLATFORM_JWT_SECRET must be at least 32 characters'),
  PLATFORM_JWT_EXPIRES_IN: z.string().default('8h'),
  PLATFORM_BOOTSTRAP_ADMIN_EMAIL: z
    .string()
    .email('PLATFORM_BOOTSTRAP_ADMIN_EMAIL must be a valid email')
    .optional(),
  PLATFORM_BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8).optional(),

  CONTROL_PLANE_WEB_URL: z.string().url('CONTROL_PLANE_WEB_URL must be a valid URL').optional(),
  CORS_ALLOWED_ORIGINS: z.string().optional(),

  // ── Internal service auth ──────────────────────────────────────────────────
  INTERNAL_SERVICE_JWT_SECRET: z
    .string()
    .min(32, 'INTERNAL_SERVICE_JWT_SECRET must be at least 32 characters'),
  INTERNAL_SERVICE_JWT_EXPIRES_IN: z.string().default('2m'),
  INTERNAL_SERVICE_CALLER_ID: z.string().default('api-control-plane'),
  INTERNAL_SERVICE_AUDIENCE: z.string().default('api-control-plane'),
  INTERNAL_SERVICE_ALLOWED_CALLERS: z
    .string()
    .default('api-core,api-intelligence'),
  API_CORE_BASE_URL: z.string().url('API_CORE_BASE_URL must be a valid URL').optional(),

  // ── Payment providers ──────────────────────────────────────────────────────
  FLUTTERWAVE_BASE_URL: z
    .string()
    .url('FLUTTERWAVE_BASE_URL must be a valid URL')
    .default('https://api.flutterwave.com/v3'),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_WEBHOOK_SECRET_HASH: z.string().optional(),
  PAYSTACK_BASE_URL: z
    .string()
    .url('PAYSTACK_BASE_URL must be a valid URL')
    .default('https://api.paystack.co'),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  BILLING_PAYMENT_RETURN_URL: z
    .string()
    .url('BILLING_PAYMENT_RETURN_URL must be a valid URL')
    .optional(),

  // ── Controlled bootstrap ───────────────────────────────────────────────────
  BOOTSTRAP_DEFAULT_PLATFORM_SETTINGS: envBoolean.default(false),
});

export type ControlPlaneEnv = z.infer<typeof schema>;

/**
 * Validate and parse environment variables at startup.
 * Passed directly to NestJS ConfigModule.forRoot({ validate }).
 * Throws a descriptive error on any missing or malformed variable.
 */
export function controlPlaneEnvConfig(config: Record<string, unknown>): ControlPlaneEnv {
  const result = schema.safeParse(config);
  if (!result.success) {
    const lines = result.error.errors.map((e) => `  ${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`[api-control-plane] Environment validation failed:\n${lines}`);
  }
  return result.data;
}
