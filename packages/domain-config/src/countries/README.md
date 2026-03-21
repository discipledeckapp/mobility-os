# Country Profiles

Each file in this folder is a pure data profile keyed by ISO 3166-1 alpha-2 code.

Rules:
- add a new `<cc>.ts` file exporting a `CountryConfig`
- register it in [`index.ts`](./index.ts)
- keep business logic out of the profile file
- put phone, locale, currency, required documents, and identifier support here
- any country-specific onboarding or verification flow must read from this registry

Current profiles:
- `GH` Ghana
- `KE` Kenya
- `NG` Nigeria
- `ZA` South Africa
