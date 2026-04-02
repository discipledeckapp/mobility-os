# Smart Outreach System

## 1. Daily Target

- 20 high-quality personalized messages per day
- no bulk spam
- one strong angle per lead

## 2. Outreach Structure

Every message should contain:

1. Hook
2. Insight
3. Offer
4. Soft CTA

## 3. Inputs Codex Should Expect

- `role_title`
- `company_name`
- `segment_icp`
- `linkedin_summary`
- `website_copy`
- `public_post_snippets`
- `pain_hypothesis`
- `proof_point_to_reference`
- `channel`

## 4. ICP Templates

### Transport operators

Hook:

- reference route scale, fleet growth, or passenger operations

Insight:

- assignment and remittance disputes usually get worse as vehicles and drivers grow

Offer:

- Mobiris helps operators know who their drivers are, structure assignments, and keep clearer visibility on obligations

Soft CTA:

- `Open to a quick chat on how you currently track this?`

Example email:

```text
Subject: Quick question about driver and vehicle control at [Company]

Hi [First Name],

I came across [Company] and saw you operate in [transport / staff transport / passenger fleet].

A pattern we keep seeing is that as fleet activity grows, the hard part is not just dispatch. It becomes knowing exactly which driver had which vehicle, what has been remitted, and where accountability starts to get blurry.

Mobiris helps operators bring structure to driver records, vehicle assignment, and remittance visibility without adding a heavy process.

If useful, I can share a very short walkthrough or compare notes on how your team handles it today.
```

### Delivery / logistics fleets

Example LinkedIn DM:

```text
Hi [First Name], I had a look at [Company]. For delivery fleets, one issue that often hides in plain sight is weak driver-to-vehicle accountability once operations get busy.

Mobiris is built to help operators tighten driver records, assignments, and obligation tracking so issues are easier to trace early.

Happy to share a quick example if relevant.
```

### Asset financing / hire-purchase

Example email:

```text
Subject: Visibility gap in vehicle repayment operations

Hi [First Name],

I looked through [Company] and it seems you work around vehicle finance / hire-purchase.

A lot of losses in that model do not start with collections. They start earlier with weak visibility around driver identity, guarantor confidence, assignment records, and repayment tracking.

Mobiris helps teams keep cleaner operational records around those moving parts, so follow-up and recovery are based on structure rather than scattered notes.

Would it be useful if I sent a short breakdown of the workflow we are seeing work best?
```

### Corporate fleets

Example WhatsApp-style message:

```text
Hi [First Name], I work on Mobiris. We help fleet teams tighten driver verification, vehicle assignment, and accountability records.

Reaching out because corporate fleets often hit a point where vehicle control starts depending too much on memory, chats, and spreadsheets.

If that is something your team is trying to improve, happy to share a simple workflow.
```

## 5. Personalization Prompt

```text
You are writing one personalized outreach message for Mobiris Fleet OS.

Goal:
- sound observant, not salesy
- show you understand the likely operational pain
- make the CTA easy to accept

Input:
- role/title: [TITLE]
- company: [COMPANY]
- segment: [SEGMENT]
- public profile summary: [TEXT]
- website/about page copy: [TEXT]
- post snippets: [TEXT]
- pain hypothesis: [TEXT]
- channel: [EMAIL / LINKEDIN / WHATSAPP / X]

Return:
1. the best hook
2. one-sentence insight
3. one message tailored to the channel
4. a soft CTA

Do not flatter excessively. Do not sound like an automation bot.
```

## 6. Outreach Quality Checklist

- mentions something real
- speaks to likely pain, not generic growth
- keeps message under 120 words for DM
- has only one CTA
- does not oversell
- avoids “we help businesses streamline”
