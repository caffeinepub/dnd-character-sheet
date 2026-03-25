import type { Principal } from "@icp-sdk/core/principal";

export type CharacterId = bigint;
export type TraitId = bigint;
export type RaceId = bigint;
export type SpellId = bigint;
export type ClassId = bigint;
export type InventoryItemId = bigint;
export type CustomSpellId = bigint;
export type CustomItemId = bigint;
export type CustomAbilityId = bigint;
export type CharacterAbilityId = bigint;
export type CustomPhysicalAttackId = bigint;
export type CharacterPhysicalAttackId = bigint;
export type CustomSpellSchoolId = bigint;

export interface Abilities {
  str: bigint;
  dex: bigint;
  con: bigint;
  int: bigint;
  wis: bigint;
  cha: bigint;
}

export interface Spell {
  duration: string;
  school: string;
  name: string;
  damageEffect: string;
  components: string;
  description: string;
  level: bigint;
  characterId: bigint;
  range: string;
  castingTime: string;
}

export interface Trait {
  source: string;
  name: string;
  description: string;
  characterId: bigint;
}

export interface CustomClass {
  name: string;
  hitDie: bigint;
  description: string;
  proficiencies: string[];
  features: Trait[];
}

export interface SkillProficiencies {
  perception: boolean;
  animalHandling: boolean;
  nature: boolean;
  investigation: boolean;
  deception: boolean;
  sleightOfHand: boolean;
  acrobatics: boolean;
  description: string;
  athletics: boolean;
  history: boolean;
  persuasion: boolean;
  medicine: boolean;
  stealth: boolean;
  survival: boolean;
  insight: boolean;
  intimidation: boolean;
  performance: boolean;
  arcana: boolean;
  religion: boolean;
}

export interface Character {
  ac: bigint;
  cha: bigint;
  con: bigint;
  dex: bigint;
  int: bigint;
  str: bigint;
  wis: bigint;
  spellSlots: Array<bigint>;
  characterClass: string;
  background: string;
  hpMax: bigint;
  owner: Principal;
  gold: bigint;
  name: string;
  race: string;
  hpCurrent: bigint;
  level: bigint;
  speed: bigint;
  gender: string;
  notes: string;
  skills: SkillProficiencies;
  proficiencyBonus: bigint;
  alignment: string;
  initiative: bigint;
}

export interface InventoryItem {
  weight: bigint;
  name: string;
  description: string;
  equipped: boolean;
  quantity: bigint;
  characterId: bigint;
}

export interface Settings {
  maxLevel: bigint;
}

export interface CustomRace {
  name: string;
  description: string;
  speed: bigint;
  abilityBonuses: Abilities;
  traits: Trait[];
}

export interface CustomSpell {
  name: string;
  level: bigint;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  damageEffect: string;
  description: string;
  owner: Principal;
}

export interface CustomItem {
  name: string;
  description: string;
  weight: string;
  value: string;
  itemType: string;
  rarity: string;
  owner: Principal;
}

export interface CustomAbility {
  owner: Principal;
  name: string;
  description: string;
  abilityType: string;
  uses: bigint;
  rechargeOn: string;
}

export interface CharacterAbility {
  characterId: CharacterId;
  name: string;
  description: string;
  abilityType: string;
  uses: bigint;
  usesRemaining: bigint;
  rechargeOn: string;
}

export interface CustomPhysicalAttack {
  name: string;
  description: string;
  damageDice: string;
  attackBonus: bigint;
  damageType: string;
  range: string;
  properties: string;
  owner: Principal;
}

export interface CharacterPhysicalAttack {
  characterId: CharacterId;
  name: string;
  description: string;
  damageDice: string;
  attackBonus: bigint;
  damageType: string;
  range: string;
  properties: string;
  timesUsed: bigint;
}

export interface CustomSpellSchool {
  name: string;
  owner: Principal;
}

export interface UserProfile {
  name: string;
}

