# API Intelligence

NestJS backend service providing the canonical person graph, identity resolution, biometric uniqueness enforcement, fraud signals, and risk scoring APIs.

## Responsibilities

Backend services for:
- Canonical person graph — platform-wide person records independent of tenant boundaries
- Biometric uniqueness — face and fingerprint deduplication across all tenants
- Identity matching — resolving whether multiple records refer to the same real-world person
- Fraud signals — watchlist management and fraud indicator ingestion
- Risk scoring — global person risk score computation and exposure

## Implementation Status

Currently implemented in this app:
- `persons`
- `identifiers`
- `biometrics`
- `risk`

Planned next modules within the existing intelligence boundary:
- `matching`
- `review-cases`
- `watchlists`

## Tech Stack

- Runtime: Node.js (NestJS)
- Database: PostgreSQL (schema prefix `intel_*`)
- ORM: Prisma
- Vector similarity: pgvector (for biometric embedding search)
- Auth: JWT (tenant calls via scoped API key; platform admin via staff JWT)

## Module Structure

```
src/
  auth/
  biometrics/      — embedding storage, quality gating, deduplication
  config/
  database/
  identifiers/     — government ID normalisation and conflict detection
  persons/         — canonical person CRUD and presence tracking
  risk/            — risk score computation and exposure

planned:
  matching/        — identity resolution engine and confidence scoring
  review-cases/    — manual adjudication queue for ambiguous matches
  watchlists/      — watchlist and fraud signal management
```

## Getting Started

```bash
# Install dependencies (from repo root)
pnpm install

# Run in development
pnpm --filter api-intelligence dev

# Run tests
pnpm --filter api-intelligence test
```

## Environment Variables

Key variables:
- `DATABASE_URL` — PostgreSQL connection string (must include pgvector extension)
- `JWT_SECRET` — Platform JWT signing secret
- `BIOMETRIC_ENCRYPTION_KEY` — AES-256 key for embedding encryption at rest
- `PORT` — Default `3002`

## Access Policy

- Tenant calls: scoped API key with `intelligence:read` scope; returns only risk signals, never raw cross-tenant data
- Platform admin calls: `PLATFORM_ADMIN` role; full access for review case management
- Direct DB access to `intel_*` tables is restricted to this service process only

## Related Docs

- [Person Graph](../../docs/intelligence/person-graph.md)
- [Identity Resolution](../../docs/intelligence/identity-resolution.md)
- [Biometric Uniqueness](../../docs/intelligence/biometric-uniqueness.md)
- [Privacy & Data Governance](../../docs/intelligence/privacy-and-data-governance.md)
- [ADR-008: Global Person Graph](../../docs/decisions/ADR-008-global-person-graph.md)
