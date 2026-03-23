import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  page: Page;
  setPage: (p: Page) => void;
}

export default function NavBar({ page, setPage }: Props) {
  const { clear } = useInternetIdentity();

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "#0F1113",
        borderBottom: "1px solid var(--ds-border)",
        height: 64,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 24 }}>🐉</span>
        <span
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 18, fontWeight: 700 }}
        >
          DungeonScribe
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[
          { label: "Characters", p: { name: "list" } as Page },
          { label: "Settings", p: { name: "settings" } as Page },
        ].map(({ label, p }) => (
          <button
            type="button"
            key={label}
            onClick={() => setPage(p)}
            style={{
              background: "transparent",
              border: "none",
              color:
                page.name === p.name ? "var(--ds-gold)" : "var(--ds-muted)",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "Inter, sans-serif",
              borderBottom:
                page.name === p.name
                  ? "2px solid var(--ds-gold)"
                  : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={clear}
          style={{
            marginLeft: 8,
            background: "transparent",
            border: "1px solid var(--ds-border)",
            color: "var(--ds-muted)",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
