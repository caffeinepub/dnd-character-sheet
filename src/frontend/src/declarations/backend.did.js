/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

export const CustomClass = IDL.Record({
  'features' : IDL.Text, 'name' : IDL.Text, 'hitDie' : IDL.Nat,
  'description' : IDL.Text, 'proficiencies' : IDL.Text,
});
export const ClassId = IDL.Nat;
export const InventoryItem = IDL.Record({
  'weight' : IDL.Text, 'name' : IDL.Text, 'description' : IDL.Text,
  'equipped' : IDL.Bool, 'quantity' : IDL.Nat, 'characterId' : IDL.Nat,
});
export const InventoryItemId = IDL.Nat;
export const CustomRace = IDL.Record({
  'abilityBonuses' : IDL.Text, 'traits' : IDL.Text, 'name' : IDL.Text,
  'description' : IDL.Text, 'speed' : IDL.Nat,
});
export const RaceId = IDL.Nat;
export const Spell = IDL.Record({
  'duration' : IDL.Text, 'school' : IDL.Text, 'name' : IDL.Text,
  'damageEffect' : IDL.Text, 'components' : IDL.Text, 'description' : IDL.Text,
  'level' : IDL.Nat, 'characterId' : IDL.Nat, 'range' : IDL.Text, 'castingTime' : IDL.Text,
});
export const SpellId = IDL.Nat;
export const Trait = IDL.Record({
  'source' : IDL.Text, 'name' : IDL.Text, 'description' : IDL.Text, 'characterId' : IDL.Nat,
});
export const TraitId = IDL.Nat;
export const UserRole = IDL.Variant({ 'admin' : IDL.Null, 'user' : IDL.Null, 'guest' : IDL.Null });
export const SkillProficiencies = IDL.Record({
  'perception' : IDL.Bool, 'animalHandling' : IDL.Bool, 'nature' : IDL.Bool,
  'investigation' : IDL.Bool, 'deception' : IDL.Bool, 'sleightOfHand' : IDL.Bool,
  'acrobatics' : IDL.Bool, 'athletics' : IDL.Bool, 'history' : IDL.Bool,
  'persuasion' : IDL.Bool, 'medicine' : IDL.Bool, 'stealth' : IDL.Bool,
  'survival' : IDL.Bool, 'insight' : IDL.Bool, 'intimidation' : IDL.Bool,
  'performance' : IDL.Bool, 'arcana' : IDL.Bool, 'religion' : IDL.Bool,
});
export const Character = IDL.Record({
  'ac' : IDL.Nat, 'cha' : IDL.Nat, 'con' : IDL.Nat, 'dex' : IDL.Nat,
  'int' : IDL.Nat, 'str' : IDL.Nat, 'wis' : IDL.Nat, 'spellSlots' : IDL.Vec(IDL.Nat),
  'characterClass' : IDL.Text, 'background' : IDL.Text, 'hpMax' : IDL.Nat,
  'owner' : IDL.Principal, 'gold' : IDL.Nat, 'name' : IDL.Text, 'race' : IDL.Text,
  'hpCurrent' : IDL.Nat, 'level' : IDL.Nat, 'speed' : IDL.Nat, 'gender' : IDL.Text,
  'notes' : IDL.Text, 'skills' : SkillProficiencies, 'proficiencyBonus' : IDL.Nat,
  'alignment' : IDL.Text, 'initiative' : IDL.Nat,
});
export const CharacterId = IDL.Nat;
export const UserProfile = IDL.Record({ 'name' : IDL.Text });
export const Settings = IDL.Record({ 'maxLevel' : IDL.Nat });

const CharacterEntry = IDL.Tuple(IDL.Nat, Character);
const SpellEntry = IDL.Tuple(IDL.Nat, Spell);
const InventoryEntry = IDL.Tuple(IDL.Nat, InventoryItem);
const TraitEntry = IDL.Tuple(IDL.Nat, Trait);
const RaceEntry = IDL.Tuple(IDL.Nat, CustomRace);
const ClassEntry = IDL.Tuple(IDL.Nat, CustomClass);

