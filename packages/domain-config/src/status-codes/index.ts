// =============================================================================
// Status code registry
// Canonical status definitions for all domain entities.
// These strings are the values stored in the database — change with care.
// =============================================================================

export interface StatusCodeConfig {
  /** The value stored in the DB and used in API responses. */
  code: string;
  /** Human-readable label for display in UI. */
  label: string;
  /** True if this status is a final state (no further transitions allowed). */
  terminal: boolean;
}

// ── Driver statuses ───────────────────────────────────────────────────────────

export const DRIVER_STATUS_CODES = {
  active: { code: 'active', label: 'Active', terminal: false },
  inactive: { code: 'inactive', label: 'Inactive', terminal: false },
  suspended: { code: 'suspended', label: 'Suspended', terminal: false },
  terminated: { code: 'terminated', label: 'Terminated', terminal: true },
} as const satisfies Record<string, StatusCodeConfig>;

export type DriverStatusCode = keyof typeof DRIVER_STATUS_CODES;

// ── Vehicle statuses ──────────────────────────────────────────────────────────

export const VEHICLE_STATUS_CODES = {
  available: { code: 'available', label: 'Available', terminal: false },
  assigned: { code: 'assigned', label: 'Assigned', terminal: false },
  maintenance: {
    code: 'maintenance',
    label: 'Under Maintenance',
    terminal: false,
  },
  retired: { code: 'retired', label: 'Retired', terminal: true },
} as const satisfies Record<string, StatusCodeConfig>;

export type VehicleStatusCode = keyof typeof VEHICLE_STATUS_CODES;

// ── Assignment statuses ───────────────────────────────────────────────────────

export const ASSIGNMENT_STATUS_CODES = {
  created: { code: 'created', label: 'Created', terminal: false },
  pending_driver_confirmation: {
    code: 'pending_driver_confirmation',
    label: 'Pending Driver Confirmation',
    terminal: false,
  },
  driver_action_required: {
    code: 'driver_action_required',
    label: 'Driver Action Required',
    terminal: false,
  },
  accepted: {
    code: 'accepted',
    label: 'Accepted',
    terminal: false,
  },
  active: { code: 'active', label: 'Active', terminal: false },
  declined: { code: 'declined', label: 'Declined', terminal: true },
  ended: { code: 'ended', label: 'Ended', terminal: true },
  cancelled: { code: 'cancelled', label: 'Cancelled', terminal: true },
} as const satisfies Record<string, StatusCodeConfig>;

export type AssignmentStatusCode = keyof typeof ASSIGNMENT_STATUS_CODES;

// ── Remittance statuses ───────────────────────────────────────────────────────

export const REMITTANCE_STATUS_CODES = {
  pending: { code: 'pending', label: 'Pending', terminal: false },
  completed: { code: 'completed', label: 'Completed', terminal: true },
  partially_settled: { code: 'partially_settled', label: 'Partially Settled', terminal: true },
  cancelled_due_to_assignment_end: {
    code: 'cancelled_due_to_assignment_end',
    label: 'Cancelled Due To Assignment End',
    terminal: true,
  },
  disputed: { code: 'disputed', label: 'Disputed', terminal: true },
  waived: { code: 'waived', label: 'Waived', terminal: true },
} as const satisfies Record<string, StatusCodeConfig>;

export type RemittanceStatusCode = keyof typeof REMITTANCE_STATUS_CODES;

// ── Inspection statuses ───────────────────────────────────────────────────────

export const INSPECTION_STATUS_CODES = {
  pass: { code: 'pass', label: 'Pass', terminal: true },
  fail: { code: 'fail', label: 'Fail', terminal: true },
  conditional: {
    code: 'conditional',
    label: 'Conditional Pass',
    terminal: false,
  },
} as const satisfies Record<string, StatusCodeConfig>;

export type InspectionStatusCode = keyof typeof INSPECTION_STATUS_CODES;

// ── Maintenance statuses ──────────────────────────────────────────────────────

export const MAINTENANCE_STATUS_CODES = {
  scheduled: { code: 'scheduled', label: 'Scheduled', terminal: false },
  in_progress: { code: 'in_progress', label: 'In Progress', terminal: false },
  completed: { code: 'completed', label: 'Completed', terminal: true },
  cancelled: { code: 'cancelled', label: 'Cancelled', terminal: true },
} as const satisfies Record<string, StatusCodeConfig>;

export type MaintenanceStatusCode = keyof typeof MAINTENANCE_STATUS_CODES;
