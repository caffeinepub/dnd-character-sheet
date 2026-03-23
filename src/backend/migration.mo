import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  type CharacterId = Nat;
  type SpellId = Nat;
  type TraitId = Nat;
  type InventoryItemId = Nat;
  type RaceId = Nat;
  type ClassId = Nat;
  type CustomSpellId = Nat;
  type CustomItemId = Nat;
  type CustomAbilityId = Nat;
  type CharacterAbilityId = Nat;

  type OldCharacter = {
    name : Text;
    race : Text;
    characterClass : Text;
    gender : Text;
    background : Text;
    alignment : Text;
    level : Nat;
    str : Nat;
    dex : Nat;
    con : Nat;
    int : Nat;
    wis : Nat;
    cha : Nat;
    hpMax : Nat;
    hpCurrent : Nat;
    ac : Nat;
    speed : Nat;
    initiative : Nat;
    proficiencyBonus : Nat;
    gold : Nat;
    notes : Text;
    spellSlots : [Nat];
    skills : OldSkills;
    owner : Principal.Principal;
  };

  type OldSkills = {
    acrobatics : Bool;
    animalHandling : Bool;
    arcana : Bool;
    athletics : Bool;
    deception : Bool;
    history : Bool;
    insight : Bool;
    intimidation : Bool;
    investigation : Bool;
    medicine : Bool;
    nature : Bool;
    perception : Bool;
    performance : Bool;
    persuasion : Bool;
    religion : Bool;
    sleightOfHand : Bool;
    stealth : Bool;
    survival : Bool;
  };

  type Spell = {
    characterId : CharacterId;
    name : Text;
    level : Nat;
    school : Text;
    castingTime : Text;
    range : Text;
    components : Text;
    duration : Text;
    damageEffect : Text;
    description : Text;
  };

  type Trait = {
    characterId : CharacterId;
    name : Text;
    source : Text;
    description : Text;
  };

  type InventoryItem = {
    characterId : CharacterId;
    name : Text;
    description : Text;
    quantity : Nat;
    weight : Nat;
    equipped : Bool;
  };

  type CustomRace = {
    name : Text;
    description : Text;
    speed : Nat;
    abilityBonuses : Abilities;
    traits : [Trait];
  };

  type CustomClass = {
    name : Text;
    hitDie : Nat;
    description : Text;
    proficiencies : [Text];
    features : [Trait];
  };

  type Abilities = {
    str : Nat;
    dex : Nat;
    con : Nat;
    int : Nat;
    wis : Nat;
    cha : Nat;
  };

  type CustomSpell = {
    name : Text;
    level : Nat;
    school : Text;
    castingTime : Text;
    range : Text;
    components : Text;
    duration : Text;
    damageEffect : Text;
    description : Text;
    owner : Principal.Principal;
  };

  type CustomItem = {
    name : Text;
    description : Text;
    weight : Text;
    value : Text;
    itemType : Text;
    rarity : Text;
    owner : Principal.Principal;
  };

  type Settings = {
    maxLevel : Nat;
  };

  type UserProfile = {
    name : Text;
  };

  type CustomAbility = {
    name : Text;
    description : Text;
    abilityType : Text;
    uses : Nat;
    rechargeOn : Text;
    owner : Principal.Principal;
  };

  type CharacterAbility = {
    characterId : CharacterId;
    name : Text;
    description : Text;
    abilityType : Text;
    uses : Nat;
    usesRemaining : Nat;
    rechargeOn : Text;
  };

  type OldActor = {
    nextCharacterId : Nat;
    nextSpellId : Nat;
    nextTraitId : Nat;
    nextItemId : Nat;
    nextRaceId : Nat;
    nextClassId : Nat;
    nextCustomSpellId : Nat;
    nextCustomItemId : Nat;
    characters : Map.Map<CharacterId, OldCharacter>;
    spells : Map.Map<SpellId, Spell>;
    traits : Map.Map<TraitId, Trait>;
    inventoryItems : Map.Map<InventoryItemId, InventoryItem>;
    races : Map.Map<RaceId, CustomRace>;
    classes : Map.Map<ClassId, CustomClass>;
    customSpells : Map.Map<CustomSpellId, CustomSpell>;
    customItems : Map.Map<CustomItemId, CustomItem>;
    settings : Settings;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
  };

  type NewCharacter = {
    name : Text;
    race : Text;
    characterClass : Text;
    gender : Text;
    background : Text;
    alignment : Text;
    level : Nat;
    str : Nat;
    dex : Nat;
    con : Nat;
    int : Nat;
    wis : Nat;
    cha : Nat;
    hpMax : Nat;
    hpCurrent : Nat;
    ac : Nat;
    speed : Nat;
    initiative : Nat;
    proficiencyBonus : Nat;
    gold : Nat;
    notes : Text;
    spellSlots : [Nat];
    skills : NewSkills;
    owner : Principal.Principal;
  };

  type NewSkills = {
    acrobatics : Bool;
    animalHandling : Bool;
    arcana : Bool;
    athletics : Bool;
    deception : Bool;
    history : Bool;
    insight : Bool;
    intimidation : Bool;
    investigation : Bool;
    medicine : Bool;
    nature : Bool;
    perception : Bool;
    performance : Bool;
    persuasion : Bool;
    religion : Bool;
    sleightOfHand : Bool;
    stealth : Bool;
    survival : Bool;
    description : Text; // new field
  };

  type NewActor = {
    nextCharacterId : Nat;
    nextSpellId : Nat;
    nextTraitId : Nat;
    nextItemId : Nat;
    nextRaceId : Nat;
    nextClassId : Nat;
    nextCustomSpellId : Nat;
    nextCustomItemId : Nat;
    nextCustomAbilityId : Nat;
    nextCharacterAbilityId : Nat;
    characters : Map.Map<CharacterId, NewCharacter>;
    spells : Map.Map<SpellId, Spell>;
    traits : Map.Map<TraitId, Trait>;
    inventoryItems : Map.Map<InventoryItemId, InventoryItem>;
    races : Map.Map<RaceId, CustomRace>;
    classes : Map.Map<ClassId, CustomClass>;
    customSpells : Map.Map<CustomSpellId, CustomSpell>;
    customItems : Map.Map<CustomItemId, CustomItem>;
    customAbilities : Map.Map<CustomAbilityId, CustomAbility>;
    characterAbilities : Map.Map<CharacterAbilityId, CharacterAbility>;
    settings : Settings;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      nextCharacterId = old.nextCharacterId;
      nextSpellId = old.nextSpellId;
      nextTraitId = old.nextTraitId;
      nextItemId = old.nextItemId;
      nextRaceId = old.nextRaceId;
      nextClassId = old.nextClassId;
      nextCustomSpellId = old.nextCustomSpellId;
      nextCustomItemId = old.nextCustomItemId;
      nextCustomAbilityId = 1;
      nextCharacterAbilityId = 1;
      characters = old.characters.map(
        func(_id, oldChar) {
          {
            oldChar with
            skills = {
              oldChar.skills with
              description = "";
            };
          };
        }
      );
      spells = old.spells;
      traits = old.traits;
      inventoryItems = old.inventoryItems;
      races = old.races;
      classes = old.classes;
      customSpells = old.customSpells;
      customItems = old.customItems;
      customAbilities = Map.empty<CustomAbilityId, CustomAbility>();
      characterAbilities = Map.empty<CharacterAbilityId, CharacterAbility>();
      settings = old.settings;
      userProfiles = old.userProfiles;
    };
  };
};
