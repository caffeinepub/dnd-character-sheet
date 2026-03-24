import type { Principal } from "@icp-sdk/core/principal";
import { useCallback, useEffect, useState } from "react";
import type {
  CharacterPhysicalAttack,
  CustomPhysicalAttack,
  DndBackend,
} from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

type AttackWithId = { id: bigint } & CharacterPhysicalAttack;
type CustomAttackWithId = { id: bigint } & CustomPhysicalAttack;

const DAMAGE_TYPES = [
  "Bludgeoning",
  "Piercing",
  "Slashing",
  "Fire",
  "Cold",
  "Lightning",
  "Poison",
  "Acid",
  "Necrotic",
  "Radiant",
  "Force",
  "Psychic",
  "Thunder",
  "Other",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  damageDice: "",
  attackBonus: 0,
  damageType: "Bludgeoning",
  range: "",
  properties: "",
};

const DAMAGE_TYPE_COLORS: Record<string, string> = {
  Bludgeoning: "#8b7355",
  Piercing: "#6b8b9e",
  Slashing: "#c0392b",
  Fire: "#e67e22",
  Cold: "#5dade2",
  Lightning: "#f4d03f",
  Poison: "#27ae60",
  Acid: "#a9cce3",
  Necrotic: "#7c5cbf",
  Radiant: "#f9e79f",
  Force: "#ec407a",
  Psychic: "#ab47bc",
  Thunder: "#7986cb",
  Other: "#90a4ae",
};

function formatBonus(bonus: bigint): string {
  const n = Number(bonus);
  return n >= 0 ? `+${n}` : `${n}`;
}

