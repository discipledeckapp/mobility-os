# Free Pilot Deployment

## Target Surfaces

- `apps/tenant-web` on Vercel Hobby
- `apps/api-core` on Render Free
- `apps/api-intelligence` on Render Free
- PostgreSQL on Neon Free

## Deployment Readiness

### Ready

- `tenant-web` builds as a standalone Next.js app with shared UI package support
- `api-core` builds with Prisma, local auth, JWT issuance, and tenant operations APIs
- `api-intelligence` builds as a standalone Nest service for canonical identity and verification
- auth/login flow works end to end against `tenant-web` and `api-core`

### Conditional

- tenant lifecycle sync degrades safely when control-plane integration is not configured
- identity verification endpoints degrade safely when intelligence integration is not configured

### Still External

- SaaS lifecycle sync requires `api-control-plane` to be deployed and reachable

## Environment Variables

### Vercel: `tenant-web`

- `NEXT_PUBLIC_API_URL`
  - example: `https://mobility-os-api-core.onrender.com/api/v1`

### Render: `api-core`

Required:

- `NODE_ENV=production`
- `PORT=10000`
- `DATABASE_URL`
  - Neon pooled or direct Postgres URL
  - include SSL, e.g. `postgresql://.../mobility_os?sslmode=require`
- `JWT_SECRET`
  - at least 32 characters
- `TENANT_WEB_URL`
  - exact Vercel production URL, e.g. `https://mobiris-tenant-web.vercel.app`

Recommended:

- `JWT_EXPIRES_IN=7d`
- `CORS_ALLOWED_ORIGINS`
  - comma-separated list including the tenant-web URL

Optional for pilot hardening:

- `ZEPTOMAIL_API_KEY`
- `ZEPTOMAIL_API_URL`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_FROM_NAME`
- `SUPPORT_EMAIL`
- `SUPPORT_PHONE_PRIMARY`
- `SUPPORT_PHONE_SECONDARY`
- `WEBSITE_URL`
- `SOCIAL_HANDLE`

Optional integration dependencies:

- `CONTROL_PLANE_API_URL`
- `INTERNAL_SERVICE_TOKEN`
- `INTELLIGENCE_API_URL`
- `INTELLIGENCE_API_KEY`

### Render: `api-intelligence`

Required:

- `NODE_ENV=production`
- `PORT=10000`
- `DATABASE_URL`
  - separate intelligence database
  - must have `pgvector` enabled
- `PLATFORM_JWT_SECRET`
- `INTELLIGENCE_API_KEY`
  - shared with `api-core`
- `BIOMETRIC_ENCRYPTION_KEY`

Required for live Nigeria verification provider path:

- liveness provider credentials, such as:
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
- identifier verification provider credentials, such as:
  - `YOUVERIFY_API_KEY`
  - `YOUVERIFY_BASE_URL`
  - and/or
  - `SMILE_IDENTITY_API_KEY`
  - `SMILE_IDENTITY_BASE_URL`

Optional:

- `CONTROL_PLANE_BASE_URL`
- `INTERNAL_SERVICE_TOKEN`
- `VERIFICATION_FEE_AMOUNT_MINOR_UNITS`
- mock provider envs for non-production verification testing

## Commands

### Vercel

- root directory: `apps/tenant-web`
- install command:
  - `cd ../.. && pnpm install --frozen-lockfile`
- build command:
  - `cd ../.. && pnpm --filter @mobility-os/ui build && pnpm --filter tenant-web build`

### Render

- `api-intelligence` build command:
  - `pnpm install --frozen-lockfile && pnpm --filter @mobility-os/env-config build && pnpm --filter @mobility-os/authz-model build && pnpm --filter @mobility-os/tenancy-domain build && pnpm --filter @mobility-os/domain-config build && pnpm --filter @mobility-os/intelligence-domain build && pnpm --filter @mobility-os/api-intelligence db:generate && pnpm --filter @mobility-os/api-intelligence build`
- `api-intelligence` start command:
  - `pnpm --filter @mobility-os/api-intelligence db:migrate && pnpm --filter @mobility-os/api-intelligence start`
- build command:
  - `pnpm install --frozen-lockfile && pnpm --filter @mobility-os/env-config build && pnpm --filter @mobility-os/authz-model build && pnpm --filter @mobility-os/tenancy-domain build && pnpm --filter @mobility-os/domain-config build && pnpm --filter @mobility-os/intelligence-domain build && pnpm --filter @mobility-os/api-core db:generate && pnpm --filter @mobility-os/api-core build`
- start command:
  - `pnpm --filter @mobility-os/api-core db:migrate && pnpm --filter @mobility-os/api-core start`

## Pilot Checklist

1. Create a Neon database for `api-core`.
2. Create a separate Neon database for `api-intelligence`.
3. Enable `pgvector` on the intelligence database.
4. Create the `api-intelligence` Render web service from [render.yaml](/Users/seyiadelaju/mobility-os/render.yaml).
5. Set `api-intelligence` env vars on Render.
6. Confirm `api-intelligence` deploy succeeds.
7. Create the `api-core` Render web service from [render.yaml](/Users/seyiadelaju/mobility-os/render.yaml).
8. Set `api-core` env vars on Render, including the deployed `api-intelligence` URL and shared intelligence API key.
9. Confirm `api-core` deploy succeeds and `/api/v1/auth/login` responds.
10. Create Vercel project with root directory `apps/tenant-web`.
11. Set `NEXT_PUBLIC_API_URL` on Vercel to the Render `api-core` URL.
12. Seed one tenant, business entity, operating unit, fleet, operational wallet, and tenant user before operator access.
13. Confirm tenant-web login works against the deployed backend.

## Architecture Check

- tenant-web remains a frontend for `api-core`
- operational wallets remain in `api-core`
- SaaS governance remains in `api-control-plane`
- identity intelligence remains in `api-intelligence`
- making control-plane and intelligence envs optional at startup does not collapse planes; it only prevents non-required integrations from blocking `api-core` boot
