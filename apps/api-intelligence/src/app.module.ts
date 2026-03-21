import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import type { Options as PinoHttpOptions } from 'pino-http';
import { AuthModule } from './auth/auth.module';
import { BiometricsModule } from './biometrics/biometrics.module';
import { intelligenceEnvConfig } from './config/env.config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { IdentifiersModule } from './identifiers/identifiers.module';
import { LinkageEventsModule } from './linkage-events/linkage-events.module';
import { MatchingModule } from './matching/matching.module';
import { PersonsModule } from './persons/persons.module';
import { ReviewCasesModule } from './review-cases/review-cases.module';
import { RiskModule } from './risk/risk.module';
import { WatchlistsModule } from './watchlists/watchlists.module';

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
 * Root application module for the intelligence plane (api-intelligence).
 *
 * Access model:
 *  - Tenant callers: scoped API key (`x-api-key` header, `intelligence:read` scope)
 *    → receives only derived risk signals; never raw cross-tenant data
 *  - Platform staff: JWT with PLATFORM_ADMIN role
 *    → full access including review-case adjudication
 *
 * The intelligence service uses a flat domain structure (no modules/ wrapper)
 * because each domain directory maps directly to a bounded context:
 *
 *   persons/       — canonical person CRUD and tenant-presence tracking
 *   identifiers/   — government ID normalisation and conflict detection
 *   biometrics/    — embedding storage, quality gating, deduplication
 *   matching/      — identity resolution engine (the core algorithm)
 *   review-cases/  — manual adjudication queue for ambiguous matches
 *   risk/          — risk score computation and signal aggregation
 *   watchlists/    — watchlist management and fraud signal ingestion
 *
 * Feature modules are imported here as they are built. Build order mirrors
 * the dependency graph — persons and identifiers first, matching last.
 */
@Module({
  imports: [
    // ── Config (global, loaded first) ─────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validate: intelligenceEnvConfig,
      cache: true,
    }),
    createLoggerModule(),

    // ── Infrastructure ────────────────────────────────────────────────────────
    AuthModule,
    DatabaseModule,
    HealthModule,

    // ── Domain modules (in dependency order) ──────────────────────────────────
    PersonsModule,
    IdentifiersModule,
    BiometricsModule,
    LinkageEventsModule,
    RiskModule,
    ReviewCasesModule,
    MatchingModule,
    WatchlistsModule,
  ],
})
export class AppModule {}
