# Mobiris Marketing Website — Development Plan

This is the plan for **mobiris.ng** (or mobiris.com) — the public marketing website.
It is separate from the tenant-web app (`app.mobiris.ng`) and the control-plane console.

---

## Guiding Principles

1. **Operator-first language everywhere.** No tech jargon. Every headline should mean something to a Lagos fleet manager who has never seen SaaS marketing before.
2. **Mobile-first.** The ICP discovers us on a phone — often via a WhatsApp link someone shared. Every page must be perfect at 375px before desktop.
3. **One CTA per page section.** Don't present three options at once. Guide the visitor toward a single next step per section.
4. **Speed.** Nigerian mobile internet is 1–3 Mbps on average. Pages must load under 3 seconds on a slow 3G connection. No heavy hero images. SVG illustrations preferred.
5. **WhatsApp as a first-class channel.** Every page should have a floating WhatsApp button. This market converts on WhatsApp, not on forms.
6. **Product screenshots are the best marketing copy.** The actual dashboard — showing a real operational readiness report, a real remittance dispute trail — is more persuasive than any headline.

---

## Tech Stack Recommendation

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Same stack as tenant-web; team already knows it |
| Styling | Tailwind CSS | Same as rest of monorepo |
| UI components | `@mobility-os/ui` (extend as needed) | Reuse existing design system |
| CMS (blog/guides) | Contentlayer + MDX or Sanity | Contentlayer is zero-cost and Git-based; Sanity if non-dev content editing is needed |
| Analytics | Plausible (privacy-first) or PostHog | NDPA-conscious; avoid Google Analytics without consent banner |
| Forms | Native Next.js server actions | No third-party form provider needed |
| Email capture | ZeptoMail (already integrated in api-core) | Consistent with transactional email setup |
| Search | Pagefind (static) | Blog/docs search without a backend |
| Hosting | Vercel (already used for tenant-web) | Zero-config Next.js deployment |

**Location in monorepo:** `apps/marketing-web/` — new app alongside `tenant-web`.

---

## Domain Architecture

| URL | Destination |
|---|---|
| `mobiris.ng` (or `mobiris.com`) | Marketing site (this plan) |
| `app.mobiris.ng` | tenant-web (the product) |
| `cp.mobiris.ng` | control-plane-web (staff only) |
| `api.mobiris.ng` | api-core |

---

## Site Architecture

```
/                           Homepage
/product                    Product overview (all modules in one scroll)
/features/
  driver-verification       Driver onboarding + biometric + self-service
  remittance-tracking       Remittance lifecycle + wallet ledger
  fleet-management          Vehicles, fleets, compliance reporting
  assignments               Assignment dispatch and tracking
  fraud-detection           Intelligence plane + cross-operator signals
  mobile-app                Driver-facing field app
/pricing                    Pricing tiers + FAQ + calculator
/customers                  Case studies + testimonials
/about                      Company story, mission, team
/contact                    Contact form + WhatsApp + office location
/demo                       Demo request form (or embedded Loom/video)
/blog/                      Content hub
  [slug]                    Individual post
/guides/                    Gated/downloadable operator guides
  [slug]                    Individual guide landing page
/legal/
  terms                     Terms of Service
  privacy                   Privacy Policy
  dpa                       Data Processing Agreement (enterprise)
/for/
  fleet-operators            Segment page: vehicle-for-hire operators
  ride-hail-fleets           Segment page: Uber/Bolt fleet partners
  corporate-shuttle          Segment page: staff transport operators
/not-found                  Custom 404
```

Total: **~25 unique page templates**, several with dynamic routes.

---

## Page-by-Page Specification

---

### `/` — Homepage

**Purpose:** Convert a first-time visitor (fleet manager or MD who clicked a WhatsApp link or LinkedIn post) into a trial signup or demo request.

**Hero Section**

- **Headline:** "Run your fleet. Know your drivers. Track every naira."
- **Subheadline:** "Mobiris is the operations platform for transport companies — driver verification, fleet assignment, and daily remittance tracking. Built for Africa."
- **Primary CTA:** "Start free — no credit card" → `/signup` on app.mobiris.ng
- **Secondary CTA:** "Watch a 3-min demo" → opens embedded video modal
- **Visual:** Animated or static screenshot of the operational readiness dashboard. Real data, not a mockup. Navy background behind the browser frame to anchor it.
- **Trust signal below hero:** "Used by fleet operators across Nigeria, Ghana, and Kenya" — with operator logos or fleet count stat once available.

**Problem Bar** (3 icons, horizontal on desktop / stacked on mobile)

