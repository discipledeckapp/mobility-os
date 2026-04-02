# Prompt Library

## 1. Raw Lead -> Structured Intelligence

```text
Turn this raw lead information into a structured Mobiris lead record.

Return:
- clean identity fields
- company fields
- ICP classification
- top pain signals
- priority score out of 100
- best outreach angle
- best channel
- short note for the CRM

Raw input:
[PASTE HERE]
```

## 2. Website Analysis Prompt

```text
Read this company website copy and identify what kind of fleet or transport operation this appears to be.

Return:
- company type
- likely fleet model
- likely operational pain points
- words or phrases worth referencing in outreach
- one angle Mobiris can credibly use

Website copy:
[PASTE HERE]
```

## 3. LinkedIn Profile Analysis Prompt

```text
Analyze this public LinkedIn-style profile summary for a Mobiris outreach campaign.

Return:
- role seniority
- likely responsibilities
- whether this person is a likely buyer, influencer, or low-fit contact
- top pain hypothesis
- one respectful outreach angle

Profile:
[PASTE HERE]
```

## 4. Outreach Personalization Prompt

```text
Write a personalized outreach message for Mobiris Fleet OS.

Rules:
- plain language
- no hype
- no generic startup lines
- show real understanding of likely pain

Inputs:
- channel: [EMAIL / LINKEDIN / WHATSAPP / X]
- name:
- role:
- company:
- segment:
- website summary:
- profile summary:
- post snippet:
- pain hypothesis:

Return:
- subject line if email
- final message
- one alternate CTA
```

## 5. Follow-Up Prompt

```text
Generate the next follow-up for this Mobiris prospect.

Inputs:
- ICP:
- channel:
- original message:
- previous follow-ups:
- reply status:
- known pain:
- current sequence stage:

Return:
- best next-step message
- why this follow-up fits now
- whether to continue or stop after this step
```

## 6. Article Prompt

```text
Write a Mobiris blog article using simple, operator-focused language.

Inputs:
- ICP:
- keyword:
- pain theme:
- CTA:

Return:
- title
- meta description
- outline
- full article
```

## 7. Repurposing Prompt

```text
Repurpose this Mobiris article into:
- one LinkedIn post
- one X thread
- one 30-second video script
- one landing-page section

Keep each version pain-focused and simple.

Article:
[PASTE HERE]
```

## 8. Weekly Learning Prompt

```text
Review this growth data and extract what Mobiris should learn.

Return:
- best-performing ICP
- best-performing message angle
- weak segments
- top objections
- content ideas created by this feedback
- prompt/template changes to make next week

Data:
[PASTE HERE]
```
