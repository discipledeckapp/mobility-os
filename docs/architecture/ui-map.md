# UI Map

## Tenant Web

Current live routes in `apps/tenant-web`:

- `/`
  - dashboard summary
- `/drivers`
  - live driver list, create flow, status actions, identity verification
- `/vehicles`
  - live vehicle list, create flow, status actions
- `/assignments`
  - live assignment list and lifecycle actions
- `/remittance`
  - live remittance list and lifecycle actions
- `/wallet`
  - read-only operational wallet balance and ledger view for the current business entity

## Navigation

- The tenant sidebar wallet link is now live
- Wallet is read-only in the current UI batch

## Shared UI

- Tenant-web continues to use `packages/ui`
- No CSS modules are required for the wallet page
