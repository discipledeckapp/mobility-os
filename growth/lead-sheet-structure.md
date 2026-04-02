# Google Sheets Lead Structure

## 1. Sheet Tabs

Create these tabs:

- `Leads_Master`
- `Accounts`
- `Activities`
- `Content_Log`
- `Weekly_Review`
- `Dropdowns`

## 2. `Leads_Master` Columns

Use this order so the sheet stays usable:

1. `lead_id`
2. `created_date`
3. `owner`
4. `full_name`
5. `role_title`
6. `company_name`
7. `segment_icp`
8. `company_url`
9. `source_url`
10. `source_platform`
11. `country`
12. `city_or_region`
13. `estimated_fleet_size`
14. `business_model`
15. `pain_signal_1`
16. `pain_signal_2`
17. `pain_signal_3`
18. `pain_hypothesis`
19. `priority_score`
20. `priority_bucket`
21. `outreach_angle`
22. `recommended_channel`
23. `status`
24. `sequence_stage`
25. `last_contact_date`
26. `next_follow_up_date`
27. `reply_status`
28. `positive_reply`
29. `demo_booked`
30. `signup_status`
31. `first_driver_added`
32. `first_driver_verified`
33. `first_assignment_created`
34. `notes`

## 3. Suggested Status Values

- `new`
- `enriched`
- `ready_for_outreach`
- `contacted`
- `follow_up_due`
- `replied`
- `qualified`
- `demo_booked`
- `won`
- `nurture`
- `closed_lost`

## 4. Sequence Stage Values

- `day_1_initial`
- `day_3_follow_up`
- `day_7_value_follow_up`
- `day_14_final_ping`
- `paused`
- `completed`

## 5. `Activities` Columns

1. `activity_id`
2. `lead_id`
3. `date`
4. `activity_type`
5. `channel`
6. `message_summary`
7. `outcome`
8. `next_step`
9. `next_step_date`
10. `notes`

## 6. `Accounts` Columns

1. `account_id`
2. `company_name`
3. `website`
4. `segment_icp`
5. `country`
6. `estimated_fleet_size`
7. `main_pain_theme`
8. `account_priority`
9. `notes`

## 7. Useful Google Sheets Formulas

### Follow-up due today

```text
=COUNTIF(Leads_Master!Y:Y,TODAY())
```

### Positive reply rate

```text
=IFERROR(COUNTIF(Leads_Master!AB:AB,TRUE)/COUNTIF(Leads_Master!W:W,"<>"),0)
```

### Demo booking rate

```text
=IFERROR(COUNTIF(Leads_Master!AC:AC,TRUE)/COUNTIF(Leads_Master!W:W,"<>"),0)
```

### Activation rate to first assignment

```text
=IFERROR(COUNTIF(Leads_Master!AF:AF,TRUE)/COUNTIF(Leads_Master!AD:AD,"signed_up"),0)
```

## 8. Sheet Workflow Rule

- Never overwrite history in the row notes.
- Log each message in `Activities`.
- Keep `Leads_Master` as the latest state view.
- Use conditional formatting for `next_follow_up_date <= TODAY()`.
