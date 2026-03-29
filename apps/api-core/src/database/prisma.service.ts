import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function withConnectionPool(url: string): string {
  const databaseUrl = new URL(url);
  if (!databaseUrl.searchParams.has('connection_limit')) {
    databaseUrl.searchParams.set('connection_limit', process.env.DATABASE_CONNECTION_LIMIT ?? '10');
  }
  if (!databaseUrl.searchParams.has('pool_timeout')) {
    databaseUrl.searchParams.set('pool_timeout', '30');
  }
  return databaseUrl.toString();
}

// Tables that must exist for core onboarding flows to work.
// If any are missing, we log a clear warning at startup rather than
// letting the first request fail with a raw Prisma error.
const REQUIRED_TABLES = [
  'users',
  'drivers',
  'user_consents',
  'data_subject_requests',
  'verification_entitlements',
  'verification_attempts',
  'verification_billing_profiles',
  'tenant_saved_cards',
  'verification_charge_audits',
  'driver_document_verifications',
  'self_service_otps',
];

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: withConnectionPool(process.env.DATABASE_URL ?? ''),
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.checkRequiredTables();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  private async checkRequiredTables(): Promise<void> {
    try {
      const rows = await this.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename = ANY(${REQUIRED_TABLES})
      `;
      const existing = new Set(rows.map((r) => r.tablename));
      const missing = REQUIRED_TABLES.filter((t) => !existing.has(t));
      if (missing.length > 0) {
        this.logger.error(
          `[MIGRATION REQUIRED] The following tables are missing from the database: ${missing.join(', ')}. ` +
          'Apply pending migrations before serving traffic: pnpm --filter api-core db:migrate',
        );
      }
    } catch {
      // Table check is best-effort; do not block startup if the query fails.
    }
  }
}
