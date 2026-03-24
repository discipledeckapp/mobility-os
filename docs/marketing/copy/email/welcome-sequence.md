# Welcome Email Sequence

5-email nurture from signup → active operator.

Sent via ZeptoMail from the configured `EMAIL_FROM_ADDRESS`.
Triggered by: completed signup + OTP verification.

**Writing tone:** Friendly but direct. Not corporate. Operators are busy people who read on mobile. Short paragraphs. Clear single action per email.

---

## Email 1 — Immediate: Welcome + Single Next Step

**Subject:** You're in — here's where to start, [First Name]

**Preview text:** Takes 5 minutes. No spreadsheets required.

---

Hi [First Name],

Your Mobiris account is live. One thing to do right now:

**Add your first vehicle.**

Go to Vehicles → New Vehicle. You can paste a VIN and we'll decode the details automatically, or enter them manually.

Once your first vehicle is in, you can add drivers, create assignments, and start tracking remittance.

[→ Add your first vehicle]

Takes under 5 minutes.

Any questions? Reply to this email or WhatsApp us at [SUPPORT_PHONE_PRIMARY]. We're real people.

— The Mobiris Team

*P.S. You have 14 days free on the Growth plan. No credit card needed until you decide to continue.*

---

## Email 2 — Day 2: Driver Onboarding (If No Driver Added)

**Subject:** The fastest way to onboard your first driver

**Trigger:** Send only if `driver_count = 0` at day 2

**Preview text:** Drivers can verify themselves — from their phone.

---

Hi [First Name],

You've added your vehicles — now let's get your drivers in.

The fastest way: **send a self-service link.**

1. Create a driver record (basic details — name, phone)
2. Click "Send self-service link"
3. The driver gets an OTP on their phone
4. They complete their own documents and biometric selfie — from their Android

You see the results on your dashboard in real time. No paper-chasing.

[→ Add your first driver]

For drivers without smartphones, you can upload documents manually from the dashboard. But for most operators, the self-service link cuts onboarding time significantly.

— Mobiris Team

---

## Email 3 — Day 5: Remittance Tracking

**Subject:** How to end remittance disputes for good

**Preview text:** Record, confirm, dispute — with a timestamp every time.

---

Hi [First Name],

Here's a situation most fleet managers know well:

Driver says: *"I paid yesterday."*
Manager checks: a notebook. Or their memory. Or a WhatsApp message from three days ago.

No resolution. The dispute goes nowhere.

Mobiris fixes this with a simple flow:

1. **Record** — log each driver's daily remittance (target and actual)
2. **Confirm** — mark it received when cash is in hand (timestamp)
3. **Dispute** — if there's a shortfall, raise it with a note. It's on the permanent record.
4. **Waive** — if you choose to let it go, you can log that too.

Every action is timestamped. Your operational wallet shows the running balance at any point.

When a dispute comes up, you have the history — not an argument.

[→ Record your first remittance entry]

— Mobiris Team

---

## Email 4 — Day 10: Compliance Report

**Subject:** Do you know which of your drivers has an expired licence today?

**Preview text:** Pull the report in under a minute.

---

Hi [First Name],

Quick question: if an FRSC officer asked you right now for a list of your active drivers with valid licences — how long would it take you to produce it?

For most operators, the honest answer is "I'd have to check each file manually."

Mobiris generates that report instantly.

Go to Reports → Licence Expiry. You'll see every driver sorted by days until their licence expires. The ones in red are already overdue. The ones in amber expire in the next 30 days.

You can also run the Operational Readiness report — it shows what percentage of your fleet is currently active, suspended, or idle.

[→ View your operational readiness report]

These are the reports you hand to a bank, an investor, or a regulator. Now you have them, on demand.

— Mobiris Team

---

## Email 5 — Day 12: Trial Ending (3 Days Notice)

**Subject:** Your free trial ends in 3 days, [First Name]

**Preview text:** Keep everything — or we'll keep your data safe for 90 days.

---

Hi [First Name],

Your 14-day free trial ends in 3 days.

Here's what happens next:

**Option 1 — Stay on Mobiris**
Choose a plan and continue. Your drivers, vehicles, remittance records, and assignments stay exactly as they are.

→ **Starter (₦15,000/month)** — up to 10 vehicles, core ops
→ **Growth (₦35,000/month base)** — full verification, mobile app, up to 20 vehicles

[→ Choose your plan]

**Option 2 — Not ready yet**
Your account moves to read-only. All your data is kept for 90 days. You can reactivate at any time.

**Option 3 — Have questions?**
Reply to this email or WhatsApp us at [SUPPORT_PHONE_PRIMARY]. If you're running 50+ vehicles and want to talk enterprise pricing, we can do that too.

One question for us: how did the trial go? What worked, what didn't? We read every reply.

— Mobiris Team

---

## Sequence Settings

| Email | Trigger | Send condition | Subject A/B ideas |
|---|---|---|---|
| #1 Welcome | Signup verified | Always | — |
| #2 Driver onboarding | +2 days | `driver_count = 0` | Alt: "Your vehicles are in — now let's add your drivers" |
| #3 Remittance | +5 days | Always | Alt: "The ₦ you're losing to untracked remittance" |
| #4 Compliance | +10 days | Always | Alt: "Licence expiry report — pull it now" |
| #5 Trial end | Trial expiry − 3 days | `plan = trial` | Alt: "3 days left — what did you think?" |

---

## Support Channel Note

All emails should include a WhatsApp number as the primary support CTA alongside email. Nigerian operators respond to WhatsApp faster than email. Consider a WhatsApp-based onboarding nudge sequence as a parallel channel once volume warrants it.
