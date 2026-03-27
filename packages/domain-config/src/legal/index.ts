export const LEGAL_DOCUMENT_VERSIONS = {
  privacy: '2026-03-27',
  terms: '2026-03-27',
} as const;

export type LegalDocumentKind = keyof typeof LEGAL_DOCUMENT_VERSIONS;

export const CONSENT_SCOPES = {
  general_app_usage: 'general_app_usage',
  sensitive_identity_verification: 'sensitive_identity_verification',
} as const;

export type ConsentScope = (typeof CONSENT_SCOPES)[keyof typeof CONSENT_SCOPES];

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDocumentDefinition {
  title: string;
  version: string;
  summary: string;
  sections: LegalSection[];
}

export const LEGAL_DOCUMENTS: Record<LegalDocumentKind, LegalDocumentDefinition> = {
  privacy: {
    title: 'Mobiris Privacy Policy',
    version: LEGAL_DOCUMENT_VERSIONS.privacy,
    summary:
      'This policy explains how Mobility OS and Mobiris collect, use, share, retain, and protect personal data, including sensitive identity and biometric data used for verification and fraud prevention.',
    sections: [
      {
        heading: '1. Who we are',
        body: [
          'Mobiris operates Mobility OS as a multi-tenant mobility operations platform for driver onboarding, verification, fleet operations, guarantor management, payments, and risk governance.',
          'Mobiris acts as a platform provider and processor or controller depending on the workflow and applicable law. Tenant organisations using Mobility OS may separately act as controllers for their own operational records.',
          'For data requests or privacy questions, contact support@mobiris.ng unless a different privacy contact is shown in your organisation onboarding flow.',
        ],
      },
      {
        heading: '2. Data we collect',
        body: [
          'We collect account and contact data such as name, email address, phone number, organisation, role, and login credentials.',
          'For identity verification, we may collect government identity references, identity numbers or masked references, date of birth, gender, verification status, liveness/selfie images, provider-returned identity images, and provider-backed identity attributes.',
          'For operations, we may collect driver, guarantor, vehicle, assignment, remittance, wallet, and document records needed for tenancy and mobility workflows.',
          'We also collect platform security and audit data such as device/session events, consent records, permissions, and administrative audit trails.',
        ],
      },
      {
        heading: '3. Sensitive personal data and biometrics',
        body: [
          'Identity verification in Mobility OS may involve biometric processing, including live selfie capture, liveness checks, face comparison, and government or provider-backed portrait matching. This is treated as sensitive personal data.',
          'We process biometric and government identity data only for verification, fraud prevention, compliance, dispute handling, safety, and platform risk governance.',
          'We do not expose raw biometric templates to tenant operators. Canonical biometric matching and person resolution remain inside the intelligence plane with restricted access controls.',
        ],
      },
      {
        heading: '4. Purposes of processing',
        body: [
          'We process personal data to create and secure accounts, onboard drivers and guarantors, complete identity verification, prevent fraud, manage fleet operations, process payments, maintain compliance, and support customer service.',
          'We may also use data to detect duplicate identities, assess risk, maintain watchlists, open review cases, and preserve legally required audit trails across the platform.',
          'Where required by law, we rely on explicit consent for sensitive verification processing. We may also rely on contractual necessity, legal obligations, legitimate interests in fraud prevention and platform security, and other lawful bases permitted by NDPR, GDPR, or local law.',
        ],
      },
      {
        heading: '5. Third-party processors and sharing',
        body: [
          'Mobiris may use third-party processors for identity verification, liveness, payments, cloud infrastructure, document storage, messaging, and email delivery. These may include identity providers such as Youverify or Smile Identity, payment processors such as Paystack or Flutterwave, cloud storage providers, and transactional email providers.',
          'We share only the data reasonably necessary for each processor to perform the requested service, and we require appropriate contractual and security protections.',
          'Tenant organisations do not receive cross-tenant identity graphs. Tenant users receive only tenant-safe derived signals such as verification status, risk band, or reverification-required flags where operationally necessary.',
        ],
      },
      {
        heading: '6. Cross-tenant identity linkage and risk governance',
        body: [
          'Mobility OS may link successfully verified humans to one canonical person record in the intelligence plane so that repeated fraud, duplicate identity attempts, unresolved defaults, or guarantor overexposure can be assessed safely across organisations.',
          'This canonical model is used for fraud prevention, platform integrity, and governance. It is not a public directory and is not exposed to tenants as a cross-tenant lookup.',
          'Only authorised platform staff in the control plane may access cross-tenant intelligence views for governance, compliance, review, and security purposes.',
        ],
      },
      {
        heading: '7. Retention and deletion',
        body: [
          'We retain operational, financial, verification, and audit records only for as long as necessary to provide the service, comply with law, resolve disputes, prevent fraud, and enforce platform safety controls.',
          'Sensitive verification materials are retained according to documented retention controls and may be deleted, anonymised, or restricted when no longer required for the original purpose, legal compliance, or fraud-prevention evidence.',
          'Where deletion cannot be immediate because of legal, audit, security, or dispute obligations, we will restrict processing and retain only what is necessary for those obligations.',
        ],
      },
      {
        heading: '8. Your rights',
        body: [
          'Subject to applicable law, you may request access to your personal data, correction of inaccurate data, deletion, restriction of processing, objection where applicable, portability where applicable, and withdrawal of consent for future sensitive processing.',
          'Where we process data on behalf of a tenant organisation, some requests may need to be routed through that organisation as controller of the operational workflow.',
          'You may submit requests through in-app support, account settings where available, or by contacting support@mobiris.ng.',
        ],
      },
      {
        heading: '9. Security',
        body: [
          'We use layered technical and organisational controls including HTTPS in transit, access controls, audit logging, guarded internal APIs, encrypted or restricted biometric artifacts, and controlled storage for documents and verification assets.',
          'We do not intentionally publish sensitive identity or document materials. Access is limited to authorised services and users with a legitimate operational or governance need.',
        ],
      },
      {
        heading: '10. International transfers and updates',
        body: [
          'Where data is processed outside your jurisdiction, we apply appropriate safeguards permitted by applicable law and our processor arrangements.',
          'We may update this policy from time to time. Material updates will carry a new version and may require renewed consent where legally required.',
        ],
      },
    ],
  },
  terms: {
    title: 'Mobiris Terms of Use',
    version: LEGAL_DOCUMENT_VERSIONS.terms,
    summary:
      'These terms govern access to Mobility OS, including self-service onboarding, verification, payments, operational use, and platform governance features.',
    sections: [
      {
        heading: '1. Acceptance of the terms',
        body: [
          'By using Mobility OS, creating an account, or continuing a verification or onboarding flow, you agree to these Terms of Use and the applicable Privacy Policy.',
          'If you are using Mobility OS on behalf of an organisation, you confirm that you are authorised to do so within that organisation’s workflow.',
        ],
      },
      {
        heading: '2. Service scope',
        body: [
          'Mobility OS supports tenancy, driver and guarantor onboarding, identity verification, risk governance, payments, document management, operational workflows, and related support surfaces.',
          'Some services rely on third-party processors and regulated identity or payment networks. Availability may vary by country, provider, tenant configuration, and legal requirements.',
        ],
      },
      {
        heading: '3. Account responsibilities',
        body: [
          'You are responsible for providing accurate information, protecting your sign-in credentials, and using the platform only for lawful and authorised purposes.',
          'You must not impersonate another person, submit another person’s biometrics or identity number, or attempt to bypass liveness, verification, billing, or security controls.',
        ],
      },
      {
        heading: '4. Identity verification and non-refundable checks',
        body: [
          'Where identity verification is required, you may be asked to provide a government identity number, consent, and a live selfie for liveness and facial matching.',
          'If the verification fee applies, that fee covers provider and platform verification processing. Unless required by law or platform error, failed verification caused by wrong identity details, failed liveness, or submission of another person’s face is non-refundable.',
          'Mobiris and the tenant organisation may pause, reject, escalate, or require reverification where verification cannot be safely completed or where a mismatch, review case, or fraud signal exists.',
        ],
      },
      {
        heading: '5. Payments and wallets',
        body: [
          'Payments made through Mobility OS must use authorised payment channels and are subject to the tenant’s configured payer model, provider rules, and applicable law.',
          'A successful payment does not automatically guarantee successful verification, activation, or operational readiness where additional checks remain outstanding.',
        ],
      },
      {
        heading: '6. Documents and operational data',
        body: [
          'You may upload documents and operational information required for onboarding, compliance, assignment, remittance, or platform governance. You must only upload materials you are authorised to submit.',
          'Mobiris may reject, remove, or request replacement of documents that are invalid, unreadable, misleading, or non-compliant with the tenant’s requirements.',
        ],
      },
      {
        heading: '7. Suspensions and enforcement',
        body: [
          'Mobiris or the relevant tenant organisation may suspend, restrict, or terminate access where required for fraud prevention, unpaid obligations, policy violations, legal compliance, or platform safety.',
          'Cross-tenant identity, risk, and review findings may be considered in platform governance decisions, but tenant users will only see derived operational signals appropriate to their role.',
        ],
      },
      {
        heading: '8. Intellectual property and platform restrictions',
        body: [
          'The Mobility OS software, workflows, content, and platform marks remain the property of Mobiris or its licensors. You may not reverse engineer, scrape, misuse, or abuse the service.',
          'You may not use Mobility OS to conduct unlawful surveillance, discriminatory profiling, identity fraud, or unauthorised background screening.',
        ],
      },
      {
        heading: '9. Liability and service changes',
        body: [
          'To the extent permitted by law, Mobility OS is provided on an as-available basis. We do not guarantee uninterrupted availability of third-party identity, payment, or telecom services.',
          'Nothing in these terms excludes liability where exclusion is not permitted by law, including applicable consumer or data-protection rights.',
        ],
      },
      {
        heading: '10. Contact and updates',
        body: [
          'For support, legal notices, or questions about these terms, contact support@mobiris.ng unless a different contact is explicitly provided for your tenant or contract.',
          'We may update these terms from time to time. Updated terms will carry a new version and take effect as stated in the product or accompanying notice.',
        ],
      },
    ],
  },
};