export const idlService = IDL.Service({
  '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
  'addClass' : IDL.Func([CustomClass], [ClassId], []),
  'addItem' : IDL.Func([InventoryItem], [InventoryItemId], []),
  'addRace' : IDL.Func([CustomRace], [RaceId], []),
  'addSpell' : IDL.Func([Spell], [SpellId], []),
  'addTrait' : IDL.Func([Trait], [TraitId], []),
  'assignCallerUserRole' : IDL.Func([IDL.Principal, IDL.Text], [], []),
  'createCharacter' : IDL.Func([Character], [CharacterId], []),
  'deleteCharacter' : IDL.Func([CharacterId], [], []),
  'deleteClass' : IDL.Func([ClassId], [], []),
  'deleteItem' : IDL.Func([InventoryItemId], [], []),
  'deleteRace' : IDL.Func([RaceId], [], []),
  'deleteSpell' : IDL.Func([SpellId], [], []),
  'deleteTrait' : IDL.Func([TraitId], [], []),
  'getAllCharacters' : IDL.Func([], [IDL.Vec(CharacterEntry)], ['query']),
  'getAllClasses' : IDL.Func([], [IDL.Vec(ClassEntry)], ['query']),
  'getAllRaces' : IDL.Func([], [IDL.Vec(RaceEntry)], ['query']),
  'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
  'getCallerUserRole' : IDL.Func([], [IDL.Text], ['query']),
  'getCharacter' : IDL.Func([CharacterId], [IDL.Opt(Character)], ['query']),
  'getItemsByCharacter' : IDL.Func([CharacterId], [IDL.Vec(InventoryEntry)], ['query']),
  'getSettings' : IDL.Func([], [Settings], ['query']),
  'getSpellsByCharacter' : IDL.Func([CharacterId], [IDL.Vec(SpellEntry)], ['query']),
  'getTraitsByCharacter' : IDL.Func([CharacterId], [IDL.Vec(TraitEntry)], ['query']),
  'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
  'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
  'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
  'updateCharacter' : IDL.Func([CharacterId, Character], [], []),
  'updateClass' : IDL.Func([ClassId, CustomClass], [], []),
  'updateItem' : IDL.Func([InventoryItemId, InventoryItem], [], []),
  'updateRace' : IDL.Func([RaceId, CustomRace], [], []),
  'updateSettings' : IDL.Func([Settings], [], []),
  'updateSpell' : IDL.Func([SpellId, Spell], [], []),
  'updateTrait' : IDL.Func([TraitId, Trait], [], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const CustomClass = IDL.Record({
    'features' : IDL.Text, 'name' : IDL.Text, 'hitDie' : IDL.Nat,
    'description' : IDL.Text, 'proficiencies' : IDL.Text,
  });
  const InventoryItem = IDL.Record({
    'weight' : IDL.Text, 'name' : IDL.Text, 'description' : IDL.Text,
    'equipped' : IDL.Bool, 'quantity' : IDL.Nat, 'characterId' : IDL.Nat,
  });
  const CustomRace = IDL.Record({
    'abilityBonuses' : IDL.Text, 'traits' : IDL.Text, 'name' : IDL.Text,
    'description' : IDL.Text, 'speed' : IDL.Nat,
  });
  const Spell = IDL.Record({
    'duration' : IDL.Text, 'school' : IDL.Text, 'name' : IDL.Text,
    'damageEffect' : IDL.Text, 'components' : IDL.Text, 'description' : IDL.Text,
    'level' : IDL.Nat, 'characterId' : IDL.Nat, 'range' : IDL.Text, 'castingTime' : IDL.Text,
  });
  const Trait = IDL.Record({
    'source' : IDL.Text, 'name' : IDL.Text, 'description' : IDL.Text, 'characterId' : IDL.Nat,
  });
  const SkillProficiencies = IDL.Record({
    'perception' : IDL.Bool, 'animalHandling' : IDL.Bool, 'nature' : IDL.Bool,
    'investigation' : IDL.Bool, 'deception' : IDL.Bool, 'sleightOfHand' : IDL.Bool,
    'acrobatics' : IDL.Bool, 'athletics' : IDL.Bool, 'history' : IDL.Bool,
    'persuasion' : IDL.Bool, 'medicine' : IDL.Bool, 'stealth' : IDL.Bool,
    'survival' : IDL.Bool, 'insight' : IDL.Bool, 'intimidation' : IDL.Bool,
    'performance' : IDL.Bool, 'arcana' : IDL.Bool, 'religion' : IDL.Bool,
  });
  const Character = IDL.Record({
    'ac' : IDL.Nat, 'cha' : IDL.Nat, 'con' : IDL.Nat, 'dex' : IDL.Nat,
    'int' : IDL.Nat, 'str' : IDL.Nat, 'wis' : IDL.Nat, 'spellSlots' : IDL.Vec(IDL.Nat),
    'characterClass' : IDL.Text, 'background' : IDL.Text, 'hpMax' : IDL.Nat,
    'owner' : IDL.Principal, 'gold' : IDL.Nat, 'name' : IDL.Text, 'race' : IDL.Text,
    'hpCurrent' : IDL.Nat, 'level' : IDL.Nat, 'speed' : IDL.Nat, 'gender' : IDL.Text,
    'notes' : IDL.Text, 'skills' : SkillProficiencies, 'proficiencyBonus' : IDL.Nat,
    'alignment' : IDL.Text, 'initiative' : IDL.Nat,
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const Settings = IDL.Record({ 'maxLevel' : IDL.Nat });
  const CharacterEntry = IDL.Tuple(IDL.Nat, Character);
  const SpellEntry = IDL.Tuple(IDL.Nat, Spell);
  const InventoryEntry = IDL.Tuple(IDL.Nat, InventoryItem);
  const TraitEntry = IDL.Tuple(IDL.Nat, Trait);
  const RaceEntry = IDL.Tuple(IDL.Nat, CustomRace);
  const ClassEntry = IDL.Tuple(IDL.Nat, CustomClass);
  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'addClass' : IDL.Func([CustomClass], [IDL.Nat], []),
    'addItem' : IDL.Func([InventoryItem], [IDL.Nat], []),
    'addRace' : IDL.Func([CustomRace], [IDL.Nat], []),
    'addSpell' : IDL.Func([Spell], [IDL.Nat], []),
    'addTrait' : IDL.Func([Trait], [IDL.Nat], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, IDL.Text], [], []),
    'createCharacter' : IDL.Func([Character], [IDL.Nat], []),
    'deleteCharacter' : IDL.Func([IDL.Nat], [], []),
    'deleteClass' : IDL.Func([IDL.Nat], [], []),
    'deleteItem' : IDL.Func([IDL.Nat], [], []),
    'deleteRace' : IDL.Func([IDL.Nat], [], []),
    'deleteSpell' : IDL.Func([IDL.Nat], [], []),
    'deleteTrait' : IDL.Func([IDL.Nat], [], []),
    'getAllCharacters' : IDL.Func([], [IDL.Vec(CharacterEntry)], ['query']),
    'getAllClasses' : IDL.Func([], [IDL.Vec(ClassEntry)], ['query']),
    'getAllRaces' : IDL.Func([], [IDL.Vec(RaceEntry)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [IDL.Text], ['query']),
    'getCharacter' : IDL.Func([IDL.Nat], [IDL.Opt(Character)], ['query']),
    'getItemsByCharacter' : IDL.Func([IDL.Nat], [IDL.Vec(InventoryEntry)], ['query']),
    'getSettings' : IDL.Func([], [Settings], ['query']),
    'getSpellsByCharacter' : IDL.Func([IDL.Nat], [IDL.Vec(SpellEntry)], ['query']),
    'getTraitsByCharacter' : IDL.Func([IDL.Nat], [IDL.Vec(TraitEntry)], ['query']),
    'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'updateCharacter' : IDL.Func([IDL.Nat, Character], [], []),
    'updateClass' : IDL.Func([IDL.Nat, CustomClass], [], []),
    'updateItem' : IDL.Func([IDL.Nat, InventoryItem], [], []),
    'updateRace' : IDL.Func([IDL.Nat, CustomRace], [], []),
    'updateSettings' : IDL.Func([Settings], [], []),
    'updateSpell' : IDL.Func([IDL.Nat, Spell], [], []),
    'updateTrait' : IDL.Func([IDL.Nat, Trait], [], []),
  });
};

export const init = ({ IDL }) => { return []; };
