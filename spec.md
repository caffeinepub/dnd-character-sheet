# DungeonScribe - Physical Attacks Feature

## Current State
The app has:
- Custom Abilities system (global library + per-character tracking)
- Settings page with CRUD for Custom Spells, Items, Abilities, Races, Classes
- Character sheet with tabs: Stats, Spells, Inventory, Features, Notes, Items, Abilities
- Backend with owner-scoped custom content

## Requested Changes (Diff)

### Add
- `CustomPhysicalAttack` type in backend: name, description, damageDice, attackBonus, damageType, range, properties (owner-scoped)
- `CharacterPhysicalAttack` type: characterId, name, description, damageDice, attackBonus, damageType, range, properties, timesUsed
- Full CRUD backend functions for custom physical attacks (owner-scoped)
- Full CRUD backend functions for character physical attacks (character-scoped)
- "Physical Attacks" tab in Settings for managing the global library
- "Physical Attacks" tab in Character Sheet for per-character tracking with add-from-library

### Modify
- Settings page: add Physical Attacks library tab
- Character sheet: add Physical Attacks tab
- Types file: add new types for physical attacks

### Remove
- Nothing

## Implementation Plan
1. Add CustomPhysicalAttack and CharacterPhysicalAttack types + CRUD to backend
2. Update frontend types (DndBackend interface)
3. Add Physical Attacks tab to Settings (library CRUD)
4. Add Physical Attacks tab to Character Sheet (add from library, track usage)
