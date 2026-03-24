# Data Processing Agreement

**Between Growth Figures Limited (Mobiris) and [Customer Name]**

This Data Processing Agreement ("DPA") supplements the Terms of Service between Growth Figures Limited (RC1957484), trading as Mobiris ("Processor"), and the Customer named in the associated account ("Controller").

Effective on the date the Customer accepts the Terms of Service or signs this DPA, whichever is earlier.

> **Note:** This template DPA is for enterprise customers who require a formal agreement for NDPA 2023, POPIA, or other regulatory compliance. It should be reviewed by a solicitor before execution in any enterprise deal. For standard SME subscriptions, the Privacy Policy and Terms of Service are sufficient.

---

## 1. Definitions

Terms used in this DPA have the meanings given in the Terms of Service and Privacy Policy. Additionally:

- **Processing** means any operation performed on Personal Data, including collection, storage, use, disclosure, or deletion.
- **Data Subject** means any identified or identifiable natural person to whom Personal Data relates, including Drivers and Guarantors enrolled on the platform.
- **Applicable Data Protection Law** means the Nigeria Data Protection Act 2023 (NDPA), the Protection of Personal Information Act 2013 (POPIA, South Africa), the Data Protection Act 2019 (Kenya), the Data Protection Act 2012 (Ghana), and any other applicable data protection legislation in the jurisdictions where the Controller operates.
- **Sub-Processor** means any third party engaged by the Processor to carry out Processing activities on the Controller's behalf.
- **Security Incident** means any confirmed or reasonably suspected breach of security leading to accidental or unlawful destruction, loss, alteration, or unauthorised access to Personal Data.

---

## 2. Subject Matter and Duration

**Subject matter:** The Processor will process Personal Data on behalf of the Controller for the purpose of providing the Mobiris platform services as described in the Terms of Service.

**Duration:** This DPA is effective for the duration of the Terms of Service and for the post-termination data retention period specified in Section 6.6 of the Terms of Service.

---

## 3. Nature and Purpose of Processing

| Element | Detail |
|---|---|
| **Nature** | Collection, storage, retrieval, use, disclosure, and deletion of personal data in connection with fleet operations management |
| **Purpose** | Driver and Guarantor identity verification; fleet, vehicle, and assignment management; remittance tracking; cross-operator risk signal generation (Intelligence Plane) |
| **Categories of data subjects** | Drivers, Guarantors, and Authorised Users of the Controller |
| **Categories of personal data** | Identity data (name, phone, government ID), biometric embeddings, employment and remittance records, uploaded documents |
| **Special categories** | Biometric data (facial embeddings) — classified as sensitive personal data under NDPA 2023 |

---

## 4. Controller's Instructions

4.1 The Processor shall process Personal Data only on documented instructions from the Controller, which are set out in the Terms of Service and this DPA.

4.2 The Controller's use of the platform (including activating identity verification workflows, creating Driver records, and generating Intelligence Plane queries) constitutes documented processing instructions.

4.3 If the Processor is required by applicable law to process Personal Data in a manner other than instructed, it shall inform the Controller before processing, unless that law prohibits such notification.

4.4 The Controller warrants that it has obtained all necessary consents and has a lawful basis for all Personal Data submitted to the platform for processing, including the explicit consent of Drivers and Guarantors for biometric processing.

---

## 5. Processor's Obligations

The Processor shall:

(a) **Process only as instructed.** Process Personal Data only in accordance with the Controller's instructions, except where required by applicable law.

(b) **Confidentiality.** Ensure that persons authorised to process Personal Data are under appropriate confidentiality obligations.

(c) **Security.** Implement and maintain the technical and organisational security measures described in Annex A of this DPA.

(d) **Sub-processors.** Not engage Sub-processors without prior written authorisation from the Controller, except for the Sub-processors listed in Annex B (which the Controller authorises by accepting this DPA). The Processor shall impose equivalent data protection obligations on Sub-processors and remain liable for their acts.

(e) **Data subject rights.** Assist the Controller in responding to Data Subject rights requests (access, correction, deletion, portability, objection) to the extent technically feasible, within 5 business days of receiving a request from the Controller.

(f) **Data protection by design.** Implement data protection by design and by default, including storing only encrypted biometric embeddings (not raw images) and maintaining strict cross-tenant data isolation.

(g) **Security Incidents.** Notify the Controller without undue delay (and in any case within 48 hours) after becoming aware of a Security Incident affecting the Controller's Personal Data.

(h) **DPIAs.** Assist the Controller in conducting Data Protection Impact Assessments where required, including providing information about the platform's processing activities.

(i) **Return or deletion.** On termination of the DPA, delete or return Personal Data as directed by the Controller, subject to any retention obligations under applicable law.

(j) **Audit.** Make available to the Controller all information necessary to demonstrate compliance with this DPA and allow for and contribute to audits conducted by the Controller or an appointed auditor, with reasonable notice and at the Controller's cost.

---

## 6. Sub-Processors

