# DungeonScribe

## Current State
- Full backend exists with Characters, Spells, Traits, Inventory, Custom Races, Custom Classes, Custom Spells, Custom Items, Settings, and User Profiles
- Authorization uses role-based access control (`#user` / `#admin`) but new authenticated users are never granted `#user` role automatically, causing all API calls to fail with "Unauthorized"
- Generated bindings (`backend.ts`) are outdated -- missing `addCustomSpell`, `getAllCustomSpells`, `deleteCustomSpell`, `updateCustomSpell`, `addCustomItem`, `getAllCustomItems`, `deleteCustomItem`, `updateCustomItem`
- Frontend tabs and settings are stuck in loading state because backend calls fail

## Requested Changes (Diff)

### Add
- Nothing new; existing features need to work correctly

### Modify
- Fix authorization: user-level operations should verify caller is not anonymous (not require an assigned `#user` role), so any Internet Identity user can use the app immediately upon login
- Regenerate bindings to include all custom spell and item methods

### Remove
- Nothing

## Implementation Plan
1. Regenerate Motoko backend with same full feature set but using `not Principal.isAnonymous(caller)` for user-level auth checks and keeping access control only for admin operations
2. Update frontend to handle any auth errors gracefully (show error message rather than infinite loading)
