import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--ds-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🐉</div>
        <h1
          className="font-cinzel"
          style={{
            color: "var(--ds-gold)",
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          DungeonScribe
        </h1>
        <p style={{ color: "var(--ds-muted)", marginBottom: 32, fontSize: 15 }}>
          Your ultimate D&amp;D character sheet companion. Track stats, spells,
          inventory and more.
        </p>
        <button
          type="button"
          onClick={login}
          disabled={isLoggingIn}
          className="ds-btn-primary"
          style={{
            width: "100%",
            padding: "12px 24px",
            fontSize: 16,
            fontFamily: "Cinzel, serif",
          }}
        >
          {isLoggingIn ? "Connecting..." : "Sign In with Internet Identity"}
        </button>
        <p style={{ color: "var(--ds-muted)", marginTop: 16, fontSize: 13 }}>
          Secure, decentralized authentication on the Internet Computer.
        </p>
      </div>
    </div>
  );
}