| Icon | Stat | Label |
|---|---|---|
| ₦ | 10–20% | of remittance lost to manual tracking |
| 🧾 | 0 | audit trail when a driver disputes a payment |
| 🚗 | <5% | of African fleet operators have proper software |

Each number links to the relevant section below.

**Problem Narrative Section**

Headline: "You're managing millions in daily remittance from a WhatsApp group."

Body paragraph — 3 short sentences. Ends with: "Mobiris gives you the system to run properly."

**6-Module Feature Grid**

Two rows of three cards (2 columns on mobile). Each card:
- Icon (SVG, brand blue)
- Module name
- One-line description
- "Learn more →" link to the feature page

Modules:
1. **Driver Verification** → `/features/driver-verification`
2. **Remittance Tracking** → `/features/remittance-tracking`
3. **Fleet Management** → `/features/fleet-management`
4. **Assignment Dispatch** → `/features/assignments`
5. **Fraud Detection** → `/features/fraud-detection`
6. **Mobile Field App** → `/features/mobile-app`

**Product Screenshot Carousel**

Full-width section. Tabs across the top: Dashboard · Drivers · Remittance · Reports. Clicking switches the screenshot below. Shows real UI. Caption below each: 1-line description of what's being shown.

**The Intelligence Differentiator Section** (dark navy background)

Headline: "The one thing no single operator can build alone."

Body: Explain the cross-operator identity graph in 3 sentences. Bullet: "A driver who defrauded Company A is flagged when they apply at Company B — via a risk score, not raw records."

Diagram: Simple illustration. Three fleet operator logos feeding into a central "Mobiris Identity Graph" node. Arrow out: "Risk signal → Operator B." Clean, minimal.

**How It Works** (numbered steps)

5 steps: Set up fleet → Onboard drivers → Dispatch → Collect remittance → Stay compliant.
Each step: number circle, headline, one sentence, relevant screenshot thumbnail.

**Pricing Callout** (light grey background)

"Less than what most operators lose in one week of untracked remittance."
Three plan names with prices. "View full pricing →" button. No feature list here — that's on `/pricing`.

**Customer Quote / Social Proof**

If available: operator name, company, city, fleet size, quote.
If not available yet: stat-based ("Fleet operators on Mobiris track an average of X remittance entries per day.") — use real aggregate data.

**Final CTA Section** (brand blue background, white text)

Headline: "Ready to stop managing your fleet on WhatsApp?"
Two CTAs: "Start free trial" (primary, white button) and "WhatsApp us" (secondary, outline button linking to WhatsApp).

---

### `/product` — Product Overview

**Purpose:** For visitors who want a complete understanding of everything Mobiris does before signing up. Longer page than homepage. Segment-agnostic.

**Structure:** Long scroll. Each module gets a full section with:
- Left: copy (headline + 2–3 bullets)
- Right: product screenshot
- Alternating left/right on desktop; stacked on mobile

**Sections (in order):**
1. **Brief hero** — same headline as homepage but shorter. "Everything your fleet operations need in one platform."
2. **Tenant structure** — Explain the hierarchy (Tenant → Business Entity → Operating Unit → Fleet → Vehicles/Drivers). One clean diagram. This is the foundation — visitors need to understand it before the features make sense.
3. **Driver Management** — Full driver lifecycle: onboard, verify, manage, self-service. Screenshot: driver list with status badges.
4. **Biometric Verification** — NIN, BVN, Ghana Card, KE national ID. Liveness check. Guarantor. Screenshot: driver verification status screen.
5. **Remittance Tracking** — Record, confirm, dispute, waive. Operational wallet ledger. Screenshot: remittance list with statuses.
6. **Fleet & Vehicles** — Vehicle catalog, VIN decode, status lifecycle. Screenshot: vehicles page with operational readiness.
7. **Assignments** — Dispatch, start, complete, cancel. Screenshot: assignment list.
8. **Intelligence / Fraud Detection** — Cross-operator graph, risk signals. Diagram (same as homepage). "This module is what makes Mobiris fundamentally different."
9. **Team Management** — Role-based access, invite team members. Brief — not a selling point, just completeness.
10. **Compliance & Reporting** — Readiness report, licence expiry, audit trail.
11. **Mobile Field App** — Driver-facing. Screenshot: mobile app screens.
12. **Platform Architecture** (light callout box) — "Multi-tenant, three-plane architecture. Your data is isolated. We're NDPA, Kenya DPA, Ghana DPA, and POPIA compliant."

**Bottom CTA:** Same as homepage final CTA section.

---

### `/features/driver-verification`

**Purpose:** Deepest dive into the driver verification feature. SEO target: "driver verification software Nigeria", "biometric driver onboarding Africa".

