# DungeonScribe

## Current State
Frontend is fully built. Backend (`src/backend/main.mo`) is empty (`actor {}`), causing all pages to hang on loading because every API call fails.

## Requested Changes (Diff)

### Add
- Full Motoko backend implementation with all methods the frontend expects

### Modify
- `src/backend/main.mo` -- implement from empty actor to full actor

### Remove
- Nothing

## Implementation Plan
1. Implement stable storage for characters, spells, traits, inventory items, custom races, custom classes, and settings
2. Implement all CRUD methods: createCharacter, getAllCharacters, getCharacter, updateCharacter, deleteCharacter
3. Implement spell methods: addSpell, getSpellsByCharacter, updateSpell, deleteSpell
4. Implement trait methods: addTrait, getTraitsByCharacter, updateTrait, deleteTrait
5. Implement inventory methods: addItem, getItemsByCharacter, updateItem, deleteItem
6. Implement custom race/class methods: addRace, getAllRaces, updateRace, deleteRace, addClass, getAllClasses, updateClass, deleteClass
7. Implement settings: getSettings, updateSettings (maxLevel)
8. Implement user profile: getCallerUserProfile, saveCallerUserProfile, isCallerAdmin
