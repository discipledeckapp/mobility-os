# Launch Plan

---

## Market Context

Mobiris is entering a market with near-zero software penetration among the primary ICP (vehicle-for-hire operators). This is both the opportunity and the risk — operators are not looking for software because they don't know software exists for their specific problem. Discovery is push, not pull. The launch plan reflects this: it is sales-led and relationship-led, not PLG-first.

---

## Phases

### Phase 0 — Closed Beta (Current)

**Goal:** Validate product-market fit with 3–5 design partners. Learn the workflow gaps before opening to broader market.

**Pricing:** Free (in exchange for weekly feedback sessions and permission to observe operations)

**Target operator profile:** 20–80 vehicles, Lagos or Nairobi, daily remittance model, at least one dedicated fleet manager.

**Exit criteria:**

- [ ] 3 active operators using Mobiris weekly (not just signed up)
- [ ] At least 1 operator with 20+ drivers fully onboarded (verified, documents uploaded)
- [ ] Driver self-service flow tested and working without hand-holding
- [ ] Remittance tracking in active daily use by at least 2 operators
- [ ] Mobile ops app usable in the field without a support call
- [ ] NPS from operators ≥ 50
- [ ] No critical auth, data loss, or payment bugs in 30 consecutive days

**Activities:**

- Direct outreach to founder network for design partners
- Weekly 1-hour calls with each partner: what broke, what's missing, what would you pay for
- Record every complaint. The top 5 recurring ones become the first post-beta sprint
- Document the onboarding playbook: time-to-first-value, steps that cause friction, what needs a guide

---

### Phase 1 — Soft Launch (Nigeria)

**Goal:** First 20 paying customers. Prove a repeatable sales motion in Lagos.

**Target start:** Design partners converted, beta exit criteria met.

**Pricing (Nigeria):**

| Plan | Base | Per Active Vehicle (above base) | Base Includes |
|---|---|---|---|
| Starter | ₦15,000/month | — | Up to 10 vehicles, core ops (no verification) |
| Growth | ₦35,000/month | ₦1,500/vehicle/month | Up to 20 vehicles, full verification + mobile app |
| Enterprise | Custom | Custom | 50+ vehicles, multi-entity, ARR |

*Per-verification fee: ₦1,000 per successful biometric + government ID check (billed separately or bundled into Growth+ plans)*

*Rationale: A 50-vehicle Growth operator pays ₦35,000 base + ₦45,000 uplift = ₦80,000/month (~$50). Daily remittance for that fleet is ₦375,000–₦625,000. Monthly software cost is <1% of monthly remittance. This is the affordability argument.*

**Activities:**

- Founder-led outreach to 50 target operators (from NURTW contacts, ride-hail fleet communities, Uber/Bolt partner groups)
- Design partners transition to paid Growth plan or off-board
- ZeptoMail sequences: trial → paid conversion (5-email sequence)
- Launch referral program: 1 month free for both referrer and new customer
- Publish first case study from beta (with operator consent and anonymisation if needed)
- LinkedIn: 3 posts/week from founder account

**KPIs:**

| Metric | Target |
|---|---|
| Paying customers | 20 |
| MRR | ₦1.2M–₦1.6M (~$750–$1,000) |
| Trial-to-paid conversion | ≥30% |
| Monthly churn | ≤5% |
| Average vehicles per customer | 35–50 |
| Time to first value (first remittance recorded) | <48 hours from signup |

---

### Phase 2 — Market Expansion (Ghana + Kenya)

**Goal:** Prove the model repeats in a second and third market.

**Entry criteria:**
- [ ] 20 paying customers in Nigeria, stable
- [ ] Nigeria playbook documented and repeatable by someone who wasn't there for the first sale
- [ ] Country configs for GH and KE validated (identity providers live, payment rails confirmed)
- [ ] Ghana Card verification working via Smile Identity or YouVerify
- [ ] Kenyan national ID / DL verification working
- [ ] Paystack / M-Pesa payment rails confirmed for Ghana and Kenya billing

