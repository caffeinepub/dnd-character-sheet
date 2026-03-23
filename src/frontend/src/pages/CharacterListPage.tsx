import { useCallback, useEffect, useState } from "react";
import NewCharacterDialog from "../components/NewCharacterDialog";
import type { Character, DndBackend } from "../types";

interface Props {
  actor: DndBackend;
  onSelectCharacter: (id: bigint) => void;
}

type CharWithId = { id: bigint } & Character;

export default function CharacterListPage({ actor, onSelectCharacter }: Props) {
  const [characters, setCharacters] = useState<CharWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await actor.getAllCharacters()) as unknown as [
        bigint,
        Character,
      ][];
      setCharacters(result.map(([id, char]) => ({ id, ...char })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: bigint, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this character?")) return;
    await actor.deleteCharacter(id);
    await load();
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 28 }}
        >
          My Characters
        </h1>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={() => setShowNew(true)}
          style={{ fontFamily: "Cinzel, serif" }}
        >
          + New Character
        </button>
      </div>

      {loading ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            marginTop: 48,
          }}
        >
          Loading characters...
        </p>
      ) : characters.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
          <p
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 20, marginBottom: 8 }}
          >
            No Characters Yet
          </p>
          <p style={{ color: "var(--ds-muted)", marginBottom: 24 }}>
            Create your first character to begin your adventure.
          </p>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={() => setShowNew(true)}
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Create Character
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {characters.map((char) => (
            <div key={char.id.toString()} style={{ position: "relative" }}>
              <button
                type="button"
                className="ds-card clickable"
                style={{
                  padding: 20,
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "block",
                }}
                onClick={() => onSelectCharacter(char.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h2
                      className="font-cinzel"
                      style={{
                        color: "var(--ds-gold)",
                        fontSize: 18,
                        marginBottom: 4,
                      }}
                    >
                      {char.name}
                    </h2>
                    <p
                      style={{
                        color: "var(--ds-muted)",
                        fontSize: 13,
                        marginBottom: 2,
                      }}
                    >
                      {char.race} · {char.characterClass}
                    </p>
                    <p style={{ color: "var(--ds-muted)", fontSize: 13 }}>
                      Level {char.level.toString()}
                    </p>
                  </div>
                  <div style={{ width: 24 }} />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {(["str", "dex", "con", "int", "wis", "cha"] as const).map(
                    (stat) => (
                      <div
                        key={stat}
                        style={{
                          backgroundColor: "var(--ds-surface2)",
                          border: "1px solid var(--ds-border)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          textAlign: "center",
                          minWidth: 36,
                        }}
                      >
                        <div
                          style={{
                            color: "var(--ds-muted)",
                            fontSize: 10,
                            textTransform: "uppercase",
                          }}
                        >
                          {stat}
                        </div>
                        <div
                          style={{
                            color: "var(--ds-text)",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {char[stat].toString()}
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 12,
                  }}
                >
                  <span style={{ color: "#e74c3c", fontSize: 13 }}>
                    HP {char.hpCurrent.toString()}/{char.hpMax.toString()}
                  </span>
                  <span style={{ color: "var(--ds-muted)", fontSize: 13 }}>
                    AC {char.ac.toString()}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={(e) => handleDelete(char.id, e)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "transparent",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                  padding: 4,
                  fontSize: 16,
                  zIndex: 1,
                }}
                title="Delete character"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <NewCharacterDialog
          actor={actor}
          onClose={() => setShowNew(false)}
          onCreated={async (id) => {
            setShowNew(false);
            onSelectCharacter(id);
          }}
        />
      )}
    </div>
  );
}
