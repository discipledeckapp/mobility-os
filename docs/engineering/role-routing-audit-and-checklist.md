# Role Routing Audit And Checklist

Date: 2026-03-30
Status: Proposed
Depends on:
- [canonical-access-model.md](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-access-model.md)
- [access-route-decision-table.md](/Users/seyiadelaju/mobility-os/docs/engineering/access-route-decision-table.md)
- [access-model-stabilization-workplan.md](/Users/seyiadelaju/mobility-os/docs/engineering/access-model-stabilization-workplan.md)

## 1. Audit Summary

### Tenant-Web

Current reality:
- there is a global root layout in [layout.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/layout.tsx)
- there is not yet a strong route-group-level separation between:
  - operator shell
  - driver self-service shell
  - guarantor self-service shell
- role safety is therefore enforced mostly by:
  - [middleware.ts](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/middleware.ts)
  - [actions.ts](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/(auth)/login/actions.ts)
  - [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/page.tsx)

Implication:
- routing correctness is currently more important than layout separation
- any default-route mistake can leak the operator experience to a self-service user

### Driver Self-Service

Current reality:
- continuation is explicit in [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/driver-self-service/continue/page.tsx)
- the continuation page issues a fresh self-service token and redirects into the self-service flow
- the main self-service page is a dedicated standalone surface in [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/driver-self-service/page.tsx)

Implication:
- this flow already behaves like a separate experience
- the main risk is not missing flow support
- the main risk is incorrect routing into the wrong shell before continuation runs

### Guarantor Self-Service

Current reality:
- guarantor continuation mirrors the driver model in [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/guarantor-self-service/continue/page.tsx)
- the guarantor flow is a dedicated standalone surface in [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/guarantor-self-service/page.tsx)

Implication:
- same pattern as driver self-service
- same primary risk: wrong default landing behavior outside the flow

### Mobile-Ops

Current reality:
- authenticated navigator selection is mostly session-driven in [root-navigator.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/navigation/root-navigator.tsx)
- session recovery and self-service continuation are driven by:
  - [auth-context.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/contexts/auth-context.tsx)
  - [self-service-context.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/contexts/self-service-context.tsx)
- unauthenticated entry still uses a persisted role choice from:
  - [app-entry-context.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/contexts/app-entry-context.tsx)
  - [RoleSelectionScreen.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/features/auth/screens/RoleSelectionScreen.tsx)

Implication:
- the authenticated product is closer to the canonical model than the unauthenticated entry UX
- the role picker is acting as a convenience layer and copy switcher, not the true long-term identity authority

## 2. File-Level Findings

### Tenant-Web Findings

1. [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/page.tsx)
   - root route is the highest-risk file because it decides whether `/` becomes an operator experience or a role-aware redirect

2. [middleware.ts](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/middleware.ts)
   - middleware already contains the core redirect contract for:
     - token refresh
     - login-route handling
     - self-service continuation
   - this is currently the main routing authority

3. [actions.ts](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/(auth)/login/actions.ts)
   - login action mirrors middleware precedence
   - duplication is manageable now, but still a regression risk if precedence changes in one place and not the other

4. [layout.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/layout.tsx)
   - root layout is global and neutral
   - that is fine for now, but it means shell separation is conceptual rather than structural

### Mobile-Ops Findings

1. [root-navigator.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/navigation/root-navigator.tsx)
   - main source of truth for authenticated shell selection
   - already distinguishes:
     - guarantor self-service
     - driver mode
     - operator mode

2. [self-service-context.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/contexts/self-service-context.tsx)
   - can bootstrap self-service continuity from:
     - stored self-service token
     - authenticated driver/self-service session
   - currently treats driver-mobile-like sessions as eligible to resume self-service

3. [app-entry-context.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/contexts/app-entry-context.tsx)
   - persists selected role in storage
   - useful for onboarding clarity, but it should not outrank authenticated session truth

4. [LoginScreen.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/features/auth/screens/LoginScreen.tsx)
   - selected role mainly drives copy, CTA framing, and entry actions
   - this is a UX convenience, not the real access contract

## 3. Honest Diagnosis

The access model is not fundamentally broken in architecture.

The bigger issue is that the product still lacks a strong explicit separation between:

- unauthenticated role-specific entry UX
- authenticated role-specific shell ownership

That makes it too easy for future changes to:

- treat the selected role as routing truth
- treat `/` as a safe default for every tenant-authenticated user
- blur driver mobile and driver self-service continuity

## 4. Implementation Checklist

### Tenant-Web Checklist

- confirm every protected route assumes operator/admin only unless explicitly documented otherwise
- verify self-service users revisiting `/` are always re-routed before operator data loads
- review whether route groups should eventually separate:
  - public auth
  - operator app
  - self-service flows
- centralize session precedence rules so login action and middleware do not drift
- add regression coverage for:
  - driver login
  - guarantor login
  - operator login
  - saved-session revisit to `/`
  - password reset return

### Mobile-Ops Checklist

- document that the selected role is an unauthenticated entry hint, not long-term routing authority
- verify navigator precedence always honors:
  - guarantor self-service first
  - driver continuation next
  - operator mode afterward
- review whether driver mobile and driver self-service should use clearer navigator-level separation
- verify self-service token restoration cannot accidentally trap operator users in driver continuity
- add regression coverage for:
  - driver login
  - guarantor invite flow
  - operator login
  - stored selected-role mismatch with authenticated session
  - stored self-service token restoration

## 5. Recommended Implementation Sequence

1. centralize canonical session precedence in shared helpers
2. audit tenant-web route behavior against that precedence
3. audit mobile bootstrap and navigator behavior against that same precedence
4. only then decide whether to restructure route groups or remove the mobile role picker from the primary path

## 6. What Should Not Be Done Blindly

- do not remove the role-selection screen before the session and continuation model is fully documented and tested
- do not split layouts structurally without first confirming the current routing contract
- do not treat driver mobile and driver self-service as identical just because both may involve `mobileRole = driver`