**Above the fold:**
- Headline: "Know exactly who is driving your vehicles — before they get your keys."
- Subheadline: "Biometric liveness + government ID verification built into your onboarding workflow."
- CTA: "Start free trial"
- Hero screenshot: driver profile showing verification status (biometric ✓, NIN ✓, guarantor ✓)

**Section: The Self-Service Flow**

Step-by-step walkthrough with screenshots or illustrated steps:
1. Create driver record (name, phone) — 30 seconds
2. Send OTP self-service link — one click
3. Driver opens link on Android (no app required)
4. Completes biometric selfie + ID number + document uploads
5. Operator sees results on dashboard in real time, approves

Copy: "Your drivers complete their own verification. You review and approve. No paper-chasing."

**Section: What Gets Verified**

Four columns (2×2 on mobile):
- **Biometric liveness** — AWS Rekognition / Azure Face. Confirms the person is real and present.
- **Government ID** — NIN, BVN (Nigeria), Ghana Card, Kenya national ID cross-check via YouVerify + Smile Identity.
- **Driver licence** — Number, expiry date, class. Stored and tracked for expiry alerts.
- **Guarantor** — Verified independently via separate OTP link. Identity-checked separately from the driver.

**Section: Compliance-Designed**

"Driver biometric data is stored as encrypted embeddings only — no raw images. Consent is captured at onboarding. Your data meets NDPA (Nigeria), Kenya DPA, Ghana DPA, and POPIA requirements."

Small table: Regulation | What Mobiris Does | Status

**Section: The Documents Panel**

Screenshot of the driver documents panel. Description of versioned document storage, review workflow, expiry alerts.

**Section: Cross-Operator Intelligence** (callout)

Brief: "Every driver you verify joins the Mobiris identity graph. If a driver has a fraud history at another operator, you'll know before they touch your vehicle."
Link: "Learn more about fraud detection →" to `/features/fraud-detection`

**Bottom CTA:** "Start onboarding your drivers properly." → Trial signup.

---

### `/features/remittance-tracking`

**Purpose:** Convert operators who specifically feel the remittance pain. SEO target: "remittance tracking software fleet operators Nigeria".

**Above the fold:**
- Headline: "Every naira collected, confirmed, and audited."
- Subheadline: "Record, confirm, dispute, or waive every driver's daily payment — with a timestamp on every action."
- Hero screenshot: remittance list showing mix of CONFIRMED, DISPUTED, PENDING statuses.

**Section: The Remittance Problem**

Pull quote format: *"The driver says he paid. The manager can't find the record. Nobody can prove anything. The money disappears."*

This is the most common pain point reported by fleet managers. Two sentences. No statistics — it's too relatable to need them.

**Section: The Mobiris Flow**

Horizontal flow diagram (4 steps with connecting arrows):
`Record` → `Confirm` → `Dispute` (with note) → `Waive`

Under each step: 1 sentence. Under Dispute: "Add a note. It's permanent. The driver sees it."

**Section: The Wallet Ledger**

Screenshot of operational wallet ledger. Caption: "Every confirmation and dispute updates the running balance. See your operational position at any point in time — per business entity."

**Section: ROI Frame**

Dark callout box:
- "A 50-vehicle fleet collecting ₦10,000/vehicle/day brings in ₦15M/month."
- "At 10% untracked leakage: ₦1.5M/month missing."
- "Mobiris Growth at 50 vehicles: ₦80,000/month."
- "The ROI is not close."

**Section: Audit-Ready**

Screenshot of single remittance record showing the full timeline: created → confirmed → disputed → waived with timestamps and user IDs. "When a question comes up, this is what you show."

**Bottom CTA:** "Start tracking remittance today." → Trial signup.

---

### `/features/fleet-management`

**Purpose:** Vehicles, compliance, reporting. SEO target: "fleet management software Nigeria", "vehicle compliance tracking Africa".

**Above the fold:**
- Headline: "Your entire fleet, visible at a glance."
- Subheadline: "Vehicles, status, compliance, and operational readiness — all in one dashboard."
- Hero screenshot: vehicles list with status badges + operational readiness report.

**Sections:**
1. **Vehicle Catalog** — VIN decode, maker/model, registration. Screenshot of vehicle detail.
2. **Status Lifecycle** — Available → Assigned → In-Service → Maintenance → Retired. Status badge diagram. "Know which vehicles are earning right now."
3. **Operational Readiness Report** — Screenshot of the report. "Pull it in one click. Hand it to a bank, an investor, or a regulator."
4. **Licence Expiry Alerts** — "Get notified 30 days before a driver's licence expires — not after an FRSC checkpoint stop." Screenshot of the licence expiry report sorted by days remaining.
5. **Fleet Hierarchy** — Diagram: Operating Unit → Fleet → Vehicles. "If you run multiple depots or routes, organise them separately."

