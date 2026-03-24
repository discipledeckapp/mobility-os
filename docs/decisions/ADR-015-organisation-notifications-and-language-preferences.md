# ADR-015: Organisation Notifications, Language Preferences, and Guarantor Capacity

- Status: Accepted
- Date: 2026-03-24

## Context

Mobility OS now needs a consistent way to:

- remind operators and drivers about due and overdue remittances
- surface those reminders in email, in-app inboxes, and push-capable mobile sessions
- let each user decide which channels they receive
- let each organisation control branding and default language
- make the guarantor-to-driver capacity rule configurable per organisation instead of hard-coded

The existing platform already had remittance records, driver links, and local auth sessions, but
did not yet provide an end-to-end reminder and preference model.

## Decision

### 1. Organisation settings live in tenant metadata

The tenant operations plane stores organisation-level operational settings in `Tenant.metadata`:

- `branding.displayName`
- `branding.logoUrl`
- `operations.defaultLanguage`
- `operations.guarantorMaxActiveDrivers`

This keeps organisation presentation and operational limits tenant-scoped without leaking them into
global platform defaults.

### 2. User preferences live on the user record

The tenant operations plane stores user-level settings in `User.settings`:

- `preferredLanguage`
- `notificationPreferences`

These settings inherit from organisation defaults when absent.

### 3. Remittance reminders are derived from remittance state

Reminder delivery is driven from pending remittance records:

- `remittance_due` for amounts due today
- `remittance_overdue` for unreconciled amounts past due date

Recipients include:

- company owner
- fleet managers
- finance officers
- linked driver users
- direct driver email fallback when a driver has no linked app user yet

### 4. Notification channels are preference-based

Every reminder topic supports channel-level preferences:

- `email`
- `inApp`
- `push`

The platform creates in-app notifications in `user_notifications`, stores push-capable devices in
`user_push_devices`, and attempts email/push delivery on a best-effort basis.

### 5. Guarantor capacity is configurable per organisation

The historical hard-coded limit of 3 active drivers per guarantor is replaced by an
organisation-configured value, with a default of 2 active drivers per guarantor.

This aligns with the operating rule that guarantor concentration is a tenant-specific risk policy,
not a global constant.

## Consequences

### Positive

- operators can manage reminder channels directly in web and mobile settings
- remittance follow-up is now visible in-app, not only in reports
- organisation branding and default language can flow into session payloads and dashboards
- guarantor policy can match company risk appetite

### Trade-offs

- notification delivery currently relies on application-level scheduling and manual sync support;
  a dedicated job runner can be introduced later without changing the API contract
- push delivery is best-effort and depends on device registration
- multilingual support now has account and organisation preference plumbing, while full interface
  translation remains an incremental rollout

## Follow-up

- add dedicated job scheduling infrastructure for reminder generation
- expand translated UI coverage across tenant-web, mobile-ops, and control-plane
- extend reminder topics to valuation, maintenance, licence expiry, and fraud/risk escalation flows
