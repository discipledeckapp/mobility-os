# Canonical Ownership Matrix

Date: 2026-03-30
Status: Proposed
Purpose: Establish one clear ownership map for Mobility OS / Mobiris across apps, domains, routes, and workflow concepts.

## 1. Platform Boundaries

### Tenant Operations Plane

Primary runtime:
- `apps/api-core`

Primary user surfaces:
- `apps/tenant-web`
- `apps/mobile-ops`

Owns:
- tenant hierarchy
- business entities
- operating units
- fleets
- vehicles
- drivers
- guarantors as tenant operational subjects
- assignments
- remittance
- operational readiness
- inspections
- maintenance
- tenant-side notifications
- tenant-side privacy requests
- tenant-side audit records
- operational wallet
- tenant-side reports

Must not own:
- SaaS subscription governance
- platform wallet
- cross-tenant raw intelligence records
- platform staff workflows

### Control Plane

Primary runtime:
- `apps/api-control-plane`

Primary user surface:
- `apps/control-plane-web`

Owns:
- plans
- subscriptions
- invoices
- collections
- payment orchestration for platform billing
- platform wallet
- usage metering
- tenant lifecycle
- structured platform settings
- governance oversight
- platform staff accounts
- provisioning
- support/admin operations

Must not own:
- tenant operational records as a source of truth
- operator CRUD workflows
- operational wallet
- direct tenant runtime logic

### Intelligence Plane

Primary runtime:
- `apps/api-intelligence`

Primary consumers:
- `apps/api-core`
- `apps/control-plane-web`

Owns:
- canonical person graph
- identifiers
- biometrics
- liveness
- identity matching
- review cases
- watchlists
- cross-tenant fraud signals
- global risk scoring
- linkage events

Must not own:
- tenant operational CRUD
- operator-specific business workflow state
- SaaS billing

## 2. Canonical Domain Ownership

| Domain | Source Of Truth | Main UI Surface | Notes |
|---|---|---|---|
| Tenant auth and tenant session | `api-core` | `tenant-web`, `mobile-ops` | Shared tenant-plane auth stack |
| Platform staff auth | `api-control-plane` | `control-plane-web` | Separate from tenant auth |
| Tenant lifecycle status | `api-control-plane` | `control-plane-web`, consumed by `api-core` guards | Tenant plane consumes resulting status |
| Business entities | `api-core` | `tenant-web`, `mobile-ops` operator | Tenant hierarchy |
| Operating units | `api-core` | `tenant-web`, `mobile-ops` operator | Tenant hierarchy |
| Fleets | `api-core` | `tenant-web`, `mobile-ops` operator | Tenant hierarchy |
| Vehicles | `api-core` | `tenant-web`, `mobile-ops` operator | Vehicle lifecycle + readiness |
| Vehicle catalog | `api-core` | `tenant-web`, `mobile-ops` operator | Runtime source stays local |
| Drivers | `api-core` | `tenant-web`, `mobile-ops`, driver self-service | Tenant operational subject |
| Guarantor linkage | `api-core` | `tenant-web`, guarantor self-service | Linked to drivers, not platform identity source |
| Assignments | `api-core` | `tenant-web`, `mobile-ops`, driver mode | Driver-vehicle lifecycle |
| Remittance records | `api-core` | `tenant-web`, `mobile-ops`, driver mode | Operational collections |
| Remittance planning | `api-core` | `tenant-web`, `mobile-ops` operator | Assignment-level terms |
| Maintenance work orders | `api-core` | `tenant-web`, `mobile-ops` operator | Operational asset upkeep |
| Inspections | `api-core` | `tenant-web`, `mobile-ops` operator | Compliance and readiness |
| Tenant notifications | `api-core` | `tenant-web`, `mobile-ops` | Includes push device management |
| Tenant privacy requests | `api-core` | `tenant-web` | Platform sees oversight view only |
| Audit logs | `api-core` | `tenant-web` future, `control-plane-web` derived oversight | Tenant actions stay tenant-plane |
| Operational wallet | `api-core` | `tenant-web` finance/operator | Distinct from verification funding and platform wallet |
| Verification funding state | `api-core` via `tenant-billing` + `api-control-plane` internals | `tenant-web` | Needs clearer IA/name separation |
| Plans | `api-control-plane` | `control-plane-web`, consumed in tenant summary | SaaS governance |
| Subscriptions | `api-control-plane` | `control-plane-web`, tenant summary surface | SaaS governance |
| Invoices | `api-control-plane` | `control-plane-web`, tenant summary/payment | SaaS billing |
| Platform wallet | `api-control-plane` | `control-plane-web` | SaaS wallet only |
| Usage metering | `api-control-plane` | `control-plane-web` future | Internal capability exists |
| Platform settings | `api-control-plane` | `control-plane-web` | Verification routing and platform config |
| Canonical persons | `api-intelligence` | `control-plane-web` staff | Never tenant CRUD source |
| Identity matching | `api-intelligence` | `control-plane-web` staff, consumed by `api-core` | Cross-plane capability |
| Review cases | `api-intelligence` | `control-plane-web` staff | Manual adjudication |
| Watchlists | `api-intelligence` | `control-plane-web` staff | Tenant sees derived signals only |
| Risk signals | `api-intelligence` | `tenant-web`, `mobile-ops`, `control-plane-web` | Derived and privacy-safe |

