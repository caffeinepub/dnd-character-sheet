import { useState } from "react";
import type { Character, DndBackend } from "../../types";

interface Props {
  actor: DndBackend;
  character: Character;
  characterId: bigint;
  onUpdate: () => void;
}

export default function NotesTab({
  actor,
  character,
  characterId,
  onUpdate,
}: Props) {
  const [notes, setNotes] = useState(character.notes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await actor.updateCharacter(characterId, { ...character, notes });
    await onUpdate();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 16 }}
        >
          BACKSTORY & NOTES
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {saved && (
            <span style={{ color: "var(--ds-gold)", fontSize: 13 }}>
              ✓ Saved
            </span>
          )}
          <button
            type="button"
            className="ds-btn-primary"
            onClick={save}
            disabled={saving}
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {saving ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </div>
      <textarea
        className="ds-input"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={20}
        style={{ resize: "vertical", lineHeight: 1.6, fontSize: 14 }}
        placeholder="Write your character's backstory, personality traits, goals, ideals, bonds, flaws, and any other notes here..."
      />
    </div>
  );
}
