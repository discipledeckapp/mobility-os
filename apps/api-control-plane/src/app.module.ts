import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import type { Options as PinoHttpOptions } from 'pino-http';
import { BillingModule } from './billing/billing.module';
import { controlPlaneEnvConfig } from './config/env.config';
import { DatabaseModule } from './database/database.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { HealthModule } from './health/health.module';
import { MeteringModule } from './metering/metering.module';
import { PaymentsModule } from './payments/payments.module';
import { PlansModule } from './plans/plans.module';
import { PlatformSettingsModule } from './platform-settings/platform-settings.module';
import { PlatformWalletsModule } from './platform-wallets/platform-wallets.module';
import { ProvisioningModule } from './provisioning/provisioning.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TenantLifecycleModule } from './tenant-lifecycle/tenant-lifecycle.module';
import { TenantsModule } from './tenants/tenants.module';

function createLoggerModule() {
  const isProduction = process.env.NODE_ENV === 'production';
  const pinoHttp: PinoHttpOptions = {
    level: process.env.LOG_LEVEL ?? 'info',
    genReqId: (request, response) => {
      const requestWithId = request as IncomingMessage & {
        id?: string | number;
        headers: Record<string, string | string[] | undefined>;
      };
      const nodeResponse = response as ServerResponse<IncomingMessage>;
      const headerValue = requestWithId.headers['x-correlation-id'];
      const correlationId =
        typeof headerValue === 'string' && headerValue.length > 0 ? headerValue : randomUUID();

      requestWithId.id = correlationId;
      nodeResponse.setHeader('x-correlation-id', correlationId);
      return correlationId;
    },
    customProps: (request) => ({
      correlationId: String(
        (
          request as IncomingMessage & {
            id?: string | number;
          }
        ).id ?? '',
      ),
    }),
    ...(!isProduction
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            singleLine: false,
            ignore: 'pid,hostname',
          },
        }
      : {}),
  };

  return LoggerModule.forRoot({
    pinoHttp,
  });
}

/**
 * Root application module for the SaaS control plane (api-control-plane).
 *
 * This module must only ever be called by platform staff roles:
 *   PLATFORM_ADMIN | SUPPORT_AGENT | BILLING_OPS
 *
 * No tenant user should have network access to this service.
 *
 * Feature modules are imported here as they are built. Intended build order:
 *   1. Infrastructure (database, platform-auth)
 *   2. Plans (plan catalog and feature matrix)
 *   3. Subscriptions (tenant subscription lifecycle)
 *   4. Billing (invoices, payments, credits)
 *   5. Platform wallets (SaaS consumption wallet — distinct from operational wallet)
 *   6. Metering (usage event ingestion and aggregation)
 *   7. Tenant lifecycle (lifecycle state machine)
 *   8. Feature flags (per-tenant and global flags)
 *   9. Support (ticket tracking, impersonation audit)
 *  10. Platform admin (internal dashboards and overrides)
 */
@Module({
  imports: [
    // ── Config (global, loaded first) ─────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validate: controlPlaneEnvConfig,
      cache: true,
    }),
    createLoggerModule(),

    // ── Infrastructure ────────────────────────────────────────────────────────
    DatabaseModule,
    HealthModule,

    // ── Core governance ───────────────────────────────────────────────────────
    PlansModule,
    SubscriptionsModule,
    TenantsModule,
    PlatformSettingsModule,
    BillingModule,
    PlatformWalletsModule,
    MeteringModule,
    TenantLifecycleModule,
    FeatureFlagsModule,
    PaymentsModule,
    ProvisioningModule,

    // ── Operations ────────────────────────────────────────────────────────────
    // SupportModule,
    // PlatformAdminModule,
  ],
})
export class AppModule {}
