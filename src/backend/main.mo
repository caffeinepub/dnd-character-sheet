import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Specify the data migration function in with-clause

actor {
  // Types
  public type CharacterId = Nat;
  public type SpellId = Nat;
  public type TraitId = Nat;
  public type InventoryItemId = Nat;
  public type RaceId = Nat;
  public type ClassId = Nat;
  public type CustomSpellId = Nat;
  public type CustomItemId = Nat;
  public type CustomAbilityId = Nat;
  public type CharacterAbilityId = Nat;
  public type CustomPhysicalAttackId = Nat;
  public type CharacterPhysicalAttackId = Nat;

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
    description : Text; // default to "" for new clients
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

  public type CustomSpell = {
    name : Text;
    level : Nat;
    school : Text;
    castingTime : Text;
    range : Text;
    components : Text;
    duration : Text;
    damageEffect : Text;
    description : Text;
    owner : Principal;
  };

  public type CustomItem = {
    name : Text;
    description : Text;
    weight : Text;
    value : Text;
    itemType : Text;
    rarity : Text;
    owner : Principal;
  };

  public type Settings = {
    maxLevel : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  public type CustomAbility = {
    name : Text;
    description : Text;
    abilityType : Text;
    uses : Nat;
    rechargeOn : Text;
    owner : Principal;
  };

  public type CharacterAbility = {
    characterId : CharacterId;
    name : Text;
    description : Text;
    abilityType : Text;
    uses : Nat;
    usesRemaining : Nat;
    rechargeOn : Text;
  };

  public type CustomPhysicalAttack = {
    name : Text;
    description : Text;
    damageDice : Text;
    attackBonus : Int;
    damageType : Text;
    range : Text;
    properties : Text;
    owner : Principal;
  };

  public type CharacterPhysicalAttack = {
    characterId : CharacterId;
    name : Text;
    description : Text;
    damageDice : Text;
    attackBonus : Int;
    damageType : Text;
    range : Text;
    properties : Text;
    timesUsed : Nat;
  };

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent variables
  var nextCharacterId = 1;
  var nextSpellId = 1;
  var nextTraitId = 1;
  var nextItemId = 1;
  var nextRaceId = 1;
  var nextClassId = 1;
  var nextCustomSpellId = 1;
  var nextCustomItemId = 1;
  var nextCustomAbilityId = 1;
  var nextCharacterAbilityId = 1;
  var nextCustomPhysicalAttackId = 1;
  var nextCharacterPhysicalAttackId = 1;
  let characters = Map.empty<CharacterId, Character>();
  let spells = Map.empty<SpellId, Spell>();
  let traits = Map.empty<TraitId, Trait>();
  let inventoryItems = Map.empty<InventoryItemId, InventoryItem>();
  let races = Map.empty<RaceId, CustomRace>();
  let classes = Map.empty<ClassId, CustomClass>();
  let customSpells = Map.empty<CustomSpellId, CustomSpell>();
  let customItems = Map.empty<CustomItemId, CustomItem>();
  var settings : Settings = { maxLevel = 10000 };
  let userSettings = Map.empty<Principal, Settings>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let raceOwners = Map.empty<RaceId, Principal>();
  let classOwners = Map.empty<ClassId, Principal>();
  let customAbilities = Map.empty<CustomAbilityId, CustomAbility>();
  let characterAbilities = Map.empty<CharacterAbilityId, CharacterAbility>();
  let customPhysicalAttacks = Map.empty<CustomPhysicalAttackId, CustomPhysicalAttack>();
  let characterPhysicalAttacks = Map.empty<CharacterPhysicalAttackId, CharacterPhysicalAttack>();

  // Helper: verify caller is authenticated (not anonymous)
  private func requireAuth(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
  };

  // Helper: verify caller is admin
  private func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin access required");
    };
  };

  // Helper function to verify character ownership
  private func verifyCharacterOwnership(caller : Principal, characterId : CharacterId) : Bool {
    switch (characters.get(characterId)) {
      case (null) { false };
      case (?char) { Principal.equal(char.owner, caller) };
    };
  };

  // Character CRUD
  public shared ({ caller }) func createCharacter(char : Character) : async CharacterId {
    requireAuth(caller);
    let characterId = nextCharacterId;
    nextCharacterId += 1;
    let newCharacter : Character = { char with owner = caller };
    characters.add(characterId, newCharacter);
    characterId;
  };

  public query ({ caller }) func getAllCharacters() : async [(CharacterId, Character)] {
    requireAuth(caller);

    let resultList = List.empty<(CharacterId, Character)>();
    for ((id, char) in characters.entries()) {
      if (Principal.equal(char.owner, caller)) {
        resultList.add((id, char));
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func getAllCharactersCount({}) : async Nat {
    requireAuth(caller);
    var count = 0;
    for (char in characters.values()) {
      if (Principal.equal(char.owner, caller)) { count += 1 };
    };
    count;
  };

  public query ({ caller }) func getCharacter(id : CharacterId) : async ?Character {
    requireAuth(caller);
    switch (characters.get(id)) {
      case (null) { null };
      case (?char) {
        if (Principal.equal(char.owner, caller)) { ?char } else { null };
      };
    };
  };

  public shared ({ caller }) func updateCharacter(id : CharacterId, char : Character) : async () {
    requireAuth(caller);
    switch (characters.get(id)) {
      case (null) { Runtime.trap("Character not found") };
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
    requireAuth(caller);
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
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, spell.characterId)) {
      Runtime.trap("Unauthorized: Cannot add spells to characters you do not own");
    };
    let spellId = nextSpellId;
    nextSpellId += 1;
    spells.add(spellId, spell);
    spellId;
  };

  public query ({ caller }) func getSpellsByCharacter(characterId : CharacterId) : async [(SpellId, Spell)] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view spells for characters you do not own");
    };

    let resultList = List.empty<(SpellId, Spell)>();
    for ((id, spell) in spells.entries()) {
      if (spell.characterId == characterId) { resultList.add((id, spell)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateSpell(id : SpellId, spell : Spell) : async () {
    requireAuth(caller);
    switch (spells.get(id)) {
      case (null) { Runtime.trap("Spell not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized");
        };
        spells.add(id, spell);
      };
    };
  };

  public shared ({ caller }) func deleteSpell(id : SpellId) : async () {
    requireAuth(caller);
    switch (spells.get(id)) {
      case (null) { Runtime.trap("Spell not found") };
      case (?spell) {
        if (not verifyCharacterOwnership(caller, spell.characterId)) {
          Runtime.trap("Unauthorized");
        };
        spells.remove(id);
      };
    };
  };

  // Trait CRUD
  public shared ({ caller }) func addTrait(trait : Trait) : async TraitId {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, trait.characterId)) {
      Runtime.trap("Unauthorized");
    };
    let traitId = nextTraitId;
    nextTraitId += 1;
    traits.add(traitId, trait);
    traitId;
  };

  public query ({ caller }) func getTraitsByCharacter(characterId : CharacterId) : async [(TraitId, Trait)] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized");
    };

    let resultList = List.empty<(TraitId, Trait)>();
    for ((id, trait) in traits.entries()) {
      if (trait.characterId == characterId) { resultList.add((id, trait)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateTrait(id : TraitId, trait : Trait) : async () {
    requireAuth(caller);
    switch (traits.get(id)) {
      case (null) { Runtime.trap("Trait not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized");
        };
        traits.add(id, trait);
      };
    };
  };

  public shared ({ caller }) func deleteTrait(id : TraitId) : async () {
    requireAuth(caller);
    switch (traits.get(id)) {
      case (null) { Runtime.trap("Trait not found") };
      case (?trait) {
        if (not verifyCharacterOwnership(caller, trait.characterId)) {
          Runtime.trap("Unauthorized");
        };
        traits.remove(id);
      };
    };
  };

  // Inventory CRUD
  public shared ({ caller }) func addItem(item : InventoryItem) : async InventoryItemId {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, item.characterId)) {
      Runtime.trap("Unauthorized");
    };
    let itemId = nextItemId;
    nextItemId += 1;
    inventoryItems.add(itemId, item);
    itemId;
  };

  public query ({ caller }) func getItemsByCharacter(characterId : CharacterId) : async [(InventoryItemId, InventoryItem)] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized");
    };

    let resultList = List.empty<(InventoryItemId, InventoryItem)>();
    for ((id, item) in inventoryItems.entries()) {
      if (item.characterId == characterId) { resultList.add((id, item)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateItem(id : InventoryItemId, item : InventoryItem) : async () {
    requireAuth(caller);
    switch (inventoryItems.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized");
        };
        inventoryItems.add(id, item);
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : InventoryItemId) : async () {
    requireAuth(caller);
    switch (inventoryItems.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (not verifyCharacterOwnership(caller, item.characterId)) {
          Runtime.trap("Unauthorized");
        };
        inventoryItems.remove(id);
      };
    };
  };

  // Custom Races (admin CRUD)
  public shared ({ caller }) func addRace(race : CustomRace) : async RaceId {
    requireAuth(caller);
    let raceId = nextRaceId;
    nextRaceId += 1;
    races.add(raceId, race);
    raceOwners.add(raceId, caller);
    raceId;
  };

  public query ({ caller }) func getAllRaces() : async [(RaceId, CustomRace)] {
    requireAuth(caller);
    let resultList = List.empty<(RaceId, CustomRace)>();
    for ((id, race) in races.entries()) {
      switch (raceOwners.get(id)) {
        case (?owner) { if (Principal.equal(owner, caller)) { resultList.add((id, race)) } };
        case (null) {};
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateRace(id : RaceId, race : CustomRace) : async () {
    requireAuth(caller);
    if (not races.containsKey(id)) { Runtime.trap("Race not found") };
    let isOwner = switch (raceOwners.get(id)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot edit races you do not own");
    };
    races.add(id, race);
  };

  public shared ({ caller }) func deleteRace(id : RaceId) : async () {
    requireAuth(caller);
    if (not races.containsKey(id)) { Runtime.trap("Race not found") };
    let isOwner = switch (raceOwners.get(id)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot delete races you do not own");
    };
    races.remove(id);
    raceOwners.remove(id);
  };

  // Custom Classes (admin CRUD)
  public shared ({ caller }) func addClass(cls : CustomClass) : async ClassId {
    requireAuth(caller);
    let classId = nextClassId;
    nextClassId += 1;
    classes.add(classId, cls);
    classOwners.add(classId, caller);
    classId;
  };

  public query ({ caller }) func getAllClasses() : async [(ClassId, CustomClass)] {
    requireAuth(caller);
    let resultList = List.empty<(ClassId, CustomClass)>();
    for ((id, cls) in classes.entries()) {
      switch (classOwners.get(id)) {
        case (?owner) { if (Principal.equal(owner, caller)) { resultList.add((id, cls)) } };
        case (null) {};
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateClass(id : ClassId, cls : CustomClass) : async () {
    requireAuth(caller);
    if (not classes.containsKey(id)) { Runtime.trap("Class not found") };
    let isOwner = switch (classOwners.get(id)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot edit classes you do not own");
    };
    classes.add(id, cls);
  };

  public shared ({ caller }) func deleteClass(id : ClassId) : async () {
    requireAuth(caller);
    if (not classes.containsKey(id)) { Runtime.trap("Class not found") };
    let isOwner = switch (classOwners.get(id)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot delete classes you do not own");
    };
    classes.remove(id);
    classOwners.remove(id);
  };

  // Custom Spell Library (user CRUD, owner-scoped)
  public shared ({ caller }) func addCustomSpell(spell : CustomSpell) : async CustomSpellId {
    requireAuth(caller);
    let id = nextCustomSpellId;
    nextCustomSpellId += 1;
    customSpells.add(id, { spell with owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomSpells() : async [(CustomSpellId, CustomSpell)] {
    requireAuth(caller);

    let resultList = List.empty<(CustomSpellId, CustomSpell)>();
    for ((id, spell) in customSpells.entries()) {
      if (Principal.equal(spell.owner, caller)) { resultList.add((id, spell)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomSpell(id : CustomSpellId, spell : CustomSpell) : async () {
    requireAuth(caller);
    switch (customSpells.get(id)) {
      case (null) { Runtime.trap("Custom spell not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot edit spells you do not own");
        };
        customSpells.add(id, { spell with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteCustomSpell(id : CustomSpellId) : async () {
    requireAuth(caller);
    switch (customSpells.get(id)) {
      case (null) { Runtime.trap("Custom spell not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete spells you do not own");
        };
        customSpells.remove(id);
      };
    };
  };

  // Custom Item Library (user CRUD, owner-scoped)
  public shared ({ caller }) func addCustomItem(item : CustomItem) : async CustomItemId {
    requireAuth(caller);
    let id = nextCustomItemId;
    nextCustomItemId += 1;
    customItems.add(id, { item with owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomItems() : async [(CustomItemId, CustomItem)] {
    requireAuth(caller);

    let resultList = List.empty<(CustomItemId, CustomItem)>();
    for ((id, item) in customItems.entries()) {
      if (Principal.equal(item.owner, caller)) { resultList.add((id, item)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomItem(id : CustomItemId, item : CustomItem) : async () {
    requireAuth(caller);
    switch (customItems.get(id)) {
      case (null) { Runtime.trap("Custom item not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot edit items you do not own");
        };
        customItems.add(id, { item with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteCustomItem(id : CustomItemId) : async () {
    requireAuth(caller);
    switch (customItems.get(id)) {
      case (null) { Runtime.trap("Custom item not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete items you do not own");
        };
        customItems.remove(id);
      };
    };
  };

  // Settings
  public query ({ caller }) func getSettings() : async Settings {
    requireAuth(caller);
    switch (userSettings.get(caller)) {
      case (?s) { s };
      case (null) { { maxLevel = 10000 } };
    };
  };

  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    requireAuth(caller);
    userSettings.add(caller, newSettings);
  };

  // User Profiles
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireAuth(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireAuth(caller);
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    requireAdmin(caller);
    userProfiles.toArray();
  };

  // Custom Abilities (user CRUD, owner-scoped)
  public shared ({ caller }) func addCustomAbility(ability : CustomAbility) : async CustomAbilityId {
    requireAuth(caller);
    let id = nextCustomAbilityId;
    nextCustomAbilityId += 1;
    customAbilities.add(id, { ability with owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomAbilities() : async [(CustomAbilityId, CustomAbility)] {
    requireAuth(caller);

    let resultList = List.empty<(CustomAbilityId, CustomAbility)>();
    for ((id, ability) in customAbilities.entries()) {
      if (Principal.equal(ability.owner, caller)) { resultList.add((id, ability)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomAbility(id : CustomAbilityId, ability : CustomAbility) : async () {
    requireAuth(caller);
    switch (customAbilities.get(id)) {
      case (null) { Runtime.trap("Custom ability not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot edit abilities you do not own");
        };
        customAbilities.add(id, { ability with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteCustomAbility(id : CustomAbilityId) : async () {
    requireAuth(caller);
    switch (customAbilities.get(id)) {
      case (null) { Runtime.trap("Custom ability not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete abilities you do not own");
        };
        customAbilities.remove(id);
      };
    };
  };

  // Character Abilities (character-scoped CRUD)
  public shared ({ caller }) func addCharacterAbility(ability : CharacterAbility) : async CharacterAbilityId {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, ability.characterId)) {
      Runtime.trap("Unauthorized: Cannot add abilities to characters you do not own");
    };
    let id = nextCharacterAbilityId;
    nextCharacterAbilityId += 1;
    characterAbilities.add(id, ability);
    id;
  };

  public query ({ caller }) func getAbilitiesByCharacter(characterId : CharacterId) : async [(CharacterAbilityId, CharacterAbility)] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view abilities for characters you do not own");
    };

    let resultList = List.empty<(CharacterAbilityId, CharacterAbility)>();
    for ((id, ability) in characterAbilities.entries()) {
      if (ability.characterId == characterId) { resultList.add((id, ability)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCharacterAbility(id : CharacterAbilityId, ability : CharacterAbility) : async () {
    requireAuth(caller);
    switch (characterAbilities.get(id)) {
      case (null) { Runtime.trap("Character ability not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot modify abilities you do not own");
        };
        characterAbilities.add(id, ability);
      };
    };
  };

  public shared ({ caller }) func deleteCharacterAbility(id : CharacterAbilityId) : async () {
    requireAuth(caller);
    switch (characterAbilities.get(id)) {
      case (null) { Runtime.trap("Character ability not found") };
      case (?ability) {
        if (not verifyCharacterOwnership(caller, ability.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete abilities you do not own");
        };
        characterAbilities.remove(id);
      };
    };
  };

  // Custom Physical Attacks (user CRUD, owner-scoped)
  public shared ({ caller }) func addCustomPhysicalAttack(attack : CustomPhysicalAttack) : async CustomPhysicalAttackId {
    requireAuth(caller);
    let id = nextCustomPhysicalAttackId;
    nextCustomPhysicalAttackId += 1;
    customPhysicalAttacks.add(id, { attack with owner = caller });
    id;
  };

  public query ({ caller }) func getAllCustomPhysicalAttacks() : async [(CustomPhysicalAttackId, CustomPhysicalAttack)] {
    requireAuth(caller);

    let resultList = List.empty<(CustomPhysicalAttackId, CustomPhysicalAttack)>();
    for ((id, attack) in customPhysicalAttacks.entries()) {
      if (Principal.equal(attack.owner, caller)) { resultList.add((id, attack)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCustomPhysicalAttack(id : CustomPhysicalAttackId, attack : CustomPhysicalAttack) : async () {
    requireAuth(caller);
    switch (customPhysicalAttacks.get(id)) {
      case (null) { Runtime.trap("Custom physical attack not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot edit attacks you do not own");
        };
        customPhysicalAttacks.add(id, { attack with owner = existing.owner });
      };
    };
  };

  public shared ({ caller }) func deleteCustomPhysicalAttack(id : CustomPhysicalAttackId) : async () {
    requireAuth(caller);
    switch (customPhysicalAttacks.get(id)) {
      case (null) { Runtime.trap("Custom physical attack not found") };
      case (?existing) {
        if (not Principal.equal(existing.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete attacks you do not own");
        };
        customPhysicalAttacks.remove(id);
      };
    };
  };

  // Character Physical Attacks (character-scoped CRUD)
  public shared ({ caller }) func addCharacterPhysicalAttack(attack : CharacterPhysicalAttack) : async CharacterPhysicalAttackId {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, attack.characterId)) {
      Runtime.trap("Unauthorized: Cannot add attacks to characters you do not own");
    };
    let id = nextCharacterPhysicalAttackId;
    nextCharacterPhysicalAttackId += 1;
    characterPhysicalAttacks.add(id, attack);
    id;
  };

  public query ({ caller }) func getPhysicalAttacksByCharacter(characterId : CharacterId) : async [(CharacterPhysicalAttackId, CharacterPhysicalAttack)] {
    requireAuth(caller);
    if (not verifyCharacterOwnership(caller, characterId)) {
      Runtime.trap("Unauthorized: Cannot view attacks for characters you do not own");
    };

    let resultList = List.empty<(CharacterPhysicalAttackId, CharacterPhysicalAttack)>();
    for ((id, attack) in characterPhysicalAttacks.entries()) {
      if (attack.characterId == characterId) { resultList.add((id, attack)) };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateCharacterPhysicalAttack(id : CharacterPhysicalAttackId, attack : CharacterPhysicalAttack) : async () {
    requireAuth(caller);
    switch (characterPhysicalAttacks.get(id)) {
      case (null) { Runtime.trap("Character physical attack not found") };
      case (?existing) {
        if (not verifyCharacterOwnership(caller, existing.characterId)) {
          Runtime.trap("Unauthorized: Cannot modify attacks you do not own");
        };
        characterPhysicalAttacks.add(id, attack);
      };
    };
  };

  public shared ({ caller }) func deleteCharacterPhysicalAttack(id : CharacterPhysicalAttackId) : async () {
    requireAuth(caller);
    switch (characterPhysicalAttacks.get(id)) {
      case (null) { Runtime.trap("Character physical attack not found") };
      case (?attack) {
        if (not verifyCharacterOwnership(caller, attack.characterId)) {
          Runtime.trap("Unauthorized: Cannot delete attacks you do not own");
        };
        characterPhysicalAttacks.remove(id);
      };
    };
  };
};
