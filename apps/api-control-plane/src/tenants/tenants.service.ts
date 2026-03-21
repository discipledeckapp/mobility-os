import { Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ApiCoreTenantsClient } from './api-core-tenants.client';
import type { TenantDetailDto } from './dto/tenant-detail.dto';
import type { TenantListItemDto } from './dto/tenant-list-item.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly apiCoreTenantsClient: ApiCoreTenantsClient,
  ) {}

  async listTenants(): Promise<TenantListItemDto[]> {
    const [tenants, subscriptions] = await Promise.all([
      this.apiCoreTenantsClient.listTenants(),
      this.prisma.cpSubscription.findMany({
        include: {
          plan: true,
        },
      }),
    ]);

    const subscriptionsByTenantId = new Map(
      subscriptions.map((subscription) => [subscription.tenantId, subscription]),
    );

    return tenants.map((tenant) => {
      const subscription = subscriptionsByTenantId.get(tenant.id);
      return {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        country: tenant.country,
        status: tenant.status,
        planName: subscription?.plan.name ?? null,
        planTier: subscription?.plan.tier ?? null,
        subscriptionStatus: subscription?.status ?? null,
        createdAt: new Date(tenant.createdAt),
      };
    });
  }

  async getTenantDetail(tenantId: string): Promise<TenantDetailDto> {
    const [tenant, subscription, invoices, lifecycleState, lifecycleEvents, overrides] =
      await Promise.all([
        this.apiCoreTenantsClient.getTenant(tenantId),
        this.prisma.cpSubscription.findUnique({
          where: { tenantId },
          include: { plan: true },
        }),
        this.prisma.cpInvoice.findMany({
          where: { tenantId },
          include: { lineItems: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        this.prisma.cpSubscription.findUnique({
          where: { tenantId },
          select: {
            tenantId: true,
            id: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        }),
        this.prisma.cpTenantLifecycleEvent.findMany({
          where: { tenantId },
          orderBy: { occurredAt: 'desc' },
          take: 20,
        }),
        this.prisma.cpFeatureFlagOverride.findMany({
          where: { tenantId },
          include: { flag: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    if (!tenant) {
      throw new NotFoundException(`Tenant '${tenantId}' not found`);
    }

    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      country: tenant.country,
      status: tenant.status,
      createdAt: new Date(tenant.createdAt),
      subscription: subscription
        ? {
            id: subscription.id,
            planId: subscription.planId,
            planName: subscription.plan.name,
            planTier: subscription.plan.tier,
            status: subscription.status,
            currency: subscription.plan.currency,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
      invoices,
      featureFlagOverrides: overrides.map((override) => ({
        id: override.id,
        flagKey: override.flag.key,
        countryCode: override.countryCode,
        planTier: override.planTier,
        isEnabled: override.isEnabled,
      })),
      lifecycleState: lifecycleState
        ? {
            tenantId: lifecycleState.tenantId,
            subscriptionId: lifecycleState.id,
            status: lifecycleState.status,
            currentPeriodStart: lifecycleState.currentPeriodStart,
            currentPeriodEnd: lifecycleState.currentPeriodEnd,
            cancelAtPeriodEnd: lifecycleState.cancelAtPeriodEnd,
          }
        : null,
      lifecycleEvents,
    };
  }
}