**Bottom CTA:** "See your fleet properly." → Trial signup.

---

### `/features/assignments`

**Purpose:** Assignment dispatch. Less of a standalone selling point — usually bundled with fleet pitch.

**Above the fold:**
- Headline: "Assign drivers to vehicles in seconds. Know the status in real time."
- Hero screenshot: assignment list with statuses (ACTIVE, COMPLETED, CANCELLED).

**Sections:**
1. **The Assignment Flow** — Create → Start → Complete (or Cancel). Each step has a timestamp. Step diagram.
2. **Full History** — "Every assignment, ever. Per driver and per vehicle. If something happens, you have the record."
3. **Link to Remittance** — "Assignments and remittance work together. An assignment period defines when remittance should be collected."

**Bottom CTA:** "Start dispatching properly." → Trial signup.

---

### `/features/fraud-detection`

**Purpose:** The most differentiated feature. Deserves its own deep page. SEO target: "cross-operator driver fraud detection", "driver fraud Africa fleet".

**Above the fold:**
- Headline: "A driver who defrauded another operator won't slip through at yours."
- Subheadline: "Mobiris runs a shared identity graph across all operators on the platform. Risk signals without raw records."
- Visual: Clean diagram — multiple operator circles feeding into a central "Mobiris Identity Graph" node. Risk score flowing back to a new operator.

**Section: The Problem Nobody Talks About**

"Driver fraud between companies is invisible. When a driver absconds with a vehicle or systematically under-reports remittance at Company A, they simply move to Company B and start again. Company A has no way to warn Company B. Company B has no way to ask. The driver knows this."

"This is not rare. It is the primary source of vehicle loss and cash fraud in the vehicle-for-hire sector."

**Section: How the Identity Graph Works**

Three-step illustrated flow:
1. Driver applies at Operator A → verified (biometric + NIN) → joins the person graph
2. Driver commits fraud → risk signal logged against their identity
3. Driver applies at Operator B → Mobiris checks the graph → risk score returned → Operator B is warned

"Operator B never sees Operator A's records. Only the score. The privacy boundary is architectural — not a policy."

**Section: What Triggers a Risk Signal**

List:
- Watchlist entry from another operator's flag
- Biometric match against a known fraudulent identity
- Government document discrepancy
- Identity enrolled under multiple names
- Platform staff investigation outcome

**Section: Technical Credibility**

For operators who will ask: "How does this actually work?"

"Every driver verified on Mobiris has their biometric data stored as an encrypted mathematical embedding — not a photo. When a new driver enrolls, we compare their embedding against all existing ones using cosine similarity. A match above the threshold triggers a deduplication flag, which a platform reviewer investigates."

"Biometric providers: AWS Rekognition and Azure Face for liveness. YouVerify and Smile Identity for government ID cross-check."

**Section: Your Data Is Safe**

"Your drivers' records are never visible to other operators. The intelligence layer returns risk scores, not records. This is how a credit bureau works — it doesn't show you someone's bank statements; it shows you a score derived from them."

**Bottom CTA:** "Stop letting fraudulent drivers move freely between companies." → Trial signup.

---

### `/features/mobile-app`

**Purpose:** The driver-facing field app. Secondary selling point — supports the core platform.

**Above the fold:**
- Headline: "Your drivers, connected. In the field, offline-ready."
- Subheadline: "The Mobiris field app lets drivers view assignments, submit self-service verification, and log remittance — from their Android."
- Visual: Two-phone mockup showing the assignments screen and the remittance screen.

**Sections:**
1. **What Drivers Can Do** — Bullet list: view today's assignment, complete self-service verification (biometric + documents), log remittance, view profile.
2. **Designed for African Connectivity** — "Offline-first. Actions taken without signal are queued and synced when connectivity returns. Designed for low-end Android (sub-₦30,000 devices). Data-efficient — under 5MB for a full day's usage."
3. **No App Download Required for Verification** — "Driver self-service verification works in any mobile browser via a WhatsApp OTP link. No Google Play install needed."
4. **iOS and Android** — Available on both. Android is the primary design target.

**Bottom CTA:** "Give your drivers the app. Keep your dashboard." → Trial signup.

---

### `/pricing`

**Purpose:** Convert price-aware visitors. The pricing page is often the second page visited after the homepage.

**Above the fold:**
- Headline: "Pricing that scales with your fleet. Costs less than one week of remittance leakage."
- Subheadline: "14-day free trial. No credit card. Cancel any time."

**Plan Cards (3 columns on desktop, stacked on mobile)**

Each card:
- Plan name (Starter / Growth / Enterprise)
- Price (bold, large)
- Target operator profile (1 sentence)
- Feature list (checklist)
- CTA button