6.1 The Controller provides general authorisation for the Processor to engage the Sub-processors listed in **Annex B**.

6.2 The Processor shall give the Controller at least 14 days' advance notice of any intended changes to the Sub-processor list (additions or replacements). The Controller may object to any new Sub-processor on reasonable data protection grounds within 14 days.

6.3 If the Controller objects and the Processor cannot provide the services without the Sub-processor, either party may terminate the relevant services on 30 days' notice.

---

## 7. International Transfers

7.1 Processing by AWS Rekognition and Microsoft Azure Face involves temporary transfer of biometric data outside Nigeria for liveness analysis. The result is returned to Nigerian-hosted infrastructure and the raw image is immediately discarded.

7.2 The Processor has entered into Standard Contractual Clauses (SCCs) with AWS and Microsoft to safeguard these transfers.

7.3 The Controller acknowledges and consents to these transfers as a necessary element of the biometric verification service.

---

## 8. Security Incident Notification

8.1 The Processor shall notify the Controller within **48 hours** of becoming aware of a Security Incident affecting the Controller's Personal Data.

8.2 The notification shall include: (a) a description of the nature of the incident; (b) the categories and approximate number of Data Subjects affected; (c) the categories and approximate volume of Personal Data affected; (d) likely consequences; and (e) measures taken or proposed to address the incident.

8.3 Notification by the Processor under this clause does not constitute an acknowledgement of fault or liability.

8.4 The Controller is responsible for notifying the relevant supervisory authority (NDPC, ODPC, etc.) and affected Data Subjects as required by applicable law, using the information provided by the Processor.

---

## 9. Deletion and Return of Data

9.1 On termination of the Terms of Service, the Processor shall (at the Controller's election) either return all Personal Data in machine-readable format or securely delete all Personal Data within 90 days of the termination date.

9.2 The Processor may retain Personal Data beyond this period only where required by applicable law, in which case it shall notify the Controller and process the retained data only for the legally required purpose.

9.3 The Processor shall provide a written certification of deletion upon request.

---

## 10. Liability

10.1 Each party's liability under this DPA is subject to the limitations and exclusions set out in the Terms of Service.

10.2 The Controller is liable for any damages resulting from processing instructions that violate applicable data protection law.

10.3 The Processor is liable for damages resulting from its failure to comply with this DPA or applicable data protection law.

---

## 11. Governing Law

This DPA is governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved in accordance with the dispute resolution clause in the Terms of Service.

---

## Annex A — Technical and Organisational Security Measures

| Measure | Implementation |
|---|---|
| Encryption in transit | TLS 1.2+ for all data transmission |
| Encryption at rest | AES-256 for biometric embeddings; database-level encryption for all stored data |
| Access controls | Role-based access control; least-privilege; separate JWT secrets per service plane |
| Biometric data isolation | Biometric embeddings stored in segregated Intelligence Plane schema; not accessible by Operators |
| Cross-tenant isolation | Separate Prisma schemas per plane; no cross-tenant foreign keys; enforced at application layer |
| Authentication | JWT with short-lived access tokens (15 minutes) + refresh tokens (30 days) |
| Secrets management | Environment variables and managed secrets; no hardcoded credentials |
| Infrastructure | Managed cloud hosting (Render); automated backups; RPO < 1 hour, RTO < 4 hours |
| Incident response | Security Incident notification procedure as per Section 8 of this DPA |
| Personnel | Confidentiality obligations for all personnel with data access |
| Sub-processor oversight | DPAs in place with all sub-processors listed in Annex B |

---

## Annex B — Authorised Sub-Processors

| Sub-Processor | Purpose | Location | Safeguard |
|---|---|---|---|
| Amazon Web Services (Rekognition) | Biometric liveness analysis | United States | Standard Contractual Clauses |
| Microsoft Azure (Face API) | Biometric liveness analysis | EU / US | Standard Contractual Clauses |
| YouVerify | Nigerian government ID verification (NIN, BVN, FRSC, LASG) | Nigeria | Data Processing Agreement |
| Smile Identity | Pan-African government ID verification (Ghana Card, Kenya ID, SA ID) | Pan-African | Data Processing Agreement |
| ZeptoMail (Zoho Corporation) | Transactional email delivery | India / USA | Data Processing Agreement |
| Render | Cloud infrastructure and database hosting | United States | Data Processing Agreement |
| Paystack | Payment processing | Nigeria | NDPA-compliant processor |
| Flutterwave | Payment processing | Nigeria | NDPA-compliant processor |

---

## Signature Block

**Controller:**
Company Name: ___________________________
Authorised Signatory: ___________________________
Title: ___________________________
Date: ___________________________
Signature: ___________________________

**Processor (Growth Figures Limited, trading as Mobiris):**
Authorised Signatory: Oluwaseyi Adelaju
Title: Founder
Date: ___________________________
Signature: ___________________________

---

*This DPA template should be reviewed by a qualified solicitor before use in any enterprise contract. This document is not legal advice.*
