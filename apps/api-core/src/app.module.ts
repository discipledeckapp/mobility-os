import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import type { Options as PinoHttpOptions } from 'pino-http';
import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { BusinessEntitiesModule } from './business-entities/business-entities.module';
import { apiCoreEnvConfig } from './config/env.config';
import { DatabaseModule } from './database/database.module';
import { DriversModule } from './drivers/drivers.module';
import { FleetsModule } from './fleets/fleets.module';
import { GuarantorsModule } from './guarantors/guarantors.module';
import { HealthModule } from './health/health.module';
import { InternalProvisioningModule } from './internal-provisioning/internal-provisioning.module';
import { InternalTenantsModule } from './internal-tenants/internal-tenants.module';
import { MobileOpsModule } from './mobile-ops/mobile-ops.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OperatingUnitsModule } from './operating-units/operating-units.module';
import { OperationalWalletsModule } from './operational-wallets/operational-wallets.module';
import { RemittanceModule } from './remittance/remittance.module';
import { ReportsModule } from './reports/reports.module';
import { SelfSignupModule } from './self-signup/self-signup.module';
import { TeamModule } from './team/team.module';
import { TenantBillingModule } from './tenant-billing/tenant-billing.module';
import { TenantsModule } from './tenants/tenants.module';
import { VehicleCatalogModule } from './vehicle-catalog/vehicle-catalog.module';
import { VehiclesModule } from './vehicles/vehicles.module';

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
 * Root application module for the tenant operations plane (api-core).
 *
 * Feature modules are imported here as they are built out. The order below
 * reflects the intended build sequence:
 *   1. Infrastructure (database, auth)
 *   2. Foundational tenant hierarchy (tenants → business-entities → operating-units → fleets)
 *   3. Asset modules (vehicles, vehicle-types)
 *   4. People modules (drivers, guarantors, investors)
 *   5. Operation modules (assignments, remittance, operational-wallets, accounting)
 *   6. Ancillary modules (valuations, inspections, maintenance, documents)
 *   7. Cross-cutting modules (audit, notifications, country-config)
 */
@Module({
  imports: [
    // ── Config (global, loaded first) ─────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validate: apiCoreEnvConfig,
      cache: true,
    }),
    createLoggerModule(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),

    // ── Infrastructure ────────────────────────────────────────────────────────
    DatabaseModule,
    NotificationsModule,
    AuthModule,
    HealthModule,

    // ── Tenant hierarchy ──────────────────────────────────────────────────────
    TenantsModule,
    BusinessEntitiesModule,
    OperatingUnitsModule,
    FleetsModule,

    // ── Assets ────────────────────────────────────────────────────────────────
    VehiclesModule,
    VehicleCatalogModule,
    MobileOpsModule,
    ReportsModule,
    TenantBillingModule,

    // ── People ────────────────────────────────────────────────────────────────
    DriversModule,
    GuarantorsModule,
    // InvestorsModule,

    // ── Operations ────────────────────────────────────────────────────────────
    AssignmentsModule,
    RemittanceModule,
    OperationalWalletsModule,
    InternalProvisioningModule,
    InternalTenantsModule,
    SelfSignupModule,
    TeamModule,
    // AccountingModule,

    // ── Ancillary ─────────────────────────────────────────────────────────────
    // ValuationsModule,
    // InspectionsModule,
    // MaintenanceModule,
    // DocumentsModule,

    // ── Cross-cutting ─────────────────────────────────────────────────────────
    // AuditModule,
    // CountryConfigModule,
  ],
  providers: [ThrottlerGuard],
})
export class AppModule {}