## 3. Canonical Route Intent

### Tenant Web

| Route | Intended Product Meaning | Primary Role |
|---|---|---|
| `/` | Operator home or role-aware redirect | operator, driver, guarantor |
| `/drivers` | Driver registry and readiness management | operator |
| `/driver-self-service` | Driver onboarding and recovery flow | driver |
| `/guarantor-self-service` | Guarantor verification flow | guarantor |
| `/vehicles` | Vehicle registry and lifecycle | operator |
| `/assignments` | Driver-vehicle assignment management | operator |
| `/remittance` | Remittance records and collection history | operator |
| `/reports` | Operational reporting and readiness summaries | operator |
| `/maintenance` | Maintenance queue and work-order operations | operator |
| `/business-entities` | Tenant hierarchy management | operator/admin |
| `/fleets` | Fleet management and readiness view | operator/admin |
| `/settings` | Account, team, preferences, privacy, org controls | operator/admin |
| `/subscription` | SaaS plan and invoice management | operator/admin |
| `/wallet` | Must be explicitly defined: verification funding vs operational wallet | operator/admin |

### Mobile Ops

| Navigator / Screen Area | Intended Product Meaning | Primary Role |
|---|---|---|
| Role selection + auth | entry point only, not long-term role source of truth | all |
| Driver mode | assignments, remittance, profile, verification continuity | driver |
| Guarantor mode | guarantor onboarding and verification continuity | guarantor |
| Operator mode | mobile-first operator console | operator/admin |

### Control-Plane Web

| Route | Intended Product Meaning | Primary Role |
|---|---|---|
| `/` | platform dashboard | platform staff |
| `/tenants` | tenant governance and provisioning | platform staff |
| `/subscriptions` | subscription management | platform staff |
| `/billing-operations` | invoices, collections, disputes, receipts | billing ops / platform admin |
| `/platform-wallets` | SaaS wallet oversight | billing ops / platform admin |
| `/tenant-lifecycle` | lifecycle posture and intervention | platform staff |
| `/feature-flags` | rollout controls | platform staff |
| `/platform-settings` | structured governance config | platform staff |
| `/operations` | cross-tenant operational oversight | support / platform admin |
| `/governance` | privacy, consent, notification governance | support / platform admin |
| `/intelligence/*` | person graph, review, watchlists, matching oversight | platform admin / intelligence reviewers |
| `/staff` | platform staff management | platform admin |

## 4. Financial Concept Separation

### Operational Wallet

Owner:
- `api-core`

Purpose:
- tenant business operational finance
- remittance-related accounting and internal cash operations

Should surface in:
- tenant operator/finance workflows

Should not be confused with:
- verification funding
- subscription billing

### Verification Funding

Owner:
- tenant-facing orchestration in `api-core/tenant-billing`
- underlying platform funding and payments integration via control-plane internals

Purpose:
- pay for company-funded verification activity
- expose credit/wallet/card-backed coverage for verification workflows

Should surface in:
- driver verification and finance/admin decision flows

Should not be confused with:
- operational remittance cash management
- subscription invoices

### Platform Billing / SaaS Wallet

Owner:
- `api-control-plane`

Purpose:
- plans, subscriptions, invoices, collections, credits, SaaS settlement

Should surface in:
- control-plane staff tooling
- tenant subscription/billing views

Should not be confused with:
- operational wallet
- verification funding copy unless deliberately bridged in UX

## 5. Known Current Misalignments

- `tenant-web /wallet` currently behaves as verification funding, not the operational wallet described by older docs.
- `PROJECT_STATE.md` understates mobile-ops progress and is not reliable as a current system description.
- `tenant-web` feature directories do not reflect where most real implementation lives.
- `mobile-ops` still uses pre-login role selection even though long-term role-aware routing should be session-driven.
- support operations are documented as a formal platform capability, but the implementation is still more oversight dashboard than full operational workflow.

## 6. Rules For Future Work

1. New operator operational workflows belong in the tenant plane unless they are explicitly platform-staff governance concerns.
2. New cross-tenant identity, liveness, or fraud logic belongs in the intelligence plane.
3. New subscription, metering, invoice, platform-wallet, and lifecycle controls belong in the control plane.
4. Tenant-web route naming must follow canonical product semantics, not temporary implementation shortcuts.
5. Financial UI must explicitly distinguish operational finance, verification funding, and SaaS billing.
6. Mobile-ops should be treated as a first-class operator surface, not a secondary companion app.
