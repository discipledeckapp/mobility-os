# Lead Intelligence Template

Use this template when Codex receives raw lead notes, copied profile text, website copy, or manually exported lead rows.

## 1. Lead Schema

### Identity

- `lead_id`
- `full_name`
- `first_name`
- `last_name`
- `role_title`
- `role_seniority`
- `email`
- `phone_or_whatsapp`
- `linkedin_url`
- `x_url`
- `source_url`

### Company

- `company_name`
- `company_url`
- `company_type`
- `segment_icp`
- `country`
- `city_or_region`
- `estimated_fleet_size`
- `business_model`

### Lead Qualification

- `primary_problem_area`
- `secondary_problem_area`
- `pain_signals`
- `trigger_event`
- `current_process_guess`
- `urgency_level`
- `decision_power_estimate`
- `priority_score`
- `outreach_angle`
- `recommended_channel`

### Workflow

- `discovery_source`
- `owner`
- `status`
- `sequence_stage`
- `last_contact_date`
- `next_follow_up_date`
- `reply_status`
- `demo_status`
- `activation_status`

### Notes

- `public_profile_summary`
- `website_summary`
- `pain_hypothesis`
- `proof_points_to_reference`
- `objections_to_expect`
- `notes`

## 2. Priority Scoring Framework

Score each lead from 0 to 100.

### ICP fit: 0 to 25

- 25: exactly matches transport, logistics, hire-purchase, or fleet operator ICP
- 15: adjacent but still plausible
- 5: weak fit

### Pain intensity: 0 to 25

- 25: public signs of assignment, remittance, trust, repayment, or driver control pain
- 15: likely pain but not explicit
- 5: broad interest only

### Buying power: 0 to 20

- 20: owner, operations head, fleet manager, recovery head, finance lead
- 10: influential but not direct buyer
- 5: unclear power

### Timing signal: 0 to 15

- 15: hiring, expansion, new fleet push, financing push, operations complaints, growth update
- 8: stable but active
- 3: no visible timing signal

### Outreach clarity: 0 to 15

- 15: clear angle based on role, site, or post
- 8: moderate angle
- 3: weak angle

## 3. Priority Buckets

- `A` = 75 to 100: contact this week
- `B` = 55 to 74: enrich further, then contact
- `C` = 35 to 54: keep in nurture/content pool
- `D` = below 35: archive for now

## 4. Pain Signal Library

### Transport operators

- mentions safety, discipline, fraud, accountability, expansion, vehicle misuse
- posts about driver reliability or monitoring
- job posts for operations control, fleet admin, recovery, compliance

### Delivery/logistics fleets

- route visibility complaints
- driver performance issues
- handover chaos
- customer complaint patterns tied to drivers or late reconciliation

### Asset finance / hire purchase

- talks about vehicle recovery
- talks about collections or remittance
- talks about guarantor or verification controls
- markets financing but shows weak operational proof

### Corporate fleets

- mentions pool vehicles, field teams, compliance, audit, or misuse
- documents operational standardization initiatives

## 5. Google Sheets-Friendly Tabs

### `Leads_Master`

One row per lead.

### `Accounts`

One row per company.

### `Activities`

One row per message, call, follow-up, or content touch.

### `Content_Interactions`

One row per click, download, reply, form fill, or booked demo.

### `Insights`

Weekly summary of winning pain angles, objections, and conversion notes.

## 6. Enrichment Workflow

1. Paste raw lead input into Codex.
2. Ask Codex to classify ICP, estimate pain, and score priority.
3. Review the output manually.
4. Add verified fields to Google Sheets.
5. Tag with one primary outreach angle only.
6. Move A and B leads into outreach queue.

## 7. Codex Enrichment Prompt

```text
You are enriching lead intelligence for Mobiris Fleet OS.

Business context:
- Mobiris helps fleet operators know who their drivers are, assign vehicles with structure, track remittance/repayment obligations, and reduce losses from weak visibility.

Task:
Turn the raw lead information below into structured lead intelligence.

Return:
1. clean lead fields
2. ICP classification
3. likely pain signals
4. priority score out of 100 with short reason
5. best outreach angle
6. best first channel
7. one-sentence personalization note

Be practical. Do not invent precise facts that are not supported by the input.

Raw lead input:
[PASTE PROFILE / WEBSITE / NOTES HERE]
```

## 8. Pain-Based Notes Prompt

```text
Analyze this lead for operational pain signals relevant to Mobiris.

Focus on:
- driver trust and verification risk
- vehicle assignment control
- remittance or repayment visibility
- guarantor/accountability issues
- operational chaos caused by weak records

Return:
- top 3 likely pains
- why each pain is plausible
- one outreach angle that feels natural
- one question worth asking on a first call

Lead input:
[PASTE HERE]
```
