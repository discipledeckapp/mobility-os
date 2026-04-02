# WordPress Usage Plan

## 1. Role of WordPress in the Engine

WordPress should be used for:

- blog publishing
- SEO content
- ICP landing pages
- campaign pages
- lead capture pages
- thank-you pages with next-step routing

WordPress should not be used for:

- storing outreach secrets in code
- tightly coupling content generation and privileged publishing workflows

## 2. Recommended Page Types

### Core pages

- Homepage
- Demo page
- Contact page
- Fleet Control Checklist page

### ICP landing pages

- `/transport-operators/`
- `/delivery-fleet-operations/`
- `/hire-purchase-fleet-control/`
- `/corporate-fleet-accountability/`

### Campaign pages

- `/reduce-driver-remittance-disputes/`
- `/know-who-has-the-vehicle/`
- `/fleet-driver-verification/`

### Conversion pages

- `/book-a-demo/`
- `/get-the-checklist/`
- `/thank-you/`

## 3. Blog Categories

- Driver Verification
- Vehicle Assignment
- Remittance and Repayment
- Hire Purchase Operations
- Fleet Controls
- Delivery Fleet Operations
- Corporate Fleet Accountability

## 4. CTA Strategy

Primary CTA:

- `Book a demo`

Secondary CTA:

- `Get the fleet control checklist`

Contextual CTA by topic:

- verification article -> `See how to structure driver records`
- remittance article -> `Get the remittance checklist`
- hire-purchase article -> `Talk to us about repayment visibility`

## 5. Lead Form Strategy

Keep forms short:

- first name
- last name
- work email
- phone or WhatsApp
- company
- fleet type
- fleet size range
- main problem

Optional hidden fields:

- source page
- campaign tag
- CTA type

## 6. Landing Page Structure

1. pain-first headline
2. short explanation
3. 3 to 5 operational pain bullets
4. how Mobiris helps
5. who it is for
6. proof or scenario example
7. form or demo CTA

## 7. Publishing Workflow

1. Draft article or landing-page copy in Markdown outside WordPress.
2. Review for clarity and factual tone.
3. Move approved copy into WordPress editor.
4. Add CTA block and form block.
5. Add UTM tags to external promotion links.
6. Log publish date in `Content_Log`.

## 8. Credential Handling Rule

If WordPress credentials are ever provided:

- store them in secure environment variables or password manager
- never commit them
- separate content generation from authenticated publishing

## 9. CTA Routing

- blog readers -> checklist or demo
- outbound prospects -> ICP landing page
- social traffic -> campaign page with one clear CTA
- high-intent finance ICP -> demo page first
