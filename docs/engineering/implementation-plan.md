# Implementation Plan

## Current Implemented Tenant-Web Slices

- auth and protected tenant session
- live operational pages for drivers, vehicles, assignments, and remittance
- driver identity verification flow
- driver activation gate requiring a linked guarantor after identity verification
- driver document lifecycle with storage-backed files, operator approval, and approved-licence gating for activation and assignment
- driver and vehicle status management
- local vehicle maker/model catalog with inline create flow
- read-only operational wallet page

## Current Priorities

1. identity verification refinement where backend contracts expand
2. vehicle catalog bootstrap and VIN enrichment via NHTSA vPIC while keeping local DB as runtime source of truth
3. status-management follow-through across remaining modules
4. wallet follow-up actions and reporting, if needed

## Wallet Page Scope

- implemented as read-only
- resolves business-entity context from tenant JWT claims
- reads:
  - `GET /operational-wallets/:businessEntityId/balance`
  - `GET /operational-wallets/:businessEntityId/entries`
- does not mutate wallet state
