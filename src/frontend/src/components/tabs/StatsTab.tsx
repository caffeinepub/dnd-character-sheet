import { useState } from "react";
import type { Character, DndBackend } from "../../types";

interface Props {
  actor: DndBackend;
  character: Character;
  characterId: bigint;
  onUpdate: () => void;
}

const SKILLS = [
  { key: "acrobatics", label: "Acrobatics", stat: "dex" },
  { key: "animalHandling", label: "Animal Handling", stat: "wis" },
  { key: "arcana", label: "Arcana", stat: "int" },
  { key: "athletics", label: "Athletics", stat: "str" },
  { key: "deception", label: "Deception", stat: "cha" },
  { key: "history", label: "History", stat: "int" },
  { key: "insight", label: "Insight", stat: "wis" },
  { key: "intimidation", label: "Intimidation", stat: "cha" },
  { key: "investigation", label: "Investigation", stat: "int" },
  { key: "medicine", label: "Medicine", stat: "wis" },
  { key: "nature", label: "Nature", stat: "int" },
  { key: "perception", label: "Perception", stat: "wis" },
  { key: "performance", label: "Performance", stat: "cha" },
  { key: "persuasion", label: "Persuasion", stat: "cha" },
  { key: "religion", label: "Religion", stat: "int" },
  { key: "sleightOfHand", label: "Sleight of Hand", stat: "dex" },
  { key: "stealth", label: "Stealth", stat: "dex" },
  { key: "survival", label: "Survival", stat: "wis" },
] as const;

const SAVES = ["str", "dex", "con", "int", "wis", "cha"] as const;

function mod(score: bigint): number {
  return Math.floor((Number(score) - 10) / 2);
}
function modStr(score: bigint): string {
  const m = mod(score);
  return m >= 0 ? `+${m}` : `${m}`;
}

export default function StatsTab({
  actor,
  character,
  characterId,
  onUpdate,
}: Props) {
  const [editingHp, setEditingHp] = useState(false);
  const [hpVal, setHpVal] = useState(Number(character.hpCurrent));
  const [savingHp, setSavingHp] = useState(false);
  const skills = character.skills;
  const prof = Number(character.proficiencyBonus);

  const saveHp = async () => {
    setSavingHp(true);
    await actor.updateCharacter(characterId, {
      ...character,
      hpCurrent: BigInt(hpVal),
    });
    await onUpdate();
    setEditingHp(false);
    setSavingHp(false);
  };

  const toggleSkill = async (key: string) => {
    const updated = {
      ...character,
      skills: { ...skills, [key]: !skills[key as keyof typeof skills] },
    };
    await actor.updateCharacter(characterId, updated);
    await onUpdate();
  };

  const hpPct = Math.min(
    100,
    (Number(character.hpCurrent) / Math.max(1, Number(character.hpMax))) * 100,
  );

  return (
    <div
      className="stats-grid"
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* HP */}
        <div className="ds-card" style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span
              className="font-cinzel"
              style={{ color: "var(--ds-gold)", fontSize: 14 }}
            >
              Hit Points
            </span>
            {!editingHp && (
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12, padding: "4px 8px" }}
                onClick={() => {
                  setHpVal(Number(character.hpCurrent));
                  setEditingHp(true);
                }}
              >
                Edit
              </button>
            )}
          </div>
          {editingHp ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="ds-input"
                type="number"
                value={hpVal}
                onChange={(e) => setHpVal(Number.parseInt(e.target.value) || 0)}
                min={0}
                max={Number(character.hpMax)}
                style={{ width: 80 }}
              />
              <span style={{ color: "var(--ds-muted)" }}>
                / {character.hpMax.toString()}
              </span>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={saveHp}
                disabled={savingHp}
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                {savingHp ? "..." : "Save"}
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditingHp(false)}
                style={{ fontSize: 12 }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  fontSize: 20,
                  color: "#e74c3c",
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                {character.hpCurrent.toString()} / {character.hpMax.toString()}
              </div>
              <div
                style={{
                  height: 8,
                  backgroundColor: "var(--ds-surface2)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${hpPct}%`,
                    backgroundColor: "#8B1A1A",
                    borderRadius: 4,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Ability Scores */}
        <div className="ds-card" style={{ padding: 16 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 12 }}
          >
            ABILITY SCORES
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {(["str", "dex", "con", "int", "wis", "cha"] as const).map(
              (stat) => (
                <div key={stat} className="ability-box">
                  <div
                    style={{
                      color: "var(--ds-muted)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 2,
                    }}
                  >
                    {stat}
                  </div>
                  <div
                    style={{
                      color: "var(--ds-text)",
                      fontSize: 24,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {character[stat].toString()}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      backgroundColor: "var(--ds-bg)",
                      border: "1px solid var(--ds-border)",
                      borderRadius: 10,
                      padding: "2px 6px",
                      fontSize: 11,
                      color: "var(--ds-gold)",
                      marginTop: 4,
                    }}
                  >
                    {modStr(character[stat])}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Saving Throws */}
        <div className="ds-card" style={{ padding: 16 }}>
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 12 }}
          >
            SAVING THROWS
          </h3>
          {SAVES.map((stat) => {
            const m = mod(character[stat]);
            const val = m >= 0 ? `+${m}` : `${m}`;
            return (
              <div
                key={stat}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: "1px solid var(--ds-border)",
                }}
              >
                <span style={{ color: "var(--ds-text)", fontSize: 13 }}>
                  {stat.toUpperCase()}
                </span>
                <span style={{ color: "var(--ds-gold)", fontSize: 13 }}>
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div className="ds-card" style={{ padding: 16 }}>
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 14, marginBottom: 12 }}
        >
          SKILLS
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SKILLS.map(({ key, label, stat }) => {
            const isProficient = skills[key as keyof typeof skills] as boolean;
            const base = mod(character[stat as "str"]);
            const bonus = isProficient ? base + prof : base;
            const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`;
            return (
              <button
                type="button"
                key={key}
                className="skill-btn"
                onClick={() => toggleSkill(key)}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: "2px solid var(--ds-gold)",
                    backgroundColor: isProficient
                      ? "var(--ds-gold)"
                      : "transparent",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{ color: "var(--ds-text)", fontSize: 13, flex: 1 }}
                >
                  {label}
                </span>
                <span
                  style={{
                    color: "var(--ds-muted)",
                    fontSize: 11,
                    textTransform: "uppercase",
                  }}
                >
                  {stat}
                </span>
                <span
                  style={{
                    color: "var(--ds-gold)",
                    fontSize: 13,
                    minWidth: 28,
                    textAlign: "right",
                  }}
                >
                  {bonusStr}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
