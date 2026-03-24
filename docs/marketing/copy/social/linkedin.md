# LinkedIn Content

Organic content for the Mobiris company page and founder account.
Target audience on LinkedIn: Fleet managers, transport company MDs, operations directors — primarily Nigeria, Ghana, Kenya.

---

## Content Pillars

| Pillar | Frequency | Goal |
|---|---|---|
| **Operator education** | 2x/week | Build trust and relevance with the ICP |
| **Market insight** | 1x/week | Establish market authority |
| **Product updates** | 1x/week | Convert warm followers |
| **Behind the build** | 1x/week | Investor/founder audience; builds credibility |
| **Customer stories** | As available | Strongest conversion content; gate behind permission |

Post frequency: 3x/week. Never two product posts back-to-back. Alternate pillars.

---

## Draft Posts

### Post 1 — Operator Education (Remittance Leakage)

> Most fleet operators in Lagos are reconciling daily remittance the same way they did 20 years ago.
>
> Driver says: "I paid ₦9,000 today."
> Manager checks: a notebook. Or a WhatsApp message. Or just trusts it.
>
> At 50 vehicles, that's 50 daily conversations with no audit trail. Industry estimates put remittance leakage in manually-managed fleets at 10–20% of total collections.
>
> For a 50-vehicle operator collecting ₦500,000/day, that's ₦50,000–₦100,000 disappearing every day. ₦1.5M–₦3M every month. With no record of where it went.
>
> The fix isn't complicated. It's a record with a timestamp, a confirmation step, and a dispute trail. That's it.
>
> This is the first thing every operator asks for when they see Mobiris. Because it's the most expensive thing they're not tracking.

---

### Post 2 — Market Insight (The Whitespace)

> Fleet management software is a multi-billion dollar global market.
>
> Samsara raised $800M. Verizon Connect and MiX Telematics serve hundreds of thousands of vehicles. Fleetio has thousands of customers.
>
> None of them serve the vehicle-for-hire operator in Lagos, Nairobi, or Accra.
>
> Why? Because the daily remittance model — where the driver pays the owner a fixed daily fee and keeps the rest — doesn't exist in their world. Neither does the guarantor system. Or the need for cross-operator fraud signals because a fraudulent driver moves freely between unconnected companies.
>
> These products were built for corporate fleets in the US and Europe. They were not built for how transport works in Africa.
>
> 10+ million commercial vehicles across Nigeria, Ghana, Kenya, and South Africa. Software penetration in the vehicle-for-hire segment: estimated under 5%.
>
> That's the market we're building for.

---

### Post 3 — Behind the Build (Intelligence Plane)

> The hardest architectural decision we made at Mobiris wasn't about databases or microservices.
>
> It was: how do you share fraud signals across competing operators without giving anyone access to another company's records?
>
> The answer: you never share records. You share scores.
>
> Every verified driver on the platform joins a canonical person graph. When a driver applies at a new company, we check: does this person have risk signals on the graph? We return a risk score, not a record. The operator knows there's a flag; they don't know which company flagged it or why.
>
> This is the intelligence plane. It's the one part of Mobiris that individual operators cannot replicate — because the value comes from network effects across operators, not from any single operator's data.
>
> And it only works because we designed the data boundaries correctly from day one. No cross-tenant foreign keys. No shared schemas. Embeddings only — no raw biometric images.
>
> Early architectural decisions are the ones you pay for or profit from for years.

---

### Post 4 — Operator Education (Driver Verification)

> A driver walks into your depot looking for work.
>
> You ask for their licence. They show you a laminated card.
> You ask for a guarantor. They give you a phone number.
> You take a photocopy of their ID. It goes in a folder.
>
> That folder is your only record that this driver exists. If they drive off with your vehicle next month, that folder is what you hand to the police.
>
> This is how driver onboarding works for most fleet operators in Nigeria today.
>
> What it should look like:
> 1. Biometric liveness selfie — confirms they are who they claim to be, right now
> 2. NIN/BVN cross-check — government record matches the person standing in front of you
> 3. Guarantor OTP verification — the guarantor verifies themselves separately, not through the driver
> 4. Documents uploaded, stored, version-tracked
>
> The driver does most of this from their phone via a self-service link. You review and approve from your dashboard.
>
> The difference between "folder in a filing cabinet" and "verified record with audit trail" is the difference between hoping for the best and actually managing risk.

