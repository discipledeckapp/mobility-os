# Wallet Model

## Overview

Mobility OS uses two distinct wallet types that must never be co-mingled. See [ADR-009](../decisions/ADR-009-wallet-separation.md).

This document describes the target wallet model and the current schema boundary. Some wallet service workflows are defined in Prisma and architecture docs before their full service modules are wired.

## Wallet Types

### Platform Wallet

**Scope**: Owned by the platform (control plane)
**Purpose**: SaaS billing, service credits, and consumption charges
**Location**: `cp_platform_wallets` table
**Who manages it**: Platform billing ops staff via the control-plane dashboard

- Funded by tenant payment (bank transfer, card on file, etc.)
- Debited automatically on invoice generation
- Credited via service credits issued by platform staff
- Balance below zero triggers grace period → suspension flow

### Operational Wallet

**Scope**: Owned by a tenant business or operating unit
**Purpose**: Driver remittance accounting, cash collections, and internal fleet finance
**Location**: `ow_*` tables in the tenant data plane
**Who manages it**: Tenant finance staff via the tenant-web dashboard

- Independently funded by tenant business operations
- Not visible to platform billing
- Transactions follow tenant-defined ledger rules

## Separation Rule

> Platform wallet and operational wallet must remain distinct.

The platform must never debit an operational wallet to settle a SaaS invoice. Operational wallet transactions must never appear on a SaaS invoice.

## Ledger Design Principles

- All wallet mutations are recorded as double-entry ledger entries
- Every entry references the initiating event (invoice ID, payment ID, remittance run ID)
- Wallet balance is always derived from the ledger — never stored as a mutable column
- All transactions are append-only; corrections are made via reversal entries

## Implementation Status

Current repo state:
- Wallet schemas and separation rules are defined
- Operational wallet functionality exists within `apps/api-core`
- `apps/tenant-web` now has a read-only wallet page for the current business entity
- The tenant sidebar wallet link is live and points to that read-only page

Still pending in the control-plane service layer:
- Full platform-wallet workflows
- Billing-ops mutation endpoints
- End-to-end invoice settlement automation

Still pending in tenant-web:
- wallet mutation flows
- wallet filters and reporting views

## Related Docs

- [Subscription & Billing](./subscription-and-billing.md)
- [ADR-009: Wallet Separation](../decisions/ADR-009-wallet-separation.md)
