import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
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

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
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
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
