import type { Principal } from "@icp-sdk/core/principal";
import { useCallback, useEffect, useState } from "react";
import type { Character, CustomSpell, DndBackend, Spell } from "../../types";

interface Props {
  actor: DndBackend;
  character: Character;
  characterId: bigint;
  onUpdate: () => void;
}

type SpellWithId = { id: bigint } & Spell;
type CustomSpellWithId = { id: bigint } & CustomSpell;

const SCHOOLS = [
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation",
];
const EMPTY_SPELL = {
  name: "",
  level: 0,
  school: "Evocation",
  castingTime: "1 action",
  range: "",
  components: "",
  duration: "",
  description: "",
  damageEffect: "",
};

export default function SpellsTab({
  actor,
  character,
  characterId,
  onUpdate,
}: Props) {
  const [spells, setSpells] = useState<SpellWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SpellWithId | null>(null);
  const [form, setForm] = useState({ ...EMPTY_SPELL });
  const [saving, setSaving] = useState(false);
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [editingSlots, setEditingSlots] = useState(false);
  const [slotsForm, setSlotsForm] = useState<number[]>(
    Array.from({ length: 10 }, (_, i) => Number(character.spellSlots[i] ?? 0)),
  );

  // Library modal state
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySpells, setLibrarySpells] = useState<CustomSpellWithId[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [addingFromLib, setAddingFromLib] = useState<bigint | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = (await actor.getSpellsByCharacter(
      characterId,
    )) as unknown as [bigint, Spell][];
    setSpells(result.map(([id, spell]) => ({ id, ...spell })));
    setLoading(false);
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const openLibrary = async () => {
    setShowLibrary(true);
    setLibrarySearch("");
    setLibraryLoading(true);
    const result = (await actor.getAllCustomSpells()) as unknown as [
      bigint,
      CustomSpell,
    ][];
    setLibrarySpells(result.map(([id, s]) => ({ id, ...s })));
    setLibraryLoading(false);
  };

  const addFromLibrary = async (libSpell: CustomSpellWithId) => {
    setAddingFromLib(libSpell.id);
    const spell: Spell = {
      characterId,
      name: libSpell.name,
      level: libSpell.level,
      school: libSpell.school,
      castingTime: libSpell.castingTime,
      range: libSpell.range,
      components: libSpell.components,
      duration: libSpell.duration,
      description: libSpell.description,
      damageEffect: libSpell.damageEffect,
    };
    await actor.addSpell(spell);
    await load();
    setAddingFromLib(null);
    setShowLibrary(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_SPELL });
    setShowForm(true);
  };
  const openEdit = (s: SpellWithId) => {
    setEditing(s);
    setForm({
      name: s.name,
      level: Number(s.level),
      school: s.school,
      castingTime: s.castingTime,
      range: s.range,
      components: s.components,
      duration: s.duration,
      description: s.description,
      damageEffect: s.damageEffect,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const spell: Spell = {
      characterId,
      name: form.name,
      level: BigInt(form.level),
      school: form.school,
      castingTime: form.castingTime,
      range: form.range,
      components: form.components,
      duration: form.duration,
      description: form.description,
      damageEffect: form.damageEffect,
    };
    if (editing) await actor.updateSpell(editing.id, spell);
    else await actor.addSpell(spell);
    await load();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this spell?")) return;
    await actor.deleteSpell(id);
    await load();
  };

  const saveSlots = async () => {
    await actor.updateCharacter(characterId, {
      ...character,
      spellSlots: slotsForm.map((n) => BigInt(n)),
    });
    await onUpdate();
    setEditingSlots(false);
  };

  const f = (field: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [field]: val }));
  const filtered =
    filterLevel !== null
      ? spells.filter((s) => Number(s.level) === filterLevel)
      : spells;
  const grouped = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map((lvl) => ({
      lvl,
      spells: filtered.filter((s) => Number(s.level) === lvl),
    }))
    .filter((g) =>
      filterLevel === null ? g.spells.length > 0 : g.lvl === filterLevel,
    );

  const filteredLibrary = librarySpells.filter(
    (s) =>
      s.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      s.school.toLowerCase().includes(librarySearch.toLowerCase()),
  );

  return (
    <div>
      {/* Spell Slots */}
      <div className="ds-card" style={{ padding: 16, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14 }}
          >
            SPELL SLOTS
          </h3>
          {!editingSlots ? (
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12, padding: "4px 8px" }}
              onClick={() => setEditingSlots(true)}
            >
              Edit
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={saveSlots}
                style={{ fontSize: 12, padding: "4px 10px" }}
              >
                Save
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditingSlots(false)}
                style={{ fontSize: 12 }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
            <div key={lvl} style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "var(--ds-muted)",
                  fontSize: 10,
                  marginBottom: 4,
                }}
              >
                LVL {lvl}
              </div>
              {editingSlots ? (
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={slotsForm[lvl]}
                  onChange={(e) => {
                    const s = [...slotsForm];
                    s[lvl] = Number.parseInt(e.target.value) || 0;
                    setSlotsForm(s);
                  }}
                  style={{
                    width: 44,
                    textAlign: "center",
                    backgroundColor: "var(--ds-surface2)",
                    border: "1px solid var(--ds-gold)",
                    color: "var(--ds-text)",
                    borderRadius: 4,
                    padding: "4px 0",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 44,
                    height: 36,
                    backgroundColor: "var(--ds-surface2)",
                    border: "1px solid var(--ds-border)",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ds-gold)",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {Number(character.spellSlots[lvl] ?? 0)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setFilterLevel(null)}
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid var(--ds-border)",
              backgroundColor:
                filterLevel === null ? "var(--ds-maroon)" : "transparent",
              color: filterLevel === null ? "#F2E9DB" : "var(--ds-muted)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            All
          </button>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
            <button
              type="button"
              key={lvl}
              onClick={() => setFilterLevel(filterLevel === lvl ? null : lvl)}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid var(--ds-border)",
                backgroundColor:
                  filterLevel === lvl ? "var(--ds-maroon)" : "transparent",
                color: filterLevel === lvl ? "#F2E9DB" : "var(--ds-muted)",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {lvl === 0 ? "Cantrip" : `L${lvl}`}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={openLibrary}
            style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
            data-ocid="spells.secondary_button"
          >
            📚 Library
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={openNew}
            style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
            data-ocid="spells.primary_button"
          >
            + Add Spell
          </button>
        </div>
      </div>

      {/* Spell List */}
      {loading ? (
        <p style={{ color: "var(--ds-muted)" }}>Loading spells...</p>
      ) : grouped.length === 0 ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            marginTop: 32,
          }}
          data-ocid="spells.empty_state"
        >
          No spells found. Add your first spell!
        </p>
      ) : (
        grouped.map(({ lvl, spells: lvlSpells }) => (
          <div key={lvl} style={{ marginBottom: 20 }}>
            <h3
              className="font-cinzel"
              style={{
                color: "var(--ds-gold)",
                fontSize: 13,
                marginBottom: 8,
                borderBottom: "1px solid var(--ds-border)",
                paddingBottom: 6,
              }}
            >
              {lvl === 0 ? "CANTRIPS" : `LEVEL ${lvl}`}
            </h3>
            {lvlSpells.map((spell, i) => (
              <div
                key={spell.id.toString()}
                className="ds-card2"
                style={{ padding: 12, marginBottom: 8 }}
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
                      }}
                    >
                      <span
                        style={{ color: "var(--ds-text)", fontWeight: 600 }}
                      >
                        {spell.name}
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
                        {spell.school}
                      </span>
                      {spell.components && (
                        <span
                          style={{ color: "var(--ds-muted)", fontSize: 11 }}
                        >
                          ({spell.components})
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        marginTop: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      {spell.castingTime && (
                        <span
                          style={{ color: "var(--ds-muted)", fontSize: 12 }}
                        >
                          ⏱ {spell.castingTime}
                        </span>
                      )}
                      {spell.range && (
                        <span
                          style={{ color: "var(--ds-muted)", fontSize: 12 }}
                        >
                          🞹 {spell.range}
                        </span>
                      )}
                      {spell.duration && (
                        <span
                          style={{ color: "var(--ds-muted)", fontSize: 12 }}
                        >
                          ⧐ {spell.duration}
                        </span>
                      )}
                      {spell.damageEffect && (
                        <span style={{ color: "#e74c3c", fontSize: 12 }}>
                          ⚔️ {spell.damageEffect}
                        </span>
                      )}
                    </div>
                    {spell.description && (
                      <p
                        style={{
                          color: "var(--ds-muted)",
                          fontSize: 12,
                          marginTop: 6,
                          lineHeight: 1.5,
                        }}
                      >
                        {spell.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 12, padding: "4px 8px" }}
                      onClick={() => openEdit(spell)}
                      data-ocid={`spells.edit_button.${i + 1}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(spell.id)}
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
            ))}
          </div>
        ))
      )}

      {/* Spell Form Modal */}
      {showForm && (
        <SpellFormDialog
          form={form}
          schools={SCHOOLS}
          onField={f}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
          saving={saving}
          editing={!!editing}
        />
      )}

      {/* Library Modal */}
      {showLibrary && (
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
          data-ocid="spells.modal"
        >
          <div
            className="ds-card"
            style={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "85vh",
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
                📚 Spell Library
              </h2>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ds-muted)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
                data-ocid="spells.close_button"
              >
                ×
              </button>
            </div>
            <input
              className="ds-input"
              placeholder="Search spells..."
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              style={{ marginBottom: 16, width: "100%" }}
              data-ocid="spells.search_input"
            />
            {libraryLoading ? (
              <p
                style={{ color: "var(--ds-muted)" }}
                data-ocid="spells.loading_state"
              >
                Loading library...
              </p>
            ) : filteredLibrary.length === 0 ? (
              <p
                style={{
                  color: "var(--ds-muted)",
                  textAlign: "center",
                  padding: "24px 0",
                }}
                data-ocid="spells.empty_state"
              >
                {librarySpells.length === 0
                  ? "No custom spells in your library. Add spells in Settings → Custom Spells."
                  : "No spells match your search."}
              </p>
            ) : (
              filteredLibrary.map((s) => (
                <div
                  key={s.id.toString()}
                  className="ds-card2"
                  style={{
                    padding: 12,
                    marginBottom: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
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
                      <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                        {Number(s.level) === 0 ? "Cantrip" : `Level ${s.level}`}
                      </span>
                    </div>
                    {s.damageEffect && (
                      <div
                        style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}
                      >
                        ⚔️ {s.damageEffect}
                      </div>
                    )}
                    {s.description && (
                      <p
                        style={{
                          color: "var(--ds-muted)",
                          fontSize: 12,
                          marginTop: 4,
                          lineHeight: 1.5,
                        }}
                      >
                        {s.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="ds-btn-primary"
                    onClick={() => addFromLibrary(s)}
                    disabled={addingFromLib === s.id}
                    style={{
                      fontSize: 12,
                      padding: "6px 12px",
                      fontFamily: "Cinzel, serif",
                      flexShrink: 0,
                    }}
                  >
                    {addingFromLib === s.id ? "Adding..." : "+ Add"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SpellFormDialog({
  form,
  schools,
  onField,
  onSave,
  onClose,
  saving,
  editing,
}: {
  form: Record<string, string | number>;
  schools: string[];
  onField: (k: string, v: string | number) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  editing: boolean;
}) {
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
      data-ocid="spells.dialog"
    >
      <div
        className="ds-card"
        style={{
          width: "100%",
          maxWidth: 560,
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
            {editing ? "Edit Spell" : "Add Spell"}
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
            data-ocid="spells.close_button"
          >
            ×
          </button>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <label
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span className="ds-label">Spell Name *</span>
            <input
              className="ds-input"
              value={form.name as string}
              onChange={(e) => onField("name", e.target.value)}
              placeholder="e.g. Fireball"
              data-ocid="spells.input"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="ds-label">Level (0 = Cantrip)</span>
            <input
              className="ds-input"
              type="number"
              min={0}
              max={9}
              value={form.level as number}
              onChange={(e) =>
                onField("level", Number.parseInt(e.target.value) || 0)
              }
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="ds-label">School</span>
            <select
              className="ds-input"
              value={form.school as string}
              onChange={(e) => onField("school", e.target.value)}
            >
              {schools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {(
            [
              ["castingTime", "Casting Time"],
              ["range", "Range"],
              ["components", "Components"],
              ["duration", "Duration"],
              ["damageEffect", "Damage / Effect"],
            ] as [string, string][]
          ).map(([k, l]) => (
            <label
              key={k}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <span className="ds-label">{l}</span>
              <input
                className="ds-input"
                value={form[k] as string}
                onChange={(e) => onField(k, e.target.value)}
              />
            </label>
          ))}
          <label
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span className="ds-label">Description</span>
            <textarea
              className="ds-input"
              value={form.description as string}
              onChange={(e) => onField("description", e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </label>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 20,
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={onClose}
            data-ocid="spells.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={onSave}
            disabled={saving || !(form.name as string).trim()}
            style={{ fontFamily: "Cinzel, serif" }}
            data-ocid="spells.submit_button"
          >
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Spell"}
          </button>
        </div>
      </div>
    </div>
  );
}
