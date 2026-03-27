# Operator Onboarding Emails

Triggered emails for specific activation milestones, sent independently of the welcome sequence.
These fire based on product actions (or inaction) rather than time.

---

## Email: First Driver Verified

**Trigger:** `driver.status` transitions to `active` for the first time on the account
**Subject:** ✓ Driver verified — here's what happens next

---

Hi [First Name],

[Driver Name] has been verified and is active on your Mobiris account.

**Their record now includes:**
- Biometric verification: ✓
- Government ID cross-check: ✓
- Documents: [X uploaded]
- Guarantor: [Linked / Pending]

**What to do next:**

1. **Assign them to a vehicle** — go to Assignments → New Assignment
2. **Record their first remittance** — once they're on the road
3. **Add their guarantor** (if not done) — send a separate self-service link

[→ Create an assignment for [Driver Name]]

— Mobiris Team

---

## Email: First Remittance Dispute

**Trigger:** First `DISPUTED` remittance record created on the account
**Subject:** Dispute recorded — here's the trail

---

Hi [First Name],

A remittance dispute has been recorded for [Driver Name] on [Date].

Amount expected: ₦[X]
Amount received: ₦[X]
Note: [Dispute note entered by user]

This record is permanent. If the driver later pays the shortfall, you can update the status to Confirmed. If you decide to waive it, you can mark it as Waived — with a note.

[→ View the dispute record]

**Tip:** Every dispute, confirmation, and waiver is visible in the driver's remittance history and your operational wallet ledger. When a pattern emerges — three disputes in a week, for example — it shows on the record.

— Mobiris Team

---

## Email: Licence About to Expire (30 Days)

**Trigger:** Any driver's licence expiry date is 30 days away
**Subject:** ⚠ [Driver Name]'s licence expires in 30 days

---

Hi [First Name],

This is an advance notice: **[Driver Name]'s driver's licence expires on [Date]** — 30 days from now.

You have time to act before it becomes a compliance issue.

[→ View [Driver Name]'s profile]

To update the licence after renewal: go to the driver's profile → Documents → Upload new licence → set the new expiry date.

You can see all upcoming licence expiries at once in **Reports → Licence Expiry**.

— Mobiris Team

---

## Email: Licence Expired (Day 0)

**Trigger:** Driver licence expiry date is today or in the past; driver is still `active`
**Subject:** 🔴 [Driver Name]'s licence has expired

---

Hi [First Name],

**[Driver Name]'s driver's licence expired on [Date].**

They are currently showing as Active in your fleet. We recommend suspending their assignment access until the licence is renewed.

[→ Update [Driver Name]'s status]
[→ Upload renewed licence]

Allowing a driver with an expired licence to operate creates FRSC/NTSA compliance risk and potential insurance liability.

— Mobiris Team

---

## Email: Intelligence Risk Signal Triggered

**Trigger:** A new driver onboarding triggers a risk signal from the intelligence plane
**Subject:** ⚠ Risk signal flagged for [Driver Name]

---

Hi [First Name],

During onboarding verification for **[Driver Name]**, a risk signal was detected in the Mobiris identity graph.

**Risk level:** [Low / Medium / High]
**Signal type:** [Fraud history / Identity mismatch / Watchlist]

This signal was generated from cross-operator intelligence data. No details from other operators are shared — only the risk level.

**Recommended action:** Put the driver's onboarding on hold and review before activating.

[→ View [Driver Name]'s identity summary]

If you believe this is an error or want to proceed despite the signal, you can override and document your decision — it will be recorded in the driver's audit trail.

Contact support if you need assistance reviewing the signal.

— Mobiris Team

---

## Email: Team Member Invited (To New User)

**Trigger:** A team invitation is sent to a new email address
**Subject:** [Admin Name] has invited you to join [Tenant Name] on Mobiris

---

Hi,

**[Admin Name]** has invited you to join **[Tenant Name]**'s Mobiris account as **[Role]**.

Mobiris is the operations console [Tenant Name] uses to verify drivers, control assignments, and enforce remittance accountability.

[→ Accept your invitation and set up your account]

This link expires in 48 hours. If you weren't expecting this, you can ignore this email.

— Mobiris Team

---

## Email: Payment Failed

**Trigger:** Subscription invoice settlement fails (card declined or wallet insufficient)
**Subject:** Action needed — your Mobiris payment couldn't be processed

---

Hi [First Name],

We weren't able to process your Mobiris subscription payment for [Month].

**What to do:**

Option A — **Top up your wallet**
Add funds to your platform wallet and we'll retry the payment automatically.
[→ Top up wallet]

Option B — **Pay the invoice directly**
[→ Pay ₦[Amount] now]

If this isn't resolved within 7 days, your account will move to read-only mode. Your data will be kept safe.

Questions? Reply to this email or WhatsApp us at [SUPPORT_PHONE_PRIMARY].

— Mobiris Team

---

## Delivery Notes

All triggered emails are delivered via ZeptoMail.
- Transactional emails (dispute, expiry, risk signal) should fire immediately — no batching
- Onboarding milestone emails (first driver verified, first assignment) can batch at most 1 hour
- Payment failure should fire within 15 minutes of the failed attempt

WhatsApp parallel: consider mirroring the licence expiry and risk signal emails as WhatsApp messages to the account owner's phone number. Nigerian operators respond to WhatsApp faster than email.
