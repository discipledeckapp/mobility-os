import { TenantRole } from '@mobility-os/authz-model';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../auth/password-utils';

interface CliArgs {
  tenantId: string;
  businessEntityId: string;
  email: string;
  password: string;
}

function printUsage(): void {
  console.error(
    [
      'Usage:',
      '  pnpm --filter @mobility-os/api-core cli:seed-test-user -- \\',
      '    --tenantId <tenant-id> \\',
      '    --businessEntityId <business-entity-id> \\',
      '    --email <email> \\',
      '    --password <password>',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): CliArgs {
  const parsed = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key?.startsWith('--')) {
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for argument '${key}'`);
    }

    parsed.set(key.slice(2), value);
    index += 1;
  }

  const tenantId = parsed.get('tenantId')?.trim();
  const businessEntityId = parsed.get('businessEntityId')?.trim();
  const email = parsed.get('email')?.trim().toLowerCase();
  const password = parsed.get('password');

  if (!tenantId || !businessEntityId || !email || !password) {
    throw new Error(
      'Missing required arguments. Expected --tenantId, --businessEntityId, --email, and --password.',
    );
  }

  return {
    tenantId,
    businessEntityId,
    email,
    password,
  };
}

function deriveNameFromEmail(email: string): string {
  const localPart = email.split('@')[0] ?? 'Test User';
  const normalized = localPart.replace(/[._-]+/g, ' ').trim();

  if (!normalized) {
    return 'Test User';
  }

  return normalized
    .split(/\s+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }

  const args = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient();

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: args.tenantId },
      select: { id: true, name: true },
    });

    if (!tenant) {
      throw new Error(`Tenant '${args.tenantId}' not found.`);
    }

    const businessEntity = await prisma.businessEntity.findUnique({
      where: { id: args.businessEntityId },
      select: { id: true, tenantId: true, name: true },
    });

    if (!businessEntity) {
      throw new Error(`BusinessEntity '${args.businessEntityId}' not found.`);
    }

    if (businessEntity.tenantId !== args.tenantId) {
      throw new Error(
        `BusinessEntity '${args.businessEntityId}' does not belong to tenant '${args.tenantId}'.`,
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: args.tenantId,
        email: args.email,
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new Error(
        `A user with email '${args.email}' already exists in tenant '${args.tenantId}'.`,
      );
    }

    const user = await prisma.user.create({
      data: {
        tenantId: args.tenantId,
        businessEntityId: args.businessEntityId,
        role: TenantRole.TenantOwner,
        email: args.email,
        name: deriveNameFromEmail(args.email),
        passwordHash: hashPassword(args.password),
        isActive: true,
        isEmailVerified: true,
      },
      select: {
        id: true,
        tenantId: true,
        businessEntityId: true,
        email: true,
        role: true,
      },
    });

    console.log(
      JSON.stringify(
        {
          message: 'Test operator user created successfully.',
          user,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`seed-test-user failed: ${message}`);
  printUsage();
  process.exit(1);
});
