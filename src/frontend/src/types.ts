import type { Principal } from "@icp-sdk/core/principal";

export type CharacterId = bigint;
export type TraitId = bigint;
export type RaceId = bigint;
export type SpellId = bigint;
export type ClassId = bigint;
export type InventoryItemId = bigint;

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

export interface CustomClass {
  features: string;
  name: string;
  hitDie: bigint;
  description: string;
  proficiencies: string;
}

export interface SkillProficiencies {
  perception: boolean;
  animalHandling: boolean;
  nature: boolean;
  investigation: boolean;
  deception: boolean;
  sleightOfHand: boolean;
  acrobatics: boolean;
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

export interface Trait {
  source: string;
  name: string;
  description: string;
  characterId: bigint;
}

export interface InventoryItem {
  weight: string;
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
  abilityBonuses: string;
  traits: string;
  name: string;
  description: string;
  speed: bigint;
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
  createCharacter(character: Character): Promise<CharacterId>;
  deleteCharacter(id: CharacterId): Promise<void>;
  deleteClass(id: ClassId): Promise<void>;
  deleteItem(id: InventoryItemId): Promise<void>;
  deleteRace(id: RaceId): Promise<void>;
  deleteSpell(id: SpellId): Promise<void>;
  deleteTrait(id: TraitId): Promise<void>;
  getAllCharacters(): Promise<Array<[CharacterId, Character]>>;
  getAllClasses(): Promise<Array<[ClassId, CustomClass]>>;
  getAllRaces(): Promise<Array<[RaceId, CustomRace]>>;
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
}
