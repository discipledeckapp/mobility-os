# Objection Handling

Common objections encountered in the Nigerian and broader African fleet operator market, with responses grounded in local context.

---

## Pricing Objections

### "It's too expensive."

**First move:** Don't defend — probe.

"Compared to what? What are you currently spending on fleet management?"

*Most operators are spending ₦0 on software. The real comparison is the cost of the current state, not a competing product.*

**Then anchor to the economics:**

"A 30-vehicle fleet collecting ₦10,000/vehicle/day in remittance brings in ₦300,000/day. If 10% of that goes untracked — a conservative estimate — that's ₦30,000/day or ₦900,000/month you can't account for.

Mobiris for 30 vehicles is about ₦50,000/month. You're asking if ₦50,000 is too expensive to recover ₦900,000."

**If they're genuinely at the wrong tier:** "The Starter plan is ₦15,000/month for up to 10 vehicles. Is the price the problem, or the plan?"

---

### "Can we get a discount?"

For SME operators: "We keep pricing simple to keep delivery fast. What's the blocker — is it the monthly amount, or do you need to see more value before committing?"

Offer a 14-day free trial before discounting. Most operators who experience the product convert without a price conversation.

For enterprise: "Enterprise plans are custom. What's your vehicle count and structure? Let's build pricing that reflects your actual usage."

**Do not discount the Growth plan for SMEs without a strategic reason.** Discounting sets a precedent that erodes margin and signals the price isn't anchored.

---

### "I'll pay when I see results."

"That's exactly what the 14-day free trial is for. You don't pay anything until you've decided it works. What would 'seeing results' look like for you — fewer remittance disputes? A driver verified without manual document collection? Tell me the metric and we'll show you how to hit it in the trial."

---

## Product Objections

### "We already have a system." / "We have GPS tracking."

"What does it handle? Does it track daily remittance per driver? Does it verify driver identity with biometrics? Does it flag a driver who defrauded another company?"

*GPS trackers track the vehicle — location, mileage, fuel consumption. They do not manage the driver-remittance relationship. These are different problems.*

"Mobiris and your GPS tracker can coexist. One tells you where the vehicle is; the other tells you who's driving it, whether they're verified, and whether they paid today."

---

### "My drivers don't have smartphones."

"The driver-facing mobile app requires a smartphone. But everything your fleet manager and operations team needs is on the web dashboard — accessible from any laptop or desktop.

For drivers without smartphones, document upload and remittance recording can be done by the fleet manager from the dashboard. The self-service OTP link works on any mobile browser — even a low-end Android. In our experience, most drivers have a phone that can handle it.

What's the mix in your fleet — how many drivers have Android vs feature phones?"

---

### "What about connectivity? My drivers work in areas with poor network."

"The mobile app is built offline-first. Actions taken without connectivity are queued and synced when the connection is restored. The web dashboard requires connectivity, but it's used by your fleet manager at the depot — not in the field.

We designed for this specifically because it's the reality of operating in Lagos traffic or outside city centers."

---

### "Can Mobiris do [feature we don't have yet]?"

Be direct. Look up whether it's on the roadmap before answering.

**If it's coming soon:** "That's on our roadmap. It's not live yet — would it block you from starting with what exists today? What's the workaround in the interim?"

**If it's not on the roadmap:** "That's not something we currently support. Tell me more about the workflow — if enough operators need it, we build it. We've shipped features based on operator requests before."

**Do not promise features you haven't committed to.** A customer who signs up expecting a feature that doesn't arrive churns loudly.

---

### "What happens if Mobiris goes down?"

"Our infrastructure targets 99.9% uptime. Our architecture has an RPO of under 1 hour and RTO of under 4 hours — meaning if something goes wrong, your data is safe and the system recovers in under 4 hours.

Enterprise customers get a formal SLA on this.

For context: what's your downtime risk with WhatsApp? If the Meta servers have an issue, your entire operations communication goes with it."

---

## Trust Objections

### "You're a small company. What if you shut down?"

"Understood. Here's what we commit to:

1. Your data is exportable at any time on request — you're never locked in
2. If we ever faced a shutdown scenario, we'd give 90 days notice and provide a full data export
3. We're building on a commercially sound model — subscription revenue, not venture-dependent burn

What would give you more confidence? I can walk you through our infrastructure and customer references if that helps."

---

### "We've heard about tech companies that promised things and didn't deliver."

This is a real concern in Nigeria specifically, where "promising tech" has disappointed SME operators before.

"I hear that. The best thing I can say is: don't take our word for it. Use the trial. You'll see the actual product working with your actual data. I'm not going to promise you features that aren't live. What's currently live, you can use today.

Can I set up a 30-minute demo so you can see exactly what's in the product right now — no slides, just the real thing?"

---

### "The data privacy issue worries me. My drivers won't want their biometrics stored."

"Important concern. Here's how we handle it:

1. We do not store raw biometric images — only encrypted mathematical embeddings that cannot be reverse-engineered into a face image
2. Every driver provides explicit consent before verification — the self-service flow captures consent digitally
3. Your driver records are isolated from every other operator's — only your team can access your drivers' data
4. We're compliant with Nigeria's NDPA (2023) — biometric data handling is our core architecture, not an afterthought

We can share our Privacy Policy and a Data Processing Agreement on request."

---

## Change Management Objections

### "My team won't adopt a new system."

"That's the most common real reason fleet software fails — not the product, the change.

Here's what we recommend: start with one fleet manager using the dashboard for 2 weeks before rolling it out to the full team. If that manager finds it valuable, they become the internal advocate.

The driver-facing self-service link has very high adoption in our experience because it requires minimal behaviour change — drivers just follow a WhatsApp link from their phone."

---

### "I don't have time to set this up."

"Setup for a 50-vehicle fleet takes under a day if we do it together. We walk you through:
1. Adding your vehicles (bulk import available)
2. Creating driver records (or sending self-service links)
3. Setting up your team users

After that, the daily workflow — recording remittance, creating assignments — takes less time than your current WhatsApp reconciliation.

When's a good time for a 90-minute onboarding session?"

---

### "I'll think about it." (The Soft No)

Don't push. Understand what's actually needed.

"Of course. What specifically would help you decide? Is there someone else who needs to be involved in the decision? Is it a budget question, a timing question, or do you need to see more of the product?"

Then: agree on a specific follow-up date. Send a follow-up within 24 hours with the one-pager and a direct link to the demo. If they haven't responded in 5 days, a single WhatsApp check-in is appropriate. After that, move on.

**Do not chase indefinitely.** An operator who doesn't buy after 3 touches is not a qualified lead at this time. They may come back after a fraud incident.

---

## Post-Objection Protocol

After resolving an objection:

1. **Check**: "Does that address what you were concerned about?"
2. **Advance**: "Based on that, is there anything else standing in the way of starting a trial?"
3. **Set next step with a date**: "Let's do a 30-minute demo on [day]. I'll send you a calendar link. Does morning or afternoon work better?"

The goal of every conversation is a specific next step with a specific time — not "I'll follow up soon."

---

## Related

- [Competitive Positioning](./competitive-positioning.md)
- [One-Pager](./one-pager.md)
- [Value Propositions](../messaging/value-propositions.md)
- [ICP](../go-to-market/icp.md)
