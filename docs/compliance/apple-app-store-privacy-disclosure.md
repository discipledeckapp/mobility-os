# Apple App Store Privacy Disclosure Preparation

Last updated: 2026-03-27

Official references:
- Apple App Store Review Guidelines: https://developer.apple.com/app-store/guidelines/
- Apple app privacy and data collection disclosures: https://developer.apple.com/app-store/app-privacy-details/

## Mobility OS mobile disclosure summary

### Data collected

| Apple category | Mobility OS examples | Linked to user | Tracking | Purpose |
| --- | --- | --- | --- | --- |
| Name | operator profile name, verified identity name | Yes | No | App functionality |
| Email Address | account email, support routing, invitations | Yes | No | App functionality |
| Phone Number | contact number, onboarding and support | Yes | No | App functionality |
| User ID | tenant user ID, canonical/self-service account linkage | Yes | No | App functionality |
| Photos or Videos | live selfie, provider portrait, uploaded documents | Yes | No | App functionality |
| Sensitive Info | biometric verification artifacts, government-backed identity attributes used for verification | Yes | No | App functionality |
| Financial Info | remittance and billing-related operational records shown in the app | Yes | No | App functionality |

### Permissions and justifications

- Camera:
  - Used for live selfie capture, liveness verification, and document capture.
  - Shown only in user-initiated onboarding or document workflows.
- Photos:
  - Used only for user-selected document upload.
- Microphone:
  - Not requested.

### Tracking

- `NSPrivacyTracking = false`
- No advertising SDK or hidden background tracking is declared.

### Review notes

- Verification consent is explicit and versioned before sensitive identity processing.
- Legal documents are accessible in-app and on the web.
- The app provides a data-deletion request path through authenticated settings.
