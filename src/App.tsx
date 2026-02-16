import { useEffect, useMemo, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { createApiClient } from "./apiClient";

type Claim = {
  id: string;
  claimNumber: string;
  policyholderName?: string | null;
  lossCity?: string | null;
  lossState?: string | null;
  claimStatus?: string | null;
  assignedAdjusterInitials?: string | null;
  estimatedLossAmount?: number | null;
};

export default function App() {
  const { getToken } = useAuth();
  const api = useMemo(() => createApiClient(getToken), [getToken]);

  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenPreview, setTokenPreview] = useState<string>("");

  async function handleGetToken() {
    const token = await getToken();
    if (!token) {
      setTokenPreview("(no token - are you signed in?)");
      return;
    }
    setTokenPreview(token.slice(0, 40) + "…");
    await navigator.clipboard.writeText(token);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await getToken();
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        const res = await api.get<Claim[]>("/api/claims");
        if (!cancelled) setClaims(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? String(e));
        setClaims([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, getToken]);

  return (
    <div style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0 }}>FloodAI UI</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>

          <SignedIn>
            <button
              onClick={handleGetToken}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer",
              }}
            >
              Copy JWT
            </button>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <SignedIn>
        {tokenPreview && (
          <div style={{ marginBottom: 12, fontFamily: "monospace" }}>
            Token: {tokenPreview}
          </div>
        )}
      </SignedIn>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: "crimson" }}>Error: {error}</div>}

      <div style={{ marginTop: 12 }}>
        Loaded <b>{claims.length}</b> claims.
      </div>

      <div style={{ marginTop: 12, background: "#111", padding: 12, borderRadius: 8 }}>
        <pre style={{ margin: 0, color: "#ddd", overflowX: "auto" }}>
          {JSON.stringify(claims.slice(0, 5), null, 2)}
        </pre>
      </div>
    </div>
  );
}
