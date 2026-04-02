# Growth Engine Overview

## 1. System Goal

Build a repeatable engine that helps Mobiris:

- find the right fleet operators
- turn public pain signals into usable lead intelligence
- publish pain-driven content that attracts inbound interest
- send 20 high-quality personalized messages per day
- follow up consistently without sounding robotic
- learn from replies, demos, and activation behavior

## 2. Core ICPs

### Transport operators

- Bus operators
- Staff transport fleets
- Interstate and intracity passenger fleets
- School transport operators

Main pain signals:

- Poor driver accountability
- Weak assignment discipline
- Cash/remittance disputes
- Missing verification structure
- Vehicle loss or misuse due to weak controls

### Delivery and logistics fleets

- Courier businesses
- Last-mile delivery operators
- Dispatch fleets
- Route-based service fleets

Main pain signals:

- Driver identity risk
- Vehicle handover confusion
- Weak operational visibility
- Hard-to-track obligations and recoveries
- Difficulty proving who had what vehicle and when

### Asset financing / hire-purchase operators

- Vehicle finance businesses
- Rent-to-own operators
- Lease-to-own operators
- Informal fleet financiers moving into structured operations

Main pain signals:

- Weak repayment visibility
- Driver/guarantor trust problems
- No clean assignment-to-repayment record
- Manual reconciliation chaos
- Losses from poor follow-through and bad records

### Corporate fleet operators

- Companies with pool vehicles
- Field service fleets
- FMCG distributor fleets
- Enterprise transport units

Main pain signals:

- Weak vehicle accountability
- Poor driver allocation records
- Manual tracking and audit stress
- Operational blind spots across teams

## 3. Engine Architecture

### Part A: Lead discovery

Inputs:

- LinkedIn profiles manually copied/exported
- X profiles/posts manually gathered
- Company websites
- Public directories
- Public blog posts and public pages

Codex jobs:

- structure raw lead data
- classify by ICP
- identify pain signals
- score priority
- suggest outreach angle

Storage:

- Google Sheets master CRM

### Part B: Content engine

Inputs:

- ICP pain themes
- SEO keywords
- objection patterns from calls
- real examples from ops pain

Codex jobs:

- write article outlines
- write landing-page copy
- create LinkedIn posts and X threads
- turn long-form content into short-form variants

Publishing:

- WordPress blog
- WordPress landing pages
- social channels

### Part C: Smart outreach

Inputs:

- lead record
- website/about copy
- role/title
- public posts
- pain hypotheses

Codex jobs:

- generate 1 strong angle per lead
- draft channel-specific messages
- produce follow-up sequence

Execution:

- Gmail
- LinkedIn DM
- WhatsApp-style messages
- X DM where appropriate

### Part D: Follow-up automation

Inputs:

- last message sent
- lead stage
- reply status
- channel
- ICP

Codex jobs:

- suggest best next step
- rewrite follow-up naturally
- attach value asset or insight

Tracking:

- Google Sheets sequence columns

## 4. Daily Operating Loop

1. Source 20 to 40 raw leads manually.
2. Run Codex enrichment on the raw batch.
3. Add scored leads into the Google Sheet.
4. Select top 20 for personalized outreach.
5. Send initial messages manually.
6. Log responses and next-step stage.
7. Publish or repurpose one content asset.
8. End day with wins, objections, and new patterns captured.

## 5. Weekly Operating Loop

1. Review sourced, enriched, and contacted leads.
2. Review reply rate by ICP and message angle.
3. Review content traffic and CTA performance.
4. Review demos booked and activation quality.
5. Identify top 3 winning pain angles.
6. Drop weak channels or weak angles.
7. Update prompts, templates, and target lists.

## 6. Messaging Rule

Mobiris should sound like this:

- simple
- operational
- credible
- observant
- direct

Mobiris should not sound like this:

- vague SaaS hype
- “transform your business” fluff
- generic automation claims
- jargon-heavy enterprise positioning

Good message frame:

- You likely deal with X.
- That usually causes Y.
- Mobiris helps you control Z.
- If useful, I can show you how operators handle this with more structure.
