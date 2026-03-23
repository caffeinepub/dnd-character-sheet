import type { Principal } from "@icp-sdk/core/principal";
import { useCallback, useEffect, useState } from "react";
import type {
  Abilities,
  CustomClass,
  CustomItem,
  CustomRace,
  CustomSpell,
  DndBackend,
  Trait,
} from "../types";

interface Props {
  actor: DndBackend;
  onBack: () => void;
}

type RaceWithId = { id: bigint } & CustomRace;
type ClassWithId = { id: bigint } & CustomClass;
type SpellWithId = { id: bigint } & CustomSpell;
type ItemWithId = { id: bigint } & CustomItem;

// Form state uses simple primitives for editing; we convert on save
interface RaceFormState {
  name: string;
  description: string;
  speed: number;
  // ability bonuses as plain numbers for form inputs
  ab_str: number;
  ab_dex: number;
  ab_con: number;
  ab_int: number;
  ab_wis: number;
  ab_cha: number;
  // traits as newline-separated names (simple text UI)
  traitsText: string;
}

interface ClassFormState {
  name: string;
  hitDie: number;
  description: string;
  // proficiencies one per line
  proficienciesText: string;
  // features one per line (name only)
  featuresText: string;
}

const EMPTY_RACE: RaceFormState = {
  name: "",
  description: "",
  speed: 30,
  ab_str: 0,
  ab_dex: 0,
  ab_con: 0,
  ab_int: 0,
  ab_wis: 0,
  ab_cha: 0,
  traitsText: "",
};

const EMPTY_CLASS: ClassFormState = {
  name: "",
  hitDie: 8,
  description: "",
  proficienciesText: "",
  featuresText: "",
};

const EMPTY_SPELL = {
  name: "",
  level: 0,
  school: "Evocation",
  castingTime: "1 action",
  range: "",
  components: "",
  duration: "",
  damageEffect: "",
  description: "",
};
const EMPTY_ITEM = {
  name: "",
  description: "",
  weight: "",
  value: "",
  itemType: "Other",
  rarity: "Common",
};

const SPELL_SCHOOLS = [
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation",
];
const ITEM_TYPES = [
  "Weapon",
  "Armor",
  "Potion",
  "Tool",
  "Wondrous Item",
  "Ring",
  "Rod",
  "Scroll",
  "Staff",
  "Wand",
  "Other",
];
const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Very Rare",
  "Legendary",
  "Artifact",
];

type Section = "general" | "races" | "classes" | "spells" | "items";

// Helpers: convert between form state and backend types
function abilitiesToForm(ab: Abilities) {
  return {
    ab_str: Number(ab.str),
    ab_dex: Number(ab.dex),
    ab_con: Number(ab.con),
    ab_int: Number(ab.int),
    ab_wis: Number(ab.wis),
    ab_cha: Number(ab.cha),
  };
}

function formToAbilities(f: RaceFormState): Abilities {
  return {
    str: BigInt(f.ab_str),
    dex: BigInt(f.ab_dex),
    con: BigInt(f.ab_con),
    int: BigInt(f.ab_int),
    wis: BigInt(f.ab_wis),
    cha: BigInt(f.ab_cha),
  };
}

function traitArrayToText(traits: Trait[]): string {
  return traits
    .map((t) => (t.description ? `${t.name}: ${t.description}` : t.name))
    .join("\n");
}

function textToTraitArray(text: string, source: string): Trait[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colonIdx = line.indexOf(":");
      if (colonIdx > -1) {
        return {
          name: line.slice(0, colonIdx).trim(),
          description: line.slice(colonIdx + 1).trim(),
          source,
          characterId: 0n,
        };
      }
      return { name: line, description: "", source, characterId: 0n };
    });
}

function formatAbilityBonuses(ab: Abilities): string {
  const parts: string[] = [];
  const map: [keyof Abilities, string][] = [
    ["str", "STR"],
    ["dex", "DEX"],
    ["con", "CON"],
    ["int", "INT"],
    ["wis", "WIS"],
    ["cha", "CHA"],
  ];
  for (const [key, label] of map) {
    const val = Number(ab[key]);
    if (val !== 0) parts.push(`${val > 0 ? "+" : ""}${val} ${label}`);
  }
  return parts.join(", ") || "None";
}

