# ADR-005: Country Abstraction

## Status

Accepted

## Context

Mobility OS is designed as a multi-country SaaS platform. Country-specific requirements exist across:
- identity verification
- documents
- provider integrations
- compliance sequencing
- enrichment rules
- billing and operational behavior

A recurring design risk is to implement the first supported country as if its rules were globally true. That creates hidden platform coupling and makes future country rollout expensive and error-prone.

Nigeria is an example of this risk:
- supported identifiers may include `NIN` and/or `BVN`
- liveness must happen before provider lookup
- configured providers may return verified identity attributes that enrich canonical person records

These rules are valid for Nigeria, but must not become hardcoded global assumptions.

## Decision

Country-specific behavior must be modeled through country abstraction and configuration, not hardcoded as platform-wide rules.

Specifically:
- country support is represented by country profiles
- identifier labels such as `NIN` and `BVN` are mapped onto generic platform identifier types
- provider sequencing rules, including liveness-before-lookup requirements, belong to country config
- liveness vendor selection and lookup vendor selection are separate configuration concerns
- provider priority and fallback rules also belong to country config
- provider enrichment rules belong to country config and intelligence workflows
- canonical person enrichment remains in the intelligence plane
- tenant driver profiles remain tenant-specific operational records

## Consequences

### Positive

- adding new countries does not require rewriting core identity logic
- Nigeria can be supported without making Nigeria the global default
- intelligence workflows remain reusable across jurisdictions
- canonical person enrichment stays separated from tenant operations data
- provider-specific behavior can vary by country and configuration

### Negative

- country rollout requires more upfront modeling discipline
- provider integrations need normalization layers
- provider fallback must distinguish technical failure from true identity mismatch
- teams must resist shortcutting through hardcoded country branches in core modules

### Neutral

- some countries may share the same underlying generic identifier types while exposing different labels and provider rules
- rollout can still be phased country by country, but through config and profile enablement

## Rules

1. Core modules must not switch on `countryCode` for business logic that belongs in config.
2. Country-specific labels must not replace generic identifier abstractions in shared domain contracts.
3. Country provider responses may enrich canonical persons, not tenant driver records.
4. Required pre-check order, such as liveness before lookup, must be country-driven.
5. Tenants may operate in multiple countries, so country assumptions cannot be bound to the whole platform.
6. Multiple providers for one country must be orchestrated through normalized adapters and ordered fallback, not provider-specific branching in core matching logic.
7. Structured provider-routing configuration belongs to control-plane governed settings, not feature flags.
8. Provider adapters may reach different maturity levels over time; a provider may exist as a configured adapter slot before its live server-side transport is implemented, as long as the orchestration contract remains stable.

## Related Docs

- [Nigeria Country Profile](../country-profiles/nigeria.md)
- [Identity Resolution](../intelligence/identity-resolution.md)
- [Person Graph](../intelligence/person-graph.md)
- [ADR-008: Global Person Graph](./ADR-008-global-person-graph.md)
