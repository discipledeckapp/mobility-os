# ADR-013: Mobile-First Operator Architecture

## Status

Accepted

## Context

The initial design of `apps/mobile-ops` targeted field workers: drivers reviewing assignments, capturing remittance, and checking verification status. The operator console (`apps/tenant-web`) was assumed to be the primary surface for fleet managers.

Audit of the ICP (Nigerian fleet operators, 20–200 vehicles) revealed that this assumption is incorrect. The target customer:

- Operates primarily on an Android device
- Communicates via WhatsApp, not email or browser
- Is unlikely to sit at a desktop to manage their fleet
- Discovers and evaluates software via mobile links shared over WhatsApp

Building a feature-complete web console and a lightweight mobile companion inverts the priority. The mobile app is where operators will spend their day, not the web console. This requires mobile-ops to grow into a full operator client, not just a field tool.

## Decision

`apps/mobile-ops` is a dual-mode operator + driver client. It must reach feature parity with `apps/tenant-web` for all core operational workflows.

**Auth strategy (Option A — split guards):**
- Driver screens use `MobileAuthGuard`: enforces `driverId` claim and blocks revoked mobile access
- Operator screens use `TenantAuthGuard`: the same guard already used by tenant-web, calling the same `api-core` endpoints
- No new API endpoints required; guard selection is the only structural change

**Role-aware navigator:**
- After login, the JWT role claim determines which navigator the user enters
- `(driver)` navigator: 3-tab structure — Home (shift/vehicle), My Remittance, Profile
- `(operator)` navigator: full tab structure — Dashboard, Drivers, Vehicles, Assignments, Remittance, More
- Auth flow (login, OTP, password reset) is shared between both modes

**State management:**
- React Query (TanStack Query) must be installed before building operator screens
- Current `useState` + `useEffect` pattern does not scale to 10+ operator data domains

**Utility extraction:**
- `formatDateTime`, `statusTone`, and similar helpers must be extracted to `src/utils/` before adding screens, to prevent further copy-paste spread

**Offline support:**
- The existing offline queue (`src/lib/offline/`) and NetInfo reconnect subscriber applies to both driver and operator contexts
- Reconnect subscriber registration at `App.tsx` startup must be verified before operator rollout

**Token storage:**
- Expo SecureStore for mobile (existing, correct) — no change

## Consequences

### Positive
- Fleet operators have a native mobile experience that matches their actual usage context
- WhatsApp-driven acquisition flows directly into a mobile-native onboarding experience
- Same api-core endpoints serve both web and mobile — no API duplication
- Driver mode and operator mode share a codebase, auth stack, and offline infrastructure

### Negative
- Mobile-ops scope increases significantly; feature parity with tenant-web is a substantial build
- React Query adoption is a prerequisite, adding setup cost before any operator screens can ship
- Two navigators to maintain (driver mode and operator mode)

### Neutral
- `apps/tenant-web` remains the reference implementation for all operator workflows
- Control-plane and intelligence surfaces remain web-only (platform staff, not field operators)

## Alternatives Considered

- **Keep mobile-ops as field-only, improve tenant-web for mobile browsers**: rejected because responsive web cannot match a native mobile experience for this audience, and WhatsApp sharing links to native apps, not browser URLs
- **Build a separate operator mobile app**: rejected as unnecessary duplication; role-aware navigation within a single app achieves the same outcome at lower maintenance cost
- **Progressive web app (PWA)**: rejected; offline capability, push notifications, and camera access (for biometric liveness capture) require native

## Related Docs

- [ADR-004: Control Plane vs Tenant Plane](./ADR-004-control-plane-vs-tenant-plane.md)
- [ADR-008: Global Person Graph](./ADR-008-global-person-graph.md)
- [docs/architecture/application-map.md](../architecture/application-map.md)
- [docs/architecture/ui-map.md](../architecture/ui-map.md)
- [docs/marketing/go-to-market/icp.md](../marketing/go-to-market/icp.md)
