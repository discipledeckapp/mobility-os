# Elevator Pitch

Three versions: 30 seconds, 2 minutes, full narrative.

---

## 30-Second Version

> Transport companies in Africa — Lagos danfo fleets, Nairobi matatu SACCOs, Accra trotro operators — run on WhatsApp and notebooks. Mobiris is the operations platform that replaces that: driver verification, fleet assignment, and daily remittance tracking in one place, with a shared identity graph that catches fraudulent drivers before they get your keys. It's the first purpose-built product for the vehicle-for-hire segment — 10 million commercial vehicles, near-zero software penetration.

**Use when:** investor intro, cold networking, press.

---

## 2-Minute Version

> Transport is one of the largest informal employment sectors in Africa. In Nigeria alone, an estimated 5–8 million people work in road transport. Operators running 20–200 vehicles each collect ₦7,500 to ₦25,000 per vehicle per day in driver remittance — cash, tracked in notebooks, disputed via WhatsApp.
>
> There is no purpose-built software for this. Telematics tools like Samsara or MiX Telematics track vehicles, not drivers or cash. Generic ERP is too expensive and the wrong fit. Fleet financing companies like Moove provide capital, not an operations platform. The actual operator — who needs to know which driver is in which vehicle, whether yesterday's remittance was confirmed or disputed, and whether a new hire has a fraud history at another company — has no product.
>
> Mobiris is that product. We give fleet operators a complete system: driver onboarding with biometric liveness and government ID verification (NIN, BVN, Ghana Card), vehicle and fleet management, assignment dispatch, and a remittance ledger with a full audit trail. On top of that, we run a cross-operator identity graph. When a driver who defrauded one company tries to join another, we surface the risk signal — without exposing the other company's records.
>
> We're live in Nigeria, built for Ghana, Kenya, and South Africa. We sell to operators with 20–200 vehicles, starting with direct sales and a product-led trial. The pricing is ₦[X]/month — less than what most operators lose to untracked remittance in a single week.

**Use when:** investor pitch intro, partnership conversations, accelerator applications.

---

## Full Narrative (Investor / Press Version)

### The Opportunity

Africa has an estimated 10+ million commercial vehicles across Nigeria, Ghana, Kenya, and South Africa. The vehicle-for-hire segment — the danfo buses of Lagos, the matatus of Nairobi, the trotros of Accra, the minibus taxis of Johannesburg — carries the majority of urban passenger trips on the continent (80–95% in most cities) and directly employs tens of millions of people.

The fleet management software market for this segment is a whitespace. The global fleet SaaS market is growing at 15–20% CAGR, but existing products serve corporate fleets and long-haul trucking. They charge $20–45/vehicle/month and require hardware. They are built for European or North American operating models. They do not understand — and cannot serve — the vehicle-for-hire operator who is collecting cash remittance from 50 drivers every morning.

Software penetration in this segment is estimated at well under 5%. That is not a niche — it is the largest unserved vertical in African SaaS.

### The Problem

A typical mid-sized Lagos transport operator running 50 vehicles:

- Collects ₦375,000–₦625,000 in daily remittance — almost entirely in cash
- Has no reliable system to confirm whether payments were made, disputed, or waived
- Has no biometric record of who their drivers actually are
- Cannot verify whether a job applicant has a fraud history at a competitor — no shared system exists
- Manages compliance (licence expiry, vehicle roadworthiness) from memory or a notebook
- If a driver absconds with a vehicle, their documentation is often incomplete or unverifiable

Industry estimates put remittance leakage at 10–20% of total collections in manually-managed fleets — ₦1.1M–₦2.8M per month for a 50-vehicle operator. That is the addressable pain.

### The Product

Mobiris is a three-plane SaaS platform:

**Tenant Plane** — what operators use daily:
- Driver management: biometric liveness verification + government ID cross-check (NIN, BVN, Ghana Card, Kenya national ID, South African ID) via YouVerify and Smile Identity
- Vehicle and fleet management: catalog, VIN decode, status lifecycle, operational readiness reporting
- Assignment dispatch: driver-to-vehicle assignment lifecycle with timestamps
- Remittance tracking: confirm, dispute, waive — with a running ledger per business entity
- Team management, role-based access, document storage

**Control Plane** — platform governance (staff only):
- Tenant lifecycle, subscription and billing management
- Feature flags, usage metering, platform wallets
- Per-tenant financial management and invoice settlement

**Intelligence Plane** — cross-operator fraud detection:
- Canonical person graph: every verified driver, deduplicated across all operators on the platform
- Biometric matching via AWS Rekognition and Azure Face
- Government document verification via YouVerify and Smile Identity
- Risk signals surfaced as scores per driver — never raw records from another operator's account
- Review cases and watchlists managed by platform staff

### The Business Model

- **Base subscription** per tenant: flat monthly fee covering platform access
- **Usage uplift**: per active vehicle/driver above the plan base
- **Intelligence add-on**: per-verification fee for biometric checks and government ID lookups
- **Enterprise**: ARR contracts for transport groups managing multiple subsidiaries
- **Payments**: Flutterwave + Paystack; wallet top-up + invoice settlement model

Comparable SaaS products in adjacent categories (accounting, HRMS) in Africa are priced at $2–10/month for SME operators. Telematics with hardware runs $20–45/vehicle/month. Mobiris's target pricing of ₦[X]/vehicle/month sits well within WTP benchmarks while offering more relevant functionality than either category.

### Market Infrastructure Tailwinds

Three structural forces are converging:

1. **Identity infrastructure is maturing.** Nigeria has 100M+ NIN enrollees, 60M+ BVN records. Ghana Card has 17M+ issued. Smile Identity has processed 100M+ verifications across Africa. The rails exist.

2. **Regulatory pressure is increasing.** Nigeria's NDPA (2023), Kenya's DPA (2019), Ghana's DPA (2012), and South Africa's POPIA all require consent-based, auditable biometric data handling. Operators who want to comply need a platform with compliant data architecture. Mobiris stores only encrypted embeddings — never raw biometric images — which is the correct compliance posture.

3. **Government formalization pushes are creating demand.** Lagos State has pushed digital commercial vehicle registration. Kenya's NTSA TIMS system is mandating digital driver and vehicle records. Operators who need to comply with these initiatives need a system of record.

### Why Now

The combination of affordable biometric APIs (AWS Rekognition, Azure Face, YouVerify, Smile Identity), high smartphone penetration among drivers (45–65% in target markets, 90%+ Android), and increasing regulatory formalization creates the exact moment for a purpose-built platform. Five years ago, the identity infrastructure wasn't reliable. Five years from now, a competitor will have taken this market.

### Traction

*[Populate with: operator count, vehicles managed, drivers verified, remittance volume tracked, MRR.]*

### The Ask

*[Populate based on round: seed/pre-seed raise, use of funds, milestones.]*

### Vision

Mobiris becomes the operational infrastructure layer for transport in Africa — the platform that every vehicle-for-hire operator relies on for compliance, driver verification, and daily operations. The cross-operator identity graph compounds in value with every new operator who joins. By the time a competitor tries to replicate it, the network is already the moat.

---

## Related

- [Positioning](./positioning.md)
- [Value Propositions](./value-propositions.md)
- [Pitch Deck Outline](../sales/pitch-deck-outline.md)
