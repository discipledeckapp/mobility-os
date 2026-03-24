# Value Propositions

Value props by product area and audience segment, grounded in African market economics.

---

## The Core Economic Argument

A mid-sized Lagos fleet operator running 50 vehicles collects an estimated **₦375,000–₦625,000 in daily remittance** (₦7,500–₦12,500 per vehicle). Unrecorded shortfalls, driver disputes, and fraud conservatively cost **10–15% of that** — roughly ₦37,500–₦93,750 per day, or **₦1.1M–₦2.8M per month in leakage**.

Mobiris's monthly subscription for 50 vehicles sits at a fraction of one day's remittance. The ROI argument writes itself.

---

## By Audience

### Fleet Manager / Operations Lead

> "Stop reconciling remittance in WhatsApp. See every assignment, every payment, and every dispute — in one dashboard, with a full audit trail."

Core benefits:
- **Remittance tracking**: Record, confirm, dispute, or waive each driver's daily payment. Timestamps on every action. No more "I paid, you didn't record it" disputes with no trail.
- **Operational readiness**: Know in real time what percentage of your fleet is active, suspended, or idle. Pull a compliance report in under a minute.
- **Licence expiry alerts**: Get notified before a driver's licence expires — not after a checkpoint stop.
- **Assignment history**: Every vehicle assignment has a start, an end, and a complete log. If something happens, you have the record.

### Transport Company Owner / MD

> "Stop losing 10–15% of your remittance to fraud and untracked shortfalls. Mobiris gives you the control and the data to prove every naira collected."

Core benefits:
- **Cash leakage control**: Every remittance transaction is recorded, confirmed, and disputable — no more missing cash with no explanation.
- **Driver verification before the keys go out**: Biometric liveness check + government ID cross-verification (NIN, BVN, Ghana Card, Kenya national ID) before a driver gets near your vehicle.
- **Cross-operator fraud signals**: A driver who absconded with a vehicle at another company is flagged when they apply at yours — without the other company's data ever being exposed.
- **Investor and regulator-ready records**: Full audit trail, document management, and compliance reports that you can hand to a bank, an investor, or a regulator on demand.

### Compliance / HR Lead

> "Driver verification, document management, guarantor records — all in one place, always audit-ready, fully NDPA/DPA compliant."

Core benefits:
- **Biometric verification built in**: Liveness selfie + government document check at onboarding, via YouVerify and Smile Identity. No separate integration needed.
- **Guarantor capture**: Every driver can have a verified guarantor linked to their record — captured via a separate self-service OTP link, identity-verified independently.
- **Document versioning**: Every document upload is stored, reviewed, and version-tracked. Expired documents trigger alerts.
- **Consent-based data handling**: Biometric data stored as encrypted embeddings only (no raw images). Consent captured at onboarding. Meets NDPA sensitive data requirements.

### Platform Operator / Enterprise Buyer

> "Multi-tenant architecture purpose-built for scale — manage a group of transport companies from a single control plane, with per-tenant billing and cross-tenant fraud intelligence."

Core benefits:
- **Full tenant isolation**: Each subsidiary or affiliate operates independently. No data crossover.
- **Per-tenant billing and invoicing**: Subscription plans, usage-based billing, wallet management, and invoice settlement — all configurable per tenant.
- **Feature flags**: Control which capabilities each tenant accesses. Roll out new features gradually.
- **Cross-operator intelligence grows with the network**: The more operators on the platform, the stronger the fraud signals. This is a structural moat that individual operators cannot replicate.

---

## By Product Area

### Driver Management

- Biometric liveness verification (AWS Rekognition / Azure Face) + government ID check (YouVerify / Smile Identity) at onboarding
- NIN, BVN, Ghana Card, KENYAN national ID — all verifiable via integrated providers
- **Self-service verification**: Send a driver an OTP link; they complete documents and biometrics from their phone — no back-and-forth
- Guarantor management: capture, verify, and link guarantors to drivers independently
- Full status lifecycle: pending → active → suspended → inactive — with reason codes and timestamp trail

### Fleet & Vehicle Management

- Full vehicle catalog with automatic VIN decoding (NHTSA vPIC integration)
- Status lifecycle: available → assigned → in-service → maintenance → retired
- Vehicle valuation tracking
- Operational readiness report: real-time snapshot of your whole fleet
- Licence expiry report: sorted by days-to-expiry

### Assignments

- Assign a driver to a vehicle with start and end timestamps
- Track lifecycle: created → started → completed → cancelled
- Full assignment history per driver and per vehicle
- If a driver abandons a vehicle mid-assignment, the record shows when it started, the last known state, and who was responsible

### Remittance

- Record daily remittance target and actual amount per driver
- Confirm receipt, raise a dispute (with notes), or waive a shortfall
- Every action is timestamped and auditable
- Operational wallet per business entity: running balance visible at any point
- Ledger entries: see the full history of every credit and debit

### Cross-Operator Intelligence

- Shared identity graph: every driver verified on the platform is deduplicated against a canonical person record
- Biometric deduplication catches a driver who enrolled under a different identity at another company
- Risk signals are surfaced as scores — no raw records from another tenant are ever exposed
- Review cases for staff investigation when a flag is raised
- Watchlist entries for known fraudulent individuals

---

## Proof Points

| Claim | Data / Benchmark | Source |
|---|---|---|
| Software cost < 1% of daily remittance | Vehicle generates ₦7,500–₦25,000/day; Mobiris costs ~₦500–₦1,200/vehicle/month | Market estimates |
| Identity verification gap | <5% of transport operators use biometric driver verification | Industry estimate |
| Fraud exposure | Cross-operator driver fraud goes entirely undetected in current market | No shared fraud database exists in sector |
| Scale of market | 10M+ commercial vehicles across NG, GH, KE, ZA | National registration estimates |
| Informal transport dominance | 80–95% of urban trips are informal; near-zero software penetration | GSMA, sector reports |

*Customer-specific ROI data to be added once design partners provide consent for case study publication.*

---

## Related

- [Positioning](./positioning.md)
- [Elevator Pitch](./elevator-pitch.md)
- [Homepage Copy](../copy/website/homepage.md)
