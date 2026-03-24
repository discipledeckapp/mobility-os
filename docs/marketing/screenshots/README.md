# Screenshots

Product screenshots for use across the marketing website.

## How to Replace Placeholders

Each `.svg` file is a labelled placeholder showing the correct filename and what the screenshot should contain. To replace:

1. Take the screenshot from the live app at 1440px wide browser width
2. Save as `.png` (or `.webp`) using the **exact same filename** (e.g. `01-dashboard-operational-readiness.png`)
3. Drop it into this folder — the website references these filenames directly

## Screenshot Spec

- **Resolution:** 1440 × 900 px minimum
- **Format:** PNG (original) + WebP (optimised for web — convert with `cwebp` or Squoosh)
- **Browser chrome:** Include the browser frame for context (shows it's a real web app)
- **Account:** Use a demo account with plausible-looking data (Nigerian names, ₦ amounts, real vehicle counts)
- **No sensitive data:** Do not use screenshots from a real customer's account

## Required Screenshots

| File | What to Show | Used On |
|---|---|---|
| `01-dashboard-operational-readiness.svg` | Main dashboard — fleet stats, today's remittance, recent assignments, readiness % | Homepage hero, `/product` |
| `02-driver-list.svg` | Driver list — mix of Active/Pending/Suspended status badges | `/features/driver-verification`, `/product` |
| `03-driver-verification-status.svg` | Driver profile — biometric ✓, NIN ✓, documents panel, guarantor linked | `/features/driver-verification` |
| `04-remittance-list.svg` | Remittance list — mix of CONFIRMED, DISPUTED, PENDING | `/features/remittance-tracking`, homepage carousel |
| `05-remittance-detail.svg` | Single remittance record — full timeline with timestamps | `/features/remittance-tracking` |
| `06-vehicles-page.svg` | Vehicle list — AVAILABLE, ASSIGNED, IN-SERVICE status badges | `/features/fleet-management` |
| `07-assignments-list.svg` | Assignments list — driver name, vehicle, start time, status | `/features/assignments` |
| `08-licence-expiry-report.svg` | Licence expiry report — sorted by days remaining, red/amber/green | `/features/fleet-management`, `/product` |

## Optional (Phase 2+)

| File | What to Show |
|---|---|
| `09-mobile-app-assignments.png` | Mobile app — assignments screen on Android |
| `10-mobile-app-remittance.png` | Mobile app — remittance submission screen |
| `11-intelligence-risk-signal.png` | Risk signal flag on a driver profile (use demo data) |
| `12-operational-wallet-ledger.png` | Wallet ledger showing running balance |
| `13-team-settings.png` | Team management panel with role badges |