---

### Post 5 — Market Insight (Identity Infrastructure)

> Nigeria now has 100M+ NIN enrollees. 60M+ BVN records. Both accessible via API.
>
> Ghana has issued 17M+ Ghana Cards with biometric data. Smile Identity and YouVerify can cross-check both.
>
> This matters for fleet operators because it means **biometric driver verification is now affordable and reliable** in a way it wasn't 5 years ago.
>
> A verification that required a physical NIMC office visit in 2019 now takes a 30-second selfie and a government ID number.
>
> The transport sector hasn't caught up to this yet. Most operators are still doing manual document checks — not because they don't want better, but because they don't know the infrastructure exists.
>
> We built Mobiris's driver verification on top of exactly this infrastructure. NIN, BVN, Ghana Card, Kenyan national ID — all in one onboarding flow.

---

### Post 6 — Product Update (Self-Service Verification)

> We shipped something that operators immediately asked for once they saw it: **driver self-service verification**.
>
> Old flow: operator collects documents manually, uploads them, waits for driver to come to the office.
>
> New flow:
> 1. Create a driver record (name, phone)
> 2. Send a self-service OTP link
> 3. Driver opens it on their Android — no app download
> 4. They complete: biometric selfie, ID number, guarantor details, document uploads
> 5. You see the results on your dashboard in real time
>
> For a fleet manager onboarding 10 new drivers at once, this replaces 10 individual document collection sessions.
>
> The interesting part: drivers prefer it too. No waiting at a depot. Done on their phone, on their time.

---

### Post 7 — Operator Education (The Guarantor Problem)

> Every Lagos fleet operator requires a guarantor for new drivers. It's industry standard.
>
> The guarantor is supposed to be financially liable if the driver absconds with the vehicle.
>
> In practice, here's how guarantor verification works at most companies:
> - Driver brings in someone they know
> - Operator takes their phone number and "an address"
> - Documents go in the folder
>
> If the driver disappears, the guarantor "address" turns out to be wrong, the phone is switched off, and there's nothing to chase.
>
> What guarantor verification should look like:
> - Guarantor receives a separate OTP link (not from the driver — from the platform)
> - They verify their own identity independently
> - Their documents are stored under their own record, linked to the driver but separately verified
> - If anything goes wrong, the guarantor record stands on its own
>
> The key word is "separately." A guarantor who verifies themselves, with their own biometrics and ID, is a real accountability layer. A name in a folder is not.

---

### Post 8 — Customer Story (Template — Populate With Real Operator)

> [Operator name / anonymised: "A 45-vehicle operator in Lagos"] came to us after losing ₦[X] to a driver remittance dispute that went unresolved for three months.
>
> There was no record of whether the money was paid. The driver said yes. The manager said no. With no audit trail, no one could prove anything.
>
> [Six / Eight] weeks after going live on Mobiris:
> - Every daily remittance entry is timestamped and confirmed or disputed on the day
> - Three disputes have been resolved in under 24 hours using the transaction log
> - Driver onboarding went from 3–5 days of document chasing to under 24 hours via self-service links
>
> "I can see everything from my phone now. Before, I had to be at the depot to know what was happening." — [Fleet Manager Name or role]

---

## Content Calendar Template (Weekly)

| Day | Post | Pillar |
|---|---|---|
| Monday | Operator education (a specific pain point, solved) | Education |
| Wednesday | Market insight or behind-the-build | Authority |
| Friday | Product update or customer story | Conversion |

---

## Engagement Rules

- Reply to every comment within 4 hours during business hours
- Engage on posts from NURTW, GPRTU, MOAK accounts and transport industry leaders
- When a fleet manager comments, DM them within 24 hours with a personal note
- Do not auto-like or use engagement pods — the audience is small and savvy
- Never engage-bait ("comment YES if you agree") — it signals inauthenticity

---

## LinkedIn vs WhatsApp Strategy

LinkedIn builds awareness and credibility with buyers who are doing research. WhatsApp is where the actual conversion conversation happens. The goal of LinkedIn posts is not to close deals — it's to earn the right to be in someone's WhatsApp contacts.

End posts (especially educational ones) with an implicit or explicit invitation: "We built a tool for this. DM me or message us on WhatsApp if you want to see it."
