// =============================================================================
// authz-model
// Roles, permissions, and guard utilities for all Mobility OS services.
// No database access. No framework dependencies.
// Used by both NestJS backends and Next.js middleware.
// =============================================================================

// ── Platform roles (staff-side) ───────────────────────────────────────────────

/**
 * Roles for platform staff. Only holders of these roles may call
 * api-control-plane endpoints. Tenant users never receive a PlatformRole.
 */
export enum PlatformRole {
  PlatformAdmin = 'PLATFORM_ADMIN',
  SupportAgent = 'SUPPORT_AGENT',
  BillingOps = 'BILLING_OPS',
}

// ── Tenant roles (operator-side) ──────────────────────────────────────────────

/**
 * Roles for tenant users. These are scoped to a tenant account and optionally
 * to a business entity or operating unit.
 */
export enum TenantRole {
  TenantOwner = 'TENANT_OWNER',
  FleetManager = 'FLEET_MANAGER',
  FinanceOfficer = 'FINANCE_OFFICER',
  FieldOfficer = 'FIELD_OFFICER',
  ReadOnly = 'READ_ONLY',
}

// ── Permissions ───────────────────────────────────────────────────────────────

export enum Permission {
  // ── Tenant / business hierarchy ──────────────────────────────────────────
  TenantsRead = 'tenants:read',
  TenantsWrite = 'tenants:write',
  BusinessEntitiesRead = 'business_entities:read',
  BusinessEntitiesWrite = 'business_entities:write',
  OperatingUnitsRead = 'operating_units:read',
  OperatingUnitsWrite = 'operating_units:write',

  // ── Fleet and assets ─────────────────────────────────────────────────────
  FleetsRead = 'fleets:read',
  FleetsWrite = 'fleets:write',
  VehiclesRead = 'vehicles:read',
  VehiclesWrite = 'vehicles:write',

  // ── People ────────────────────────────────────────────────────────────────
  DriversRead = 'drivers:read',
  DriversWrite = 'drivers:write',
  GuarantorsRead = 'guarantors:read',
  GuarantorsWrite = 'guarantors:write',
  InvestorsRead = 'investors:read',
  InvestorsWrite = 'investors:write',

  // ── Operations ────────────────────────────────────────────────────────────
  AssignmentsRead = 'assignments:read',
  AssignmentsWrite = 'assignments:write',
  RemittanceRead = 'remittance:read',
  RemittanceWrite = 'remittance:write',
  RemittanceApprove = 'remittance:approve',

  // ── Finance ───────────────────────────────────────────────────────────────
  OperationalWalletsRead = 'operational_wallets:read',
  OperationalWalletsWrite = 'operational_wallets:write',
  AccountingRead = 'accounting:read',
  AccountingWrite = 'accounting:write',

  // ── Ancillary ─────────────────────────────────────────────────────────────
  ValuationsRead = 'valuations:read',
  ValuationsWrite = 'valuations:write',
  InspectionsRead = 'inspections:read',
  InspectionsWrite = 'inspections:write',
  MaintenanceRead = 'maintenance:read',
  MaintenanceWrite = 'maintenance:write',
  DocumentsRead = 'documents:read',
  DocumentsWrite = 'documents:write',

  // ── Cross-cutting ─────────────────────────────────────────────────────────
  AuditRead = 'audit:read',
  IntelligenceRead = 'intelligence:read',

  // ── Platform staff only ───────────────────────────────────────────────────
  TenantImpersonate = 'tenant:impersonate',
  PlatformWalletsWrite = 'platform_wallets:write',
  FeatureFlagsWrite = 'feature_flags:write',
  PlansWrite = 'plans:write',
  SubscriptionsWrite = 'subscriptions:write',
  MeteringRead = 'metering:read',
  SupportRead = 'support:read',
}

const DRIVER_LINKED_TENANT_PERMISSIONS = new Set<Permission>([
  Permission.DriversRead,
  Permission.AssignmentsRead,
  Permission.AssignmentsWrite,
  Permission.RemittanceRead,
  Permission.RemittanceWrite,
]);

// ── Role → Permission sets ────────────────────────────────────────────────────

/** All read permissions across the tenant operational plane. */
const ALL_READ = new Set<Permission>([
  Permission.TenantsRead,
  Permission.BusinessEntitiesRead,
  Permission.OperatingUnitsRead,
  Permission.FleetsRead,
  Permission.VehiclesRead,
  Permission.DriversRead,
  Permission.GuarantorsRead,
  Permission.InvestorsRead,
  Permission.AssignmentsRead,
  Permission.RemittanceRead,
  Permission.OperationalWalletsRead,
  Permission.AccountingRead,
  Permission.ValuationsRead,
  Permission.InspectionsRead,
  Permission.MaintenanceRead,
  Permission.DocumentsRead,
  Permission.AuditRead,
]);

/**
 * Authoritative mapping from role to granted permissions.
 *
 * Rules:
 *  - Permissions are additive and explicit — there is no role hierarchy.
 *  - Adding a permission here is the only way to grant it; there is no wildcard.
 *  - Platform-only permissions must not appear in any TenantRole set.
 */