export interface DndBackend {
  addClass(cls: CustomClass): Promise<ClassId>;
  addItem(item: InventoryItem): Promise<InventoryItemId>;
  addRace(race: CustomRace): Promise<RaceId>;
  addSpell(spell: Spell): Promise<SpellId>;
  addTrait(trait: Trait): Promise<TraitId>;
  addCustomSpell(spell: CustomSpell): Promise<CustomSpellId>;
  addCustomItem(item: CustomItem): Promise<CustomItemId>;
  addCustomAbility(ability: CustomAbility): Promise<CustomAbilityId>;
  addCharacterAbility(ability: CharacterAbility): Promise<CharacterAbilityId>;
  addCustomSpellSchool(school: CustomSpellSchool): Promise<CustomSpellSchoolId>;
  getAllCustomSpellSchools(): Promise<
    Array<[CustomSpellSchoolId, CustomSpellSchool]>
  >;
  updateCustomSpellSchool(
    id: CustomSpellSchoolId,
    school: CustomSpellSchool,
  ): Promise<void>;
  deleteCustomSpellSchool(id: CustomSpellSchoolId): Promise<void>;
  addCustomPhysicalAttack(
    attack: CustomPhysicalAttack,
  ): Promise<CustomPhysicalAttackId>;
  addCharacterPhysicalAttack(
    attack: CharacterPhysicalAttack,
  ): Promise<CharacterPhysicalAttackId>;
  createCharacter(character: Character): Promise<CharacterId>;
  deleteCharacter(id: CharacterId): Promise<void>;
  deleteClass(id: ClassId): Promise<void>;
  deleteItem(id: InventoryItemId): Promise<void>;
  deleteRace(id: RaceId): Promise<void>;
  deleteSpell(id: SpellId): Promise<void>;
  deleteTrait(id: TraitId): Promise<void>;
  deleteCustomSpell(id: CustomSpellId): Promise<void>;
  deleteCustomItem(id: CustomItemId): Promise<void>;
  deleteCustomAbility(id: CustomAbilityId): Promise<void>;
  deleteCharacterAbility(id: CharacterAbilityId): Promise<void>;
  deleteCustomPhysicalAttack(id: CustomPhysicalAttackId): Promise<void>;
  deleteCharacterPhysicalAttack(id: CharacterPhysicalAttackId): Promise<void>;
  getAllCharacters(): Promise<Array<[CharacterId, Character]>>;
  getAllClasses(): Promise<Array<[ClassId, CustomClass]>>;
  getAllRaces(): Promise<Array<[RaceId, CustomRace]>>;
  getAllCustomSpells(): Promise<Array<[CustomSpellId, CustomSpell]>>;
  getAllCustomItems(): Promise<Array<[CustomItemId, CustomItem]>>;
  getAllCustomAbilities(): Promise<Array<[CustomAbilityId, CustomAbility]>>;
  getAllCustomPhysicalAttacks(): Promise<
    Array<[CustomPhysicalAttackId, CustomPhysicalAttack]>
  >;
  getAbilitiesByCharacter(
    characterId: CharacterId,
  ): Promise<Array<[CharacterAbilityId, CharacterAbility]>>;
  getPhysicalAttacksByCharacter(
    characterId: CharacterId,
  ): Promise<Array<[CharacterPhysicalAttackId, CharacterPhysicalAttack]>>;
  getCallerUserProfile(): Promise<UserProfile | null>;
  getCharacter(id: CharacterId): Promise<Character | null>;
  getItemsByCharacter(
    characterId: CharacterId,
  ): Promise<Array<[InventoryItemId, InventoryItem]>>;
  getSettings(): Promise<Settings>;
  getSpellsByCharacter(
    characterId: CharacterId,
  ): Promise<Array<[SpellId, Spell]>>;
  getTraitsByCharacter(
    characterId: CharacterId,
  ): Promise<Array<[TraitId, Trait]>>;
  isCallerAdmin(): Promise<boolean>;
  saveCallerUserProfile(profile: UserProfile): Promise<void>;
  updateCharacter(id: CharacterId, character: Character): Promise<void>;
  updateClass(id: ClassId, cls: CustomClass): Promise<void>;
  updateItem(id: InventoryItemId, item: InventoryItem): Promise<void>;
  updateRace(id: RaceId, race: CustomRace): Promise<void>;
  updateSettings(newSettings: Settings): Promise<void>;
  updateSpell(id: SpellId, spell: Spell): Promise<void>;
  updateTrait(id: TraitId, trait: Trait): Promise<void>;
  updateCustomSpell(id: CustomSpellId, spell: CustomSpell): Promise<void>;
  updateCustomItem(id: CustomItemId, item: CustomItem): Promise<void>;
  updateCustomAbility(
    id: CustomAbilityId,
    ability: CustomAbility,
  ): Promise<void>;
  updateCharacterAbility(
    id: CharacterAbilityId,
    ability: CharacterAbility,
  ): Promise<void>;
  updateCustomPhysicalAttack(
    id: CustomPhysicalAttackId,
    attack: CustomPhysicalAttack,
  ): Promise<void>;
  updateCharacterPhysicalAttack(
    id: CharacterPhysicalAttackId,
    attack: CharacterPhysicalAttack,
  ): Promise<void>;
}
