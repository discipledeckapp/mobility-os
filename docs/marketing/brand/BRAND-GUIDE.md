# Mobiris Brand Guide

Version 1.0 · March 2026

---

## Brand Positioning

Mobiris is **mobility risk infrastructure for transport operators** — the verification, accountability, and fraud intelligence layer that vehicle-for-hire companies in Africa run on.

The brand should feel:
- **Reliable** — operators trust Mobiris with their drivers, their daily money, and their compliance
- **In control** — the product enforces structure; the brand should project that
- **Professional** — enterprise-grade, not a startup toy

It should not feel: flashy, consumer-facing, or over-designed.

> For full approved/disallowed vocabulary and messaging rules, see [`/docs/positioning/mobiris-positioning.md`](../positioning/mobiris-positioning.md).

---

## Colour

| Name | Hex | Usage |
|---|---|---|
| Brand Blue | `#2563EB` | Primary CTA, links, active states |
| Blue Dark | `#1D4ED8` | Hover states, pressed buttons |
| Navy | `#0F172A` | Headings, dark backgrounds |
| White | `#FFFFFF` | Light backgrounds, reversed text |
| Slate 100 | `#F1F5F9` | Page backgrounds, subtle fill |
| Slate 500 | `#64748B` | Secondary text, metadata |

**Do not** introduce additional brand colours without updating this guide.

---

## Typography

| Use | Typeface | Weight |
|---|---|---|
| Headlines | Inter | 700 (Bold) |
| Body | Inter | 400 (Regular) |
| UI Labels | Inter | 500 (Medium) |
| Monospace / code | JetBrains Mono | 400 |

Minimum body size: 14px web / 16px mobile.

---

## Logo & Wordmark

All source files are in [`docs/ux/mobiris-brand/`](../../ux/mobiris-brand/).

### Icon variants

| Variant | File | Use when |
|---|---|---|
| Standard (blue) | `icons/png/icon-*.png` | Light backgrounds |
| Dark background | `icons/png-dark-bg/icon-dark-bg-*.png` | Dark or coloured backgrounds |
| Navy background | `icons/png-navy-bg/icon-navy-bg-*.png` | Navy `#0F172A` backgrounds |
| Transparent | `icons/png-transparent/icon-transparent-*.png` | Overlaid on images or custom backgrounds |
| SVG source | `svg/icon.svg`, `svg/icon-transparent.svg` | All digital production use |

### Wordmark variants

| Variant | File | Use when |
|---|---|---|
| Dark text | `wordmark/wordmark-dark.png` | Light backgrounds |
| Light text | `wordmark/wordmark-light.png` | Dark/navy backgrounds |
| Blue | `wordmark/wordmark-blue.png` | Brand-forward headers |
| 2× versions | `wordmark-dark-2x.png`, `wordmark-light-2x.png` | Retina / high-DPI displays |

### Favicon

| Size | File |
|---|---|
| 16 px | `favicon/favicon-16.png` |
| 32 px | `favicon/favicon-32.png` |
| 48 px | `favicon/favicon-48.png` |
| SVG (preferred) | `favicon/favicon.svg` |

### App store icon
Use `icons/png/icon-1024.png` for App Store and Google Play submissions.

---

## Usage Rules

- **Minimum width:** 160 px for wordmark (light/dark); 200 px for blue variant
- **Clear space:** maintain clear space equal to the cap-height of the "M" on all sides
- **Do not** stretch, rotate, recolour, or add drop shadows to the mark
- **Do not** place the standard (blue) icon on a coloured background — use the transparent or bg-specific variant
- **Do not** use low-resolution PNGs at 1× on retina displays — use SVG or 2× assets

---

## Tone of Voice

| Do | Do not |
|---|---|
| Direct and specific ("Verify every driver before they get your keys") | Vague and generic ("Unlock your potential") |
| Operator-first language ("Your drivers", "Your operation") | Tech jargon ("leverage", "synergy", "disrupt") |
| Confident without arrogance | Hyperbolic claims without data |
| Use numbers when available ("₦1M/month in remittance leakage for a 50-vehicle fleet") | Passive voice |
| Enforcement and accountability verbs ("enforce", "verify", "control") | Passive management verbs as primary claims ("manage", "track", "handle") |

**Primary audience vocabulary:** transport operators, fleet managers, transport companies, operators, remittance accountability, driver verification, compliance, assignment, identity risk, fraud signals.

---

## What Mobiris Is Not

- Not a consumer app — do not use casual emoji-heavy copy
- Not a fleet management platform — "fleet management" implies telematics/GPS dashboards; Mobiris is risk infrastructure
- Not a generic "logistics platform" — be specific about the vehicle-for-hire transport operator use case
- Not a fintech product — remittance and wallets are accountability tools, not the primary product story

---

## Related

- [Positioning](../messaging/positioning.md)
- [Value Propositions](../messaging/value-propositions.md)
- [Brand Assets directory](../../ux/mobiris-brand/)