export const rolePermissions: Readonly<Record<PlatformRole | TenantRole, ReadonlySet<Permission>>> =
  {
    // ── Platform roles ────────────────────────────────────────────────────────

    [PlatformRole.PlatformAdmin]: new Set<Permission>([
      ...ALL_READ,
      Permission.TenantImpersonate,
      Permission.PlatformWalletsWrite,
      Permission.FeatureFlagsWrite,
      Permission.PlansWrite,
      Permission.SubscriptionsWrite,
      Permission.MeteringRead,
      Permission.SupportRead,
      Permission.IntelligenceRead,
    ]),

    [PlatformRole.SupportAgent]: new Set<Permission>([
      ...ALL_READ,
      // Impersonation is read-only — the api-control-plane guard enforces
      // that support agents cannot make mutations during impersonation sessions.
      Permission.TenantImpersonate,
      Permission.SupportRead,
      Permission.MeteringRead,
    ]),

    [PlatformRole.BillingOps]: new Set<Permission>([
      Permission.TenantsRead,
      Permission.MeteringRead,
      Permission.SupportRead,
      Permission.PlatformWalletsWrite,
      Permission.SubscriptionsWrite,
    ]),

    // ── Tenant roles ──────────────────────────────────────────────────────────

    [TenantRole.TenantOwner]: new Set<Permission>([
      ...ALL_READ,
      Permission.TenantsWrite,
      Permission.BusinessEntitiesWrite,
      Permission.OperatingUnitsWrite,
      Permission.FleetsWrite,
      Permission.VehiclesWrite,
      Permission.DriversWrite,
      Permission.GuarantorsWrite,
      Permission.InvestorsWrite,
      Permission.AssignmentsWrite,
      Permission.RemittanceWrite,
      Permission.RemittanceApprove,
      Permission.OperationalWalletsWrite,
      Permission.AccountingWrite,
      Permission.ValuationsWrite,
      Permission.InspectionsWrite,
      Permission.MaintenanceWrite,
      Permission.DocumentsWrite,
      Permission.IntelligenceRead,
    ]),

    [TenantRole.FleetManager]: new Set<Permission>([
      Permission.BusinessEntitiesRead,
      Permission.OperatingUnitsRead,
      Permission.FleetsRead,
      Permission.FleetsWrite,
      Permission.VehiclesRead,
      Permission.VehiclesWrite,
      Permission.DriversRead,
      Permission.DriversWrite,
      Permission.GuarantorsRead,
      Permission.GuarantorsWrite,
      Permission.AssignmentsRead,
      Permission.AssignmentsWrite,
      Permission.ValuationsRead,
      Permission.ValuationsWrite,
      Permission.InspectionsRead,
      Permission.InspectionsWrite,
      Permission.MaintenanceRead,
      Permission.MaintenanceWrite,
      Permission.DocumentsRead,
      Permission.DocumentsWrite,
      Permission.AuditRead,
      Permission.IntelligenceRead,
    ]),

    [TenantRole.FinanceOfficer]: new Set<Permission>([
      Permission.BusinessEntitiesRead,
      Permission.OperatingUnitsRead,
      Permission.FleetsRead,
      Permission.VehiclesRead,
      Permission.DriversRead,
      Permission.AssignmentsRead,
      Permission.RemittanceRead,
      Permission.RemittanceWrite,
      Permission.RemittanceApprove,
      Permission.OperationalWalletsRead,
      Permission.OperationalWalletsWrite,
      Permission.AccountingRead,
      Permission.AccountingWrite,
      Permission.InvestorsRead,
      Permission.InvestorsWrite,
      Permission.AuditRead,
    ]),

    [TenantRole.FieldOfficer]: new Set<Permission>([
      Permission.VehiclesRead,
      Permission.DriversRead,
      Permission.AssignmentsRead,
      Permission.AssignmentsWrite,
      Permission.RemittanceRead,
      Permission.RemittanceWrite,
      Permission.InspectionsRead,
      Permission.InspectionsWrite,
      Permission.MaintenanceRead,
      Permission.MaintenanceWrite,
    ]),

    [TenantRole.ReadOnly]: new Set<Permission>([...ALL_READ]),
  } as const;

// ── Guard utilities ───────────────────────────────────────────────────────────

export function hasPermission(role: PlatformRole | TenantRole, permission: Permission): boolean {
  return rolePermissions[role]?.has(permission) ?? false;
}

export function getGrantedPermissions(
  role: PlatformRole | TenantRole,
  customPermissions: readonly string[] = [],
  options?: { linkedDriverId?: string | null },
): ReadonlySet<string> {
  if (options?.linkedDriverId) {
    return new Set<string>(DRIVER_LINKED_TENANT_PERMISSIONS);
  }

  const granted = new Set<string>(rolePermissions[role] ?? []);
  for (const permission of customPermissions) {
    if (typeof permission === 'string' && permission.trim()) {
      granted.add(permission.trim());
    }
  }
  return granted;
}

export function isPlatformRole(role: string): role is PlatformRole {
  return Object.values(PlatformRole).includes(role as PlatformRole);
}

export function isTenantRole(role: string): role is TenantRole {
  return Object.values(TenantRole).includes(role as TenantRole);
}

/**
 * Only PLATFORM_ADMIN and SUPPORT_AGENT may impersonate tenant sessions.
 * Impersonation must always be read-only — enforced at the guard/interceptor level.
 */
export function canImpersonate(role: PlatformRole | TenantRole): boolean {
  return role === PlatformRole.PlatformAdmin || role === PlatformRole.SupportAgent;
}
