# Google Play Data Safety Preparation

Last updated: 2026-03-27

Official reference:
- Provide information for Google Play's Data safety section: https://support.google.com/googleplay/android-developer/answer/10787469?hl=en-EN

## Form-level answers

- Does the app collect or share user data?
  - Yes.
- Is all user data encrypted in transit?
  - Yes.
- Does the app provide a way for users to request deletion of their data?
  - Yes. Authenticated privacy/data-rights requests are available in settings.
- Does the app use data for tracking?
  - No.

## Data types to declare

| Google Play category | Mobility OS examples | Required | Shared | Primary purposes |
| --- | --- | --- | --- | --- |
| Personal info: Name | account/profile names, verified identity names | Yes | Service providers only | App functionality, fraud prevention, account management |
| Personal info: Email address | login, invites, support routing | Yes | Service providers only | App functionality, account management |
| Personal info: Phone number | onboarding, contact, support | Optional in some flows | Service providers only | App functionality, fraud prevention |
| Personal info: Address | provider-returned identity address when available | Optional | Service providers only | Fraud prevention, app functionality |
| Personal info: User IDs | tenant user IDs, linked driver access IDs | Yes | No external sharing except processors acting on our behalf | App functionality |
| Photos and videos | selfie verification, provider image, document uploads | Optional but required for verification/document flows | Service providers only | App functionality, fraud prevention |
| Financial info: Other financial info | remittance amounts, billing posture, wallet balances | Optional by workflow | No external sharing except processors acting on our behalf | App functionality |
| App info and performance: Diagnostics | operational error logs with redaction | Optional | No | Fraud prevention, app functionality |

## Notes for console submission

- Treat processor traffic to identity and payment providers as collection by the app for the disclosed purposes.
- Do not declare microphone, contacts, precise location, or advertising IDs unless later added to the shipped app.
- If a future build adds crash-reporting or analytics SDKs, update this disclosure before release.