See [pricing-page.md](./copy/website/pricing-page.md) for full content.

**Country Switcher**

Dropdown or tab above plan cards: 🇳🇬 Nigeria · 🇬🇭 Ghana · 🇰🇪 Kenya · 🇿🇦 South Africa.
Prices update dynamically in local currency. Default: Nigeria (₦).

**Add-Ons Section**

3-column table: Add-on | Price | Notes

**ROI Calculator** (interactive)

Inputs:
- Number of vehicles (slider: 10–200)
- Daily remittance per vehicle (₦ input, pre-filled ₦10,000)
- Estimated leakage % (slider: 5–20%, pre-filled 12%)

Outputs:
- Monthly leakage (estimated): **₦X,XXX,XXX**
- Mobiris monthly cost: **₦XX,XXX**
- Net monthly saving: **₦X,XXX,XXX**

This is a high-conversion element. Built as a React client component — no backend needed.

**FAQ Section**

Full FAQ from [pricing-page.md](./copy/website/pricing-page.md). Accordion component.

**Bottom CTA:** "Start your 14-day free trial" (primary) + "Talk to us for Enterprise" (secondary link to `/contact`).

---

### `/customers`

**Purpose:** Social proof. The most persuasive page on the site for prospects who are close to deciding.

**Status:** Build the page structure now; populate with real case studies as they become available. Do not ship with fake testimonials or stock photography.

**Above the fold:**
- Headline: "Fleet operators who run properly."
- Subheadline: "How transport companies across Nigeria, Ghana, and Kenya use Mobiris to track remittance, verify drivers, and grow their fleets."

**Case Study Cards**

Each card:
- Operator name / anonymised if required (e.g. "A 45-vehicle operator in Lagos")
- City + country flag
- Fleet size
- Problem they had
- Result metric (e.g. "Remittance disputes down by 80% in 6 weeks")
- "Read the story →" link

**Individual Case Study Page** (`/customers/[slug]`)

Structure:
1. **Operator profile** — company type, fleet size, city, team structure
2. **The problem** — what were they doing before; what broke
3. **Why Mobiris** — what made them choose the product
4. **The setup** — how long onboarding took, what modules they use
5. **The result** — specific metrics, direct quote
6. **What they'd tell other operators** — authentic close

**Placeholder (until real case studies):**
Show aggregate stats: "Across all operators on Mobiris: X drivers verified · ₦X remittance tracked · X assignments completed." Real numbers, no operator identification needed.

---

### `/about`

**Purpose:** Build trust for operators doing due diligence. "Is this a real company?"

**Sections:**
1. **Mission** — "Mobiris exists to give transport operators in Africa the operational infrastructure they deserve. The informality of the sector is not a preference — it's a consequence of having no proper tools."
2. **Company** — Founded [year], based in [Lagos / location], team size. Keep it honest and current.
3. **The Problem We Chose** — 2 paragraphs explaining why this problem specifically. Reference the market context (10M+ vehicles, <5% penetration, cross-operator fraud blindspot).
4. **Team** — Founder photos, names, 2–3 sentence bios. Relevant experience. Include "We're hiring" if applicable.
5. **Advisors** — Names and one-line expertise, if applicable.
6. **Built in Africa, for Africa** — "Mobiris is built in Lagos. We use African payment infrastructure (Flutterwave, Paystack), African identity providers (YouVerify, Smile Identity), and African biometric infrastructure (NIN, BVN, Ghana Card). We're not adapting a foreign product — we built this from scratch for how transport works here."
7. **Press / Coverage** — Logos and links if any coverage exists. Skip if empty.

---

### `/contact`

**Purpose:** Handle inbound from prospects, partners, press, and support queries.

**Layout:** Two columns on desktop. Left: contact options. Right: form.

**Contact Options (left):**
- 📧 **Email:** hello@mobiris.ng
- 💬 **WhatsApp:** [SUPPORT_PHONE_PRIMARY] — "Fastest response. We're on WhatsApp."
- 🗓 **Book a demo:** Link to `/demo` or Calendly embed
- 📍 **Location:** [Office address, Lagos]

**Form (right):**
Fields: Name, Company name, Email, Phone (optional), Number of vehicles (dropdown: <10 / 10–50 / 50–200 / 200+), Message.
Submit button: "Send message"
Confirmation: "We'll respond within 4 hours during business hours. For faster response, WhatsApp us."

**Form backend:** Next.js server action → ZeptoMail notification to ops team → auto-reply to submitter with WhatsApp number.

---

### `/demo`

**Purpose:** Capture high-intent visitors who want a guided walkthrough before trial.

