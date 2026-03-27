# Pitch Deck Outline

Slide-by-slide narrative for investor and strategic partner decks.
Target length: 13 slides + appendix.

---

## Slide 1 — Cover

**Mobiris**
> Risk infrastructure for African transport.

*Clean wordmark on navy background. No subtitle clutter.*

---

## Slide 2 — The Market

**Headline:** 10 million commercial vehicles. Under 5% have software. That's the opportunity.

**Key data points:**
- Africa's fleet management software market: ~$2–3B (2023), growing at 15–20% CAGR
- Estimated commercial vehicles: Nigeria 5–7M, South Africa 3–4M, Kenya 1.5–2M, Ghana 800K–1.2M
- Vehicle-for-hire segment (danfo, matatu, trotro, minibus taxi): carries 80–95% of urban passenger trips in most African cities
- Software penetration in this segment: <5%
- Global fleet SaaS (Samsara, Verizon Connect, MiX Telematics): built for corporate fleets in the US and Europe — not for this model

**Punchline:** This is the largest unserved vertical in African B2B SaaS. It is not a niche.

*Visual: map of target markets with vehicle count callouts; bar chart showing informal transport % of urban trips*

---

## Slide 3 — The Problem

**Headline:** Fleet operators are managing ₦500,000 in daily remittance from a WhatsApp group.

**Show the before-state:**
- Daily remittance collection: ₦7,500–₦25,000 per vehicle per day (Nigeria)
- 80% cash; tracked in notebooks or WhatsApp
- Industry estimate: 10–20% leakage in manually-managed fleets
- For a 50-vehicle operator: ₦1.5M–₦3M/month in untracked leakage

**Three core problems:**
1. **Driver fraud**: No biometric verification at onboarding. No cross-operator fraud signals. A driver who absconds at Company A walks into Company B with a new story.
2. **Remittance leakage**: No audit trail. Disputes have no resolution. Cash that was paid or wasn't paid can't be proven either way.
3. **Zero compliance visibility**: Expired licences discovered at FRSC checkpoints. Guarantors on paper with no verified contact. No record to hand a bank, investor, or regulator.

*Visual: before/after storyboard — WhatsApp group vs Mobiris dashboard*

---

## Slide 4 — The Solution

**Headline:** Mobiris is the operating system for vehicle-for-hire transport companies.

**Three-plane product architecture — one sentence each:**
- **Tenant Plane**: What operators use daily — driver management, fleet ops, assignment dispatch, remittance tracking
- **Control Plane**: Platform governance — subscriptions, billing, tenant lifecycle, feature flags
- **Intelligence Plane**: Cross-operator fraud detection — shared identity graph, risk signals, biometric deduplication

*Visual: product screenshot — operational readiness dashboard or live assignment board*

---

## Slide 5 — Product Walkthrough (Key Flows)

**Headline:** From driver onboarding to remittance reconciliation — in one platform.

**Flow 1 — Driver Verification (30 seconds to explain):**
> Create driver record → send OTP self-service link → driver completes biometric selfie + NIN/BVN/Ghana Card check on Android → guarantor verifies separately → operator approves → driver goes active

**Flow 2 — Remittance Tracking:**
> Record daily target → driver pays → operator confirms (timestamp) or disputes (with note) → operational wallet updates → audit trail is permanent

**Flow 3 — Intelligence Fraud Detection:**
> Driver applies at Operator B → Mobiris checks against person graph → risk signal found from Operator A incident → risk score returned → operator decides to investigate or reject → raw records never exposed

*Visual: 3-panel screenshot showing each flow*

---

## Slide 6 — The Intelligence Moat

**Headline:** The more operators on the platform, the stronger the fraud network becomes.

This slide explains the structural moat. Most investors will need it explained.

- Every verified driver on Mobiris joins a canonical person graph (the Intelligence Plane)
- Biometric deduplication catches a driver who enrolled under a different identity at another operator
- Risk signals grow: each fraudulent driver caught enriches the signals for all future operators
- No operator ever sees another's raw records — only the risk score
- This is a network-effect moat: impossible to replicate with a single-operator product

**Comparison:** The equivalent in credit scoring — a credit bureau doesn't share raw bank transactions; it shares a score derived from them. Mobiris is doing the same for transport operator risk.

**Technical credibility (for investor decks):**
- Biometric liveness via AWS Rekognition + Azure Face
- Government ID verification via YouVerify (Nigeria) + Smile Identity (pan-African)
- Identity infrastructure: NIN (100M+ enrolled), BVN (60M+), Ghana Card (17M+), Kenyan national ID
- Embeddings only stored — no raw biometric images (NDPA / Kenya DPA compliant architecture)

*Visual: diagram of multi-tenant intelligence layer with "risk signal flows" illustration*

---

## Slide 7 — Business Model

**Headline:** Subscription SaaS with usage uplift. Priced for African operator economics.

**Unit economics anchor:**
- A 50-vehicle operator collects ~₦15M/month in remittance
- Conservative 10% leakage = ₦1.5M/month lost
- Mobiris Growth at 50 vehicles = ₦80,000/month
- Mobiris cost is ~5% of what the operator saves on leakage alone

**Revenue model:**
| Revenue Line | Description |
|---|---|
| Base subscription | Flat monthly per tenant (Starter / Growth / Enterprise) |
| Vehicle/driver uplift | Per active vehicle/driver above plan base |
| Verification fees | Per biometric + government ID verification event |
| Intelligence queries | Per cross-operator risk lookup (bundled in Enterprise) |
| Enterprise ARR | Custom contracts for multi-entity transport groups |

**Payment infrastructure:** Flutterwave + Paystack. Wallet top-up + invoice settlement model. Local card fees: 1.5% + ₦100 (Paystack, capped at ₦2,000).

