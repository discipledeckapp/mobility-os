# Lead Magnet: "The Fleet Remittance Health Report"

## Concept

A free, personalised PDF report that an operator fills out a short form to receive. It gives them a calculated estimate of how much remittance leakage they're likely experiencing based on their fleet size and current tracking method — and what fixing it is worth.

**Why this works for the ICP:**
- Fleet managers think in naira terms, not software terms
- Seeing "you are likely losing ₦1.4M/month" in a report addressed to their company name is more powerful than a product demo
- It's genuinely useful — they can share it with their MD to justify adopting software
- It collects name, email, phone, fleet size, and current tracking method — exactly the qualification data we need

---

## Form Fields (on the website `/guides/remittance-health`)

| Field | Type | Notes |
|---|---|---|
| Full name | Text | Required |
| Company / fleet name | Text | Required |
| Email address | Email | Required — report delivered here |
| WhatsApp number | Phone | Optional but recommended for follow-up |
| Number of vehicles | Number | Required — drives the calculation |
| Average daily remittance per vehicle (₦) | Number | Pre-filled ₦10,000, editable |
| How do you track remittance today? | Select | Options: Notebook / WhatsApp / Spreadsheet / Software (other) |
| Country | Select | Nigeria / Ghana / Kenya / South Africa |

**CTA button:** "Generate my report →"

---

## Report Content (auto-generated, delivered by email)

The report is a single-page PDF branded as a "Fleet Remittance Health Assessment" for [Company Name].

### Section 1: Your Fleet at a Glance

> **[Company Name]** operates **[X] vehicles** collecting an average of **₦[Y]/vehicle/day** in driver remittance.
>
> Monthly remittance target: **₦[X × Y × 25]/month**

### Section 2: Your Remittance Health Score

Based on your current tracking method ([Notebook / WhatsApp / Spreadsheet]), we calculate:

| Risk Level | Tracking Method | Estimated Leakage |
|---|---|---|
| 🔴 High | Notebook / verbal | 15–20% |
| 🟡 Medium | WhatsApp only | 10–15% |
| 🟡 Medium | Spreadsheet | 8–12% |
| 🟢 Low | Dedicated software | 2–5% |

> Your estimated monthly leakage: **₦[calculated range]**
> Over 12 months, that is: **₦[annual range]**

### Section 3: What That Looks Like

Simple table for [their fleet size] × their daily rate:

| Month | Remittance Collected | Estimated Missed | Cumulative Loss |
|---|---|---|---|
| Month 1 | ₦[X] | ₦[Y] | ₦[Y] |
| Month 3 | ₦[X] | ₦[Y] | ₦[3Y] |
| Month 6 | ₦[X] | ₦[Y] | ₦[6Y] |
| Month 12 | ₦[X] | ₦[Y] | ₦[12Y] |

### Section 4: The Three Root Causes

Brief, readable — not a sales pitch yet.

1. **No confirmation step** — Cash paid with no record of who confirmed it or when.
2. **No dispute trail** — When a driver says "I paid", there's nothing to check against.
3. **No pattern visibility** — Chronic shortfall drivers blend into the noise without per-driver history.

### Section 5: What Operators With Proper Tracking Do Differently

3 bullet points drawn from the product (without naming Mobiris aggressively):

- Record each driver's expected and actual payment separately
- Require a confirmation action (not just receipt) — with a timestamp
- Review a per-driver remittance history weekly, not monthly

### Section 6: Your Next Step

> Mobiris gives your fleet the remittance tracking, driver verification, and compliance reporting it needs — starting at ₦15,000/month.
>
> Based on your fleet of [X] vehicles, your estimated monthly saving is **₦[lower bound of leakage estimate]**.
>
> Your Mobiris subscription pays for itself in under [X days] of recovered remittance.

**CTA (in the report):**
- Start your 14-day free trial at mobiris.ng
- Or WhatsApp us at +2348053108039 to talk through your specific situation

---

## Follow-Up Sequence (after report download)

| Time | Action | Channel |
|---|---|---|
| Immediate | Deliver report PDF via email | Email (ZeptoMail) |
| +1 hour | WhatsApp message if number provided: "Hi [Name], your fleet remittance health report has been sent to [email]. Let me know if you have questions." | WhatsApp |
| +2 days | Email: "Did the report land? One question for you..." (ask about their biggest remittance pain) | Email |
| +5 days | Email: Short case study or product screenshot | Email |
| +8 days | WhatsApp: "Would a 20-minute demo make sense? I can show you exactly how Mobiris handles this for a fleet your size." | WhatsApp |

---

## PDF Design Spec

- **Format:** A4 portrait, 1–2 pages
- **Header:** Mobiris wordmark (wordmark-dark.png) + "Fleet Remittance Health Assessment" heading
- **Personalisation:** Company name, vehicle count, calculated figures throughout
- **Colour palette:** Navy (#0F172A) for headings, Brand Blue (#2563EB) for callout boxes, white background
- **Footer:** mobiris.ng · hello@mobiris.ng · +2348053108039
- **Generation:** Server-side PDF using a Node.js PDF library (e.g. `@react-pdf/renderer` or `puppeteer` rendering an HTML template) — triggered by the form submission API endpoint

---

## Website Page: `/guides/remittance-health`

**Headline:** "Find out exactly how much your fleet is losing to untracked remittance."

**Subheadline:** "Enter your fleet details below. We'll generate a personalised remittance health report and send it to your email — free."

**Form** (see fields above)

**What you'll get** (3 bullets below the form):
- Your estimated monthly remittance leakage in naira
- A 12-month projection of untracked losses
- A practical breakdown of what operators with proper tracking do differently

**Trust signals:** "Used by fleet operators across Nigeria, Ghana, and Kenya. No spam — just your report and one follow-up."

---

## Other Lead Magnet Ideas (Phase 2)

| Title | Target | Form Fields |
|---|---|---|
| "Driver Verification Checklist for Nigerian Fleet Operators" | Compliance-focused fleet managers | Name, email, fleet size, country |
| "NDPA Compliance Guide for Transport Companies" | Operators who've heard about the regulation | Name, email, company, role |
| "The Fleet Operations Benchmark Report" | MDs / owners | Name, email, fleet size, vehicle type, city — aggregate into an industry report once 50+ responses collected |

The benchmark report is the highest-value long-term asset: once enough operators fill it out, the aggregate data (average daily remittance, average fleet size, common fraud incidents) becomes a publishable industry report that generates press coverage and inbound.
