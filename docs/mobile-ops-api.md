# Mobile Ops API Notes

First mobile-ops release uses existing tenant JWT auth against `api-core`.

## Token lifecycle

- `POST /auth/login` returns:
  - `accessToken`
  - `refreshToken`
- `POST /auth/refresh` rotates both tokens
- mobile-ops stores both in SecureStore
- mobile-ops schedules a silent refresh before access-token expiry
- if refresh fails, the app falls back to a sign-in requirement instead of staying in a stale session

## Mobile error reporting

- `POST /mobile/log`
- accepts best-effort mobile client logs for crashes and operational errors
- current implementation writes structured logs through `api-core`
- this is the MVP crash-reporting path until a dedicated provider such as Sentry is added

## Session bootstrap

- `GET /auth/session`

Returns:
- current tenant user profile
- granted permissions
- explicitly linked driver summary for the signed-in mobile account
- tenant country and default currency
- formatting locale derived from country config
- `mobileRole`
- `mobileAccessRevoked`
- `currencyMinorUnit`

## Operational reads and writes

- `GET /mobile-ops/assignments`
- `GET /mobile-ops/assignments/:id`
- `POST /mobile-ops/assignments/:id/start`
- `POST /mobile-ops/assignments/:id/complete`
- `POST /mobile-ops/assignments/:id/cancel`
- `GET /mobile-ops/profile`
- `POST /mobile-ops/remittance`

## Notes

- Mobile assignment and remittance actions are scoped server-side to the signed-in user’s linked driver.
- Mobile endpoints are protected by `MobileAuthGuard`, not the generic tenant guard alone.
- Remittance recording now rejects duplicate records for the same assignment.
- Remittance recording accepts assignments in `active` or `completed` status.
- Remittance currency must match the organisation currency configured from tenant country.
- mobile-ops queues assignment status changes and remittance writes offline when network access is unavailable, then retries them on reconnect.
- mobile deep links now resolve into assignment detail, remittance, and profile routes through the app navigator.

See [mobile-auth.md](./mobile-auth.md) for the current MVP auth model and the follow-up path for device/session controls.
