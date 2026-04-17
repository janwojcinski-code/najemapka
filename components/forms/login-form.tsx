"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  missing_profile:
    "Twój profil nie został jeszcze skonfigurowany. Skontaktuj się z administratorem.",
  invalid_credentials: "Nieprawidłowy email lub hasło.",
  no_role: "Konto nie ma przypisanej roli.",
  default: "Nie udało się zalogować. Spróbuj ponownie.",
};

export default function LoginForm({
  searchError,
}: {
  searchError?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchError ? (ERROR_MESSAGES[searchError] ?? ERROR_MESSAGES.default) : null
  );

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(ERROR_MESSAGES.invalid_credentials);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(ERROR_MESSAGES.default);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      setError(ERROR_MESSAGES.missing_profile);
      setLoading(false);
      return;
    }

    if (!profile.role) {
      setError(ERROR_MESSAGES.no_role);
      setLoading(false);
      return;
    }

    if (profile.role === "admin") {
      router.push("/admin/dashboard");
      return;
    }

    if (profile.role === "tenant") {
      router.push("/najemca/dashboard");
      return;
    }

    setError(ERROR_MESSAGES.no_role);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "14px 16px",
            borderRadius: "14px",
            background: "#FEF2F2",
            color: "#B91C1C",
            border: "1px solid #FECACA",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="email"
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.pl"
          required
          disabled={loading}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: "22px" }}>
        <label
          htmlFor="password"
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Hasło
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #0B5CAD 0%, #1D4ED8 100%)",
          color: "white",
          border: "none",
          borderRadius: "14px",
          padding: "14px 18px",
          fontWeight: 800,
          fontSize: "16px",
          cursor: "pointer",
          boxShadow: "0 12px 24px rgba(29, 78, 216, 0.20)",
        }}
      >
        {loading ? "Logowanie..." : "Zaloguj się"}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #D0D5DD",
  background: "white",
  fontSize: "15px",
};