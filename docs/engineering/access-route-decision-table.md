# Access Route Decision Table

Date: 2026-03-30
Status: Proposed
Depends on:
- [canonical-access-model.md](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-access-model.md)
- [access-model-stabilization-workplan.md](/Users/seyiadelaju/mobility-os/docs/engineering/access-model-stabilization-workplan.md)

## 1. Purpose

Translate the canonical access model into concrete route and file-level decision points that implementation will need to harden.

## 2. Tenant-Web Current Decision Points

| Surface | Current File | Current Responsibility | Risk |
|---|---|---|---|
| root landing route | [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/page.tsx) | decides whether `/` renders operator shell or redirects by role | high if role defaults drift |
| login redirect | [actions.ts](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/(auth)/login/actions.ts) | sets cookies and chooses immediate post-login destination | high |
| request middleware | [middleware.ts](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/middleware.ts) | refreshes tenant session, enforces auth, redirects by continuation path | high |
| app shell | [layout.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/layout.tsx) | global app wrapper | medium if shell-specific chrome is not separated enough |
| driver self-service entry | [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/driver-self-service/page.tsx) | token / continuity entry for driver self-service | medium |
| driver self-service continuation | [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/driver-self-service/continue/page.tsx) | resume flow | high |
| guarantor self-service entry | [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/guarantor-self-service/page.tsx) | token / continuity entry for guarantor self-service | medium |
| guarantor self-service continuation | [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/guarantor-self-service/continue/page.tsx) | resume flow | high |
| password reset return | [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/(auth)/reset-password/page.tsx) | reset completion entry back into login flow | medium |
| verification payment return | [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/driver-kyc/payment-return/page.tsx) | handles return from verification payment flow | high for continuity |

## 3. Tenant-Web Canonical Routing Rules

| Session / Context | Target Route | Must Avoid |
|---|---|---|
| no session, public route | remain on public route | forced redirect into app shell |
| no session, protected route | `/login?next=...` | silent render of protected content |
| guarantor self-service session | `/guarantor-self-service/continue` | `/`, operator pages |
| driver self-service session | `/driver-self-service/continue` | `/`, operator pages |
| driver-mobile-like tenant session hitting tenant-web | `/driver-self-service/continue` for continuity-first behavior in web | operator shell by default |
| operator/admin tenant session | `/` | self-service routes unless explicitly targeted |

## 4. Mobile-Ops Current Decision Points

| Surface | Current File | Current Responsibility | Risk |
|---|---|---|---|
| navigator bootstrap | [root-navigator.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/navigation/root-navigator.tsx) | selects initial route and role-specific stacks | high |
| auth bootstrap / refresh | [auth-context.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/contexts/auth-context.tsx) | loads tokens, refreshes session, restores cached access | high |
| entry role picker | [RoleSelectionScreen.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/features/auth/screens/RoleSelectionScreen.tsx) | pre-login role selection UX | medium-high |
| entry role state | [app-entry-context.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/contexts/app-entry-context.tsx) | stores selected role before auth | medium-high |
| login copy and hints | [LoginScreen.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/features/auth/screens/LoginScreen.tsx) | adapts login UX based on selected role | medium |
| driver mobile detection helper | [roles.ts](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/utils/roles.ts) | determines if session is driver mobile | medium |
| self-service bootstrap | [self-service-context.tsx](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/contexts/self-service-context.tsx) | restores self-service token and subject continuity | high |

## 5. Mobile-Ops Canonical Routing Rules

| Session / Context | Target Experience | Must Avoid |
|---|---|---|
| guarantor self-service session | guarantor self-service stack | operator or driver mobile home |
| driver-scoped session with incomplete onboarding/readiness continuity | self-service resume stack | operator stack |
| driver mobile session with ready continuation state | driver home stack | operator stack |
| operator/admin tenant session | operator stack | driver or guarantor stacks |
| no session, self-service token restored | self-service resume | generic operator login-first flow |
| no session, no self-service token, selected role present | login screen tailored by selected role | incorrect default copy |
| no session, no selected role | role selection | forced operator framing |

## 6. Most Important Current Structural Observation

Tenant-web currently depends on:

- middleware
- login action redirects
- root-page redirect logic

more than it depends on explicit route-group shell separation.

That means role leaks are likely to come from:

- default route assumptions
- duplicated redirect logic
- layout chrome being too operator-centric by default

Mobile-ops currently depends on:

- session interpretation
- self-service state recovery
- selected-role entry state

That means the biggest strategic cleanup is to make session and continuation state the durable source of truth, and treat role selection as a temporary UX helper rather than a routing authority.

## 7. Recommended Next Implementation Slice

1. Audit every tenant-web protected route and layout against the canonical routing rules above.
2. Audit `RootNavigator` and `self-service-context` against the same precedence rules.
3. Produce a regression matrix covering:
   - operator login
   - driver login
   - guarantor login
   - saved session
   - invite/deep-link
   - password reset return