*Visual: pricing tier table with illustrative ACV for Starter / Growth / Enterprise*

---

## Slide 8 — Regulatory Tailwind

**Headline:** Governments are forcing transport formalisation. Operators need a system of record.

Three converging forces:

1. **Identity infrastructure**: NIN-SIM linkage mandate drove 100M+ NIN enrollments. BVN adoption at 60M+. YouVerify processes millions of verifications/month. The rails now exist to verify who drivers actually are.

2. **Data protection law**: Nigeria NDPA 2023, Kenya DPA 2019, Ghana DPA 2012, South Africa POPIA — all classify biometric data as sensitive personal data requiring explicit consent and audit-ready handling. Operators who store driver documents need compliant infrastructure. Mobiris is built to this standard.

3. **Transport formalisation pushes**: Lagos State digital commercial vehicle registration push. Kenya NTSA TIMS system mandating digital driver/vehicle records. GPRTU registration requirements in Ghana. Operators who want to be compliant need a platform.

**Implication**: The regulatory environment is generating demand, not just permitting the product to exist.

---

## Slide 9 — Competition

**Headline:** No direct competitor in the vehicle-for-hire segment. Here's what operators use instead.

| Product | What It Does | Why It Doesn't Fit |
|---|---|---|
| MiX Telematics / Ctrack | GPS tracking + driver behaviour | Vehicle-centric, no remittance, hardware cost ($20–45/vehicle + HW) |
| Samsara | Enterprise fleet telematics (US) | No Africa presence; wrong segment; $25–35/vehicle/month |
| Kobo360 / Lori Systems | Freight marketplace | Cargo, not passenger / vehicle-for-hire |
| Moove | Vehicle financing | Capital, not operations software — their operators are our prospects |
| Generic ERP (Odoo, SAP) | Business operations | Wrong fit; no driver verification or remittance lifecycle |
| WhatsApp + notebooks | Manual workaround | Free but leaks ₦1.5M+/month at 50 vehicles |

**Our position**: The first purpose-built risk infrastructure layer for the vehicle-for-hire segment in Africa — verification, remittance enforcement, and cross-operator fraud intelligence in one platform.

---

## Slide 10 — Traction

**Headline:** *(Populate with real numbers.)*

- **Customers**: [X] paying operators
- **MRR**: ₦[X] (~$[X])
- **Vehicles managed**: [X]
- **Drivers verified**: [X]
- **Remittance tracked**: ₦[X] total
- **Markets**: Nigeria [primary], [Ghana/Kenya if applicable]

**Customer quote** (with permission):
> "[Quote from an operator about the specific problem Mobiris solved and the outcome.]" — [Title, Company size, City]

**Key metric to highlight**: Time-to-first-value (from signup to first remittance entry recorded). Shows product-led adoption.

*Visual: growth chart (MRR or customer count) + product screenshot with real data*

---

## Slide 11 — Go-to-Market

**Headline:** Direct sales → associations → financing partners → enterprise.

**Phase 1 (Now):** Founder-led direct sales in Lagos. Target: 20 paying customers.
- Outreach to NURTW / RTEAN contacts, ride-hail fleet communities, Moove operator network
- Referral program: 1 month free per referral

**Phase 2 (Month 6+):** Ghana (Accra, GPRTU partnership) + Kenya (Nairobi, MOAK / matatu SACCOs).
- Local rep per market
- Country configs already built (identity providers, payment rails)

**Phase 3 (Month 12+):** Enterprise motion.
- Multi-depot transport groups
- Moove partnership (Mobiris as recommended management platform for financed fleets)
- Fleet insurer partnerships (compliance as insurance condition)

**Why this works**: Transport associations are the trust layer. An endorsement from NURTW or GPRTU opens doors that cold outreach cannot. We get in front of the buyer through the channels they already trust.

---

## Slide 12 — Team

**Headline:** Built by people who understand this market and this technology.

*(Populate with founder bios, relevant experience — transport, fintech, identity tech, SaaS.)*

*(Add advisors with relevant domain expertise.)*

---

## Slide 13 — The Ask

**Headline:** We're raising [₦X / $X] to reach [specific milestone].

**Use of funds:**

| Category | % | Milestone |
|---|---|---|
| Engineering | [X]% | Mobile app GA, inspections/maintenance modules, enterprise control-plane UI |
| Sales & GTM | [X]% | First 50 paying customers, Ghana + Kenya launch |
| Operations | [X]% | Customer success, compliance, legal |

**This round gets us to:**
- [X] paying customers across [X] markets
- MRR of ₦[X]
- Moove partnership letter signed
- Series A ready: sufficient traction to demonstrate repeatability

---

## Appendix Slides

**A1 — Technical Architecture**
Three-plane architecture diagram. NestJS / Prisma / Postgres / pgvector. Deployed on Render. Turborepo monorepo.

**A2 — Identity Provider Coverage**

| Provider | Countries | Products Used |
|---|---|---|
| YouVerify | Nigeria (NIN, BVN, CAC, FRSC) | KYC, liveness |
| Smile Identity | 10+ African countries (Ghana Card, KE ID, ZA ID) | KYC, liveness |
| AWS Rekognition | All markets | Biometric liveness sessions |
| Azure Face | All markets | Liveness fallback |

**A3 — Financial Model (Detailed)**
*(3-year model with assumptions: ACV by tier, verification attach rate, churn assumptions, CAC by channel)*

**A4 — Regulatory Compliance Summary**
NDPA (Nigeria), Kenya DPA, Ghana DPA, POPIA (South Africa) — what we comply with and how.

**A5 — Customer References**
*(Contact list for due diligence conversations — with permission)*
