// =============================================================================
// tenancy-domain
// Core tenant hierarchy types, request-scoped context, and ownership guards.
// No database access. No framework dependencies.
// =============================================================================

// ── Branded scalar types ──────────────────────────────────────────────────────

/** Opaque identifier for a top-level tenant account (the SaaS subscriber). */
export type TenantId = string & { readonly __brand: 'TenantId' };

/** Opaque identifier for a legal/commercial entity within a tenant. */
export type BusinessEntityId = string & { readonly __brand: 'BusinessEntityId' };

/** Opaque identifier for an operating branch/depot within a business entity. */
export type OperatingUnitId = string & { readonly __brand: 'OperatingUnitId' };

/** Opaque identifier for a fleet within an operating unit. */
export type FleetId = string & { readonly __brand: 'FleetId' };
export type VehicleId = string & { readonly __brand: 'VehicleId' };

export const asTenantId = (id: string): TenantId => id as TenantId;
export const asBusinessEntityId = (id: string): BusinessEntityId => id as BusinessEntityId;
export const asOperatingUnitId = (id: string): OperatingUnitId => id as OperatingUnitId;
export const asFleetId = (id: string): FleetId => id as FleetId;
export const asVehicleId = (id: string): VehicleId => id as VehicleId;

// ── Tenant lifecycle ──────────────────────────────────────────────────────────

/**
 * Canonical lifecycle stages for a tenant account.
 * See docs/platform/tenant-lifecycle.md for stage definitions and transitions.
 */
export enum TenantStatus {
  Lead = 'lead',
  Prospect = 'prospect',
  Onboarded = 'onboarded',
  Active = 'active',
  PastDue = 'past_due',
  GracePeriod = 'grace_period',
  Suspended = 'suspended',
  Terminated = 'terminated',
  Archived = 'archived',
}

/** Terminal stages — a tenant in one of these states cannot transition forward. */
export const TERMINAL_TENANT_STATUSES = new Set<TenantStatus>([
  TenantStatus.Terminated,
  TenantStatus.Archived,
]);

// ── Request-scoped context ────────────────────────────────────────────────────

/**
 * Tenant context extracted from a verified JWT and attached to every
 * authenticated request in api-core.
 *
 * operatingUnitId is absent for users whose access is scoped to the full
 * business entity (e.g. TENANT_OWNER, FINANCE_OFFICER at entity level).
 */
export interface TenantContext {
  tenantId: TenantId;
  /** The subject claim from the JWT — identifies the user record. */
  userId: string;
  /** Optional for tenant-wide operators and access modes resolved from linked driver records. */
  businessEntityId?: BusinessEntityId;
  /** Role string — use @mobility-os/authz-model TenantRole for typed checks. */
  role: string;
  /** Present when the user is scoped to a specific operating unit. */
  operatingUnitId?: OperatingUnitId;
  /** Optional fleet-level access scope for users limited to selected fleets. */
  assignedFleetIds?: FleetId[];
  /** Optional vehicle-level access scope for users limited to selected vehicles. */
  assignedVehicleIds?: VehicleId[];
  /** Optional per-user permission overrides merged with the base role grants. */
  customPermissions?: string[];
  /** Present when this session is explicitly linked to a driver record. */
  linkedDriverId?: string;
  /** Optional mobile role derived from the tenant user linkage. */
  mobileRole?: 'driver' | 'field_officer';
}

/**
 * Extract TenantContext from a decoded JWT payload.
 * Throws with a descriptive message if any required claim is missing or malformed.
 */
export function tenantContextFromJwt(payload: Record<string, unknown>): TenantContext {
  const { tenantId, sub, businessEntityId, role } = payload as Record<string, unknown>;

  if (typeof tenantId !== 'string' || typeof sub !== 'string' || typeof role !== 'string') {
    throw new Error(
      'Invalid JWT payload: required claims missing or wrong type. ' +
        'Expected: tenantId (string), sub (string), role (string), and optional businessEntityId (string).',
    );
  }

  const ctx: TenantContext = {
    tenantId: asTenantId(tenantId),
    userId: sub,
    role,
  };

  if (typeof businessEntityId === 'string') {
    ctx.businessEntityId = asBusinessEntityId(businessEntityId);
  }

  const { operatingUnitId } = payload as Record<string, unknown>;
  if (typeof operatingUnitId === 'string') {
    ctx.operatingUnitId = asOperatingUnitId(operatingUnitId);
  }

  const { assignedFleetIds, assignedVehicleIds, customPermissions, linkedDriverId, mobileRole } =
    payload as Record<string, unknown>;
  if (Array.isArray(assignedFleetIds)) {
    ctx.assignedFleetIds = assignedFleetIds
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => asFleetId(value));
  }
  if (Array.isArray(assignedVehicleIds)) {
    ctx.assignedVehicleIds = assignedVehicleIds
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => asVehicleId(value));
  }
  if (Array.isArray(customPermissions)) {
    ctx.customPermissions = customPermissions.filter(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );
  }
  if (typeof linkedDriverId === 'string' && linkedDriverId.trim().length > 0) {
    ctx.linkedDriverId = linkedDriverId;
  }
  if (mobileRole === 'driver' || mobileRole === 'field_officer') {
    ctx.mobileRole = mobileRole;
  }

  return ctx;
}

// ── Ownership guards ──────────────────────────────────────────────────────────

/**
 * Assert that a resource's tenantId matches the requesting tenant's context.
 *
 * Throws a generic Error — the caller (NestJS guard or service) is responsible
 * for translating this to an appropriate HTTP response (403 or 404 depending
 * on whether the resource's existence should be disclosed).
 */
export function assertTenantOwnership(resourceTenantId: TenantId, requestTenantId: TenantId): void {
  if (resourceTenantId !== requestTenantId) {
    throw new Error('Tenant ownership assertion failed');
  }
}

/**
 * Type-safe check variant — returns boolean instead of throwing.
 * Prefer assertTenantOwnership in service code; use this in conditional logic.
 */
export function hasTenantOwnership(resourceTenantId: TenantId, requestTenantId: TenantId): boolean {
  return resourceTenantId === requestTenantId;
}
