# DungeonScribe

## Current State
Full backend with characters, spells, inventory, traits, custom spells, custom items, races, classes. No abilities system exists yet.

## Requested Changes (Diff)

### Add
- `CustomAbility` type: name, description, abilityType (passive/active/reaction), uses (optional), rechargeOn, owner Principal
- `CharacterAbility` type: characterId, name, description, abilityType, uses, usesRemaining, rechargeOn
- Backend CRUD for custom ability library (owner-scoped, like custom spells)
- Backend CRUD for per-character abilities (like spells per character)
- Abilities tab on each character sheet: list character abilities, "Add from Library" button, manual add/edit/delete
- Custom Abilities section in Settings: global library CRUD

### Modify
- Nothing existing needs to change

### Remove
- Nothing

## Implementation Plan
1. Add CustomAbility and CharacterAbility types to backend
2. Add CRUD functions for both types
3. Regenerate backend.d.ts bindings
4. Add Abilities tab to character sheet UI
5. Add Custom Abilities section to Settings page
