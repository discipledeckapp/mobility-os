# Tenant Driver Access Alignment Audit

Date: 2026-03-26
Scope: `apps/api-core`, `apps/api-intelligence`, `apps/api-control-plane`, `apps/mobile-ops`

## 1. Audit Summary

### Aligned

- Control-plane responsibilities remain in `apps/api-control-plane`: tenant lifecycle, subscriptions, platform wallets, platform settings, staff auth.
- Tenant-plane operational entities remain in `apps/api-core`: `Driver`, `Vehicle`, `Assignment`, `Remittance`, `BusinessEntity`, `OperatingUnit`, `Fleet`, tenant `User`.
- Intelligence-plane canonical identity remains in `apps/api-intelligence`: `IntelPerson`, identifiers, biometrics, risk signals, review cases, linkage events.
- Driver records remain tenant-scoped operational records with nullable `personId` linkage into the intelligence plane.
- Assignments reference `driverId` and `vehicleId`, not generic auth users.

### Misaligned Before This Cleanup

- Driver mobile/self-service auth was modeled through tenant `User`, but self-service account creation still used operator semantics (`FIELD_OFFICER`) and readiness logic was not the single source of truth for assignment eligibility.
- Driver login could fail for the wrong reason when a linked mobile account lacked operator business-entity scope.
- Assignment eligibility was enforced partly through ad hoc checks in `AssignmentsService` instead of the driver readiness summary.
- Driver, vehicle, user, assignment, and pending remittance hierarchy denormalizations could drift when fleets or operating units were moved.
- Mobile access linkage existed, but it was not constrained enough in code to clearly distinguish dedicated driver-mobile accounts from operator accounts.

## 2. Corrected Model

### Tenant User

- Remains a tenant-plane authenticated principal.
- `settings.accessMode` distinguishes `tenant_user` from `driver_mobile`.
- Driver-mobile accounts stay in the tenant plane; they are not promoted to a global auth model.
- Dedicated driver-mobile accounts now use constrained tenant-user semantics:
  - `role = READ_ONLY`
  - explicit mobile custom permissions
  - `driverId` linkage
  - business-entity and operating-unit scope copied from the linked driver

### Driver

- Remains the tenant-plane operational subject.
- Owns tenant hierarchy linkage:
  - `tenantId`
  - `businessEntityId`
  - `operatingUnitId`
  - `fleetId`
- Owns operational readiness inputs and derived summaries.
- Keeps nullable `personId` cross-plane linkage to intelligence.

### Person Linkage

- `personId` remains the only canonical-person pointer in tenant records.
- Canonical verified identity attributes remain owned by intelligence.
- Tenant APIs consume intelligence outcomes and workflow state, not a duplicated canonical profile store.

### Driver/Mobile Access Linkage

- Primary linkage is `User.driverId`.
- Driver-mobile access is explicitly tenant-scoped and linked to exactly one driver record.
- Operator accounts are not supposed to be repurposed into driver-mobile accounts ad hoc.

### Readiness

- Readiness remains tenant-plane derived state.
- Activation readiness includes identity, guarantor, licence, required documents, and mobile access linkage.
- Assignment readiness now extends activation readiness and also requires driver status to be `active`.
- Authentication is intentionally separate from readiness; login is no longer treated as proof of operational eligibility.

## 3. Refactored Access Flow

### Tenant Operator Access

- Uses tenant auth (`/auth/login`, `/auth/session`) with bearer tokens.
- Keeps role-based permissions and tenant/business-entity/operating-unit scope.

### Driver Self-Service Access

- Remains token/OTP-driven through `/driver-self-service/*`.
- Links work against an existing tenant-plane driver record first.
- Self-service can create a dedicated tenant `User` for mobile access after the driver record already exists.

### Mobile-Ops Access

- Uses bearer tokens against tenant-plane APIs.
- Driver-mobile accounts are linked to `driverId` and are mobile-scoped through `settings.accessMode = driver_mobile`.
- Mobile assignment/remittance/profile endpoints resolve the linked driver from tenant auth context, not from generic operator identity.

## 4. Onboarding / Invite / Self-Service Flow

- Operator-assisted onboarding creates the tenant-plane `Driver` first.
- Self-service link/OTP targets that driver record.
- Identity resolution updates tenant workflow state and `personId` linkage.
- Mobile account creation remains additive: it creates a linked tenant user only after the driver record exists.

## 5. Assignment Linkage And Eligibility

- Assignment records remain linked to tenant `Driver` records.
- Assignment creation/start now depends on the driver readiness summary instead of scattered checks.
- Driver status is now part of assignment readiness instead of a separate hidden prerequisite.

## 6. Event Recommendation

- No new event infrastructure was introduced in this cleanup.
- The current codebase can remain state-transition driven for now.
- Candidate future tenant-plane events, if needed later:
  - `driver.linked_to_mobile_access`
  - `driver.activation_readiness_changed`
  - `driver.assignment_readiness_changed`
  - `driver.linked_to_person`

## 7. Middleware / Guard / Service Cleanup

- Keep `TenantAuthGuard` and `MobileAuthGuard` separate.
- Keep `PermissionsGuard` in front of mobile endpoints, but rely on driver linkage plus ownership checks for driver-scoped resources.
- Keep readiness computation in `DriversService` as the tenant-plane aggregation point.
- Avoid adding readiness decisions directly into auth guards.

## 8. Migration / Backfill Steps

1. Backfill any existing driver-linked mobile users so their `settings.accessMode = driver_mobile`.
2. Backfill dedicated driver-mobile users to:
   - `role = READ_ONLY`
   - mobile custom permissions in `settings.customPermissions`
   - `assignedFleetIds = [driver.fleetId]`
3. Review any legacy linked users that are both operator accounts and driver-linked accounts before changing their role.
4. Re-run a hierarchy consistency backfill for drivers, vehicles, open assignments, and pending remittances after deploying the fleet/unit sync changes.

## 9. Human Sign-Off Needed

- Legacy mixed-use accounts:
  - if a tenant has existing `FIELD_OFFICER` users linked to drivers and also used for operator workflows, those records need product/ops review before role normalization.
- Historical hierarchy semantics:
  - this cleanup updates open assignments and pending remittances when hierarchy moves.
  - if the product wants historical records to be rewritten differently, that needs explicit product sign-off.
