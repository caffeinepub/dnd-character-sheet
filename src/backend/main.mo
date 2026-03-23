import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Apply migration module using appropriate with-clause
(with migration = Migration.run)
actor {
  // Types
  public type CharacterId = Nat;
  public type SpellId = Nat;
  public type TraitId = Nat;
  public type InventoryItemId = Nat;
  public type RaceId = Nat;
  public type ClassId = Nat;

  public type Character = {
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
    skills : Skills;
    owner : Principal;
  };

  public type Skills = {
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

  public type Spell = {
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

  public type Trait = {
    characterId : CharacterId;
    name : Text;
    source : Text;
    description : Text;
  };

  public type InventoryItem = {
    characterId : CharacterId;
    name : Text;
    description : Text;
    quantity : Nat;
    weight : Nat;
    equipped : Bool;
  };

  public type CustomRace = {
    name : Text;
    description : Text;
    speed : Nat;
    abilityBonuses : Abilities;
    traits : [Trait];
  };

  public type CustomClass = {
    name : Text;
    hitDie : Nat;
    description : Text;
    proficiencies : [Text];
    features : [Trait];
  };

  public type Abilities = {
    str : Nat;
    dex : Nat;
    con : Nat;
    int : Nat;
    wis : Nat;
    cha : Nat;
  };

  public type Settings = {
    maxLevel : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextCharacterId = 1;
  var nextSpellId = 1;
  var nextTraitId = 1;
  var nextItemId = 1;
  var nextRaceId = 1;
  var nextClassId = 1;

  let characters = Map.empty<CharacterId, Character>();
  let spells = Map.empty<SpellId, Spell>();
  let traits = Map.empty<TraitId, Trait>();
  let inventoryItems = Map.empty<InventoryItemId, InventoryItem>();
  let races = Map.empty<RaceId, CustomRace>();
  let classes = Map.empty<ClassId, CustomClass>();
  var settings : Settings = { maxLevel = 20 };
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper function to verify character ownership
  private func verifyCharacterOwnership(caller : Principal, characterId : CharacterId) : Bool {
    switch (characters.get(characterId)) {
      case (null) { false };
      case (?char) { Principal.equal(char.owner, caller) };
    };
  };

  // Character CRUD
  public shared ({ caller }) func createCharacter(char : Character) : async CharacterId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create characters");
    };

    let characterId = nextCharacterId;
    nextCharacterId += 1;

    let newCharacter : Character = {
      char with
      owner = caller;
    };

    characters.add(characterId, newCharacter);
    characterId;
  };

  public query ({ caller }) func getAllCharacters() : async [(CharacterId, Character)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view characters");
    };
    characters.toArray().filter(
      func((_, char)) {
        Principal.equal(char.owner, caller);
      }
    );
  };

  public query ({ caller }) func getCharacter(id : CharacterId) : async ?Character {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view characters");
    };
    switch (characters.get(id)) {
      case (null) { null };
      case (?char) {
        if (Principal.equal(char.owner, caller)) {
          ?char;
        } else { null };
      };
    };
  };

  public shared ({ caller }) func updateCharacter(id : CharacterId, char : Character) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update characters");
    };
    switch (characters.get(id)) {
      case (null) {
        Runtime.trap("Character not found");
      };
      case (?existing) {
        if (Principal.equal(existing.owner, caller)) {
          characters.add(id, { char with owner = caller });
        } else {
          Runtime.trap("Unauthorized: Cannot modify characters you do not own");
        };
      };
    };
  };

  public shared ({ caller }) func deleteCharacter(id : CharacterId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete characters");
    };
    switch (characters.get(id)) {
      case (null) { Runtime.trap("Character not found") };
      case (?char) {
        if (Principal.equal(char.owner, caller)) {
          characters.remove(id);
        } else {
          Runtime.trap("Unauthorized: Cannot delete characters you do not own");
        };
      };
    };
  };

  // Spell CRUD
  public shared ({ caller }) func addSpell(spell : Spell) : async SpellId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can manage spells");
    };
    // Verify the character belongs to the caller
    if (not verifyCharacterOwnership(caller, spell.characterId)) {
      Runtime.trap("Unauthorized: Cannot add spells to characters you do not own");
    };
    let spellId = nextSpellId;
    nextSpellId += 1;
    spells.add(spellId, spell);
    spellId;
  };

  public query ({ caller }) func getSpellsByCharacter(characterId : CharacterId) : async [(SpellId, Spell)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch spells");
    };
    // Verify the character belongs to the caller
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view spells for characters you do not own");
    };
    spells.toArray().filter(
      func((_, spell)) {
        spell.characterId == characterId;
      }
    );
  };

  public shared ({ caller }) func updateSpell(id : SpellId, spell : Spell) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update spells");
    };
    switch (spells.get(id)) {
      case (null) {
        Runtime.trap("Spell not found");
      };
      case (?existing) {
        // Verify the existing spell's character belongs to caller
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot update spells for characters you do not own");
        };
        // Verify the new spell's character also belongs to caller
        if (not verifyCharacterOwnership(caller, spell.characterId)) {
          Runtime.trap("Unauthorized: Cannot move spells to characters you do not own");
        };
        spells.add(id, spell);
      };
    };
  };

  public shared ({ caller }) func deleteSpell(id : SpellId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete spells");
    };
    switch (spells.get(id)) {
      case (null) {
        Runtime.trap("Spell not found");
      };
      case (?spell) {
        if (not verifyCharacterOwnership(caller, spell.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete spells for characters you do not own");
        };
        spells.remove(id);
      };
    };
  };

  // Trait CRUD
  public shared ({ caller }) func addTrait(trait : Trait) : async TraitId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add traits");
    };
    // Verify the character belongs to the caller
    if (not verifyCharacterOwnership(caller, trait.characterId)) {
      Runtime.trap("Unauthorized: Cannot add traits to characters you do not own");
    };
    let traitId = nextTraitId;
    nextTraitId += 1;
    traits.add(traitId, trait);
    traitId;
  };

  public query ({ caller }) func getTraitsByCharacter(characterId : CharacterId) : async [(TraitId, Trait)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch traits");
    };
    // Verify the character belongs to the caller
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view traits for characters you do not own");
    };
    traits.toArray().filter(
      func((_, trait)) {
        trait.characterId == characterId;
      }
    );
  };

  public shared ({ caller }) func updateTrait(id : TraitId, trait : Trait) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update traits");
    };
    switch (traits.get(id)) {
      case (null) {
        Runtime.trap("Trait not found");
      };
      case (?existing) {
        // Verify the existing trait's character belongs to caller
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot update traits for characters you do not own");
        };
        // Verify the new trait's character also belongs to caller
        if (not verifyCharacterOwnership(caller, trait.characterId)) {
          Runtime.trap("Unauthorized: Cannot move traits to characters you do not own");
        };
        traits.add(id, trait);
      };
    };
  };

  public shared ({ caller }) func deleteTrait(id : TraitId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete traits");
    };
    switch (traits.get(id)) {
      case (null) {
        Runtime.trap("Trait not found");
      };
      case (?trait) {
        if (not verifyCharacterOwnership(caller, trait.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete traits for characters you do not own");
        };
        traits.remove(id);
      };
    };
  };

  // Inventory CRUD
  public shared ({ caller }) func addItem(item : InventoryItem) : async InventoryItemId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add inventory items");
    };
    // Verify the character belongs to the caller
    if (not verifyCharacterOwnership(caller, item.characterId)) {
      Runtime.trap("Unauthorized: Cannot add items to characters you do not own");
    };
    let itemId = nextItemId;
    nextItemId += 1;
    inventoryItems.add(itemId, item);
    itemId;
  };

  public query ({ caller }) func getItemsByCharacter(characterId : CharacterId) : async [(InventoryItemId, InventoryItem)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch inventory");
    };
    // Verify the character belongs to the caller
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view inventory for characters you do not own");
    };
    inventoryItems.toArray().filter(
      func((_, item)) {
        item.characterId == characterId;
      }
    );
  };

  public shared ({ caller }) func updateItem(id : InventoryItemId, item : InventoryItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update inventory");
    };
    switch (inventoryItems.get(id)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?existing) {
        // Verify the existing item's character belongs to caller
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot update items for characters you do not own");
        };
        // Verify the new item's character also belongs to caller
        if (not verifyCharacterOwnership(caller, item.characterId)) {
          Runtime.trap("Unauthorized: Cannot move items to characters you do not own");
        };
        inventoryItems.add(id, item);
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : InventoryItemId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete inventory");
    };
    switch (inventoryItems.get(id)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?item) {
        if (not verifyCharacterOwnership(caller, item.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete items for characters you do not own");
        };
        inventoryItems.remove(id);
      };
    };
  };

  // Custom Races
  public shared ({ caller }) func addRace(race : CustomRace) : async RaceId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add races");
    };
    let raceId = nextRaceId;
    nextRaceId += 1;
    races.add(raceId, race);
    raceId;
  };

  public query ({ caller }) func getAllRaces() : async [(RaceId, CustomRace)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view races");
    };
    races.toArray();
  };

  public shared ({ caller }) func updateRace(id : RaceId, race : CustomRace) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update races");
    };
    if (not races.containsKey(id)) {
      Runtime.trap("Race not found");
    };
    races.add(id, race);
  };

  public shared ({ caller }) func deleteRace(id : RaceId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete races");
    };
    if (not races.containsKey(id)) {
      Runtime.trap("Race not found");
    };
    races.remove(id);
  };

  // Classes
  public shared ({ caller }) func addClass(cls : CustomClass) : async ClassId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add classes");
    };
    let classId = nextClassId;
    nextClassId += 1;
    classes.add(classId, cls);
    classId;
  };

  public query ({ caller }) func getAllClasses() : async [(ClassId, CustomClass)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view classes");
    };
    classes.toArray();
  };

  public shared ({ caller }) func updateClass(id : ClassId, cls : CustomClass) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update classes");
    };
    if (not classes.containsKey(id)) {
      Runtime.trap("Class not found");
    };
    classes.add(id, cls);
  };

  public shared ({ caller }) func deleteClass(id : ClassId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete classes");
    };
    if (not classes.containsKey(id)) {
      Runtime.trap("Class not found");
    };
    classes.remove(id);
  };

  // Settings
  public query ({ caller }) func getSettings() : async Settings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view settings");
    };
    settings;
  };

  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    settings := newSettings;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all profiles");
    };

    userProfiles.toArray();
  };
};
