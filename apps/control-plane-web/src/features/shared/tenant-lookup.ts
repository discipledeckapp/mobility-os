import type { TenantListItemRecord } from '../../lib/api-control-plane';

export interface TenantLookupRecord {
  name: string;
  slug: string;
  country: string;
  status: string;
}

export function buildTenantLookup(tenants: TenantListItemRecord[]): Map<string, TenantLookupRecord> {
  return new Map(
    tenants.map((tenant) => [
      tenant.id,
      {
        name: tenant.name,
        slug: tenant.slug,
        country: tenant.country,
        status: tenant.status,
      },
    ]),
  );
}

export function getTenantLabel(
  tenantLookup: Map<string, TenantLookupRecord>,
  tenantId: string,
): TenantLookupRecord {
  return (
    tenantLookup.get(tenantId) ?? {
      name: tenantId,
      slug: tenantId,
      country: 'n/a',
      status: 'unknown',
    }
  );
}