**Option A (Recommended initially):** Embedded Loom or Vimeo video (3–5 min product walkthrough). Below the video: "Seen enough? Start your free trial →"

**Option B (When volume warrants):** Calendar booking embed (Calendly or Cal.com). "Book a 30-minute walkthrough with a team member."

**Page structure:**
- Headline: "See Mobiris in action"
- Subheadline: "A 4-minute walkthrough of driver onboarding, remittance tracking, and the operational readiness dashboard."
- Video embed (full-width)
- Below video: What you'll see (3 bullet points) + CTA to sign up
- "Prefer a live demo? Book 30 minutes →" link

---

### `/blog`

**Purpose:** SEO and authority building. Target: fleet managers searching for operational guidance; investors researching the African transport sector.

**Above the fold:**
- Headline: "Insights for transport operators"
- Category filter tabs: All · Operations · Driver Management · Compliance · Industry

**Post card grid:** 3 columns (2 on tablet, 1 on mobile). Each card: cover image (or colour-block with icon if no image), title, date, reading time, 1-line excerpt, category badge.

**Content pillars (from [linkedin.md](./copy/social/linkedin.md)):**

| Pillar | Example posts |
|---|---|
| Operator education | "How to end remittance disputes in your fleet", "The guarantor checklist every fleet operator should use" |
| Market insight | "How many commercial vehicles are in Nigeria? What the numbers mean for fleet operators", "Driver fraud between companies — why it happens and how to stop it" |
| Compliance | "What Nigeria's NDPA means for fleet operators storing driver documents", "FRSC compliance checklist for Lagos transport companies" |
| Product | "How self-service driver verification works on Mobiris", "Understanding the operational readiness report" |

**Individual Post** (`/blog/[slug]`)

Layout: max-width content column, 70ch. Author + date + category at top. Table of contents sidebar (desktop only). Related posts at bottom. CTA after last paragraph: "Manage your fleet properly. Start a free trial →"

**CMS:** Contentlayer + MDX for developer-authored content. Migrate to Sanity when a content writer joins who isn't technical.

---

### `/guides`

**Purpose:** Gated (email-capture) or ungated long-form resources for the ICP. Also useful as sales leave-behinds.

**Planned guides (to be written):**

| Guide | Target | Format |
|---|---|---|
| "The Fleet Operator's Guide to Driver Verification in Nigeria" | Fleet managers / compliance | PDF, 8–12 pages |
| "Remittance Tracking: From WhatsApp Groups to Proper Records" | Ops leads / owners | PDF, 6–8 pages |
| "NDPA Compliance for Fleet Operators: What You Need to Know" | Compliance / owners | PDF, 4–6 pages |
| "How to Onboard 50 Drivers Without Losing Your Mind" | Fleet managers | PDF or web article |

**Guide landing page structure:**
- Headline + what's inside (3 bullets)
- Cover image (PDF mockup)
- Email capture form: Name + Email + Company + Vehicle count
- "Send me the guide" button
- Preview: 2–3 paragraphs from the guide body

**Gating decision:** Gate with email capture for the PDF downloads. The web/HTML versions of guides are ungated (for SEO). Both routes are valid.

---

### `/for/fleet-operators`

**Purpose:** Segment landing page. SEO target: "fleet management software Nigeria", "transport company software Africa". Also used in targeted LinkedIn or WhatsApp outreach.

**This is essentially a stripped-down homepage tuned for the specific ICP.** No feature grid — just the 3 most relevant features (remittance, driver verification, compliance). All copy uses the vehicle-for-hire operator's vocabulary (remittance, guarantor, FRSC, danfo/matatu).

**Key additions vs homepage:**
- Specific economics: "A 50-vehicle operator collecting ₦10,000/vehicle/day..."
- Explicit daily remittance leakage calculation
- Mention of NURTW / GPRTU context as the community they're in

---

### `/for/ride-hail-fleets`

**Purpose:** Segment page for Uber/Bolt fleet partners.

**Different emphasis:**
- Driver compliance requirements from Uber/Bolt platform
- Fast driver onboarding (the platform expects partners to maintain a ready driver pool)
- Mobile app for drivers
- Cross-operator fraud detection (a Bolt-banned driver applying elsewhere)

**Headline:** "Fleet partners who onboard drivers properly, grow faster."

**Mention:** Moove-financed operators by name/implication. "If you've financed vehicles through a platform like Moove, you need an operations layer on top."

---

### `/for/corporate-shuttle`

**Purpose:** Segment page for companies managing corporate commuter fleets (Treepz/Shuttlers market segment).

**Different emphasis:**
- Assignment tracking (corporate contracts have defined routes and schedules)
- Driver compliance for corporate client requirements
- Remittance is different (weekly/monthly, not daily) — adjust copy accordingly
- Reporting for corporate clients

