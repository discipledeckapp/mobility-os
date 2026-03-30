import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma';
import { PrismaService } from '../database/prisma.service';
import { PaymentTokenEncryptionService } from './payment-token-encryption.service';

type BillingPaymentMethodRow = {
  id: string;
  tenantId: string;
  provider: string;
  authorizationCodeCiphertext: string;
  customerCodeCiphertext: string;
  last4: string;
  brand: string;
  status: string;
  active: boolean;
  autopayEnabled: boolean;
  initialReference: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BillingPaymentMethodSummary = {
  provider: string;
  last4: string;
  brand: string;
  status: string;
  active: boolean;
  autopayEnabled: boolean;
  createdAt: string;
  initialReference: string | null;
} | null;

@Injectable()
export class BillingPaymentMethodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentTokenEncryptionService: PaymentTokenEncryptionService,
  ) {}

  async getSummary(tenantId: string): Promise<BillingPaymentMethodSummary> {
    const row = await this.getRow(tenantId);
    if (!row) {
      return null;
    }

    return {
      provider: row.provider,
      last4: row.last4,
      brand: row.brand,
      status: row.status,
      active: row.active,
      autopayEnabled: row.autopayEnabled,
      createdAt: row.createdAt.toISOString(),
      initialReference: row.initialReference,
    };
  }

  async saveAuthorizedPaymentMethod(input: {
    tenantId: string;
    provider: string;
    authorizationCode: string;
    customerCode: string;
    last4: string;
    brand: string;
    initialReference: string;
    autopayEnabled?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO "cp_billing_payment_methods" (
        "id",
        "tenantId",
        "provider",
        "authorizationCodeCiphertext",
        "customerCodeCiphertext",
        "last4",
        "brand",
        "status",
        "active",
        "autopayEnabled",
        "initialReference",
        "metadata",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${randomUUID()},
        ${input.tenantId},
        ${input.provider},
        ${this.paymentTokenEncryptionService.encrypt(input.authorizationCode)},
        ${this.paymentTokenEncryptionService.encrypt(input.customerCode)},
        ${input.last4},
        ${input.brand},
        ${'active'},
        ${true},
        ${input.autopayEnabled ?? false},
        ${input.initialReference},
        ${JSON.stringify(input.metadata ?? {})}::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT ("tenantId")
      DO UPDATE SET
        "provider" = EXCLUDED."provider",
        "authorizationCodeCiphertext" = EXCLUDED."authorizationCodeCiphertext",
        "customerCodeCiphertext" = EXCLUDED."customerCodeCiphertext",
        "last4" = EXCLUDED."last4",
        "brand" = EXCLUDED."brand",
        "status" = 'active',
        "active" = true,
        "autopayEnabled" = EXCLUDED."autopayEnabled",
        "initialReference" = EXCLUDED."initialReference",
        "metadata" = EXCLUDED."metadata",
        "updatedAt" = NOW()
    `);
  }

  private async getRow(tenantId: string): Promise<BillingPaymentMethodRow | null> {
    const rows = await this.prisma.$queryRaw<BillingPaymentMethodRow[]>(Prisma.sql`
      SELECT
        "id",
        "tenantId",
        "provider",
        "authorizationCodeCiphertext",
        "customerCodeCiphertext",
        "last4",
        "brand",
        "status",
        "active",
        "autopayEnabled",
        "initialReference",
        "metadata",
        "createdAt",
        "updatedAt"
      FROM "cp_billing_payment_methods"
      WHERE "tenantId" = ${tenantId}
      LIMIT 1
    `);

    return rows[0] ?? null;
  }
}