**Pricing adjustments:**

| Country | Starter | Growth Base | Notes |
|---|---|---|---|
| Ghana | GHS 150/month | GHS 350/month | Paystack GH or MTN MoMo |
| Kenya | KES 2,500/month | KES 5,500/month | Paystack KE or M-Pesa integration assessment |

**Activities:**
- Hire or activate a local sales rep in Accra or Nairobi (commission-based initially)
- Engage GPRTU (Ghana) and MOAK (Kenya) leadership for association partnership
- Localise email sequences and support documentation for market-specific language (matatu vs danfo vs trotro)
- Partner with local fleet vehicle dealers for referral channel

**KPIs:**

| Metric | Target (per new market, 6 months post-entry) |
|---|---|
| Paying customers | 10 |
| Gross margin maintained | Verify verification cost per tenant stays within model |
| Local referral pipeline | ≥20% of new leads from local network |

---

### Phase 3 — Enterprise Motion

**Goal:** First ARR contracts ($10K+ ACV) from multi-depot transport groups.

**Entry criteria:**
- [ ] 50+ SME customers across at least 2 markets
- [ ] Enterprise plan tier in control-plane catalog, tested end-to-end
- [ ] Control-plane web UI complete (staff can manage enterprise tenants fully)
- [ ] SLA documented: RPO <1 hour, RTO <4 hours (already in architecture docs ADR-012)
- [ ] Data Processing Agreement template ready

**Target enterprise profiles:**
- Family-owned transport groups with multiple depot/city operations
- Corporate shuttle providers (Treepz/Shuttlers segment) managing 10+ corporate clients
- Moove-financed fleet operators who have scaled to 100+ vehicles

**Activities:**
- Identify 10 enterprise targets through industry network
- Build enterprise one-pager and customised pitch (see [One-Pager](../sales/one-pager.md))
- Introduce a CSM function for enterprise accounts
- Explore Moove partnership: Mobiris as recommended management platform for Moove-financed operators

---

## Launch Readiness Checklist

### Product

- [ ] Self-signup flow working end-to-end (register → OTP → dashboard)
- [ ] Payment flow tested live with Flutterwave and Paystack (not sandbox only)
- [ ] Driver self-service OTP link tested on Android (target device: low-end Android, sub-$150)
- [ ] Biometric liveness working on Android Chrome (not just desktop)
- [ ] Operational readiness report accurate with real data
- [ ] Email deliverability confirmed from production domain (ZeptoMail warm-up complete)
- [ ] Document storage confirmed (not using base64 inline — actual cloud storage)

### Legal / Compliance

- [ ] Terms of Service published (covers Nigeria, Ghana, Kenya, South Africa)
- [ ] Privacy Policy published — explicitly covers biometric data processing, consent, storage of embeddings not raw images
- [ ] NDPA compliance review completed (Nigeria Data Protection Commission registration if required)
- [ ] Kenya DPC registration completed
- [ ] Data Processing Agreement template ready for enterprise prospects
- [ ] Operator onboarding captures explicit consent for biometric processing

### Support

- [ ] Support inbox monitored (target: <4 hour first response during business hours)
- [ ] WhatsApp business number active for operator support
- [ ] Help documentation for top 5 operator workflows (onboarding drivers, recording remittance, creating assignments, inviting team, pulling a compliance report)
- [ ] Escalation path defined for identity verification failures

### Marketing

- [ ] Landing page live with clear problem/solution framing for Nigerian operator
- [ ] Demo video recorded (3-min walkthrough: onboard a driver, record remittance, view dashboard)
- [ ] At least 1 customer quote or anonymised case study ready
- [ ] LinkedIn company page active and posting
- [ ] Founder LinkedIn active (3 posts scheduled before launch week)

---

## Related

- [ICP](./icp.md)
- [Channels](./channels.md)
- [Pricing Hypotheses](../../product/pricing-hypotheses.md)
- [Competitive Positioning](../sales/competitive-positioning.md)
