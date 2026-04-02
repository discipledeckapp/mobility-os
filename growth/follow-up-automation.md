# Follow-Up Automation System

## 1. Base Cadence

- Day 1: initial message
- Day 3: short follow-up
- Day 7: value follow-up
- Day 14: final ping

## 2. Sequence Templates

### Day 1: Initial

Goal:

- show relevance
- name a likely pain
- open a low-friction conversation

### Day 3: Follow-up

Goal:

- bump lightly
- avoid guilt language
- restate the core pain in one sentence

Example:

```text
Hi [First Name], following up in case this got buried.

The reason I reached out is that many [ICP] teams hit a visibility gap around driver accountability, vehicle handover, or remittance tracking long before they think they need a system.

If that is on your radar, happy to share a simple workflow.
```

### Day 7: Value Follow-up

Goal:

- give something useful
- sound generous, not pushy

Examples of value asset:

- short checklist
- one-page workflow
- short article
- a practical question relevant to their operation

Example:

```text
Hi [First Name], sending one useful thing instead of another nudge.

We put together a simple checklist for spotting where fleet accountability starts to break:
- weak driver records
- unclear vehicle handovers
- scattered payment follow-up

If useful, I can send it over here.
```

### Day 14: Final ping

Goal:

- close the loop respectfully
- leave the door open

Example:

```text
Hi [First Name], I’ll close the loop after this.

I reached out because Mobiris is built around a problem many operators face once growth makes driver, vehicle, and repayment visibility harder to manage.

If that becomes a priority later, happy to reconnect.
```

## 3. When to Stop

Stop if:

- the lead says no clearly
- the lead asks not to be contacted
- the lead is clearly not the right person and no referral is offered
- 4 touches are completed with no engagement

Continue if:

- the lead replied positively
- the lead asked for timing later
- the lead clicked or requested the value asset
- the lead moved into a real sales conversation

## 4. Google Sheets Tracking Logic

Use these fields:

- `sequence_stage`
- `last_contact_date`
- `next_follow_up_date`
- `reply_status`
- `continue_sequence`

Logic:

- if no reply after Day 1, schedule Day 3
- if no reply after Day 3, schedule Day 7
- if no reply after Day 7, schedule Day 14
- if no reply after Day 14, mark `completed`
- if positive reply at any stage, mark `paused` and move to human follow-up

## 5. Value Follow-Up Ideas by ICP

### Transport operators

- `5 places assignment control usually breaks in a growing fleet`

### Delivery/logistics fleets

- `A simple driver-to-vehicle accountability checklist for busy dispatch teams`

### Asset finance / hire purchase

- `Where repayment visibility usually breaks before collections notice`

### Corporate fleets

- `How to tighten vehicle accountability without adding heavy admin`

## 6. Codex Prompt

```text
Generate the next follow-up for a Mobiris prospect.

Inputs:
- ICP:
- channel:
- day in sequence:
- previous message:
- whether the lead engaged:
- known pain:
- any asset already shared:

Return:
1. the next message
2. why it fits this stage
3. whether to continue, pause, or stop after it

Keep it human, brief, and non-robotic.
```
