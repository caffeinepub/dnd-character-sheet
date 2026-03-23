import { useCallback, useEffect, useState } from "react";
import type { CustomClass, CustomRace, DndBackend } from "../types";

interface Props {
  actor: DndBackend;
  onBack: () => void;
}

type RaceWithId = { id: bigint } & CustomRace;
type ClassWithId = { id: bigint } & CustomClass;

const EMPTY_RACE = {
  name: "",
  description: "",
  speed: 30,
  abilityBonuses: "",
  traits: "",
};
const EMPTY_CLASS = {
  name: "",
  hitDie: 8,
  description: "",
  proficiencies: "",
  features: "",
};

export default function SettingsPage({ actor, onBack }: Props) {
  const [maxLevel, setMaxLevel] = useState(20);
  const [savedMaxLevel, setSavedMaxLevel] = useState(20);
  const [savingLevel, setSavingLevel] = useState(false);
  const [races, setRaces] = useState<RaceWithId[]>([]);
  const [classes, setClasses] = useState<ClassWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<"general" | "races" | "classes">(
    "general",
  );

  const [showRaceForm, setShowRaceForm] = useState(false);
  const [editingRace, setEditingRace] = useState<RaceWithId | null>(null);
  const [raceForm, setRaceForm] = useState({ ...EMPTY_RACE });
  const [savingRace, setSavingRace] = useState(false);

  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithId | null>(null);
  const [classForm, setClassForm] = useState({ ...EMPTY_CLASS });
  const [savingClass, setSavingClass] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [settings, raceData, classData] = await Promise.all([
      actor.getSettings(),
      actor.getAllRaces() as unknown as Promise<[bigint, CustomRace][]>,
      actor.getAllClasses() as unknown as Promise<[bigint, CustomClass][]>,
    ]);
    setMaxLevel(Number(settings.maxLevel));
    setSavedMaxLevel(Number(settings.maxLevel));
    setRaces(raceData.map(([id, r]) => ({ id, ...r })));
    setClasses(classData.map(([id, c]) => ({ id, ...c })));
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
      abilityBonuses: r.abilityBonuses,
      traits: r.traits,
    });
    setShowRaceForm(true);
  };
  const saveRace = async () => {
    setSavingRace(true);
    const race: CustomRace = {
      name: raceForm.name,
      description: raceForm.description,
      speed: BigInt(raceForm.speed),
      abilityBonuses: raceForm.abilityBonuses,
      traits: raceForm.traits,
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
      proficiencies: c.proficiencies,
      features: c.features,
    });
    setShowClassForm(true);
  };
  const saveClass = async () => {
    setSavingClass(true);
    const cls: CustomClass = {
      name: classForm.name,
      hitDie: BigInt(classForm.hitDie),
      description: classForm.description,
      proficiencies: classForm.proficiencies,
      features: classForm.features,
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

  const tabs = [
    { id: "general" as const, label: "General" },
    { id: "races" as const, label: `Custom Races (${races.length})` },
    { id: "classes" as const, label: `Custom Classes (${classes.length})` },
  ];

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
        }}
      >
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setSection(t.id)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom:
                section === t.id
                  ? "2px solid var(--ds-gold)"
                  : "2px solid transparent",
              color: section === t.id ? "var(--ds-gold)" : "var(--ds-muted)",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "Cinzel, serif",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--ds-muted)" }}>Loading settings...</p>
      ) : (
        <>
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
                  max={99}
                  value={maxLevel}
                  onChange={(e) =>
                    setMaxLevel(
                      Math.min(
                        99,
                        Math.max(1, Number.parseInt(e.target.value) || 1),
                      ),
                    )
                  }
                  style={{ width: 80 }}
                />
              </label>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={saveMaxLevel}
                disabled={savingLevel || maxLevel === savedMaxLevel}
                style={{ fontFamily: "Cinzel, serif" }}
              >
                {savingLevel ? "Saving..." : "Save"}
              </button>
              <p
                style={{ color: "var(--ds-muted)", fontSize: 13, marginTop: 8 }}
              >
                Current: {savedMaxLevel}. Range: 1–99.
              </p>
            </div>
          )}

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
                >
                  No custom races. Add your homebrew races here!
                </p>
              ) : (
                races.map((r) => (
                  <div
                    key={r.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
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
                        {r.abilityBonuses && (
                          <div
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            Bonuses: {r.abilityBonuses}
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
                >
                  No custom classes. Add your homebrew classes here!
                </p>
              ) : (
                classes.map((c) => (
                  <div
                    key={c.id.toString()}
                    className="ds-card2"
                    style={{ padding: 14, marginBottom: 8 }}
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
                        {c.proficiencies && (
                          <div
                            style={{ color: "var(--ds-muted)", fontSize: 12 }}
                          >
                            Proficiencies: {c.proficiencies}
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

      {showRaceForm && (
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
              maxWidth: 500,
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
                {editingRace ? "Edit Race" : "New Custom Race"}
              </h2>
              <button
                type="button"
                onClick={() => setShowRaceForm(false)}
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
                <span className="ds-label">Race Name *</span>
                <input
                  className="ds-input"
                  value={raceForm.name}
                  onChange={(e) =>
                    setRaceForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Speed (ft)</span>
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
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">
                  Ability Bonuses (e.g. +2 STR, +1 CHA)
                </span>
                <input
                  className="ds-input"
                  value={raceForm.abilityBonuses}
                  onChange={(e) =>
                    setRaceForm((p) => ({
                      ...p,
                      abilityBonuses: e.target.value,
                    }))
                  }
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Racial Traits</span>
                <textarea
                  className="ds-input"
                  value={raceForm.traits}
                  onChange={(e) =>
                    setRaceForm((p) => ({ ...p, traits: e.target.value }))
                  }
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Description</span>
                <textarea
                  className="ds-input"
                  value={raceForm.description}
                  onChange={(e) =>
                    setRaceForm((p) => ({ ...p, description: e.target.value }))
                  }
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
                onClick={() => setShowRaceForm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={saveRace}
                disabled={savingRace || !raceForm.name.trim()}
                style={{ fontFamily: "Cinzel, serif" }}
              >
                {savingRace
                  ? "Saving..."
                  : editingRace
                    ? "Save Changes"
                    : "Add Race"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showClassForm && (
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
              maxWidth: 500,
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
                {editingClass ? "Edit Class" : "New Custom Class"}
              </h2>
              <button
                type="button"
                onClick={() => setShowClassForm(false)}
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
                <span className="ds-label">Class Name *</span>
                <input
                  className="ds-input"
                  value={classForm.name}
                  onChange={(e) =>
                    setClassForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Hit Die (e.g. 8 for d8)</span>
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
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Proficiencies</span>
                <textarea
                  className="ds-input"
                  value={classForm.proficiencies}
                  onChange={(e) =>
                    setClassForm((p) => ({
                      ...p,
                      proficiencies: e.target.value,
                    }))
                  }
                  rows={2}
                  style={{ resize: "vertical" }}
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Class Features</span>
                <textarea
                  className="ds-input"
                  value={classForm.features}
                  onChange={(e) =>
                    setClassForm((p) => ({ ...p, features: e.target.value }))
                  }
                  rows={4}
                  style={{ resize: "vertical" }}
                />
              </label>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Description</span>
                <textarea
                  className="ds-input"
                  value={classForm.description}
                  onChange={(e) =>
                    setClassForm((p) => ({ ...p, description: e.target.value }))
                  }
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
                onClick={() => setShowClassForm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={saveClass}
                disabled={savingClass || !classForm.name.trim()}
                style={{ fontFamily: "Cinzel, serif" }}
              >
                {savingClass
                  ? "Saving..."
                  : editingClass
                    ? "Save Changes"
                    : "Add Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
