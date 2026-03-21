// =============================================================================
// billing-domain
// Money value object, billing enums, and pure calculation utilities.
// No database access. No framework dependencies.
// See docs/platform/wallet-model.md and docs/decisions/ADR-009-wallet-separation.md
// =============================================================================

// ── Branded scalar types ──────────────────────────────────────────────────────

export type PlanId = string & { readonly __brand: 'PlanId' };
export type SubscriptionId = string & { readonly __brand: 'SubscriptionId' };
export type InvoiceId = string & { readonly __brand: 'InvoiceId' };
export type PlatformWalletId = string & { readonly __brand: 'PlatformWalletId' };

export const asPlanId = (id: string): PlanId => id as PlanId;
export const asSubscriptionId = (id: string): SubscriptionId => id as SubscriptionId;
export const asInvoiceId = (id: string): InvoiceId => id as InvoiceId;
export const asPlatformWalletId = (id: string): PlatformWalletId => id as PlatformWalletId;

// ── Plan and subscription enums ───────────────────────────────────────────────

export enum PlanTier {
  Starter = 'starter',
  Growth = 'growth',
  Enterprise = 'enterprise',
}

export enum BillingInterval {
  Monthly = 'monthly',
  Annual = 'annual',
}

export enum SubscriptionStatus {
  Trialing = 'trialing',
  Active = 'active',
  PastDue = 'past_due',
  Suspended = 'suspended',
  Terminated = 'terminated',
}

export enum InvoiceStatus {
  Draft = 'draft',
  Open = 'open',
  Paid = 'paid',
  Void = 'void',
  Uncollectible = 'uncollectible',
}

/** Platform wallet ledger entry types (double-entry). */
export enum WalletEntryType {
  Credit = 'credit',
  Debit = 'debit',
  Reversal = 'reversal',
}

/** Terminal states for subscription — no further billing will occur. */
export const TERMINAL_SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>([
  SubscriptionStatus.Terminated,
]);

// ── Money value object ────────────────────────────────────────────────────────

/**
 * Immutable monetary amount stored in minor currency units (e.g. kobo, cents).
 *
 * Rules:
 *  - Amount is always an integer — never use float arithmetic for money.
 *  - Currency is an ISO 4217 code stored in uppercase.
 *  - Operations between different currencies throw explicitly.
 *
 * See docs/platform/wallet-model.md — Ledger Design Principles.
 */
export class Money {
  readonly amount: number;
  readonly currency: string;

  private constructor(amount: number, currency: string) {
    if (!Number.isInteger(amount)) {
      throw new Error(
        `Money amount must be an integer (minor units). Got: ${amount}. Convert to minor units before constructing (e.g. 1000 kobo, not 10 NGN).`,
      );
    }
    this.amount = amount;
    this.currency = currency.toUpperCase();
  }

  static of(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  static zero(currency: string): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  /**
   * Multiply by a scalar factor.
   * Result is rounded to the nearest integer minor unit.
   */
  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: cannot operate on ${this.currency} and ${other.currency}. Convert to a common currency before operating.`,
      );
    }
  }
}

// ── BillingCycle ──────────────────────────────────────────────────────────────

export interface BillingCycle {
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly interval: BillingInterval;
}

// ── Pure calculation utilities ────────────────────────────────────────────────

/**
 * Prorate a full-period charge to cover only the remaining portion of a
 * billing cycle starting from effectiveFrom.
 *
 * @param fullAmount   The charge for a complete billing period.
 * @param cycle        The complete billing cycle.
 * @param effectiveFrom  The date from which the charge starts (within the cycle).
 * @returns The prorated charge, rounded to the nearest minor unit.
 */
export function calculateProration(
  fullAmount: Money,
  cycle: BillingCycle,
  effectiveFrom: Date,
): Money {
  const totalMs = cycle.endsAt.getTime() - cycle.startsAt.getTime();
  if (totalMs <= 0) {
    throw new Error('Billing cycle must have a positive duration (endsAt > startsAt).');
  }

  const remainingMs = cycle.endsAt.getTime() - effectiveFrom.getTime();
  const factor = Math.max(0, Math.min(1, remainingMs / totalMs));
  return fullAmount.multiply(factor);
}

/**
 * Apply service credits against an invoice amount.
 * The result is clamped to zero — credits cannot generate refunds here.
 * Negative balances (owed credits) are tracked separately in the wallet ledger.
 *
 * @param invoiceAmount  The gross amount owed.
 * @param credits        Credits to apply.
 * @returns The net amount due (≥ zero).
 */
export function applyCredits(invoiceAmount: Money, credits: Money): Money {
  const net = invoiceAmount.subtract(credits);
  return net.isNegative() ? Money.zero(invoiceAmount.currency) : net;
}
