import { useCallback, useEffect, useState } from "react";
import NewCharacterDialog from "../components/NewCharacterDialog";
import FeaturesTab from "../components/tabs/FeaturesTab";
import InventoryTab from "../components/tabs/InventoryTab";
import NotesTab from "../components/tabs/NotesTab";
import SpellsTab from "../components/tabs/SpellsTab";
import StatsTab from "../components/tabs/StatsTab";
import type { Character, DndBackend } from "../types";

interface Props {
  actor: DndBackend;
  characterId: bigint;
  onBack: () => void;
}

type Tab = "stats" | "spells" | "inventory" | "features" | "notes";

export default function CharacterSheetPage({
  actor,
  characterId,
  onBack,
}: Props) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("stats");
  const [showEdit, setShowEdit] = useState(false);

  const loadCharacter = useCallback(async () => {
    setLoading(true);
    const char = await actor.getCharacter(characterId);
    setCharacter(char);
    setLoading(false);
  }, [actor, characterId]);

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <p style={{ color: "var(--ds-muted)" }}>Loading character...</p>
      </div>
    );

  if (!character)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 16,
        }}
      >
        <p style={{ color: "var(--ds-muted)" }}>Character not found.</p>
        <button type="button" className="ds-btn-ghost" onClick={onBack}>
          ← Back
        </button>
      </div>
    );

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: "Stats" },
    { id: "spells", label: "Spells" },
    { id: "inventory", label: "Inventory" },
    { id: "features", label: "Features" },
    { id: "notes", label: "Notes" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={onBack}
            style={{ marginBottom: 8, fontSize: 13 }}
          >
            ← All Characters
          </button>
          <h1
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 26, lineHeight: 1.2 }}
          >
            {character.name}
          </h1>
          <p style={{ color: "var(--ds-muted)", fontSize: 14, marginTop: 4 }}>
            {character.race} · {character.characterClass} · Level{" "}
            {character.level.toString()}
            {character.background ? ` · ${character.background}` : ""}
            {character.alignment ? ` · ${character.alignment}` : ""}
          </p>
        </div>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={() => setShowEdit(true)}
          style={{ fontFamily: "Cinzel, serif" }}
        >
          Edit Character
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
          backgroundColor: "var(--ds-surface)",
          border: "1px solid var(--ds-border)",
          borderRadius: 10,
          padding: "12px 16px",
        }}
      >
        <QuickStat
          label="HP"
          value={`${character.hpCurrent}/${character.hpMax}`}
          color="#e74c3c"
        />
        <QuickStat label="AC" value={character.ac.toString()} />
        <QuickStat label="Speed" value={`${character.speed} ft`} />
        <QuickStat
          label="Initiative"
          value={
            character.initiative >= 0n
              ? `+${character.initiative}`
              : character.initiative.toString()
          }
        />
        <QuickStat
          label="Proficiency"
          value={`+${character.proficiencyBonus}`}
        />
        <QuickStat
          label="Level"
          value={character.level.toString()}
          color="var(--ds-gold)"
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--ds-border)",
          marginBottom: 20,
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom:
                tab === t.id
                  ? "2px solid var(--ds-gold)"
                  : "2px solid transparent",
              color: tab === t.id ? "var(--ds-gold)" : "var(--ds-muted)",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "Cinzel, serif",
              whiteSpace: "nowrap",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <StatsTab
          actor={actor}
          character={character}
          characterId={characterId}
          onUpdate={loadCharacter}
        />
      )}
      {tab === "spells" && (
        <SpellsTab
          actor={actor}
          character={character}
          characterId={characterId}
          onUpdate={loadCharacter}
        />
      )}
      {tab === "inventory" && (
        <InventoryTab
          actor={actor}
          character={character}
          characterId={characterId}
          onUpdate={loadCharacter}
        />
      )}
      {tab === "features" && (
        <FeaturesTab actor={actor} characterId={characterId} />
      )}
      {tab === "notes" && (
        <NotesTab
          actor={actor}
          character={character}
          characterId={characterId}
          onUpdate={loadCharacter}
        />
      )}

      {showEdit && (
        <NewCharacterDialog
          actor={actor}
          existing={{ id: characterId, char: character }}
          onClose={() => setShowEdit(false)}
          onCreated={async () => {
            setShowEdit(false);
            await loadCharacter();
          }}
        />
      )}
    </div>
  );
}

function QuickStat({
  label,
  value,
  color,
}: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 60 }}>
      <div
        style={{
          color: "var(--ds-muted)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: color ?? "var(--ds-text)",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}
