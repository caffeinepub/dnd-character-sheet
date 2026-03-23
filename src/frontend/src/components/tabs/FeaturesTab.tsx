import { useCallback, useEffect, useState } from "react";
import type { DndBackend, Trait } from "../../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
}

type TraitWithId = { id: bigint } & Trait;

const SOURCES = ["Class", "Race", "Background", "Feat", "Other"];
const EMPTY_TRAIT = { name: "", description: "", source: "Class" };

export default function FeaturesTab({ actor, characterId }: Props) {
  const [traits, setTraits] = useState<TraitWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TraitWithId | null>(null);
  const [form, setForm] = useState({ ...EMPTY_TRAIT });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = (await actor.getTraitsByCharacter(
      characterId,
    )) as unknown as [bigint, Trait][];
    setTraits(result.map(([id, t]) => ({ id, ...t })));
    setLoading(false);
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_TRAIT });
    setShowForm(true);
  };
  const openEdit = (t: TraitWithId) => {
    setEditing(t);
    setForm({ name: t.name, description: t.description, source: t.source });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const trait: Trait = {
      characterId,
      name: form.name,
      description: form.description,
      source: form.source,
    };
    if (editing) await actor.updateTrait(editing.id, trait);
    else await actor.addTrait(trait);
    await load();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this feature?")) return;
    await actor.deleteTrait(id);
    await load();
  };

  const grouped = SOURCES.map((src) => ({
    src,
    traits: traits.filter((t) => t.source === src),
  })).filter((g) => g.traits.length > 0);
  const ungrouped = traits.filter((t) => !SOURCES.includes(t.source));

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 16 }}
        >
          FEATURES & TRAITS
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={openNew}
          style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
        >
          + Add Feature
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--ds-muted)" }}>Loading features...</p>
      ) : traits.length === 0 ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            marginTop: 32,
          }}
        >
          No features yet. Add class features, racial traits, or feats!
        </p>
      ) : (
        <>
          {grouped.map(({ src, traits: srcTraits }) => (
            <div key={src} style={{ marginBottom: 20 }}>
              <h4
                className="font-cinzel"
                style={{
                  color: "var(--ds-gold)",
                  fontSize: 13,
                  marginBottom: 8,
                  borderBottom: "1px solid var(--ds-border)",
                  paddingBottom: 6,
                }}
              >
                {src.toUpperCase()} FEATURES
              </h4>
              {srcTraits.map((t) => (
                <TraitCard
                  key={t.id.toString()}
                  trait={t}
                  onEdit={() => openEdit(t)}
                  onDelete={() => handleDelete(t.id)}
                />
              ))}
            </div>
          ))}
          {ungrouped.length > 0 && (
            <div>
              <h4
                className="font-cinzel"
                style={{
                  color: "var(--ds-gold)",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                OTHER
              </h4>
              {ungrouped.map((t) => (
                <TraitCard
                  key={t.id.toString()}
                  trait={t}
                  onEdit={() => openEdit(t)}
                  onDelete={() => handleDelete(t.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
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
            style={{ width: "100%", maxWidth: 480, padding: 24 }}
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
                {editing ? "Edit Feature" : "Add Feature"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Feature Name *</span>
                <input
                  className="ds-input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Second Wind"
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Source</span>
                <select
                  className="ds-input"
                  value={form.source}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, source: e.target.value }))
                  }
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Description</span>
                <textarea
                  className="ds-input"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={4}
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
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                style={{ fontFamily: "Cinzel, serif" }}
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Add Feature"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TraitCard({
  trait,
  onEdit,
  onDelete,
}: { trait: TraitWithId; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="ds-card2" style={{ padding: 12, marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <span style={{ color: "var(--ds-text)", fontWeight: 600 }}>
            {trait.name}
          </span>
          {trait.description && (
            <p
              style={{
                color: "var(--ds-muted)",
                fontSize: 13,
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              {trait.description}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
          <button
            type="button"
            className="ds-btn-ghost"
            style={{ fontSize: 12, padding: "4px 8px" }}
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            style={{
              background: "transparent",
              border: "none",
              color: "#666",
              cursor: "pointer",
              padding: 4,
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