**Headline:** "Run your corporate shuttle fleet with the same rigour your clients expect from you."

---

### `/legal/terms`

Standard SaaS Terms of Service. Key sections to include given the product:
- Scope of services (three-plane platform)
- Data processing (biometric data, NDPA compliance, encrypted embeddings)
- Subscription and billing (payment via Flutterwave/Paystack, wallet model)
- Termination and data retention (90-day grace period)
- Governing law (Nigeria for Nigerian entities; clause for other jurisdictions)
- Dispute resolution

**Do not copy a generic template.** Have a Nigerian solicitor review before publishing. The biometric data handling sections have specific NDPA requirements.

---

### `/legal/privacy`

Full Privacy Policy. Must explicitly cover:
- Categories of personal data collected (name, email, phone, NIN/BVN/Ghana Card numbers, biometric embeddings, driver documents)
- Biometric data: what is stored (embeddings, not raw images), how it's encrypted, consent mechanism
- Cross-tenant intelligence layer: what is and isn't shared
- Data retention periods (per data type)
- User rights: access, correction, deletion, portability
- Third-party processors: AWS (Rekognition), Azure (Face), YouVerify, Smile Identity, ZeptoMail, Render, Paystack, Flutterwave
- Data Protection Officer contact
- Regulatory body: NDPC (Nigeria), ODPC (Kenya), etc.

---

### `/legal/dpa`

Data Processing Agreement — for enterprise customers who require it under NDPA or POPIA. Downloadable PDF. Also available on request via email.

Parties: Mobiris (Processor) + Customer (Controller).
Covers: purpose limitation, sub-processors list, security measures, breach notification, cross-border transfers, audit rights.

---

## Shared Components

These components appear across multiple pages and should be built as reusable React components:

| Component | Pages Used | Notes |
|---|---|---|
| `<NavBar>` | All | Logo + links + "Start free" CTA button + mobile hamburger |
| `<Footer>` | All | Links, legal, social, WhatsApp number |
| `<WhatsAppFAB>` | All | Floating action button, bottom-right, links to WhatsApp |
| `<CTASection>` | Most | Full-width CTA block with headline + two buttons. Accept props for variant (blue, navy, grey) |
| `<FeatureCard>` | Homepage, `/product` | Icon + title + description + link |
| `<PricingCard>` | `/pricing` | Plan name + price + features + CTA. Props for highlighted/recommended |
| `<ROICalculator>` | `/pricing` | Client component with slider inputs and live output |
| `<ScreenshotFrame>` | Multiple | Browser chrome wrapper around product screenshots |
| `<StepFlow>` | Feature pages | Numbered step diagram, horizontal on desktop, vertical on mobile |
| `<TestimonialCard>` | `/customers`, homepage | Quote, operator name, company, fleet size badge |
| `<BlogCard>` | `/blog` | Post card with image, title, excerpt, category |
| `<AccordionFAQ>` | `/pricing`, FAQ sections | Expandable Q&A |
| `<CountryPriceToggle>` | `/pricing` | Dropdown that swaps price display by currency |
| `<VideoModal>` | Homepage, `/demo` | Lightbox for video embed |

---

## SEO Strategy

### Primary Keyword Targets

| Page | Primary Keyword | Secondary |
|---|---|---|
| Homepage | fleet management software Nigeria | transport company software Africa |
| `/features/driver-verification` | driver verification software Nigeria | biometric driver onboarding Africa |
| `/features/remittance-tracking` | remittance tracking fleet operators | fleet remittance management software |
| `/features/fleet-management` | fleet management software Africa | vehicle compliance software Nigeria |
| `/features/fraud-detection` | driver fraud detection Nigeria | cross-operator fleet fraud |
| `/pricing` | fleet software pricing Nigeria | fleet management cost Africa |
| `/blog/*` | Long-tail: "how to track remittance fleet Nigeria", "FRSC compliance fleet operators", etc. |

### Technical SEO

- All pages: `<title>`, `<meta name="description">`, Open Graph tags (for WhatsApp link previews — critical for this market)
- Dynamic OG image generation for blog posts (Next.js `@vercel/og`)
- Sitemap auto-generated
- `robots.txt` — allow all except `/api/`
- Structured data: `Organization`, `WebSite`, `FAQPage` (pricing FAQ), `Article` (blog)
- Canonical URLs on all pages
- Lang attribute: `lang="en"` — add `lang="yo"` / `lang="sw"` pages when localisation begins

### Content Velocity