export default function SettingsPage({ actor, onBack }: Props) {
  const [maxLevel, setMaxLevel] = useState(20);
  const [savedMaxLevel, setSavedMaxLevel] = useState(20);
  const [savingLevel, setSavingLevel] = useState(false);
  const [races, setRaces] = useState<RaceWithId[]>([]);
  const [classes, setClasses] = useState<ClassWithId[]>([]);
  const [customSpells, setCustomSpells] = useState<SpellWithId[]>([]);
  const [customItems, setCustomItems] = useState<ItemWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("general");

  // Race form
  const [showRaceForm, setShowRaceForm] = useState(false);
  const [editingRace, setEditingRace] = useState<RaceWithId | null>(null);
  const [raceForm, setRaceForm] = useState<RaceFormState>({ ...EMPTY_RACE });
  const [savingRace, setSavingRace] = useState(false);

  // Class form
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithId | null>(null);
  const [classForm, setClassForm] = useState<ClassFormState>({
    ...EMPTY_CLASS,
  });
  const [savingClass, setSavingClass] = useState(false);

  // Custom spell form
  const [showSpellForm, setShowSpellForm] = useState(false);
  const [editingSpell, setEditingSpell] = useState<SpellWithId | null>(null);
  const [spellForm, setSpellForm] = useState({ ...EMPTY_SPELL });
  const [savingSpell, setSavingSpell] = useState(false);

  // Custom item form
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemWithId | null>(null);
  const [itemForm, setItemForm] = useState({ ...EMPTY_ITEM });
  const [savingItem, setSavingItem] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [settings, raceData, classData, spellData, itemData] =
      await Promise.all([
        actor.getSettings(),
        actor.getAllRaces() as unknown as Promise<[bigint, CustomRace][]>,
        actor.getAllClasses() as unknown as Promise<[bigint, CustomClass][]>,
        actor.getAllCustomSpells() as unknown as Promise<
          [bigint, CustomSpell][]
        >,
        actor.getAllCustomItems() as unknown as Promise<[bigint, CustomItem][]>,
      ]);
    setMaxLevel(Number(settings.maxLevel));
    setSavedMaxLevel(Number(settings.maxLevel));
    setRaces(raceData.map(([id, r]) => ({ id, ...r })));
    setClasses(classData.map(([id, c]) => ({ id, ...c })));
    setCustomSpells(spellData.map(([id, s]) => ({ id, ...s })));
    setCustomItems(itemData.map(([id, i]) => ({ id, ...i })));
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const saveMaxLevel = async () => {
    setSavingLevel(true);
    await actor.updateSettings({ maxLevel: BigInt(maxLevel) });
    setSavedMaxLevel(maxLevel);
    setSavingLevel(false);
  };

  // Race CRUD
  const openNewRace = () => {
    setEditingRace(null);
    setRaceForm({ ...EMPTY_RACE });
    setShowRaceForm(true);
  };
  const openEditRace = (r: RaceWithId) => {
    setEditingRace(r);
    setRaceForm({
      name: r.name,
      description: r.description,
      speed: Number(r.speed),
      ...abilitiesToForm(r.abilityBonuses),
      traitsText: traitArrayToText(r.traits),
    });
    setShowRaceForm(true);
  };
  const saveRace = async () => {
    setSavingRace(true);
    const race: CustomRace = {
      name: raceForm.name,
      description: raceForm.description,
      speed: BigInt(raceForm.speed),
      abilityBonuses: formToAbilities(raceForm),
      traits: textToTraitArray(raceForm.traitsText, raceForm.name),
    };
    if (editingRace) await actor.updateRace(editingRace.id, race);
    else await actor.addRace(race);
    await load();
    setShowRaceForm(false);
    setSavingRace(false);
  };
  const deleteRace = async (id: bigint) => {
    if (!confirm("Delete this custom race?")) return;
    await actor.deleteRace(id);
    await load();
  };

  // Class CRUD
  const openNewClass = () => {
    setEditingClass(null);
    setClassForm({ ...EMPTY_CLASS });
    setShowClassForm(true);
  };
  const openEditClass = (c: ClassWithId) => {
    setEditingClass(c);
    setClassForm({
      name: c.name,
      hitDie: Number(c.hitDie),
      description: c.description,
      proficienciesText: c.proficiencies.join("\n"),
      featuresText: traitArrayToText(c.features),
    });
    setShowClassForm(true);
  };
  const saveClass = async () => {
    setSavingClass(true);
    const proficiencies = classForm.proficienciesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const features = textToTraitArray(classForm.featuresText, classForm.name);
    const cls: CustomClass = {
      name: classForm.name,
      hitDie: BigInt(classForm.hitDie),
      description: classForm.description,
      proficiencies,
      features,
    };
    if (editingClass) await actor.updateClass(editingClass.id, cls);
    else await actor.addClass(cls);
    await load();
    setShowClassForm(false);
    setSavingClass(false);
  };
  const deleteClass = async (id: bigint) => {
    if (!confirm("Delete this custom class?")) return;
    await actor.deleteClass(id);
    await load();
  };

  // Custom Spell CRUD
  const openNewSpell = () => {
    setEditingSpell(null);
    setSpellForm({ ...EMPTY_SPELL });
    setShowSpellForm(true);
  };
  const openEditSpell = (s: SpellWithId) => {
    setEditingSpell(s);
    setSpellForm({
      name: s.name,
      level: Number(s.level),
      school: s.school,
      castingTime: s.castingTime,
      range: s.range,
      components: s.components,
      duration: s.duration,
      damageEffect: s.damageEffect,
      description: s.description,
    });
    setShowSpellForm(true);
  };
  const saveSpell = async () => {
    setSavingSpell(true);
    const spell: CustomSpell = {
      name: spellForm.name,
      level: BigInt(spellForm.level),
      school: spellForm.school,
      castingTime: spellForm.castingTime,
      range: spellForm.range,
      components: spellForm.components,
      duration: spellForm.duration,
      damageEffect: spellForm.damageEffect,
      description: spellForm.description,
      owner: {} as unknown as Principal,
    };
    if (editingSpell) await actor.updateCustomSpell(editingSpell.id, spell);
    else await actor.addCustomSpell(spell);
    await load();
    setShowSpellForm(false);
    setSavingSpell(false);
  };
  const deleteSpell = async (id: bigint) => {
    if (!confirm("Delete this custom spell?")) return;
    await actor.deleteCustomSpell(id);
    await load();
  };

  // Custom Item CRUD
  const openNewItem = () => {
    setEditingItem(null);
    setItemForm({ ...EMPTY_ITEM });
    setShowItemForm(true);
  };
  const openEditItem = (item: ItemWithId) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      weight: item.weight,
      value: item.value,
      itemType: item.itemType,
      rarity: item.rarity,
    });
    setShowItemForm(true);
  };
  const saveItem = async () => {
    setSavingItem(true);
    const item: CustomItem = {
      name: itemForm.name,
      description: itemForm.description,
      weight: itemForm.weight,
      value: itemForm.value,
      itemType: itemForm.itemType,
      rarity: itemForm.rarity,
      owner: {} as unknown as Principal,
    };
    if (editingItem) await actor.updateCustomItem(editingItem.id, item);
    else await actor.addCustomItem(item);
    await load();
    setShowItemForm(false);
    setSavingItem(false);
  };
  const deleteItem = async (id: bigint) => {
    if (!confirm("Delete this custom item?")) return;
    await actor.deleteCustomItem(id);
    await load();
  };

  const tabs: { id: Section; label: string }[] = [
    { id: "general", label: "General" },
    { id: "races", label: `Custom Races (${races.length})` },
    { id: "classes", label: `Custom Classes (${classes.length})` },
    { id: "spells", label: `Custom Spells (${customSpells.length})` },
    { id: "items", label: `Custom Items (${customItems.length})` },
  ];

  const tabStyle = (id: Section) => ({
    background: "transparent",
    border: "none",
    borderBottom:
      section === id ? "2px solid var(--ds-gold)" : "2px solid transparent",
    color: section === id ? "var(--ds-gold)" : "var(--ds-muted)",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "Cinzel, serif",
    marginBottom: -1,
    whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <button
          type="button"
          className="ds-btn-ghost"
          onClick={onBack}
          style={{ fontSize: 13, marginBottom: 8 }}
        >
          ← Back
        </button>
        <h1
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 28 }}
        >
          Settings
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--ds-border)",
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setSection(t.id)}
            style={tabStyle(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--ds-muted)" }}>Loading settings...</p>
      ) : (
        <>
          {/* General */}
          {section === "general" && (
            <div className="ds-card" style={{ padding: 24, maxWidth: 400 }}>
              <h3
                className="font-cinzel"
                style={{
                  color: "var(--ds-gold)",
                  fontSize: 16,
                  marginBottom: 16,
                }}
              >
                LEVEL SETTINGS
              </h3>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  marginBottom: 8,
                }}
              >
                <span className="ds-label">Maximum Character Level</span>
                <input
                  className="ds-input"
                  type="number"
                  min={1}
                  max={10000}
                  value={maxLevel}
                  onChange={(e) =>
                    setMaxLevel(
                      Math.min(
                        10000,
                        Math.max(1, Number.parseInt(e.target.value) || 1),
                      ),
                    )
                  }
                  style={{ width: 100 }}
                  data-ocid="settings.input"
                />
              </label>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={saveMaxLevel}
                disabled={savingLevel || maxLevel === savedMaxLevel}
                style={{ fontFamily: "Cinzel, serif" }}
                data-ocid="settings.save_button"
              >
                {savingLevel ? "Saving..." : "Save"}
              </button>
              <p
                style={{ color: "var(--ds-muted)", fontSize: 13, marginTop: 8 }}
              >
                Current: {savedMaxLevel}. Range: 1–10,000.
              </p>
            </div>
          )}

          {/* Custom Races */}
          {section === "races" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Custom races appear in the character creation form.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewRace}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="races.primary_button"
                >
                  + Add Race
                </button>
              </div>
              {races.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="races.empty_state"
                >
                  No custom races. Add your homebrew races here!
                </p>
              ) : (
                races.map((r, i) => (
                  <div
                    key={r.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`races.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "var(--ds-text)",
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {r.name}
                        </div>
                        <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                          Speed: {r.speed.toString()} ft
                        </div>
                        <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                          Bonuses: {formatAbilityBonuses(r.abilityBonuses)}
                        </div>
                        {r.traits.length > 0 && (
                          <div
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            Traits: {r.traits.map((t) => t.name).join(", ")}
                          </div>
                        )}
                        {r.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              marginTop: 6,
                            }}
                          >
                            {r.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => openEditRace(r)}
                          data-ocid={`races.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRace(r.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#666",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          data-ocid={`races.delete_button.${i + 1}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Classes */}
          {section === "classes" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Custom classes appear in the character creation form.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewClass}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="classes.primary_button"
                >
                  + Add Class
                </button>
              </div>
              {classes.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="classes.empty_state"
                >
                  No custom classes. Add your homebrew classes here!
                </p>
              ) : (
                classes.map((c, i) => (
                  <div
                    key={c.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`classes.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "var(--ds-text)",
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {c.name}
                        </div>
                        <div style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                          Hit Die: d{c.hitDie.toString()}
                        </div>
                        {c.proficiencies.length > 0 && (
                          <div
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            Proficiencies: {c.proficiencies.join(", ")}
                          </div>
                        )}
                        {c.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              marginTop: 6,
                            }}
                          >
                            {c.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => openEditClass(c)}
                          data-ocid={`classes.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteClass(c.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#666",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          data-ocid={`classes.delete_button.${i + 1}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Spells Library */}
          {section === "spells" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Your homebrew spell library. Use "Add from Library" in the
                  Spells tab to add these to a character.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewSpell}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="spells.primary_button"
                >
                  + Add Spell
                </button>
              </div>
              {customSpells.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="spells.empty_state"
                >
                  No custom spells yet. Create your homebrew spells here!
                </p>
              ) : (
                customSpells.map((s, i) => (
                  <div
                    key={s.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`spells.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{ color: "var(--ds-text)", fontWeight: 600 }}
                          >
                            {s.name}
                          </span>
                          <span
                            style={{
                              color: "var(--ds-gold)",
                              fontSize: 11,
                              backgroundColor: "rgba(201,163,90,0.1)",
                              padding: "2px 6px",
                              borderRadius: 10,
                            }}
                          >
                            {s.school}
                          </span>
                          <span
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            {Number(s.level) === 0
                              ? "Cantrip"
                              : `Level ${s.level}`}
                          </span>
                        </div>
                        <div
                          style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                        >
                          {s.castingTime && (
                            <span
                              style={{ color: "var(--ds-muted)", fontSize: 12 }}
                            >
                              ⏱ {s.castingTime}
                            </span>
                          )}
                          {s.range && (
                            <span
                              style={{ color: "var(--ds-muted)", fontSize: 12 }}
                            >
                              🞹 {s.range}
                            </span>
                          )}
                          {s.duration && (
                            <span
                              style={{ color: "var(--ds-muted)", fontSize: 12 }}
                            >
                              ⧐ {s.duration}
                            </span>
                          )}
                          {s.damageEffect && (
                            <span style={{ color: "#e74c3c", fontSize: 12 }}>
                              ⚔️ {s.damageEffect}
                            </span>
                          )}
                        </div>
                        {s.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              marginTop: 6,
                              lineHeight: 1.5,
                            }}
                          >
                            {s.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => openEditSpell(s)}
                          data-ocid={`spells.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSpell(s.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#666",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          data-ocid={`spells.delete_button.${i + 1}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custom Items Library */}
          {section === "items" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ color: "var(--ds-muted)", fontSize: 14 }}>
                  Your homebrew item library. Use "Add from Library" in the
                  Inventory tab to add these to a character.
                </p>
                <button
                  type="button"
                  className="ds-btn-primary"
                  onClick={openNewItem}
                  style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
                  data-ocid="items.primary_button"
                >
                  + Add Item
                </button>
              </div>
              {customItems.length === 0 ? (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    textAlign: "center",
                    marginTop: 32,
                  }}
                  data-ocid="items.empty_state"
                >
                  No custom items yet. Create your homebrew items here!
                </p>
              ) : (
                customItems.map((item, i) => (
                  <div
                    key={item.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
                    data-ocid={`items.item.${i + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{ color: "var(--ds-text)", fontWeight: 600 }}
                          >
                            {item.name}
                          </span>
                          <span
                            style={{
                              color: "var(--ds-gold)",
                              fontSize: 11,
                              backgroundColor: "rgba(201,163,90,0.1)",
                              padding: "2px 6px",
                              borderRadius: 10,
                            }}
                          >
                            {item.itemType}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "2px 6px",
                              borderRadius: 10,
                              color:
                                item.rarity === "Legendary" ||
                                item.rarity === "Artifact"
                                  ? "#ff9900"
                                  : item.rarity === "Very Rare"
                                    ? "#c040fb"
                                    : item.rarity === "Rare"
                                      ? "#4488ff"
                                      : item.rarity === "Uncommon"
                                        ? "#44cc44"
                                        : "var(--ds-muted)",
                              backgroundColor: "rgba(255,255,255,0.05)",
                            }}
                          >
                            {item.rarity}
                          </span>
                        </div>
                        <div
                          style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                        >
                          {item.weight && (
                            <span
                              style={{ color: "var(--ds-muted)", fontSize: 12 }}
                            >
                              ⚖ {item.weight}
                            </span>
                          )}
                          {item.value && (
                            <span
                              style={{ color: "var(--ds-gold)", fontSize: 12 }}
                            >
                              💰 {item.value}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p
                            style={{
                              color: "var(--ds-muted)",
                              fontSize: 12,
                              marginTop: 6,
                              lineHeight: 1.5,
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => openEditItem(item)}
                          data-ocid={`items.edit_button.${i + 1}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#666",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          data-ocid={`items.delete_button.${i + 1}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Race Form Modal */}
      {showRaceForm && (
        <Modal
          onClose={() => setShowRaceForm(false)}
          title={editingRace ? "Edit Race" : "New Custom Race"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Race Name *">
              <input
                className="ds-input"
                value={raceForm.name}
                onChange={(e) =>
                  setRaceForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Speed (ft)">
              <input
                className="ds-input"
                type="number"
                min={0}
                value={raceForm.speed}
                onChange={(e) =>
                  setRaceForm((p) => ({
                    ...p,
                    speed: Number.parseInt(e.target.value) || 30,
                  }))
                }
              />
            </Field>
            <div>
              <span
                className="ds-label"
                style={{ display: "block", marginBottom: 6 }}
              >
                Ability Bonuses
              </span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}
              >
                {(
                  [
                    "ab_str",
                    "ab_dex",
                    "ab_con",
                    "ab_int",
                    "ab_wis",
                    "ab_cha",
                  ] as const
                ).map((key) => (
                  <label
                    key={key}
                    style={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <span
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                      }}
                    >
                      {key.replace("ab_", "")}
                    </span>
                    <input
                      className="ds-input"
                      type="number"
                      value={raceForm[key]}
                      onChange={(e) =>
                        setRaceForm((p) => ({
                          ...p,
                          [key]: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
            <Field label="Racial Traits (one per line, optionally: Name: Description)">
              <textarea
                className="ds-input"
                value={raceForm.traitsText}
                onChange={(e) =>
                  setRaceForm((p) => ({ ...p, traitsText: e.target.value }))
                }
                rows={3}
                placeholder="Darkvision: Can see in dim light up to 60 ft.\nFey Ancestry"
                style={{ resize: "vertical" }}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="ds-input"
                value={raceForm.description}
                onChange={(e) =>
                  setRaceForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                style={{ resize: "vertical" }}
              />
            </Field>
          </div>
          <ModalFooter
            onClose={() => setShowRaceForm(false)}
            onSave={saveRace}
            saving={savingRace}
            disabled={!raceForm.name.trim()}
            label={editingRace ? "Save Changes" : "Add Race"}
          />
        </Modal>
      )}

      {/* Class Form Modal */}
      {showClassForm && (
        <Modal
          onClose={() => setShowClassForm(false)}
          title={editingClass ? "Edit Class" : "New Custom Class"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Class Name *">
              <input
                className="ds-input"
                value={classForm.name}
                onChange={(e) =>
                  setClassForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Hit Die (e.g. 8 for d8)">
              <input
                className="ds-input"
                type="number"
                min={4}
                max={20}
                value={classForm.hitDie}
                onChange={(e) =>
                  setClassForm((p) => ({
                    ...p,
                    hitDie: Number.parseInt(e.target.value) || 8,
                  }))
                }
              />
            </Field>
            <Field label="Proficiencies (one per line)">
              <textarea
                className="ds-input"
                value={classForm.proficienciesText}
                onChange={(e) =>
                  setClassForm((p) => ({
                    ...p,
                    proficienciesText: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Light Armor\nSimple Weapons\nSaving Throws: Dexterity"
                style={{ resize: "vertical" }}
              />
            </Field>
            <Field label="Class Features (one per line, optionally: Name: Description)">
              <textarea
                className="ds-input"
                value={classForm.featuresText}
                onChange={(e) =>
                  setClassForm((p) => ({ ...p, featuresText: e.target.value }))
                }
                rows={4}
                placeholder="Sneak Attack: Extra damage when you have advantage\nCunning Action"
                style={{ resize: "vertical" }}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="ds-input"
                value={classForm.description}
                onChange={(e) =>
                  setClassForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                style={{ resize: "vertical" }}
              />
            </Field>
          </div>
          <ModalFooter
            onClose={() => setShowClassForm(false)}
            onSave={saveClass}
            saving={savingClass}
            disabled={!classForm.name.trim()}
            label={editingClass ? "Save Changes" : "Add Class"}
          />
        </Modal>
      )}

      {/* Custom Spell Form Modal */}
      {showSpellForm && (
        <Modal
          onClose={() => setShowSpellForm(false)}
          title={editingSpell ? "Edit Custom Spell" : "New Custom Spell"}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Spell Name *">
                <input
                  className="ds-input"
                  value={spellForm.name}
                  onChange={(e) =>
                    setSpellForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Arcane Bolt"
                />
              </Field>
            </div>
            <Field label="Level (0 = Cantrip)">
              <input
                className="ds-input"
                type="number"
                min={0}
                max={9}
                value={spellForm.level}
                onChange={(e) =>
                  setSpellForm((p) => ({
                    ...p,
                    level: Number.parseInt(e.target.value) || 0,
                  }))
                }
              />
            </Field>
            <Field label="School">
              <select
                className="ds-input"
                value={spellForm.school}
                onChange={(e) =>
                  setSpellForm((p) => ({ ...p, school: e.target.value }))
                }
              >
                {SPELL_SCHOOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Casting Time">
              <input
                className="ds-input"
                value={spellForm.castingTime}
                onChange={(e) =>
                  setSpellForm((p) => ({ ...p, castingTime: e.target.value }))
                }
              />
            </Field>
            <Field label="Range">
              <input
                className="ds-input"
                value={spellForm.range}
                onChange={(e) =>
                  setSpellForm((p) => ({ ...p, range: e.target.value }))
                }
              />
            </Field>
            <Field label="Components">
              <input
                className="ds-input"
                value={spellForm.components}
                onChange={(e) =>
                  setSpellForm((p) => ({ ...p, components: e.target.value }))
                }
              />
            </Field>
            <Field label="Duration">
              <input
                className="ds-input"
                value={spellForm.duration}
                onChange={(e) =>
                  setSpellForm((p) => ({ ...p, duration: e.target.value }))
                }
              />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Damage / Effect">
                <input
                  className="ds-input"
                  value={spellForm.damageEffect}
                  onChange={(e) =>
                    setSpellForm((p) => ({
                      ...p,
                      damageEffect: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Description">
                <textarea
                  className="ds-input"
                  value={spellForm.description}
                  onChange={(e) =>
                    setSpellForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </Field>
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowSpellForm(false)}
            onSave={saveSpell}
            saving={savingSpell}
            disabled={!spellForm.name.trim()}
            label={editingSpell ? "Save Changes" : "Add Spell"}
          />
        </Modal>
      )}

      {/* Custom Item Form Modal */}
      {showItemForm && (
        <Modal
          onClose={() => setShowItemForm(false)}
          title={editingItem ? "Edit Custom Item" : "New Custom Item"}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Item Name *">
                <input
                  className="ds-input"
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Vorpal Sword"
                />
              </Field>
            </div>
            <Field label="Item Type">
              <select
                className="ds-input"
                value={itemForm.itemType}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, itemType: e.target.value }))
                }
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rarity">
              <select
                className="ds-input"
                value={itemForm.rarity}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, rarity: e.target.value }))
                }
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Weight">
              <input
                className="ds-input"
                value={itemForm.weight}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, weight: e.target.value }))
                }
                placeholder="e.g. 3 lbs"
              />
            </Field>
            <Field label="Value">
              <input
                className="ds-input"
                value={itemForm.value}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, value: e.target.value }))
                }
                placeholder="e.g. 1500 gp"
              />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Description">
                <textarea
                  className="ds-input"
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </Field>
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowItemForm(false)}
            onSave={saveItem}
            saving={savingItem}
            disabled={!itemForm.name.trim()}
            label={editingItem ? "Save Changes" : "Add Item"}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
}: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="ds-card"
        style={{
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          overflow: "auto",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 18 }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--ds-muted)",
              cursor: "pointer",
              fontSize: 20,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="ds-label">{label}</span>
      {children}
    </div>
  );
}

function ModalFooter({
  onClose,
  onSave,
  saving,
  disabled,
  label,
}: {
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  disabled: boolean;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginTop: 20,
        justifyContent: "flex-end",
      }}
    >
      <button type="button" className="ds-btn-ghost" onClick={onClose}>
        Cancel
      </button>
      <button
        type="button"
        className="ds-btn-primary"
        onClick={onSave}
        disabled={saving || disabled}
        style={{ fontFamily: "Cinzel, serif" }}
      >
        {saving ? "Saving..." : label}
      </button>
    </div>
  );
}
