# DungeonScribe

## Current State
The app has a custom spell library in Settings (Custom Spells tab) where users can create spells with a school field. The school field in both the spell form (Settings) and SpellsTab currently uses a hardcoded list of 8 standard D&D schools (Abjuration, Conjuration, etc.).

## Requested Changes (Diff)

### Add
- `CustomSpellSchool` type in backend: `{ name: Text; owner: Principal }`
- Full owner-scoped CRUD for custom spell schools: `addCustomSpellSchool`, `getAllCustomSpellSchools`, `updateCustomSpellSchool`, `deleteCustomSpellSchool`
- New "Custom Schools" tab in Settings page (alongside Custom Spells, Items, etc.)
- School form: just a name field, same pattern as other custom libraries

### Modify
- School dropdown in the spell form (both in SettingsPage and SpellsTab) to load and combine standard D&D schools + user's custom schools
- `load()` in SettingsPage to also fetch custom schools

### Remove
- Nothing removed

## Implementation Plan
1. Add `CustomSpellSchool` type and CRUD to `src/backend/main.mo`
2. Update `src/frontend/src/backend.d.ts` with new types and methods
3. Update `src/frontend/src/types.ts` with `CustomSpellSchool` type
4. Update `SettingsPage.tsx`: add `schools` section, state, CRUD handlers, and pass combined schools to spell form
5. Update `SpellsTab.tsx`: fetch custom schools and combine with standard schools for the spell form dropdown
