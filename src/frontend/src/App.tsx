import { useState } from "react";
import NavBar from "./components/NavBar";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import CharacterListPage from "./pages/CharacterListPage";
import CharacterSheetPage from "./pages/CharacterSheetPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import type { DndBackend } from "./types";

export type Page =
  | { name: "list" }
  | { name: "sheet"; characterId: bigint }
  | { name: "settings" };

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor } = useActor();
  const [page, setPage] = useState<Page>({ name: "list" });

  if (isInitializing) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--ds-bg)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
          <p
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 18 }}
          >
            Loading DungeonScribe...
          </p>
        </div>
      </div>
    );
  }

  if (!identity || identity.getPrincipal().isAnonymous()) {
    return <LoginPage />;
  }

  if (!actor) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--ds-bg)",
        }}
      >
        <p className="font-cinzel" style={{ color: "var(--ds-gold)" }}>
          Connecting to the realm...
        </p>
      </div>
    );
  }

  const dndActor = actor as unknown as DndBackend;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ds-bg)" }}>
      <NavBar page={page} setPage={setPage} />
      <div style={{ paddingTop: 64 }}>
        {page.name === "list" && (
          <CharacterListPage
            actor={dndActor}
            onSelectCharacter={(id) =>
              setPage({ name: "sheet", characterId: id })
            }
          />
        )}
        {page.name === "sheet" && (
          <CharacterSheetPage
            actor={dndActor}
            characterId={page.characterId}
            onBack={() => setPage({ name: "list" })}
          />
        )}
        {page.name === "settings" && (
          <SettingsPage
            actor={dndActor}
            onBack={() => setPage({ name: "list" })}
          />
        )}
      </div>
    </div>
  );
}