| Period | Content Target |
|---|---|
| Pre-launch | 5 seed blog posts (flagship SEO pieces) + all static pages |
| Month 1–3 | 2 posts/week (operator education + market insight) |
| Month 4+ | Introduce guides (1 per month) and case studies as customers allow |

---

## Analytics and Conversion Tracking

**Events to track (Plausible custom events or PostHog):**

| Event | Trigger |
|---|---|
| `cta_click` | Any "Start free trial" or "Get started" button |
| `whatsapp_click` | WhatsApp FAB or any WhatsApp CTA |
| `demo_video_start` | Video play on `/demo` |
| `pricing_view` | User reaches `/pricing` |
| `pricing_calculator_interact` | Any ROI calculator slider change |
| `country_switch` | Pricing country toggle |
| `guide_download` | Guide email form submission |
| `contact_submit` | Contact form submission |
| `blog_post_read` | User scrolls past 80% of a blog post |

**Conversion funnel:**
Landing → Product understanding → Pricing view → Signup → First value (first remittance recorded)

Track dropoff at each stage.

---

## Accessibility

- All interactive elements keyboard-navigable
- All images have alt text (especially product screenshots — describe what's shown)
- Colour contrast ratio ≥ 4.5:1 (Brand Blue #2563EB on white passes WCAG AA)
- Form fields have explicit `<label>` elements
- Screen reader tested for the pricing page and sign-up flow

---

## Performance Targets

| Metric | Target |
|---|---|
| Largest Contentful Paint (LCP) | < 2.5s on 3G |
| Cumulative Layout Shift (CLS) | < 0.1 |
| First Input Delay (FID) | < 100ms |
| Page weight (homepage) | < 300KB (gzip) |
| Screenshot images | WebP, lazy loaded, explicit width/height |
| Fonts | Inter via `next/font` (self-hosted, no Google Fonts round-trip) |

---

## Development Phases

### Phase 1 — MVP Marketing Site (Launch blocker)

**Deliverable:** Live at mobiris.ng before any paid customer acquisition starts.

Pages:
- `/` — Homepage
- `/pricing`
- `/demo` (video only, no live booking)
- `/legal/terms`
- `/legal/privacy`
- `/contact`
- Shared components: NavBar, Footer, WhatsAppFAB, CTASection

Estimated scope: **3–4 weeks** for a single focused frontend developer.

---

### Phase 2 — Feature Pages + Blog

**Deliverable:** SEO surface area + content foundation.

Pages:
- All 6 `/features/*` pages
- `/product`
- `/blog` index + first 5 posts (Contentlayer + MDX setup)
- `/about`

Estimated scope: **2–3 weeks** after Phase 1.

---

### Phase 3 — Social Proof + Segment Pages

**Deliverable:** Conversion optimisation + segment targeting.

Pages:
- `/customers` (with real case studies)
- `/for/fleet-operators`
- `/for/ride-hail-fleets`
- `/for/corporate-shuttle`
- `/guides` (first guide + email capture)
- ROI calculator on `/pricing`

Estimated scope: **2 weeks** + time to produce the actual case study content.

---

### Phase 4 — Localisation + Enterprise

**Deliverable:** Expand market surface area.

- `/legal/dpa`
- Pricing page country toggle (Ghana, Kenya, South Africa)
- Yoruba / Swahili / French blog content
- Enterprise-specific landing page

Estimated scope: **Ongoing** — no fixed timeline.

---

## Open Questions Before Build Starts

1. **Domain:** ✅ mobiris.ng (owned)
2. **Company:** ✅ Growth Figures Limited, RC1957484, 6 Addo-Badore Road, Ajah, Lagos. Founded 2022. Founder: Oluwaseyi Adelaju.
3. **Legal documents:** ✅ Drafted — see `docs/marketing/legal/`. Must be reviewed by a Nigerian solicitor before publishing.
4. **Screenshots:** ✅ Placeholder SVGs created in `docs/marketing/screenshots/`. Replace with real screenshots before launch.
5. **WhatsApp number:** ✅ +2348053108039 (primary). Use this in the WhatsApp FAB and email footers.
6. **Demo video:** ⏳ To be recorded. Use a placeholder Loom embed for now.
7. **Email addresses:** ✅ hello@mobiris.ng and support@mobiris.ng confirmed live.
8. **Pricing:** ✅ Confirmed. Verification fee is ₦1,000 (not ₦600). See pricing-page.md.
9. **Analytics:** ✅ Plausible. No consent banner required.

---

## Related

- [Homepage Copy](./copy/website/homepage.md)
- [Pricing Copy](./copy/website/pricing-page.md)
- [Brand Guide](./brand/BRAND-GUIDE.md)
- [Positioning](./messaging/positioning.md)
- [Market Research](./MARKET-RESEARCH.md)