export default function AttacksTab({ actor, characterId }: Props) {
  const [attacks, setAttacks] = useState<AttackWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AttackWithId | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Library modal
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryAttacks, setLibraryAttacks] = useState<CustomAttackWithId[]>(
    [],
  );
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [addingFromLib, setAddingFromLib] = useState<bigint | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = (await actor.getPhysicalAttacksByCharacter(
      characterId,
    )) as unknown as [bigint, CharacterPhysicalAttack][];
    setAttacks(result.map(([id, a]) => ({ id, ...a })));
    setLoading(false);
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const openLibrary = async () => {
    setShowLibrary(true);
    setLibrarySearch("");
    setLibraryLoading(true);
    const result = (await actor.getAllCustomPhysicalAttacks()) as unknown as [
      bigint,
      CustomPhysicalAttack,
    ][];
    setLibraryAttacks(result.map(([id, a]) => ({ id, ...a })));
    setLibraryLoading(false);
  };

  const addFromLibrary = async (lib: CustomAttackWithId) => {
    setAddingFromLib(lib.id);
    try {
      const attack: CharacterPhysicalAttack = {
        characterId,
        name: lib.name,
        description: lib.description,
        damageDice: lib.damageDice,
        attackBonus: lib.attackBonus,
        damageType: lib.damageType,
        range: lib.range,
        properties: lib.properties,
        timesUsed: 0n,
      };
      await actor.addCharacterPhysicalAttack(attack);
      await load();
      setAddingFromLib(null);
      setShowLibrary(false);
    } catch (err) {
      setAddingFromLib(null);
      alert(`Failed to add attack: ${String(err)}`);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (a: AttackWithId) => {
    setEditing(a);
    setForm({
      name: a.name,
      description: a.description,
      damageDice: a.damageDice,
      attackBonus: Number(a.attackBonus),
      damageType: a.damageType,
      range: a.range,
      properties: a.properties,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const attack: CharacterPhysicalAttack = {
        characterId,
        name: form.name,
        description: form.description,
        damageDice: form.damageDice,
        attackBonus: BigInt(form.attackBonus),
        damageType: form.damageType,
        range: form.range,
        properties: form.properties,
        timesUsed: editing ? editing.timesUsed : 0n,
      };
      if (editing)
        await actor.updateCharacterPhysicalAttack(editing.id, attack);
      else await actor.addCharacterPhysicalAttack(attack);
      await load();
      setShowForm(false);
    } catch (err) {
      alert(`Failed to save attack: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this attack?")) return;
    await actor.deleteCharacterPhysicalAttack(id);
    await load();
  };

  const handleUse = async (a: AttackWithId) => {
    const updated: CharacterPhysicalAttack = {
      ...a,
      timesUsed: a.timesUsed + 1n,
    };
    await actor.updateCharacterPhysicalAttack(a.id, updated);
    await load();
  };

  const handleReset = async (a: AttackWithId) => {
    const updated: CharacterPhysicalAttack = { ...a, timesUsed: 0n };
    await actor.updateCharacterPhysicalAttack(a.id, updated);
    await load();
  };

  const filteredLib = libraryAttacks.filter(
    (a) =>
      a.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      a.description.toLowerCase().includes(librarySearch.toLowerCase()),
  );

  const f = (field: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <div data-ocid="attacks.section">
      {/* Header */}
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
        <h2
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 18 }}
        >
          Physical Attacks
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={openLibrary}
            data-ocid="attacks.open_modal_button"
          >
            📚 Library
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={openNew}
            data-ocid="attacks.primary_button"
          >
            + Add Attack
          </button>
        </div>
      </div>

      {/* Attacks List */}
      {loading ? (
        <div
          style={{ color: "var(--ds-muted)", padding: 32, textAlign: "center" }}
          data-ocid="attacks.loading_state"
        >
          Loading attacks...
        </div>
      ) : attacks.length === 0 ? (
        <div
          className="ds-card"
          style={{ padding: 32, textAlign: "center" }}
          data-ocid="attacks.empty_state"
        >
          <p style={{ color: "var(--ds-muted)", marginBottom: 12 }}>
            No physical attacks yet. Add from your library or create a new one.
          </p>
          <button type="button" className="ds-btn-ghost" onClick={openNew}>
            + Add Your First Attack
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {attacks.map((a, idx) => {
            const typeColor = DAMAGE_TYPE_COLORS[a.damageType] || "#90a4ae";
            return (
              <div
                key={a.id.toString()}
                className="ds-card"
                style={{ padding: 14 }}
                data-ocid={`attacks.item.${idx + 1}`}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + badges */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--ds-text)",
                          fontWeight: 700,
                          fontFamily: "Cinzel, serif",
                          fontSize: 15,
                        }}
                      >
                        {a.name}
                      </span>
                      {a.damageDice && (
                        <span
                          style={{
                            color: typeColor,
                            fontSize: 12,
                            border: `1px solid ${typeColor}`,
                            borderRadius: 6,
                            padding: "2px 7px",
                            fontWeight: 600,
                          }}
                        >
                          {a.damageDice} {a.damageType}
                        </span>
                      )}
                      <span
                        style={{
                          color:
                            Number(a.attackBonus) >= 0 ? "#4CAF50" : "#e57373",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {formatBonus(a.attackBonus)} to hit
                      </span>
                    </div>
                    {/* Range + properties */}
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        marginBottom: a.description ? 6 : 0,
                      }}
                    >
                      {a.range && (
                        <span
                          style={{ color: "var(--ds-muted)", fontSize: 12 }}
                        >
                          🗡 {a.range}
                        </span>
                      )}
                      {a.properties && (
                        <span
                          style={{ color: "var(--ds-muted)", fontSize: 12 }}
                        >
                          ✦ {a.properties}
                        </span>
                      )}
                    </div>
                    {a.description && (
                      <p
                        style={{
                          color: "var(--ds-muted)",
                          fontSize: 13,
                          margin: 0,
                          lineHeight: 1.4,
                          marginBottom: 8,
                        }}
                      >
                        {a.description}
                      </p>
                    )}
                    {/* Times used tracker */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--ds-muted)",
                          fontSize: 12,
                          border: "1px solid var(--ds-border)",
                          borderRadius: 6,
                          padding: "2px 8px",
                        }}
                      >
                        Used: {a.timesUsed.toString()}
                      </span>
                      <button
                        type="button"
                        className="ds-btn-ghost"
                        style={{ fontSize: 12, padding: "3px 10px" }}
                        onClick={() => handleUse(a)}
                        data-ocid={`attacks.toggle.${idx + 1}`}
                      >
                        +1 Use
                      </button>
                      {a.timesUsed > 0n && (
                        <button
                          type="button"
                          className="ds-btn-ghost"
                          style={{
                            fontSize: 12,
                            padding: "3px 10px",
                            color: "var(--ds-muted)",
                          }}
                          onClick={() => handleReset(a)}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginLeft: 8,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 12 }}
                      onClick={() => openEdit(a)}
                      data-ocid={`attacks.edit_button.${idx + 1}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ds-btn-ghost"
                      style={{ fontSize: 12, color: "#c0392b" }}
                      onClick={() => handleDelete(a.id)}
                      data-ocid={`attacks.delete_button.${idx + 1}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Library Modal */}
      {showLibrary && (
        <Modal
          onClose={() => setShowLibrary(false)}
          title="Add Attack from Library"
        >
          <input
            className="ds-input"
            placeholder="Search attacks..."
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
            style={{ marginBottom: 12 }}
            data-ocid="attacks.search_input"
          />
          {libraryLoading ? (
            <p
              style={{
                color: "var(--ds-muted)",
                textAlign: "center",
                padding: 24,
              }}
              data-ocid="attacks.loading_state"
            >
              Loading library...
            </p>
          ) : filteredLib.length === 0 ? (
            <p
              style={{
                color: "var(--ds-muted)",
                textAlign: "center",
                padding: 24,
              }}
              data-ocid="attacks.empty_state"
            >
              {libraryAttacks.length === 0
                ? "No custom attacks in library. Create some in Settings > Custom Attacks."
                : "No attacks match your search."}
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {filteredLib.map((lib, i) => (
                <div
                  key={lib.id.toString()}
                  className="ds-card2"
                  style={{ padding: 12 }}
                  data-ocid={`attacks.item.${i + 1}`}
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
                          flexWrap: "wrap",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{ color: "var(--ds-text)", fontWeight: 600 }}
                        >
                          {lib.name}
                        </span>
                        {lib.damageDice && (
                          <span
                            style={{
                              color:
                                DAMAGE_TYPE_COLORS[lib.damageType] || "#90a4ae",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {lib.damageDice} {lib.damageType}
                          </span>
                        )}
                        <span
                          style={{
                            color:
                              Number(lib.attackBonus) >= 0
                                ? "#4CAF50"
                                : "#e57373",
                            fontSize: 11,
                          }}
                        >
                          {formatBonus(lib.attackBonus)} to hit
                        </span>
                      </div>
                      {lib.description && (
                        <p
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 12,
                            margin: 0,
                          }}
                        >
                          {lib.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="ds-btn-primary"
                      style={{ fontSize: 12, marginLeft: 12, flexShrink: 0 }}
                      disabled={addingFromLib === lib.id}
                      onClick={() => addFromLibrary(lib)}
                      data-ocid={`attacks.secondary_button.${i + 1}`}
                    >
                      {addingFromLib === lib.id ? "Adding..." : "+ Add"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={() => setShowLibrary(false)}
              data-ocid="attacks.cancel_button"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <Modal
          onClose={() => setShowForm(false)}
          title={editing ? "Edit Attack" : "New Physical Attack"}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Attack Name *">
                <input
                  className="ds-input"
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  placeholder="e.g. Haymaker, Grapple"
                  data-ocid="attacks.input"
                />
              </Field>
            </div>
            <Field label="Damage Dice">
              <input
                className="ds-input"
                value={form.damageDice}
                onChange={(e) => f("damageDice", e.target.value)}
                placeholder="1d6"
                data-ocid="attacks.input"
              />
            </Field>
            <Field label="Attack Bonus">
              <input
                className="ds-input"
                type="number"
                value={form.attackBonus}
                onChange={(e) =>
                  f("attackBonus", Number.parseInt(e.target.value) || 0)
                }
                data-ocid="attacks.input"
              />
            </Field>
            <Field label="Damage Type">
              <select
                className="ds-input"
                value={form.damageType}
                onChange={(e) => f("damageType", e.target.value)}
                data-ocid="attacks.select"
              >
                {DAMAGE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Range">
              <input
                className="ds-input"
                value={form.range}
                onChange={(e) => f("range", e.target.value)}
                placeholder="5 ft (Melee)"
                data-ocid="attacks.input"
              />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Properties">
                <input
                  className="ds-input"
                  value={form.properties}
                  onChange={(e) => f("properties", e.target.value)}
                  placeholder="Finesse, Light"
                  data-ocid="attacks.input"
                />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Description">
                <textarea
                  className="ds-input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  placeholder="Describe the attack..."
                  data-ocid="attacks.textarea"
                />
              </Field>
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowForm(false)}
            onSave={handleSave}
            saving={saving}
            disabled={!form.name.trim()}
          />
        </Modal>
      )}
    </div>
  );
}

// ── Local UI primitives ────────────────────────────────────────────────────
function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      data-ocid="attacks.modal"
    >
      <div
        className="ds-card"
        style={{
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 18, margin: 0 }}
          >
            {title}
          </h3>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={onClose}
            data-ocid="attacks.close_button"
          >
            ✕
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
      <span
        className="ds-label"
        style={{
          fontSize: 12,
          color: "var(--ds-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function ModalFooter({
  onClose,
  onSave,
  saving,
  disabled,
}: {
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 20,
        paddingTop: 16,
        borderTop: "1px solid var(--ds-border)",
      }}
    >
      <button
        type="button"
        className="ds-btn-ghost"
        onClick={onClose}
        data-ocid="attacks.cancel_button"
      >
        Cancel
      </button>
      <button
        type="button"
        className="ds-btn-primary"
        onClick={onSave}
        disabled={saving || disabled}
        data-ocid="attacks.save_button"
      >
        {saving ? "Saving..." : "Save Attack"}
      </button>
    </div>
  );
}
