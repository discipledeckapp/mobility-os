# env-config

Shared TypeScript package providing shared Zod schema fragments for environment validation across Mobility OS services. Each app composes these fragments in its own `src/config/env.config.ts`.

## What's In Here

| Export | Description |
|---|---|
| `BaseEnvSchema` | Shared schema fragment for `NODE_ENV`, `PORT`, and `DATABASE_URL` |
| `TenantJwtEnvSchema` | Schema fragment for tenant-plane JWT variables |
| `PlatformJwtEnvSchema` | Schema fragment for platform JWT variables |
| `IntelligenceClientEnvSchema` | Schema fragment for services that call `api-intelligence` |
| `BiometricEnvSchema` | Schema fragment for intelligence biometric settings |
| `BaseEnv` / `TenantJwtEnv` / `PlatformJwtEnv` / `IntelligenceClientEnv` / `BiometricEnv` | Inferred TypeScript types from the schema fragments |

## Supported Variables

| Variable | Required By | Description |
|---|---|---|
| `DATABASE_URL` | API services | PostgreSQL connection string |
| `PORT` | API services | HTTP listen port |
| `NODE_ENV` | API services | `development`, `test`, `production` |
| `JWT_SECRET` | `api-core` | Tenant-plane JWT signing secret |
| `JWT_EXPIRES_IN` | `api-core` | Tenant-plane JWT lifetime |
| `PLATFORM_JWT_SECRET` | `api-control-plane`, `api-intelligence` | Platform JWT signing secret |
| `PLATFORM_JWT_EXPIRES_IN` | `api-control-plane`, `api-intelligence` | Platform JWT lifetime |
| `INTELLIGENCE_API_URL` | `api-core` | Required URL of `api-intelligence`; api-core fails fast at startup if missing |
| `INTELLIGENCE_API_KEY` | `api-core` | Required API key for calling `api-intelligence` |
| `BIOMETRIC_ENCRYPTION_KEY` | `api-intelligence` | Base64-encoded AES-256 key for biometric data at rest |
| `BIOMETRIC_AUTO_LINK_THRESHOLD` | `api-intelligence` | Auto-link confidence threshold |
| `BIOMETRIC_MIN_QUALITY_SCORE` | `api-intelligence` | Minimum accepted biometric quality score |

## Usage

```typescript
import { BaseEnvSchema, TenantJwtEnvSchema } from '@mobility-os/env-config';

const apiCoreEnvSchema = BaseEnvSchema.merge(TenantJwtEnvSchema);
const env = apiCoreEnvSchema.parse(process.env);
```

## Design Rules

1. Shared env rules must fail fast at startup — no deferred validation
2. This package provides schema fragments, not a global runtime env singleton
3. Service-specific env composition lives in each application, not in this package

## Installation

```json
{
  "dependencies": {
    "@mobility-os/env-config": "workspace:*"
  }
}
```
