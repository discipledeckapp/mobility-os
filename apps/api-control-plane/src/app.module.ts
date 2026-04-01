import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
  getOptionsToken,
  getStorageToken,
} from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import type { Options as PinoHttpOptions } from 'pino-http';
import { BillingModule } from './billing/billing.module';
import { controlPlaneEnvConfig } from './config/env.config';
import { DatabaseModule } from './database/database.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { GovernanceModule } from './governance/governance.module';
import { HealthModule } from './health/health.module';
import { MeteringModule } from './metering/metering.module';
import { OperationsModule } from './operations/operations.module';
import { PaymentsModule } from './payments/payments.module';
import { PlansModule } from './plans/plans.module';
import { PlatformSettingsModule } from './platform-settings/platform-settings.module';
import { PlatformWalletsModule } from './platform-wallets/platform-wallets.module';
import { ProvisioningModule } from './provisioning/provisioning.module';
import { ControlPlaneRecordsModule } from './records/records.module';
import { StaffModule } from './staff/staff.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TenantLifecycleModule } from './tenant-lifecycle/tenant-lifecycle.module';
import { TenantsModule } from './tenants/tenants.module';

function createLoggerModule() {
  const isProduction = process.env.NODE_ENV === 'production';
  const pinoHttp: PinoHttpOptions = {
    level: process.env.LOG_LEVEL ?? 'info',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.currentPassword',
        'req.body.newPassword',
        'req.body.confirmPassword',
        'req.body.token',
        'req.body.secretKey',
      ],
      censor: '[Redacted]',
    },
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
      envFilePath: ['.env.local', '.env'],
      validate: controlPlaneEnvConfig,
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
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
    ControlPlaneRecordsModule,
    PlatformWalletsModule,
    MeteringModule,
    OperationsModule,
    TenantLifecycleModule,
    FeatureFlagsModule,
    GovernanceModule,
    PaymentsModule,
    ProvisioningModule,
    StaffModule,

    // ── Operations ────────────────────────────────────────────────────────────
    // SupportModule,
    // PlatformAdminModule,
  ],
  providers: [
    Reflector,
    {
      provide: ThrottlerGuard,
      useFactory: (options: object, storage: object) =>
        new ThrottlerGuard(options as never, storage as never, new Reflector()),
      inject: [getOptionsToken(), getStorageToken()],
    },
    {
      provide: APP_GUARD,
      useExisting: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
