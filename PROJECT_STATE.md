# Project State

## Current System Architecture

- `apps/api-core`: tenant operations plane for operational domain APIs
- `apps/api-control-plane`: SaaS governance plane for plans, subscriptions, billing, wallets, payments, lifecycle, and metering
- `apps/api-intelligence`: canonical identity, verification orchestration, liveness, and intelligence workflows
- `apps/tenant-web`: tenant operator frontend built against `api-core`

## Completed Features

- Auth
  - backend login with JWT for `api-core`
  - tenant-web login, logout, cookie-based session handling, and route protection
- Drivers
  - `api-core` CRUD/read flows in place
  - tenant-web live list/create flow connected to backend
  - tenant-web identity verification flow connected to backend
  - tenant-web operational status actions connected to backend
- Vehicles
  - `api-core` CRUD/read flows in place
  - tenant-web live list/create flow connected to backend
  - tenant-web operational status actions connected to backend
- Operational Wallets
  - `api-core` balance and ledger endpoints are live
  - tenant-web wallet page is implemented and read-only for the current business entity
- Assignments
  - backend lifecycle and transition enforcement in `api-core`
  - tenant-web live list/create/start/complete/cancel flows connected to backend
- Remittance
  - backend lifecycle enforcement in `api-core`
  - tenant-web live list/create/confirm/dispute/waive flows connected to backend

## Current Priorities

1. auth (if any hardening gaps remain)
2. fleet context
3. identity verification
4. status management
5. wallet

## Decisions

- Mobiris is the product name
- the shared design system must be used for frontend work
- no mobile work yet

## Current Task

- operational wallet page is implemented in tenant-web and repo state/docs are being kept in sync
- tenant-web and api-core are being hardened for a free pilot deployment path on Vercel, Render, and Neon
