import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type CharacterId = bigint;
export interface Abilities {
    cha: bigint;
    con: bigint;
    dex: bigint;
    int: bigint;
    str: bigint;
    wis: bigint;
}
export interface Skills {
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
export type TraitId = bigint;
export type RaceId = bigint;
export interface Spell {
    duration: string;
    school: string;
    name: string;
    damageEffect: string;
    components: string;
    description: string;
    level: bigint;
    characterId: CharacterId;
    range: string;
    castingTime: string;
}
export interface CustomClass {
    features: Array<Trait>;
    name: string;
    hitDie: bigint;
    description: string;
    proficiencies: Array<string>;
}
export type InventoryItemId = bigint;
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
    skills: Skills;
    proficiencyBonus: bigint;
    alignment: string;
    initiative: bigint;
}
export interface Trait {
    source: string;
    name: string;
    description: string;
    characterId: CharacterId;
}
export interface InventoryItem {
    weight: bigint;
    name: string;
    description: string;
    equipped: boolean;
    quantity: bigint;
    characterId: CharacterId;
}
export interface Settings {
    maxLevel: bigint;
}
export interface CustomItem {
    weight: string;
    value: string;
    owner: Principal;
    name: string;
    description: string;
    itemType: string;
    rarity: string;
}
export type SpellId = bigint;
export interface CustomSpell {
    duration: string;
    owner: Principal;
    school: string;
    name: string;
    damageEffect: string;
    components: string;
    description: string;
    level: bigint;
    range: string;
    castingTime: string;
}
export type CustomAbilityId = bigint;
export type CharacterAbilityId = bigint;
export type CustomSpellId = bigint;
export interface CustomRace {
    abilityBonuses: Abilities;
    traits: Array<Trait>;
    name: string;
    description: string;
    speed: bigint;
    owner: Principal;
}
export type CustomItemId = bigint;
export type ClassId = bigint;
export interface CustomAbility {
    owner: Principal;
    name: string;
    uses: bigint;
    description: string;
    abilityType: string;
    rechargeOn: string;
}
export interface UserProfile {
    name: string;
}
export interface CharacterAbility {
    usesRemaining: bigint;
    name: string;
    uses: bigint;
    description: string;
    abilityType: string;
    rechargeOn: string;
    characterId: CharacterId;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCharacterAbility(ability: CharacterAbility): Promise<CharacterAbilityId>;
    addClass(cls: CustomClass): Promise<ClassId>;
    addCustomAbility(ability: CustomAbility): Promise<CustomAbilityId>;
    addCustomItem(item: CustomItem): Promise<CustomItemId>;
    addCustomSpell(spell: CustomSpell): Promise<CustomSpellId>;
    addItem(item: InventoryItem): Promise<InventoryItemId>;
    addRace(race: CustomRace): Promise<RaceId>;
    addSpell(spell: Spell): Promise<SpellId>;
    addTrait(trait: Trait): Promise<TraitId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCharacter(char: Character): Promise<CharacterId>;
    deleteCharacter(id: CharacterId): Promise<void>;
    deleteCharacterAbility(id: CharacterAbilityId): Promise<void>;
    deleteClass(id: ClassId): Promise<void>;
    deleteCustomAbility(id: CustomAbilityId): Promise<void>;
    deleteCustomItem(id: CustomItemId): Promise<void>;
    deleteCustomSpell(id: CustomSpellId): Promise<void>;
    deleteItem(id: InventoryItemId): Promise<void>;
    deleteRace(id: RaceId): Promise<void>;
    deleteSpell(id: SpellId): Promise<void>;
    deleteTrait(id: TraitId): Promise<void>;
    getAbilitiesByCharacter(characterId: CharacterId): Promise<Array<[CharacterAbilityId, CharacterAbility]>>;
    getAllCharacters(): Promise<Array<[CharacterId, Character]>>;
    getAllCharactersCount(arg0: {
    }): Promise<bigint>;
    getAllClasses(): Promise<Array<[ClassId, CustomClass]>>;
    getAllCustomAbilities(): Promise<Array<[CustomAbilityId, CustomAbility]>>;
    getAllCustomItems(): Promise<Array<[CustomItemId, CustomItem]>>;
    getAllCustomSpells(): Promise<Array<[CustomSpellId, CustomSpell]>>;
    getAllRaces(): Promise<Array<[RaceId, CustomRace]>>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCharacter(id: CharacterId): Promise<Character | null>;
    getItemsByCharacter(characterId: CharacterId): Promise<Array<[InventoryItemId, InventoryItem]>>;
    getSettings(): Promise<Settings>;
    getSpellsByCharacter(characterId: CharacterId): Promise<Array<[SpellId, Spell]>>;
    getTraitsByCharacter(characterId: CharacterId): Promise<Array<[TraitId, Trait]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCharacter(id: CharacterId, char: Character): Promise<void>;
    updateCharacterAbility(id: CharacterAbilityId, ability: CharacterAbility): Promise<void>;
    updateClass(id: ClassId, cls: CustomClass): Promise<void>;
    updateCustomAbility(id: CustomAbilityId, ability: CustomAbility): Promise<void>;
    updateCustomItem(id: CustomItemId, item: CustomItem): Promise<void>;
    updateCustomSpell(id: CustomSpellId, spell: CustomSpell): Promise<void>;
    updateItem(id: InventoryItemId, item: InventoryItem): Promise<void>;
    updateRace(id: RaceId, race: CustomRace): Promise<void>;
    updateSettings(newSettings: Settings): Promise<void>;
    updateSpell(id: SpellId, spell: Spell): Promise<void>;
    updateTrait(id: TraitId, trait: Trait): Promise<void>;
}
