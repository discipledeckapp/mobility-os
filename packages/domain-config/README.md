# domain-config

Shared configuration package providing the static domain data that drives business rules across Mobility OS. This is structured data (JSON/TypeScript), not runtime config.

## What's In Here

```
domain-config/
  business-models/     — supported transport business model types and their rules
  countries/           — country-specific config (currency, document types, phone format, etc.)
  document-types/      — platform document type registry referenced by country profiles
  status-codes/        — canonical status code definitions for vehicles, drivers, assignments, and remittance
  vehicle-types/       — vehicle category and type definitions
```

## Key Exports

| Export | Description |
|---|---|
| `COUNTRIES` | Map of ISO country codes to country config objects |
| `getCountryConfig(countryCode)` | Returns country config or throws if not supported |
| `getSupportedCountryCodes()` | Returns all registered country codes |
| `isCountrySupported(countryCode)` | Returns whether a country is configured |
| `DOCUMENT_TYPES` | Map of document type slugs to definitions |
| `getDocumentType(slug)` | Returns one document type definition |
| `getDocumentTypesByScope(scope)` | Returns document types for a given scope |
| `getRequiredDocuments(requiredSlugs)` | Resolves required document slugs to document definitions |
| `VEHICLE_TYPES` | All supported vehicle type definitions |
| `DRIVER_STATUS_CODES` / `VEHICLE_STATUS_CODES` / `ASSIGNMENT_STATUS_CODES` / `REMITTANCE_STATUS_CODES` | Canonical status-code registries |
| `BUSINESS_MODELS` | Supported fleet business models (hire-purchase, lease, owner-operator) |

## Country Config Shape

```typescript
interface CountryConfig {
  code: string;           // ISO 3166-1 alpha-2
  name: string;
  currency: string;       // ISO 4217
  currencyMinorUnit: number;
  phonePrefix: string;    // E.164 prefix
  defaultTimezone: string;
  supportedIdentifierTypes: SupportedIdentifierType[];
  requiredDriverDocumentSlugs: string[];
  requiredVehicleDocumentSlugs: string[];
}
```

## Design Rules

1. This package contains **no runtime logic** — only static data structures and typed lookup functions
2. All country configs must include currency and timezone — these are required for billing and scheduling
3. Country-specific behavior must stay config-driven; core modules should not switch on country code
4. Changes to this package must be reviewed against all consumers (country config is used by billing, documents, intelligence, and remittance modules)

## Installation

```json
{
  "dependencies": {
    "@mobility-os/domain-config": "workspace:*"
  }
}
```

## Related Docs

- [Enterprise Expansion Model](../../docs/platform/enterprise-expansion-model.md)
- [ADR-010: Tenant Business Hierarchy](../../docs/decisions/ADR-010-tenant-business-hierarchy.md)
