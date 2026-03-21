# SaaS Business Model

## Overview

Mobility OS is a multi-tenant B2B SaaS platform that enables transport operators (tenants) to manage fleets, drivers, assignments, remittance, and financial operations. The platform is sold as a subscription with usage-based add-ons.

## Revenue Streams

| Stream | Model | Notes |
|---|---|---|
| Base subscription | Per-tenant monthly / annual flat fee | Tied to plan tier |
| Seat / user add-ons | Per active user per month | Above plan seat limit |
| Intelligence add-on | Per identity-resolution query or per month | Cross-tenant person graph |
| Transaction fees | Basis-point cut on remittance volume | Optional per contract |
| Professional services | Time-and-materials onboarding | Non-recurring |

## Plan Tiers

See [subscription-and-billing.md](./subscription-and-billing.md) for tier details.

- **Starter** — single operating unit, capped fleet size, no Intelligence add-on
- **Growth** — multiple operating units, larger fleet, Intelligence available
- **Enterprise** — unlimited operating units, custom SLAs, dedicated support, white-label option

## Customer Segments

| Segment | Fleet Size | Key Needs |
|---|---|---|
| SME fleet operators | 10–100 vehicles | Low cost, easy onboarding |
| Regional transport groups | 100–1 000 vehicles | Multi-branch hierarchy, reporting |
| Enterprise conglomerates | 1 000+ vehicles | SSO, SCIM, custom contracts, multi-country |

## Revenue Model Options

- Flat monthly subscription
- Per active vehicle pricing
- Per active driver pricing
- Per verification transaction
- Per biometric operation
- Per remittance volume band
- Enterprise annual licensing
- Hybrid wallet + subscription model

## Key Principle

The platform must support both:
- Standard SaaS self-serve / assisted onboarding
- Enterprise commercial arrangements with custom pricing and rollout terms

## Growth Levers

- **Land-and-expand**: Start on Starter, upsell to Growth as fleet grows
- **Network effects**: The shared person graph makes the Intelligence add-on more valuable as more tenants contribute identity data
- **Marketplace ecosystem**: Partner integrations (fuel cards, insurance, telematics) add revenue share

## Key Metrics

| Metric | Target |
|---|---|
| ARR | — |
| Net Revenue Retention (NRR) | ≥ 110 % |
| CAC payback period | < 12 months |
| Gross margin | > 70 % |
| Annual logo churn | < 5 % |

## Related Docs

- [Control Plane](./control-plane.md)
- [Subscription & Billing](./subscription-and-billing.md)
- [Tenant Lifecycle](./tenant-lifecycle.md)
- [Enterprise Expansion Model](./enterprise-expansion-model.md)
- [Pricing Hypotheses](../product/pricing-hypotheses.md)
