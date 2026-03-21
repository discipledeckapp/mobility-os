# DEPRECATED — apps/packages/

This directory is a legacy structure. All shared packages have been migrated to (or should be authored in) the canonical location:

```
/packages/
```

## Do not add new packages here

New shared packages must be created under `/packages/` at the monorepo root. Any package in this directory that has a counterpart in `/packages/` is superseded by the root version.

## Migration status

Packages listed here are pending migration to `/packages/`. Until migrated, they may still be consumed by apps, but they should not receive new features or structural changes — patches and bug fixes only.

See ADR-004 and the repo `CLAUDE.md` for the authoritative package location policy.
